// ============== MODALS ==============
function openModal(id) {
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// ============== OFFLINE ==============
if (!navigator.onLine) {
  document.addEventListener('DOMContentLoaded', () => {
    const ind = document.getElementById('offlineIndicator');
    if (ind) ind.classList.add('show');
  });
}

window.addEventListener('online', () => {
  isOnline = true;
  document.getElementById('offlineIndicator').classList.remove('show');
  addNotification('📡 Reconnecté!');
  saveAllData();
});

window.addEventListener('offline', () => {
  isOnline = false;
  document.getElementById('offlineIndicator').classList.add('show');
});

function syncData() {
  if (isOnline) saveAllData();
}

// ============== SETTINGS ==============
function renderSettings() {
  // ✅ Icône engrenages personnalisée (remplace l'emoji ⚙️)
  const iconSlot = document.getElementById('settings-tab-icon');
  if (iconSlot && typeof EXPLORE_ICONS_3D !== 'undefined') iconSlot.innerHTML = EXPLORE_ICONS_3D.parametres;

  // Settings page has static HTML content - just show it
  const content = document.querySelector('#settings .content');
  if (content) {
    content.style.display = 'block';
  }
}

function backupData() {
  const data = {
    personalsData,
    challenges,
    galleryItems,
    feed,
    shoppingList,
    inscriptions,
    notifications,
    activitiesInscription,
    timestamp: new Date().toLocaleString()
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `saraillon-backup-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('📥 Sauvegarde téléchargée!', 'success');
  addFeedEntry('📁 A téléchargé une sauvegarde');
}

function restoreData() {
  const input = document.getElementById('restore-file');
  input.click();
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          personalsData = data.personalsData || {};
          challenges = data.challenges || [];
          galleryItems = data.galleryItems || [];
          feed = data.feed || [];
          shoppingList = data.shoppingList || [];
          inscriptions = data.inscriptions || {};
          notifications = data.notifications || [];
          activitiesInscription = data.activitiesInscription || [];
          
          saveAllData();
          showNotification('✅ Données restaurées!', 'success');
          addFeedEntry('📂 A restauré une sauvegarde');
          
          // Refresh all views
          renderPlanning();
          renderChallenges();
          renderGallery();
          renderShopping();
          renderFeed();
        } catch (error) {
          showNotification('❌ Erreur lors de la restauration', 'error');
        }
      };
      reader.readAsText(file);
    }
  };
}

function shareApp() {
  const shareText = `🏝️ SARAILLON ULTIMATE - Gère ton séjour de groupe! 
Accès: https://marine-data.github.io/hyuga/
Code: 2026`;
  
  if (navigator.share) {
    navigator.share({
      title: 'SARAILLON ULTIMATE',
      text: shareText
    }).catch(err => console.log('Share cancelled'));
  } else {
    // Fallback: copy to clipboard
    const textarea = document.createElement('textarea');
    textarea.value = shareText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showNotification('📋 Lien copié au presse-papiers!', 'success');
  }
  
  addFeedEntry('🔗 A partagé l\'app');
}

// ============== DEEZER ==============
function toggleDeezer() {
  document.getElementById('deezerPanel').classList.toggle('open');
}

// ============== SURPRISE ==============
function revealSurprise() {
  const input = document.getElementById('surprise-code');
  if (input.value.toUpperCase() === 'MAGIA') {
    document.getElementById('surprise-content').innerHTML = `
      <div class="card" style="background: linear-gradient(135deg, var(--accent-gold), var(--accent-pink)); color: white; text-align: center; margin-top: 12px; border: none;">
        <h3 style="font-family: 'Bricolage Grotesque', sans-serif; font-weight: 700; font-size: 16px; margin-bottom: 12px;">🎉 SURPRISE !</h3>
        <p style="font-size: 13px; line-height: 1.8;">Dimanche - Lieu secret 🤫<br>10h30 – 00h00<br>Mystère et magie ✨</p>
      </div>
    `;
    showNotification('🎉 Surprise débloquée !', 'success');
    addNotification(`💎 ${currentUser.name} a découvert la surprise !`, '💎', 'surprises');
    celebrateWithConfetti();
    if (typeof MedAnim !== 'undefined' && MedAnim.lanterns) setTimeout(() => MedAnim.lanterns(), 400);
    input.value = '';
    input.disabled = true;
  } else {
    showNotification('❌ Code incorrect', 'error');
    input.value = '';
  }
}

// Enter key
document.addEventListener('DOMContentLoaded', function() {
  // Afficher le modal de sélection de profil au démarrage
  startProfileSelection();
});

// ============== MESSAGE DU MATIN ==============
// Petites phrases originales (écrites pour l'app, pas des citations) inspirées des
// valeurs de la tradition confucéenne : harmonie du groupe, gratitude, bienveillance
// envers les autres et la nature, attention à soi. Une par jour de séjour, associée
// au programme du jour, affichée une seule fois par appareil et par jour.
const MORNING_WISDOM = [
  "L'harmonie du groupe se construit dans les petits gestes du quotidien.",
  "Prendre soin de soi aujourd'hui, c'est mieux prendre soin des autres demain.",
  "Un mot de gratitude change la journée de celui qui le reçoit, et de celui qui le donne.",
  "Le respect commence par l'écoute : accorder un instant d'attention sincère à chacun.",
  "La nature qui nous entoure mérite la même douceur que celle qu'on offre à ses proches.",
  "Le calme d'un esprit se cultive jour après jour, comme un jardin qu'on arrose.",
  "Rendre service sans rien attendre en retour est la plus discrète des richesses.",
  "Une journée réussie est une journée où l'on a fait un peu de bien, même invisible.",
  "L'équilibre entre soi et les autres se retrouve en accordant du temps aux deux.",
  "La bienveillance envers les animaux et les lieux qu'on traverse honore le voyage lui-même.",
  "Savourer l'instant présent, ensemble, est déjà une forme de sagesse.",
  "Un sourire donné à un inconnu revient souvent, sous une autre forme, plus tard."
];

function summarizeTodayProgram(dayIdx) {
  const day = planningData[dayIdx];
  if (!day || !day.activities || day.activities.length === 0) {
    return "pas de programme particulier prévu, profitez-en pour souffler";
  }
  const names = day.activities.map(a => a.nom).filter(Boolean).slice(0, 3);
  let summary = names.join(', ');
  if (day.activities.length > names.length) {
    summary += ` (+${day.activities.length - names.length} autre${day.activities.length - names.length > 1 ? 's' : ''})`;
  }
  return summary;
}

function showMorningWisdomIfDue() {
  const dayIdx = getTripDayIndex(new Date());
  if (dayIdx === null) return; // avant ou après le séjour, rien à afficher

  const todayKey = new Date().toISOString().slice(0, 10);
  if (localStorage.getItem('saraillon_morning_wisdom_shown') === todayKey) return;

  // ✅ Blague spéciale le samedi matin, validée avec Marine
  const isSaturday = new Date().getDay() === 6;
  const wisdom = isSaturday
    ? "Proverbe fonctionnaire : ne dors jamais le matin sinon tu ne sauras jamais quoi foutre l'après-midi."
    : MORNING_WISDOM[dayIdx % MORNING_WISDOM.length];
  const programSummary = summarizeTodayProgram(dayIdx);
  const fullMessage = `${wisdom} Aujourd'hui : ${programSummary}. Belle journée à toi 🌞`;

  addNotification(fullMessage, '🌞', 'morning');
  showNotification(`🌞 ${wisdom}`, 'success');
  localStorage.setItem('saraillon_morning_wisdom_shown', todayKey);
}

