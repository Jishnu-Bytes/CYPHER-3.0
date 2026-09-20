// CYPHER PWA Service Worker
const CACHE_NAME = 'cypher-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/verify-phone',
  '/verify-phone.html',
  '/verify-id',
  '/verify-id.html',
  '/report',
  '/report.html',
  '/admin',
  '/admin.html',
  '/i18n.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline shell');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[ServiceWorker] Cache addAll notice:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Do not cache API requests or Socket.io traffic in the SW cache (they are handled via IndexedDB queue)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io/')) {
    return;
  }

  // Network First, fallback to cache for HTML and assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200 && event.request.method === 'GET') {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
          });
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;

        // If navigation request fails offline, fallback to report or index
        if (event.request.mode === 'navigate') {
          return (await caches.match('/report')) || (await caches.match('/report.html')) || (await caches.match('/index.html'));
        }
        return new Response('Offline: Content currently not cached', { status: 503, statusText: 'Offline' });
      })
  );
});

// Background sync support
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-reports') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'TRIGGER_OFFLINE_SYNC' });
        });
      })
    );
  }
});
