// ============== INIT STARTUP ==============
window.addEventListener('load', () => {
  loadAllData();  // ✅ Charger TOUJOURS les données au démarrage
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  setTimeout(injectHeroWaves, 400);
  setTimeout(checkUpcomingActivityReminders, 2000);
});

// 🆕 Clic sur une notif alors que l'app est déjà ouverte quelque part : le service worker
// nous prévient par ce message, on navigue directement vers l'onglet concerné.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'navigate' && event.data.tab) {
      navigateToTabWhenReady(event.data.tab);
    }
  });
}

// 🆕 Clic sur une notif alors que l'app n'était pas ouverte : le service worker l'ouvre avec
// ?openTab=xxx dans l'URL, on lit ce paramètre au démarrage.
window.addEventListener('load', () => {
  const openTab = new URLSearchParams(window.location.search).get('openTab');
  if (openTab) navigateToTabWhenReady(openTab);
});

// ✅ L'app met un moment à charger le profil + les données avant que switchTab() soit
// utilisable ; on réessaie à intervalles courts plutôt que de risquer un appel trop tôt
// qui échouerait silencieusement (appContainer pas encore affiché, currentUser pas prêt).
function navigateToTabWhenReady(tab, attempt) {
  attempt = attempt || 0;
  const ready = typeof switchTab === 'function' && typeof currentUser !== 'undefined' && currentUser &&
    document.getElementById('appContainer') && document.getElementById('appContainer').style.display === 'block';
  if (ready) {
    switchTab(tab);
  } else if (attempt < 30) {
    setTimeout(() => navigateToTabWhenReady(tab, attempt + 1), 300);
  }
}

// ============== PWA INSTALL PROMPT (2 boutons distincts Android / iOS) ==============
let deferredInstallPrompt = null;

function isIOSDevice() {
  const ua = navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
}

function isAndroidDevice() {
  return /Android/.test(navigator.userAgent || '');
}

function isAlreadyInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

// Chrome/Edge Android déclenche cet évènement quand l'app est installable :
// on garde la référence pour pouvoir déclencher le vrai prompt natif au clic.
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
});

// 🆕 Bouton Android — déclenche le prompt natif Chrome (fenêtre "Installer" en bas de
// l'écran) ; l'explication en 3 étapes reste affichée en permanence sous le bouton
// dans index.html pour quelqu'un qui n'a jamais fait ça.
function installAndroid() {
  if (isAlreadyInstalled()) {
    showNotification('✅ L\'application est déjà installée !', 'success');
    return;
  }
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') {
        showNotification('✅ Application installée !', 'success');
      }
      deferredInstallPrompt = null;
    });
  } else {
    // Le prompt natif n'est pas (encore) disponible : guide vers le menu du navigateur
    showNotification('📱 Ouvre le menu ⋮ en haut à droite de Chrome, puis touche "Installer l\'application"', 'success');
  }
}

// 🆕 Bouton iOS — Safari n'a jamais de prompt automatique (non supporté par Apple),
// donc on affiche directement une modale claire avec la vraie marche à suivre.
function installIOS() {
  if (isAlreadyInstalled()) {
    showNotification('✅ L\'application est déjà installée !', 'success');
    return;
  }
  showIOSInstallInstructions();
}

function showIOSInstallInstructions() {
  let modal = document.getElementById('ios-install-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ios-install-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:999999;background:rgba(12,47,58,0.6);display:flex;align-items:center;justify-content:center;padding:24px;';
    modal.innerHTML = `
      <div style="background:#fff;border-radius:16px;padding:24px;max-width:340px;width:100%;text-align:center;">
        <div style="font-size:36px;margin-bottom:8px;">🍏</div>
        <div style="font-weight:700;font-size:17px;margin-bottom:16px;">Installer sur iPhone/iPad</div>
        <div style="text-align:left;font-size:14px;line-height:1.7;color:#333;margin-bottom:20px;">
          1️⃣ Touche l'icône <strong>Partager</strong> ⬆️ en bas de Safari<br>
          2️⃣ Fais défiler et choisis <strong>« Sur l'écran d'accueil »</strong><br>
          3️⃣ Touche <strong>« Ajouter »</strong> en haut à droite
        </div>
        <button onclick="closeIOSInstallModal()" style="width:100%;padding:12px;border:none;border-radius:10px;background:linear-gradient(135deg,#1D5FA8,#1690A3);color:#fff;font-weight:700;cursor:pointer;">J'ai compris !</button>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
}

// ✅ iOS n'a aucun événement fiable équivalent à 'appinstalled' — on ne peut donc pas
// confirmer que la personne a réellement terminé les 3 étapes. On log honnêtement
// qu'elle a suivi les instructions, pas qu'elle a "installé" à coup sûr.
function closeIOSInstallModal() {
  const modal = document.getElementById('ios-install-modal');
  if (modal) modal.remove();
  if (typeof addFeedEntry === 'function' && typeof currentUser !== 'undefined' && currentUser) {
    addFeedEntry('a suivi les instructions d\'installation iOS 🍏', '🍏');
  }
}

// ✅ Les deux boutons sont visibles pour tout le monde par défaut (au cas où la détection
// d'appareil se trompe), mais on met en avant celui qui correspond à l'appareil détecté
// et on masque celui qui ne peut clairement pas servir (ex: bouton iOS sur un Android).
document.addEventListener('DOMContentLoaded', () => {
  const androidBtn = document.getElementById('pwa-install-android-btn');
  const iosBtn = document.getElementById('pwa-install-ios-btn');
  if (isAlreadyInstalled()) {
    if (androidBtn) androidBtn.parentElement.style.display = 'none';
    return;
  }
  if (isIOSDevice() && androidBtn) {
    androidBtn.style.display = 'none';
    androidBtn.nextElementSibling.style.display = 'none'; // son explication
  } else if (isAndroidDevice() && iosBtn) {
    iosBtn.style.display = 'none';
    iosBtn.nextElementSibling.style.display = 'none'; // son explication
  }
});

window.addEventListener('appinstalled', () => {
  showNotification('✅ Application installée !', 'success');
  // 🆕 Visible dans le fil d'activité. Fiable sur Android (vrai événement navigateur) —
  // iOS n'a pas d'équivalent, voir showIOSInstallInstructions() pour ce cas.
  if (typeof addFeedEntry === 'function' && typeof currentUser !== 'undefined' && currentUser) {
    addFeedEntry('a installé l\'application 📲', '📲');
  }
});

