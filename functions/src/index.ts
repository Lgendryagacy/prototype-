import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

// Initialize Firebase Admin
admin.initializeApp();

// ============================================================
// AI CHAT PROXY — routes OpenAI calls server-side to fix CORS
// ============================================================
const openAIKey = defineSecret('OPENAI_API_KEY');

export const chatWithAI = onCall({ secrets: [openAIKey] }, async (request) => {
  const { messages } = request.data as {
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  };

  if (!messages || !Array.isArray(messages)) {
    throw new HttpsError('invalid-argument', 'messages array is required');
  }

  const apiKey = openAIKey.value();
  if (!apiKey) {
    throw new HttpsError(
      'internal',
      'OpenAI API key not configured. Run: firebase functions:secrets:set OPENAI_API_KEY'
    );
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new HttpsError('internal', `OpenAI API error: ${errText}`);
  }

  const result = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  return { content: result.choices[0]?.message?.content || '' };
});

/**
 * Send push notification when a new chat message is created
 * Triggers on: PublicChat/{conversationId}/messages/{messageId}
 */
export const sendChatNotification = functions.firestore
  .document('PublicChat/{conversationId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    try {
      const message = snapshot.data();
      const { conversationId, messageId } = context.params;

      // Don't send notification if message doesn't exist or is from system
      if (!message || !message.senderId || !message.text) {
        console.log('Invalid message data, skipping notification');
        return null;
      }

      // Get conversation to find the recipient
      const conversationRef = admin.firestore().collection('PublicChat').doc(conversationId);
      const conversationDoc = await conversationRef.get();

      if (!conversationDoc.exists) {
        console.log('Conversation not found');
        return null;
      }

      const conversation = conversationDoc.data();
      if (!conversation || !conversation.participants) {
        console.log('Invalid conversation data');
        return null;
      }

      // Find recipient (the person who is NOT the sender)
      const recipientId = conversation.participants.find(
        (participantId: string) => participantId !== message.senderId
      );

      if (!recipientId) {
        console.log('No recipient found');
        return null;
      }

      // Get sender's profile for the notification
      const senderDoc = await admin.firestore().collection('users').doc(message.senderId).get();
      const sender = senderDoc.data();
      const senderName = sender?.displayName || sender?.name || 'Someone';
      const senderPhoto = sender?.photoURL || sender?.profileImage || '/fogsly-icon-192.png';

      // Get recipient's FCM tokens
      const recipientDoc = await admin.firestore().collection('users').doc(recipientId).get();
      const recipient = recipientDoc.data();

      if (!recipient || !recipient.fcmTokens || recipient.fcmTokens.length === 0) {
        console.log('Recipient has no FCM tokens');
        return null;
      }

      const fcmTokens = recipient.fcmTokens;

      // Send to all recipient's devices
      const promises = fcmTokens.map(async (token: string) => {
        try {
          await admin.messaging().send({
            token: token,
            notification: {
              title: `💬 ${senderName}`,
              body: message.text.length > 100 
                ? message.text.substring(0, 100) + '...' 
                : message.text,
            },
            data: {
              conversationId: conversationId,
              senderId: message.senderId,
              messageId: messageId,
              type: 'chat_message',
              senderName: senderName,
              senderPhoto: senderPhoto,
            },
            webpush: {
              notification: {
                icon: senderPhoto,
                badge: '/Favicon.png',
                tag: `chat-${conversationId}`,
                requireInteraction: false,
                vibrate: [200, 100, 200],
                actions: [
                  {
                    action: 'open_chat',
                    title: '💬 Open Chat'
                  },
                  {
                    action: 'dismiss',
                    title: 'Dismiss'
                  }
                ]
              },
              fcmOptions: {
                link: `/messages?conversationId=${conversationId}`
              }
            }
          });
          console.log(`✅ Notification sent to token: ${token.substring(0, 20)}...`);
        } catch (error: any) {
          console.error(`❌ Failed to send to token ${token.substring(0, 20)}:`, error.message);
          
          // Remove invalid tokens
          if (error.code === 'messaging/invalid-registration-token' ||
              error.code === 'messaging/registration-token-not-registered') {
            console.log(`Removing invalid token: ${token.substring(0, 20)}...`);
            await admin.firestore().collection('users').doc(recipientId).update({
              fcmTokens: admin.firestore.FieldValue.arrayRemove(token)
            });
          }
        }
      });

      await Promise.all(promises);
      console.log(`✅ Chat notification sent successfully for message ${messageId}`);
      return null;

    } catch (error) {
      console.error('Error sending chat notification:', error);
      return null;
    }
  });

/**
 * Clean up old FCM tokens (optional - run periodically)
 */
export const cleanupOldTokens = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    try {
      const usersRef = admin.firestore().collection('users');
      const snapshot = await usersRef.where('fcmTokens', '!=', null).get();

      const cleanupPromises = snapshot.docs.map(async (doc) => {
        const userData = doc.data();
        const tokens = userData.fcmTokens || [];

        // Test each token
        const validTokens: string[] = [];
        for (const token of tokens) {
          try {
            // Try to send a test message (dry run)
            await admin.messaging().send({
              token: token,
              data: { test: 'true' }
            }, true); // dry run
            validTokens.push(token);
          } catch (error: any) {
            console.log(`Invalid token found for user ${doc.id}: ${error.code}`);
          }
        }

        // Update if tokens changed
        if (validTokens.length !== tokens.length) {
          await doc.ref.update({ fcmTokens: validTokens });
          console.log(`Cleaned up tokens for user ${doc.id}: ${tokens.length} -> ${validTokens.length}`);
        }
      });

      await Promise.all(cleanupPromises);
      console.log('Token cleanup completed');
      return null;
    } catch (error) {
      console.error('Error cleaning up tokens:', error);
      return null;
    }
  });
