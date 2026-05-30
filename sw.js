/**
 * Service Worker — Digital Business Card (Layla Hassan)
 * Bump CACHE_VERSION on every deploy that changes HTML/JS/CSS.
 */
const CACHE_VERSION = 'dbc-layla-pwa-v3';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/assets/icons/favicon/png/android-chrome-192x192.png',
  '/assets/icons/favicon/png/android-chrome-512x512.png'
];

function isNetworkOnly(url) {
  const path = url.pathname;
  return path.endsWith('/sw.js') || path.endsWith('/manifest.webmanifest');
}

function isNetworkFirst(url, request) {
  const path = url.pathname;
  return request.mode === 'navigate'
    || path === '/'
    || path.endsWith('/index.html')
    || path.startsWith('/js/')
    || path.startsWith('/scripts/')
    || path.startsWith('/styles/')
    || path.startsWith('/data/');
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_VERSION);

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (_error) {
    const cached = await cache.match(request);
    if (cached) return cached;

    if (request.mode === 'navigate') {
      const offline = await cache.match(OFFLINE_URL);
      if (offline) return offline;
    }

    throw _error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.status === 200) {
    const cache = await caches.open(CACHE_VERSION);
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => Promise.allSettled(
        PRECACHE_ASSETS.map((asset) => cache.add(asset))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  if (isNetworkOnly(url)) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (isNetworkFirst(url, event.request)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});
