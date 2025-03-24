const CACHE_NAME = 'clownades-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/setting.html',
  '/app1.html',
  '/app2.html',
  '/app3.html',
  '/app4.html',
  '/app5.html',
  '/app6.html',
  '/app7.html',
  '/app8.html',
  '/app9.html',
  '/app10.html',
  '/app11.html',
  '/app12.html',
  '/app13.html',
  '/app14.html',
  '/app15.html',
  '/app16.html',
  '/app17.html',
  '/app18.html',
  '/app19.html',
  '/app20.html',
  '/src/styles/app1.css',
  '/src/styles/app2.css',
  '/src/styles/app3.css',
  '/src/styles/app4.css',
  '/src/styles/app5.css',
  '/src/scripts/app1.js',
  '/src/scripts/app2.js',
  '/src/scripts/app3.js',
  '/src/scripts/app4.js',
  '/src/scripts/app5.js',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/webfonts/fa-regular-400.woff2'
];

// Install event - cache all required resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((err) => {
        console.log('Cache installation failed: ', err);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a stream and can only be consumed once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // Добавляем в кэш только локальные ресурсы
                if (event.request.url.startsWith(self.location.origin)) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
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