// ============== EXPORT SOUVENIR DU SÉJOUR ==============
// ✅ Génère une page HTML autonome (photos, XP, corvées, quêtes) téléchargeable —
// un souvenir qui survit à la suppression de l'app, à garder ou imprimer.
function exportTripSouvenir() {
  const r = computeTripRecap();
  const ranking = computeXpLeaderboard();
  const topPhotos = [...galleryItems]
    .sort((a, b) => ((b.likes || []).length) - ((a.likes || []).length))
    .slice(0, 12);

  const rankingRows = ranking.map((row, i) => `
    <tr>
      <td style="padding:8px 12px; color:#c99a3f; font-family:'Playfair Display',Georgia,serif;">${i + 1}</td>
      <td style="padding:8px 12px;">${escapeHtml(row.p.name)}</td>
      <td style="padding:8px 12px; text-align:right; font-weight:700; color:#c99a3f;">${row.xp} XP</td>
    </tr>
  `).join('');

  const photosHtml = topPhotos.map(p => `
    <div style="border:2px solid #c99a3f; border-radius:10px; padding:3px; background:#fff;">
      ${p.type === 'image' ? `<img src="${p.src}" style="width:100%; height:180px; object-fit:cover; border-radius:7px; display:block;">` : ''}
    </div>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8">
<title>Saraillon — Souvenir du séjour</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
  body { font-family: 'Inter', sans-serif; background: #f6f3ea; color: #0c2f3a; margin: 0; padding: 40px 20px; }
  .wrap { max-width: 720px; margin: 0 auto; }
  h1 { font-family: 'Playfair Display', Georgia, serif; font-size: 32px; text-align: center; margin-bottom: 4px; }
  .eyebrow { text-align: center; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #c99a3f; margin-bottom: 30px; }
  .seal { width: 60px; height: 60px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #ffe08a, #c99a3f 70%); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 700; box-shadow: 0 4px 12px rgba(12,47,58,0.2); }
  h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 19px; border-bottom: 1px solid #e4d9c0; padding-bottom: 8px; margin-top: 40px; }
  table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(12,47,58,0.06); }
  .stats { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
  .stat { flex: 1; min-width: 140px; background: #fff; border: 1px solid #e4d9c0; border-radius: 10px; padding: 16px; text-align: center; }
  .stat .num { font-family: 'Playfair Display', Georgia, serif; font-size: 26px; color: #c99a3f; }
  .stat .lbl { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #4a5a5e; margin-top: 4px; }
  .photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 16px; }
  footer { text-align: center; margin-top: 50px; font-size: 12px; font-style: italic; color: #7bb3bf; }
  @media print { body { padding: 0; } }
</style></head>
<body><div class="wrap">
  <div class="seal">S</div>
  <div class="eyebrow">Saraillon · 21 — 30 août 2026</div>
  <h1>Le carnet du séjour</h1>

  <div class="stats">
    <div class="stat"><div class="num">${r.totalXp}</div><div class="lbl">XP cumulés</div></div>
    <div class="stat"><div class="num">${r.choresDone}</div><div class="lbl">Corvées faites</div></div>
    <div class="stat"><div class="num">${r.questsDone}</div><div class="lbl">Défis relevés</div></div>
  </div>

  <h2>Classement final</h2>
  <table>${rankingRows}</table>

  ${photosHtml ? `<h2>Les photos les plus aimées</h2><div class="photos">${photosHtml}</div>` : ''}

  <footer>Merci pour ce séjour, à très vite pour le prochain 🏝️</footer>
</div></body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'saraillon-souvenir-du-sejour.html';
  a.click();
  URL.revokeObjectURL(url);
  showNotification('📖 Souvenir téléchargé ! Ouvre le fichier et imprime-le (Cmd/Ctrl+P) si tu veux un PDF.', 'success');
}
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

