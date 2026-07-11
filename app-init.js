// ============== INIT STARTUP ==============
window.addEventListener('load', () => {
  loadAllData();  // ✅ Charger TOUJOURS les données au démarrage
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  setTimeout(injectHeroWaves, 400);
  setTimeout(checkUpcomingActivityReminders, 2000);
});

// ============== PWA INSTALL PROMPT ==============
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const btn = document.getElementById('pwa-install-btn');
  if (btn) btn.style.display = 'block';
});

function installPWA() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') {
        showNotification('✅ Application installée !', 'success');
        const btn = document.getElementById('pwa-install-btn');
        if (btn) btn.style.display = 'none';
      }
      deferredInstallPrompt = null;
    });
  } else if (navigator.share) {
    navigator.share({
      title: '🎮 SARAILLON',
      text: 'Gère ton séjour comme jamais!',
      url: window.location.href
    });
  } else {
    showNotification('📱 Ajoute à l\'écran d\'accueil via le menu du navigateur !', 'success');
  }
}

window.addEventListener('appinstalled', () => {
  const btn = document.getElementById('pwa-install-btn');
  if (btn) btn.style.display = 'none';
});

