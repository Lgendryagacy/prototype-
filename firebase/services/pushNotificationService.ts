import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../config';
import { getMessagingInstance } from '../config';

// VAPID key from Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificates
const VAPID_KEY = 'BBpcQPNg1oMX6XJlSCF_CMxBLqZQxkyWyybDzqjAn5_HHy2yPkJxd0sN38Yjluxya-hOmeYU_SslfdvdWj6uWX4'; // TODO: Replace with actual VAPID key from Firebase Console

/**
 * Check browser and device compatibility
 */
export const checkNotificationCompatibility = (): { 
  supported: boolean; 
  reason?: string;
  isIOS: boolean;
  browser: string;
} => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  // Detect browser
  let browser = 'Unknown';
  if (navigator.userAgent.indexOf('Chrome') > -1) browser = 'Chrome';
  else if (navigator.userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (navigator.userAgent.indexOf('Safari') > -1) browser = 'Safari';
  else if (navigator.userAgent.indexOf('Edge') > -1) browser = 'Edge';
  else if (navigator.userAgent.indexOf('Opera') > -1) browser = 'Opera';

  // iOS Safari doesn't support Web Push (FCM)
  if (isIOS) {
    return {
      supported: false,
      reason: 'iOS Safari does not support Web Push notifications. Please use the native app.',
      isIOS: true,
      browser
    };
  }

  // Check if Notification API exists
  if (!('Notification' in window)) {
    return {
      supported: false,
      reason: 'This browser does not support notifications',
      isIOS: false,
      browser
    };
  }

  // Check if Service Worker is supported
  if (!('serviceWorker' in navigator)) {
    return {
      supported: false,
      reason: 'Service Workers not supported in this browser',
      isIOS: false,
      browser
    };
  }

  return {
    supported: true,
    isIOS: false,
    browser
  };
};

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (userId: string): Promise<string | null> => {
  try {
    console.log('🔔 Starting notification permission request...');
    console.log('Browser:', navigator.userAgent);
    console.log('Platform:', navigator.platform);
    
    // Check compatibility first
    const compatibility = checkNotificationCompatibility();
    console.log('Compatibility check:', compatibility);
    
    if (!compatibility.supported) {
      console.error('❌', compatibility.reason);
      alert(compatibility.reason);
      return null;
    }

    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.error('❌ Notifications not supported');
      alert('Your browser does not support notifications');
      return null;
    }

    console.log('Current permission status:', Notification.permission);

    // Check if messaging is supported (Safari might not support it)
    const messaging = getMessagingInstance();
    if (!messaging) {
      console.error('❌ Firebase Messaging not supported');
      alert('Firebase Messaging is not supported in this browser. Please use Chrome, Firefox, or Edge.');
      return null;
    }

    console.log('✅ Firebase Messaging instance obtained');

    // Request permission
    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log('Permission result:', permission);
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Register service worker if not already registered
      if ('serviceWorker' in navigator) {
        try {
          console.log('Registering service worker...');
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
          });
          console.log('✅ Firebase Messaging service worker registered:', registration.scope);
          
          // Wait for service worker to be ready
          console.log('Waiting for service worker to be ready...');
          await navigator.serviceWorker.ready;
          console.log('✅ Service worker is ready');
          
          // Get FCM token with service worker registration
          console.log('Getting FCM token...');
          const token = await getToken(messaging, { 
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration
          });
          console.log('✅ FCM Token obtained:', token);
          
          // Save token to user's Firestore document
          await saveFCMToken(userId, token);
          
          // Test notification
          if (Notification.permission === 'granted') {
            new Notification('🎉 Notifications Enabled!', {
              body: 'You will now receive chat notifications',
              icon: '/FOGCOIN_SITE_ICON.png',
              tag: 'test-notification'
            });
          }
          
          return token;
        } catch (swError: any) {
          console.error('❌ Service worker registration error:', swError);
          console.error('Error details:', {
            message: swError.message,
            stack: swError.stack,
            name: swError.name
          });
          
          alert(`Service worker registration failed: ${swError.message}`);
          return null;
        }
      } else {
        // No service worker support
        console.error('❌ Service Worker not supported in this browser');
        alert('Service Workers are not supported in this browser. Please use Chrome, Firefox, or Edge.');
        return null;
      }
    } else if (permission === 'denied') {
      console.error('❌ Notification permission denied by user');
      alert('You have denied notification permissions. Please enable them in your browser settings to receive notifications.');
      return null;
    } else {
      console.log('⚠️ Notification permission dismissed');
      return null;
    }
  } catch (error: any) {
    console.error('❌ Error getting notification permission:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    alert(`Failed to enable notifications: ${error.message}`);
    return null;
  }
};

/**
 * Save FCM token to user's Firestore document
 */
const saveFCMToken = async (userId: string, token: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      fcmTokens: arrayUnion(token),
      lastTokenUpdate: new Date()
    });
    console.log('✅ FCM token saved to Firestore');
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};

/**
 * Listen for foreground messages (when user is on the site)
 */
export const onForegroundMessage = (callback: (payload: any) => void) => {
  const messaging = getMessagingInstance();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log('📨 Foreground message received:', payload);
    callback(payload);
  });
};

/**
 * Check if user has granted notification permission
 */
export const hasNotificationPermission = (): boolean => {
  if (!('Notification' in window)) return false;
  return Notification.permission === 'granted';
};

/**
 * Show a local notification (for testing or foreground messages)
 */
export const showLocalNotification = (title: string, options?: NotificationOptions) => {
  if (!hasNotificationPermission()) {
    console.log('Cannot show notification - permission not granted');
    return;
  }

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        icon: '/fogsly-icon-192.png',
        badge: '/fogsly-icon-96.png',
        ...options
      });
    });
  }
};
