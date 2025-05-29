const CACHE_NAME = 'heinous-trivia-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-128.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // Cache common game assets
  '/haunt-config/widowshollow.json',
  '/questions/widowshollow-trivia.json',
  '/haunt-config/widowshollow-ads.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip chrome-extension and other non-http requests to prevent cache errors
  if (!event.request.url.startsWith('http') || 
      event.request.url.startsWith('chrome-extension://') ||
      event.request.url.startsWith('moz-extension://') ||
      event.request.url.startsWith('blob:')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Only cache same-origin requests to avoid CORS issues
          if (event.request.url.startsWith(self.location.origin)) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        }).catch(() => {
          // If network fails, try to provide fallback content
          if (event.request.url.includes('/questions/') || event.request.url.includes('trivia')) {
            return new Response(JSON.stringify([
              {
                question: "What classic horror film features a shark terrorizing a beach town?",
                choices: ["Jaws", "The Meg", "Deep Blue Sea", "Sharknado"],
                correct: "Jaws"
              }
            ]), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});