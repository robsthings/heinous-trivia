const CACHE_NAME = 'heinous-trivia-v1';
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
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
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

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

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