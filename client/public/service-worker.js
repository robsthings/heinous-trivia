const CACHE_NAME = 'heinous-cache-v4';

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/launcher.html',
      ]);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http') || 
      event.request.url.startsWith('chrome-extension://') ||
      event.request.url.startsWith('moz-extension://') ||
      event.request.url.startsWith('blob:')) {
    return;
  }

  // Skip Firebase Storage URLs to prevent CORS caching issues
  if (event.request.url.includes('firebasestorage.googleapis.com') ||
      event.request.url.includes('storage.googleapis.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Only cache successful responses
        if (response.ok) {
          return response;
        }
        // For failed responses, don't cache and still return the response
        return response;
      })
      .catch(() =>
        caches.match(event.request)
      )
  );
});