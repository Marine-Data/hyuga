// ============== SARAILLON ULTIMATE - Service Worker ==============
// Gère la réception des notifications push, le clic dessus, et le mode HORS-LIGNE.

// ✅ (audit) Cache hors-ligne : jusqu'ici le service worker ne gérait que les push —
// sans réseau, la PWA affichait une page blanche, précisément dans le scénario "île
// avec du réseau capricieux" pour lequel elle existe. Stratégie : les fichiers de
// l'app sont servis depuis le cache (démarrage instantané, même hors-ligne) et mis à
// jour en arrière-plan à chaque visite ("stale-while-revalidate"). Les appels Supabase
// ne sont JAMAIS mis en cache (données vivantes). Pour déployer une grosse mise à jour
// immédiatement, incrémenter CACHE_VERSION ci-dessous.
// ⚠️ À INCRÉMENTER À CHAQUE DÉPLOIEMENT de fichiers .js/.html/.css, sinon les
// téléphones continuent de servir l'ancienne version depuis le cache — et peuvent
// même mélanger ancien et nouveau (ex : le nouvel app-core.js avec l'ancien
// saraillon-data.js, ce qui donne une carte Réservations vide).
// v2 = planning du 22/07/2026 (plongée, réservations, correctifs de suppression).
const CACHE_VERSION = 'saraillon-v10';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './saraillon-data.js',
  './app-core.js',
  './app-init.js',
  './app-anim.js',
  './app-activities.js',
  './app-challenges.js',
  './app-features.js',
  './app-gallery.js',
  './app-misc.js',
  './app-planning.js',
  './app-social.js',
  './icon192.png',
  './icon512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      // ✅ Ajout fichier par fichier : un seul 404 ne doit pas faire échouer tout le précache
      Promise.allSettled(APP_SHELL.map((f) => cache.add(f)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Jamais de cache pour Supabase (données/temps réel) ni les domaines externes (polices...)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchAndUpdate = fetch(req).then((res) => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() => cached || (req.mode === 'navigate' ? caches.match('./index.html') : undefined));
      // Cache d'abord (instantané), mise à jour réseau en arrière-plan
      return cached || fetchAndUpdate;
    })
  );
});

self.addEventListener('push', (event) => {
  let data = { title: '🏝️ SARAILLON', body: 'Nouvelle notification' };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {
    // Payload non-JSON, on garde les valeurs par défaut
  }

  event.waitUntil(
    self.registration.showNotification(data.title || '🏝️ SARAILLON', {
      body: data.body || '',
      tag: 'saraillon-notif',
      renotify: true,
      vibrate: [100, 50, 100]
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
