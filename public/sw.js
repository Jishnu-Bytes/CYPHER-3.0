// CYPHER PWA Service Worker with IndexedDB Offline Sync Queue
const CACHE_NAME = 'cypher-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/console.html',
  '/console',
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

const IDB_NAME = 'cypher-offline-db';
const IDB_STORE = 'pending-reports';

function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getPendingOfflineReports() {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

async function removeOfflineReport(id) {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(id);
  } catch (e) {
    console.warn('[SW-IDB] Error removing report:', e);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline shell & GIS console');
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

  // Network First, fallback to cache for HTML and assets
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/socket.io/')) {
    return;
  }

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

        if (event.request.mode === 'navigate') {
          return (await caches.match('/console.html')) || (await caches.match('/report')) || (await caches.match('/index.html'));
        }
        return new Response('Offline: Content currently not cached', { status: 503, statusText: 'Offline' });
      })
  );
});

// Background sync support with automatic replay to /api/reports
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-reports') {
    event.waitUntil(
      (async () => {
        const reports = await getPendingOfflineReports();
        for (const item of reports) {
          try {
            const res = await fetch('/api/reports', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.payload)
            });
            if (res.ok) {
              await removeOfflineReport(item.id);
            }
          } catch (err) {
            console.warn('[SW-IDB] Failed sync attempt:', err);
          }
        }
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
          client.postMessage({ type: 'TRIGGER_OFFLINE_SYNC_COMPLETE' });
        });
      })()
    );
  }
});
