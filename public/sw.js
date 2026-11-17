/* Buy4AChange Offline-Ready Lightweight Service Worker (Open-Source PWA) */
const CACHE_NAME = 'buy4achange-shell-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/missions/mission-01.jpg',
  '/missions/mission-02.jpg',
  '/missions/mission-03.jpg',
  '/missions/mission-04.jpg',
  '/missions/mission-05.jpg',
  '/missions/mission-06.jpg',
  '/missions/mission-07.jpg',
  '/missions/mission-08.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Never cache live API endpoints or cross-origin payment scripts
  if (url.pathname.startsWith('/api/') || url.origin !== self.location.origin) {
    return;
  }

  // Network-first for HTML navigation so fresh deploys load immediately, fallback to cache offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/', copy)).catch(() => undefined);
          return res;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Stale-while-revalidate for static assets & mission artworks
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => undefined);
          }
          return res;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
