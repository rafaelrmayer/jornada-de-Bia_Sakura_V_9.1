const CACHE = 'jornada-bia-sakura-v9-6-21';
const CORE = [
  './',
  './index.html',
  './js/card-suggestions.js',
  './js/navigation-layout.js',
  './js/card-model-data.js',
  './js/card-model.js',
  './css/card-suggestions.css',
  './css/sakura-friendly.css',
  './css/app-v9-6-8.css',
  './icons/zen-sakura-logo.svg', './assets/sakura-petalas.svg', './icons/zen-girassol.svg', './css/refinamento-v9-4.css',
  './js/security.js',
  './js/accessibility-v9-2-9.js',
  './js/storage.js',
  './js/context-records.js',
  './js/backup-crypto.js',
  './js/backup.js',
  './js/security-advanced.js',
  './js/sakura-ui.js', './js/random-forest.js', './js/neural-assistant.js', './js/app.js', './js/routine-activities.js', './js/experience.js', './js/sakura-activities-v9.js', './js/sakura-habits-v9-2.js',
  './manifest.json',
  './icon.svg', './icons/zen-sakura-logo.svg', './assets/sakura-prototipo.png', './assets/zen-landscape.svg',
  './icons/zen-heart.svg', './icons/zen-hands.svg', './icons/zen-smile.svg', './icons/zen-heart-rays.svg', './icons/chat.svg',
  './icons/routine.svg',
  './icons/activities.svg',
  './icons/brain.svg',
  './icons/butterfly-sakura.svg',
  './icons/want.svg',
  './icons/help.svg',
  './icons/feel.svg',
  './icons/add.svg'
];
self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE).then(c => c.addAll([...new Set(CORE)])).then(() => self.skipWaiting())
));
self.addEventListener('activate', e => e.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(k =>
      k !== CACHE && (k.startsWith('jornada-bia-sakura-') || k.startsWith('jornada-bia-v31-'))
    ).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(r => {
      if (r.ok && new URL(e.request.url).origin === location.origin) {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return r;
    }).catch(() => cached))
  );
});
