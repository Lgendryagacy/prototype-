import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  increment,
  writeBatch,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config';
import type { PublicConversation, PublicChatMessage } from '../types/chat';

const CONVERSATIONS_COLLECTION = 'PublicChat';
const MESSAGES_SUBCOLLECTION = 'messages';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Generate deterministic conversation ID from two user IDs
 */
export const generateConversationId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('_');
};

/**
 * Create or get existing conversation
 */
export const createOrGetConversation = async (
  currentUserId: string,
  otherUserId: string,
  currentUserData: { name: string; displayName: string; avatar: string; email: string },
  otherUserData: { name: string; displayName: string; avatar: string; email: string }
): Promise<PublicConversation> => {
  // Validate input
  if (typeof currentUserId !== 'string' || !currentUserId) {
    throw new Error(`Invalid currentUserId: ${currentUserId}`);
  }
  if (typeof otherUserId !== 'string' || !otherUserId) {
    throw new Error(`Invalid otherUserId: ${otherUserId}`);
  }

  console.log('Creating/getting conversation:', { currentUserId, otherUserId });

  const conversationId = generateConversationId(currentUserId, otherUserId);
  console.log('Generated conversationId:', conversationId);

  const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);

  try {
    const conversationSnap = await getDoc(conversationRef);

    if (conversationSnap.exists()) {
      return { id: conversationSnap.id, ...conversationSnap.data() } as PublicConversation;
    }

    // Create new conversation
    const newConversation: Omit<PublicConversation, 'id'> = {
      participants: [currentUserId, otherUserId],
      participantsData: {
        [currentUserId]: currentUserData,
        [otherUserId]: otherUserData,
      },
      lastMessage: null,
      unreadCount: {
        [currentUserId]: 0,
        [otherUserId]: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(conversationRef, newConversation);

    return { id: conversationId, ...newConversation };
  } catch (error) {
    console.error('Error creating/getting conversation:', error);
    throw error;
  }
};

/**
 * Upload media file to Firebase Storage
 */
export const uploadChatMedia = async (
  file: File,
  conversationId: string,
  messageId: string
): Promise<{ url: string; type: 'image' | 'video' | 'document' }> => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size must be less than 10MB');
  }

  const fileExtension = file.name.split('.').pop();
  let mediaType: 'image' | 'video' | 'document';

  if (file.type.startsWith('image/')) {
    mediaType = 'image';
  } else if (file.type.startsWith('video/')) {
    mediaType = 'video';
  } else {
    mediaType = 'document';
  }

  const fileName = `${messageId}_${mediaType}.${fileExtension}`;
  const storageRef = ref(storage, `public-chat-media/${conversationId}/${fileName}`);

  try {
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);

    return { url: downloadUrl, type: mediaType };
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
};

/**
 * Send a message
 */
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  receiverId: string,
  text: string,
  mediaFile?: File
): Promise<string> => {
  try {
    const messagesRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_SUBCOLLECTION);
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);

    // Create message document first to get ID
    const messageData: Omit<PublicChatMessage, 'id'> = {
      conversationId,
      senderId,
      receiverId,
      text,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const messageRef = await addDoc(messagesRef, messageData);

    // Upload media if provided
    if (mediaFile) {
      const { url, type } = await uploadChatMedia(mediaFile, conversationId, messageRef.id);
      await updateDoc(messageRef, {
        mediaUrl: url,
        mediaType: type,
        mediaSize: mediaFile.size,
        mediaName: mediaFile.name,
      });
    }

    // Update conversation
    const batch = writeBatch(db);

    batch.update(conversationRef, {
      lastMessage: {
        text: text || (mediaFile ? `Sent a ${mediaFile.type.split('/')[0]}` : ''),
        senderId,
        timestamp: new Date().toISOString(),
        ...(mediaFile && {
          mediaUrl: true,
          mediaType: mediaFile.type.startsWith('image/') ? 'image' : mediaFile.type.startsWith('video/') ? 'video' : 'document',
          mediaName: mediaFile.name,
        }),
      },
      updatedAt: new Date().toISOString(),
      [`unreadCount.${receiverId}`]: increment(1),
    });

    await batch.commit();

    console.log('✅ Message sent:', messageRef.id);
    return messageRef.id;
  } catch (error) {
    console.error('❌ Error sending message:', error);
    throw error;
  }
};

