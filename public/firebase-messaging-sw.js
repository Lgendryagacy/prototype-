// Firebase Cloud Messaging Service Worker
// This file is required by Firebase Cloud Messaging

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyAocXQDCfVjS31FoKwYl0OWC_aI62T5EUU",
  authDomain: "fogsly-f3a47.firebaseapp.com",
  projectId: "fogsly-f3a47",
  storageBucket: "fogsly-f3a47.firebasestorage.app",
  messagingSenderId: "1039815433373",
  appId: "1:1039815433373:web:46a866e3f3bde6c3a29b05",
  measurementId: "G-QWD8WJVKF0"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('📨 Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'New Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message',
    icon: '/FOGCOIN_SITE_ICON.png',
    badge: '/FOGCOIN_SITE_ICON.png',
    data: payload.data || {},
    tag: 'chat-message',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: 'Open Chat'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open or focus chat window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (let client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            // Store userId in sessionStorage
            if (event.notification.data && event.notification.data.userId) {
              client.postMessage({
                type: 'OPEN_CHAT',
                userId: event.notification.data.userId
              });
            }
            return client.focus().then(() => {
              return client.navigate('/chat');
            });
          }
        }
        
        // No window open, open a new one
        let chatUrl = self.location.origin + '/chat';
        if (event.notification.data && event.notification.data.userId) {
          // Store in sessionStorage via postMessage after window opens
          chatUrl += '?userId=' + event.notification.data.userId;
        }
        return clients.openWindow(chatUrl);
      })
  );
});
