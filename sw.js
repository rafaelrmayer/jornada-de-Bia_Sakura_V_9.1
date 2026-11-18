const CACHE = 'jornada-bia-sakura-v9-6-60';
const CORE = [
  './',
  './index.html',
  './js/guided-voice.js', './css/guided-voice.css',
  './js/google-access.js', './js/data-api-client.js', './js/data-account.js', './css/data-account.css', './css/support-settings.css?v=health-backup',
  './js/word-practice.js', './js/word-goals.js', './js/word-summary.js', './js/word-report.js', './css/word-goals.css',
  './js/card-suggestions.js',
  './js/navigation-layout.js', './js/communication-usage.js',
  './js/card-model-data.js',
  './js/card-model.js',
  './css/card-suggestions.css',
  './css/sakura-friendly.css', './css/sakura-board.css?v=agora-depois',
  './assets/arasaac/5441.png', './assets/arasaac/37160.png', './assets/arasaac/11476.png',
  './assets/arasaac/2276.png', './assets/arasaac/2746.png', './assets/arasaac/6537.png',
  './assets/arasaac/7171.png', './assets/arasaac/15814.png', './assets/arasaac/36109.png',
  './assets/arasaac/9907.png', './assets/arasaac/35537.png', './assets/arasaac/35545.png',
  './css/app-v9-6-8.css',
  './icons/zen-sakura-logo.svg', './assets/sakura-petalas.svg', './icons/zen-girassol.svg', './css/refinamento-v9-4.css',
  './js/module-data.js',
  './js/emotions.js',
  './js/accessibility-v9-2-8.js',
  './js/security.js',
  './js/accessibility-v9-2-9.js',
  './js/storage.js?v=health-backup',
  './js/context-records.js',
  './js/rf-evaluation.js',
  './js/rf-evaluation-ui.js',
  './js/backup-crypto.js',
  './js/backup.js?v=health-backup-2',
  './js/security-advanced.js',
  './js/sakura-ui.js', './js/random-forest.js', './js/neural-assistant.js', './js/app.js?v=phrase-tools', './js/routine-activities.js?v=agora-depois', './js/experience.js', './js/sakura-activities-v9.js', './js/sakura-habits-v9-2.js',
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
  caches.open(CACHE)
    .then(cache => cache.addAll([...new Set(CORE)].map(url => new Request(url, { cache: 'reload' }))))
    .then(() => self.skipWaiting())
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