/**
 * Get user's conversations with real-time listener
 */
export const subscribeToConversations = (
  userId: string,
  onUpdate: (conversations: PublicConversation[]) => void
): (() => void) => {
  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    onUpdate([]);
    return () => {};
  }

  const q = query(
    collection(db, CONVERSATIONS_COLLECTION),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const conversations: PublicConversation[] = [];
    snapshot.forEach((doc) => {
      conversations.push({ id: doc.id, ...doc.data() } as PublicConversation);
    });
    onUpdate(conversations);
  }, (error) => {
    console.warn('Notice listening to public conversations:', error?.message || error);
    onUpdate([]);
  });

  return unsubscribe;
};

/**
 * Get messages for a conversation with real-time listener
 */
export const subscribeToMessages = (
  conversationId: string,
  onUpdate: (messages: PublicChatMessage[]) => void,
  limitCount: number = 20
): (() => void) => {
  const messagesRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_SUBCOLLECTION);
  const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(limitCount));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages: PublicChatMessage[] = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as PublicChatMessage);
    });
    // Reverse to show oldest first
    onUpdate(messages.reverse());
  }, (error) => {
    console.error('Error listening to public messages:', error);
    onUpdate([]);
  });

  return unsubscribe;
};

/**
 * Load more messages (pagination)
 */
export const loadMoreMessages = async (
  conversationId: string,
  lastMessage: PublicChatMessage,
  limitCount: number = 20
): Promise<PublicChatMessage[]> => {
  try {
    const messagesRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_SUBCOLLECTION);
    const lastDoc = await getDoc(doc(messagesRef, lastMessage.id));

    const q = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      startAfter(lastDoc),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const messages: PublicChatMessage[] = [];

    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as PublicChatMessage);
    });

    return messages.reverse();
  } catch (error) {
    console.error('Error loading more messages:', error);
    throw error;
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const messagesRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_SUBCOLLECTION);

    // Get unread messages
    const q = query(messagesRef, where('receiverId', '==', userId), where('read', '==', false));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return;

    const batch = writeBatch(db);

    // Mark all messages as read
    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        read: true,
        readAt: new Date().toISOString(),
      });
    });

    // Reset unread count
    batch.update(conversationRef, {
      [`unreadCount.${userId}`]: 0,
    });

    await batch.commit();
    console.log('✅ Messages marked as read');
  } catch (error) {
    console.error('❌ Error marking messages as read:', error);
    throw error;
  }
};

/**
 * Get total unread messages count for user
 */
export const getTotalUnreadCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('participants', 'array-contains', userId)
    );

    const snapshot = await getDocs(q);
    let totalUnread = 0;

    snapshot.forEach((doc) => {
      const conversation = doc.data() as PublicConversation;
      totalUnread += conversation.unreadCount[userId] || 0;
    });

    return totalUnread;
  } catch (error) {
    console.error('Error getting total unread count:', error);
    return 0;
  }
};

/**
 * Subscribe to total unread count
 */
export const subscribeToUnreadCount = (
  userId: string,
  onUpdate: (count: number) => void
): (() => void) => {
  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    onUpdate(0);
    return () => {};
  }

  const q = query(
    collection(db, CONVERSATIONS_COLLECTION),
    where('participants', 'array-contains', userId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    let totalUnread = 0;
    snapshot.forEach((doc) => {
      const conversation = doc.data() as PublicConversation;
      totalUnread += conversation.unreadCount[userId] || 0;
    });
    onUpdate(totalUnread);
  }, (error) => {
    console.warn('Notice listening to unread count:', error?.message || error);
    onUpdate(0);
  });

  return unsubscribe;
};
