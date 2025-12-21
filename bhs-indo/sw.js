const CACHE_NAME = 'buku-buku-v1';
const ASSETS = [
  '/bhs-indo/',
  '/bhs-indo/index.html',
  '/bhs-indo/main.js',
  '/bhs-indo/styles.css',
  '/bhs-indo/manifest.json',
  '/bhs-indo/sw.js',
  '/bhs-indo/lucide.js',
  '/bhs-indo/icon-192.png',
  '/bhs-indo/icon-512.png'
];

// Install: pre-cache asset statis
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        ASSETS.map(url =>
          cache.add(url).catch(err => console.error('❌ Gagal Cache:', url, err))
        )
      );
    })
  );
});

// Activate: hapus cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

// Fetch: Logika pengiriman data
self.addEventListener('fetch', event => {
  const req = event.request;

  // 1. JANGAN intercept request ke back-end (POST, PUT, DELETE)
  // Biarkan request ini langsung ke internet tanpa masuk ke logika cache
  if (req.method !== 'GET') {
    return; // Biarkan browser menangani secara default (langsung ke server)
  }

  // 2. Strategi untuk navigasi halaman (HTML)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 3. Strategi untuk asset statis & API GET (Cache First, Fallback to Network)
  event.respondWith(
    caches.match(req).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(req).then(networkResponse => {
        // Simpan salinan ke cache untuk penggunaan offline berikutnya
        const resClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
        return networkResponse;
      });
    })
  );
});