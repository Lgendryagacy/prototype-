// Service Worker for FOGSLY PWA
const CACHE_NAME = 'fogsly-v4'; // Increment version to force cache update
const urlsToCache = [
  '/',
  '/index.html',
  '/images/main-logo/fogsly.png'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when offline, otherwise fetch from network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests and chrome-extension requests
  if (
    !event.request.url.startsWith(self.location.origin) ||
    event.request.url.startsWith('chrome-extension://') ||
    event.request.url.startsWith('moz-extension://') ||
    event.request.url.startsWith('safari-extension://')
  ) {
    return;
  }

  // NEVER cache Firebase API calls - always fetch fresh data
  if (
    event.request.url.includes('firestore.googleapis.com') ||
    event.request.url.includes('firebase') ||
    event.request.url.includes('/api/') ||
    event.request.method !== 'GET'
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    // Network-first strategy for HTML files
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();

        // Update cache with new response
        if (response && response.status === 200 && response.type === 'basic') {
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch((error) => {
              console.log('Cache put error:', error);
            });
        }

        return response;
      })
      .catch((error) => {
        console.log('Fetch error, falling back to cache:', error);
        // If network fails, try cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            return cachedResponse || caches.match('/');
          });
      })
  );
});

// Push notification event - handle incoming push messages
self.addEventListener('push', (event) => {
  console.log('📨 Push notification received:', event);
  
  let notificationTitle = 'New Message';
  let notificationOptions = {
    body: 'You have a new message',
    icon: '/images/main-logo/fogsly.png',
    badge: '/images/main-logo/fogsly.png',
    data: {},
    tag: 'chat-message',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open',
        title: '💬 Open Chat'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };

  // Parse push notification payload
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('📦 Push payload:', payload);
      
      // FCM sends notifications in this format
      if (payload.notification) {
        notificationTitle = payload.notification.title || notificationTitle;
        notificationOptions.body = payload.notification.body || notificationOptions.body;
        notificationOptions.icon = payload.notification.icon || notificationOptions.icon;
      }
      
      // Store data for click handling
      if (payload.data) {
        notificationOptions.data = payload.data;
      }
      
      console.log('📢 Showing notification:', notificationTitle, notificationOptions);
    } catch (error) {
      console.error('❌ Error parsing push data:', error);
    }
  }

  // IMPORTANT: Show the notification!
  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
      .then(() => {
        console.log('✅ Notification displayed successfully');
      })
      .catch((error) => {
        console.error('❌ Error showing notification:', error);
      })
  );
});

// Notification click event - handle user clicking on notification
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  
  event.notification.close();

  // Handle action buttons
  if (event.action === 'close') {
    console.log('Notification dismissed by user');
    return;
  }

  // Open chat page or focus existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        console.log('Found', windowClients.length, 'open windows');
        
        // Check if there's already a window open
        for (let client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            console.log('Focusing existing window and navigating to chat');
            
            // Store conversation info for chat page to pick up
            if (event.notification.data) {
              client.postMessage({
                type: 'OPEN_CHAT',
                conversationId: event.notification.data.conversationId,
                senderId: event.notification.data.senderId
              });
            }
            
            return client.focus().then(() => {
              // Navigate to messages with conversationId
              let messagesUrl = '/messages';
              if (event.notification.data && event.notification.data.conversationId) {
                messagesUrl += '?conversationId=' + event.notification.data.conversationId;
              }
              return client.navigate(messagesUrl);
            });
          }       
        }
        
        // No window open, open a new one
        console.log('Opening new window at /messages');
        let messagesUrl = self.location.origin + '/messages';
        if (event.notification.data && event.notification.data.conversationId) {
          // Include conversationId in URL
          messagesUrl += '?conversationId=' + event.notification.data.conversationId;
        }
        return clients.openWindow(messagesUrl);
      })
  );
});
