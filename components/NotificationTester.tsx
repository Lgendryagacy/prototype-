import React, { useState } from 'react';
import { Send, Bell } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Test component to manually send push notifications
 * This is for testing purposes only - in production, Cloud Functions handle this automatically
 */
const NotificationTester: React.FC = () => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [title, setTitle] = useState('Test Notification');
  const [message, setMessage] = useState('This is a test message!');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const sendTestNotification = async () => {
    if (!recipientEmail || !title || !message) {
      setResult({ success: false, message: 'Please fill all fields' });
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      // Find user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', recipientEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setResult({ success: false, message: 'User not found with this email' });
        setIsSending(false);
        return;
      }

      const userData = querySnapshot.docs[0].data();
      const fcmTokens = userData.fcmTokens || [];

      if (fcmTokens.length === 0) {
        setResult({ 
          success: false, 
          message: 'User has no FCM tokens. They need to enable notifications first.' 
        });
        setIsSending(false);
        return;
      }

      // Get Firebase Server Key from Firebase Console > Project Settings > Cloud Messaging
      const serverKey = 'YOUR_FIREBASE_SERVER_KEY'; // TODO: Replace with actual server key

      if (serverKey === 'YOUR_FIREBASE_SERVER_KEY') {
        setResult({
          success: false,
          message: '⚠️ Please set your Firebase Server Key in NotificationTester.tsx'
        });
        setIsSending(false);
        return;
      }

      // Send notification to all user's tokens
      const promises = fcmTokens.map(async (token: string) => {
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${serverKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: token,
            notification: {
              title: title,
              body: message,
              icon: '/fogsly-icon-192.png',
              badge: '/fogsly-icon-96.png',
              tag: 'test-notification',
            },
            data: {
              type: 'test',
              timestamp: Date.now().toString(),
            },
          }),
        });

        return response.json();
      });

      const results = await Promise.all(promises);
      console.log('Notification results:', results);

      setResult({
        success: true,
        message: `✅ Notification sent to ${fcmTokens.length} device(s)!`
      });

    } catch (error: any) {
      console.error('Error sending notification:', error);
      setResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Notification Tester
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Recipient Email
          </label>
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notification Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Test Notification"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="This is a test message!"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <button
          onClick={sendTestNotification}
          disabled={isSending}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Test Notification
            </>
          )}
        </button>

        {result && (
          <div
            className={`p-4 rounded-lg ${
              result.success
                ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'
            }`}
          >
            {result.message}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            📝 Setup Instructions:
          </h3>
          <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
            <li>Go to Firebase Console</li>
            <li>Project Settings → Cloud Messaging</li>
            <li>Copy the Server Key</li>
            <li>Paste it in NotificationTester.tsx (line 48)</li>
            <li>Enter recipient's email and test!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default NotificationTester;
