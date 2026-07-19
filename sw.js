// ============== SARAILLON ULTIMATE - Service Worker ==============
// Gère la réception des notifications push et le clic dessus.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
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
      // 🐛 CORRECTIF : un tag fixe partagé par toutes les notifs pouvait faire que
      // plusieurs envois rapprochés s'écrasent silencieusement entre eux (le dernier
      // remplace le précédent sans toujours redéclencher une alerte visible/sonore
      // selon l'appareil). Le tag est maintenant unique à chaque envoi.
      tag: `saraillon-notif-${Date.now()}`,
      renotify: true,
      vibrate: [100, 50, 100],
      // 🆕 Mémorise vers quel onglet naviguer si on clique sur la notif (ex: "inscriptions")
      data: { tab: data.tab || null }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // 🆕 CORRECTIF : le clic sur une notif se contentait d'ouvrir/focus l'app à la racine,
  // sans jamais naviguer vers l'onglet concerné (ex: cliquer sur le rappel d'inscriptions
  // ne menait pas à l'onglet Inscriptions). On transmet maintenant la cible au client déjà
  // ouvert via postMessage, ou via un paramètre d'URL si l'app doit s'ouvrir depuis zéro.
  const targetTab = event.notification.data && event.notification.data.tab;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if (targetTab && 'postMessage' in client) client.postMessage({ type: 'navigate', tab: targetTab });
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetTab ? `./?openTab=${targetTab}` : './');
      }
    })
  );
});
