/* ModernTD offline cache. The app shell is cached on install; fonts are cached the first time they load. */
const CACHE = 'moderntd-254477ac0a';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'fonts/fonts.css', 'fonts/IBMPlexMono-400.woff2', 'fonts/IBMPlexMono-500.woff2', 'fonts/IBMPlexMono-600.woff2', 'fonts/SairaSemiCondensed-400.woff2', 'fonts/SairaSemiCondensed-500.woff2', 'fonts/SairaSemiCondensed-600.woff2', 'fonts/SairaSemiCondensed-700.woff2', 'fonts/SairaStencilOne-400.woff2', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url), font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !font) return;
  // pages: network first so updates arrive, cache when offline. Everything else: cache first.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); return r; }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })));
});
