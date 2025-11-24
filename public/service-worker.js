// Cache name - change this when you update your game
const CACHE_NAME = 'landen-grad-v1';

const BASE_PATH = self.location.pathname.startsWith('/Landen-2025-Graduation/')
  ? '/Landen-2025-Graduation'
  : self.location.pathname.startsWith('/Landen-2025-Graduation/')
  ? '/Landen-2025-Graduation'
  : '';

const ASSETS_TO_CACHE = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/bundle.min.js`,
  `${BASE_PATH}/style.css`,
  `${BASE_PATH}/bg.png`,
  `${BASE_PATH}/logo.png`,
  `${BASE_PATH}/full-screen.png`,
  `${BASE_PATH}/favicon.png`,
  `${BASE_PATH}/assets.json`,
  `${BASE_PATH}/manifest.json`
];

// Install event - caches assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate event - cleans up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('Service Worker: Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // Return cached asset
        }
        return fetch(event.request); // Fetch from network
      })
  );
});