// ✅ Upload de la photo de fond de l'écran d'accueil/connexion, chemin fixe pour
// que tout le monde la voie automatiquement (y compris avant connexion).
async function uploadHeroBackground(inputEl) {
  const file = inputEl.files[0];
  if (!file) return;
  const progressEl = document.getElementById('hero-bg-upload-progress');
  if (progressEl) progressEl.textContent = '⏳ Envoi en cours...';

  try {
    const publicUrl = await uploadFileToStorage('app-assets', 'hero-login.jpg', file);
    const img = document.getElementById('hero-bg-photo');
    if (img) {
      img.src = `${publicUrl}?t=${Date.now()}`;
      img.style.display = 'block';
    }
    if (progressEl) progressEl.textContent = '✅ Photo mise en ligne !';
    showNotification('🖼️ Fond d\'accueil mis à jour !', 'success');
  } catch (err) {
    console.error('Échec upload fond accueil:', err);
    const detail = (err && (err.message || err.error || err.statusCode)) || 'erreur inconnue';
    if (progressEl) progressEl.textContent = `❌ Échec : ${detail}`;
    showNotification(`❌ Échec upload : ${detail}`, 'error');
  }
}

// ✅ Version nuit de la photo d'accueil, s'affiche automatiquement en fondu
// (voir applyHeroDayNight dans app-anim.js) selon l'heure réelle.
async function uploadHeroBackgroundNight(inputEl) {
  const file = inputEl.files[0];
  if (!file) return;
  const progressEl = document.getElementById('hero-bg-night-upload-progress');
  if (progressEl) progressEl.textContent = '⏳ Envoi en cours...';

  try {
    const publicUrl = await uploadFileToStorage('app-assets', 'hero-login-night.jpg', file);
    const img = document.getElementById('hero-bg-photo-night');
    if (img) {
      img.src = `${publicUrl}?t=${Date.now()}`;
    }
    if (progressEl) progressEl.textContent = '✅ Photo mise en ligne !';
    showNotification('🌙 Fond de nuit mis à jour !', 'success');
  } catch (err) {
    console.error('Échec upload fond accueil nuit:', err);
    const detail = (err && (err.message || err.error || err.statusCode)) || 'erreur inconnue';
    if (progressEl) progressEl.textContent = `❌ Échec : ${detail}`;
    showNotification(`❌ Échec upload : ${detail}`, 'error');
  }
}

// ✅ Texture papier de fond des cartes "luxe" — appliquée via CSS background-image
async function uploadTexturePaper(inputEl) {
  const file = inputEl.files[0];
  if (!file) return;
  const progressEl = document.getElementById('texture-paper-upload-progress');
  if (progressEl) progressEl.textContent = '⏳ Envoi en cours...';
  try {
    await uploadFileToStorage('app-assets', 'texture-paper.jpg', file);
    if (progressEl) progressEl.textContent = '✅ Mise en ligne ! (rafraîchis la page pour la voir)';
    showNotification('🎨 Texture mise à jour !', 'success');
  } catch (err) {
    console.error('Échec upload texture:', err);
    const detail = (err && (err.message || err.error || err.statusCode)) || 'erreur inconnue';
    if (progressEl) progressEl.textContent = `❌ Échec : ${detail}`;
    showNotification(`❌ Échec upload : ${detail}`, 'error');
  }
}

// ✅ Photo détail (bandeau derrière le titre "Explorer" de l'accueil)
async function uploadDetailWater(inputEl) {
  const file = inputEl.files[0];
  if (!file) return;
  const progressEl = document.getElementById('detail-water-upload-progress');
  if (progressEl) progressEl.textContent = '⏳ Envoi en cours...';
  try {
    const publicUrl = await uploadFileToStorage('app-assets', 'detail-water.jpg', file);
    document.querySelectorAll('img[src*="detail-water.jpg"]').forEach(img => { img.src = `${publicUrl}?t=${Date.now()}`; });
    if (progressEl) progressEl.textContent = '✅ Photo mise en ligne !';
    showNotification('🌊 Bandeau mis à jour !', 'success');
  } catch (err) {
    console.error('Échec upload détail eau:', err);
    const detail = (err && (err.message || err.error || err.statusCode)) || 'erreur inconnue';
    if (progressEl) progressEl.textContent = `❌ Échec : ${detail}`;
    showNotification(`❌ Échec upload : ${detail}`, 'error');
  }
}

// ✅ Upload générique pour les bandeaux d'en-tête (Quêtes, Trésor, Profils, Galerie)
async function uploadBandPhoto(key, inputEl) {
  const file = inputEl.files[0];
  if (!file) return;
  const progressEl = document.getElementById(`band-${key}-upload-progress`);
  if (progressEl) progressEl.textContent = '⏳ Envoi en cours...';
  try {
    const path = `band-${key}.jpg`;
    const publicUrl = await uploadFileToStorage('app-assets', path, file);
    document.querySelectorAll(`img[src*="${path}"]`).forEach(img => { img.src = `${publicUrl}?t=${Date.now()}`; });
    if (progressEl) progressEl.textContent = '✅ Photo mise en ligne !';
    showNotification('🖼️ Bandeau mis à jour !', 'success');
  } catch (err) {
    console.error(`Échec upload bandeau ${key}:`, err);
    const detail = (err && (err.message || err.error || err.statusCode)) || 'erreur inconnue';
    if (progressEl) progressEl.textContent = `❌ Échec : ${detail}`;
    showNotification(`❌ Échec upload : ${detail}`, 'error');
  }
}

// ✅ Upload générique pour les 9 photos de jour du planning (day-XXX.jpg)
async function uploadDayPhoto(key, inputEl) {
  const file = inputEl.files[0];
  if (!file) return;
  const progressEl = document.getElementById(`day-${key}-upload-progress`);
  if (progressEl) progressEl.textContent = '⏳ Envoi en cours...';
  try {
    const path = `day-${key}.jpg`;
    const publicUrl = await uploadFileToStorage('app-assets', path, file);
    document.querySelectorAll(`img[src*="${path}"]`).forEach(img => { img.src = `${publicUrl}?t=${Date.now()}`; });
    if (progressEl) progressEl.textContent = '✅ Photo mise en ligne !';
    showNotification('📅 Photo du jour mise à jour !', 'success');
  } catch (err) {
    console.error(`Échec upload photo jour ${key}:`, err);
    const detail = (err && (err.message || err.error || err.statusCode)) || 'erreur inconnue';
    if (progressEl) progressEl.textContent = `❌ Échec : ${detail}`;
    showNotification(`❌ Échec upload : ${detail}`, 'error');
  }
}


async function uploadSeal(size, inputEl) {
  const file = inputEl.files[0];
  if (!file) return;
  const progressEl = document.getElementById(`seal-${size}-upload-progress`);
  if (progressEl) progressEl.textContent = '⏳ Envoi en cours...';
  try {
    const path = `seal-${size}.png`;
    const publicUrl = await uploadFileToStorage('app-assets', path, file);
    document.querySelectorAll(`img[src*="${path}"]`).forEach(img => { img.src = `${publicUrl}?t=${Date.now()}`; });
    if (progressEl) progressEl.textContent = '✅ Sceau mis à jour !';
    showNotification('🌊 Sceau mis à jour !', 'success');
  } catch (err) {
    console.error(`Échec upload sceau ${size}:`, err);
    const detail = (err && (err.message || err.error || err.statusCode)) || 'erreur inconnue';
    if (progressEl) progressEl.textContent = `❌ Échec : ${detail}`;
    showNotification(`❌ Échec upload : ${detail}`, 'error');
  }
}


// 🔧 Chaque matin, chaque personne reçoit UNE mission privée, visible d'elle
// seule dans l'app. {target} est remplacé par le prénom de la personne visée.
const SECRET_MISSION_TEMPLATES = {
  info: [
    "Découvre le prénom du dernier livre que {target} a adoré.",
    "Découvre un rêve de voyage que {target} n'a jamais réalisé.",
    "Découvre un plat que {target} refuserait de manger même affamée.",
    "Découvre ce qui rendrait {target} vraiment heureuse aujourd'hui.",
    "Découvre le morceau de musique préféré de {target} en ce moment.",
    "Découvre un talent caché que {target} n'a jamais montré au groupe."
  ],
  action: [
    "Prépare le café ou le thé de {target} ce matin, sans qu'elle le demande.",
    "Fais un compliment sincère et discret à {target} aujourd'hui.",
    "Trouve un petit geste pour rendre la journée de {target} plus douce.",
    "Laisse un petit mot gentil quelque part pour {target}.",
    "Trouve un moyen de faire rire {target} aujourd'hui."
  ]
};

let todaySecretMission = null;

// ✅ Génère (une fois par jour et par personne) et charge la mission secrète du
// jour de l'utilisateur actuel. Ne touche jamais aux missions des autres.
async function ensureTodaySecretMission() {
  if (!window.supabaseReady) return;
  const dayIdx = getTripDayIndex(new Date());
  if (dayIdx === null) { todaySecretMission = null; renderSecretMission(); return; }

  const { data, error } = await window.supabase
    .from('secret_missions')
    .select('*')
    .eq('day_idx', dayIdx)
    .eq('person_id', currentUser.id)
    .limit(1);

  if (!error && data && data.length > 0) {
    todaySecretMission = data[0];
    renderSecretMission();
    return;
  }

  // Pas encore de mission pour aujourd'hui → on en génère une
  const others = PARTICIPANTS.filter(p => p.id !== currentUser.id);
  const target = others[Math.floor(Math.random() * others.length)];
  const type = Math.random() < 0.5 ? 'info' : 'action';
  const pool = SECRET_MISSION_TEMPLATES[type];
  const template = pool[Math.floor(Math.random() * pool.length)].replace('{target}', target.name);

  const newMission = {
    day_idx: dayIdx,
    person_id: currentUser.id,
    target_id: target.id,
    type,
    template,
    xp: 25,
    completed: false
  };

  const { data: inserted, error: insertError } = await window.supabase
    .from('secret_missions')
    .insert(newMission)
    .select()
    .limit(1);

  if (!insertError && inserted && inserted.length > 0) {
    todaySecretMission = inserted[0];
  }
  renderSecretMission();
}

function renderSecretMission() {
  const container = document.getElementById('home-secret-mission');
  if (!container) return;

  if (!todaySecretMission) { container.innerHTML = ''; return; }

  const m = todaySecretMission;
  if (m.completed) {
    container.innerHTML = `
      <div class="card-luxe" style="text-align: center;">
        <span class="eyebrow">Mission secrète</span>
        <div class="title-serif" style="font-size: 15px;">🕵️ Mission accomplie !</div>
        <div style="font-size: 11.5px; color: var(--primary-light); margin-top: 4px;">Reviens demain pour une nouvelle mission.</div>
      </div>
    `;
    return;
  }

  const icon = m.type === 'info' ? '🔍' : '💌';
  container.innerHTML = `
    <div class="card-luxe">
      <span class="eyebrow">Mission secrète du jour</span>
      <div class="title-serif" style="font-size: 15px; margin-bottom: 8px;">${icon} ${escapeHtml(m.template)}</div>
      <div style="font-size: 10.5px; color: var(--primary-light); margin-bottom: 10px; font-style: italic;">Reste discret·ète — la personne ne doit pas savoir qu'il s'agit d'une mission.</div>
      ${m.type === 'info' ? `
        <input type="text" id="secret-mission-answer" placeholder="Ta découverte..." style="width: 100%; margin-bottom: 8px;">
        <button class="btn btn-primary" style="width: 100%; border: none;" onclick="completeSecretMissionInfo()">Valider</button>
      ` : `
        <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--accent-cyan); cursor: pointer; padding: 8px 12px; border-radius: 8px; background: rgba(31, 182, 201, 0.1);">
          📷 Ajouter la preuve en photo
          <input type="file" accept="image/*" capture="environment" style="display: none;" onchange="completeSecretMissionAction(this)">
        </label>
        <span id="secret-mission-progress" style="font-size: 11px; color: var(--primary-light); margin-left: 8px;"></span>
      `}
    </div>
  `;
}

async function completeSecretMissionInfo() {
  const input = document.getElementById('secret-mission-answer');
  const answer = input ? input.value.trim() : '';
  if (!answer) { showNotification('Écris ta découverte avant de valider', 'error'); return; }

  todaySecretMission.answer_text = answer;
  todaySecretMission.completed = true;
  todaySecretMission.completed_at = new Date().toISOString();
  await window.supabase.from('secret_missions').update({
    answer_text: answer, completed: true, completed_at: todaySecretMission.completed_at
  }).eq('id', todaySecretMission.id);

  showNotification(`🕵️ Mission accomplie ! +${todaySecretMission.xp} XP`, 'success');
  if (typeof celebrateWithConfetti === 'function') celebrateWithConfetti();
  renderSecretMission();
  if (typeof renderHomeLeaderboard === 'function') renderHomeLeaderboard();
}

async function completeSecretMissionAction(inputEl) {
  const file = inputEl.files[0];
  if (!file) return;
  const progressEl = document.getElementById('secret-mission-progress');
  if (progressEl) progressEl.textContent = '⏳ Envoi...';

  try {
    const path = `mission-${todaySecretMission.id}-${Date.now()}.jpg`;
    const publicUrl = await uploadFileToStorage('secret-missions', path, file);

    todaySecretMission.photo_url = publicUrl;
    todaySecretMission.completed = true;
    todaySecretMission.completed_at = new Date().toISOString();
    await window.supabase.from('secret_missions').update({
      photo_url: publicUrl, completed: true, completed_at: todaySecretMission.completed_at
    }).eq('id', todaySecretMission.id);

    showNotification(`🕵️ Mission accomplie ! +${todaySecretMission.xp} XP`, 'success');
    if (typeof celebrateWithConfetti === 'function') celebrateWithConfetti();
    renderSecretMission();
    if (typeof renderHomeLeaderboard === 'function') renderHomeLeaderboard();
  } catch (err) {
    console.error('Échec upload mission secrète:', err);
    if (progressEl) progressEl.textContent = '❌ Échec, réessaie.';
  }
}

// ✅ XP des missions secrètes complétées, à additionner au classement — on ne
// lit que le total par personne, jamais le contenu des missions des autres.
async function getSecretMissionsXpByPerson() {
  if (!window.supabaseReady) return {};
  const { data, error } = await window.supabase.from('secret_missions').select('person_id, xp, completed').eq('completed', true);
  if (error || !data) return {};
  const totals = {};
  data.forEach(row => { totals[row.person_id] = (totals[row.person_id] || 0) + row.xp; });
  return totals;
}

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
  .seal { width: 100px; height: 100px; border-radius: 50%; overflow: hidden; margin: 0 auto 16px; box-shadow: 0 4px 12px rgba(12,47,58,0.2); }
  .seal img { width: 100%; height: 100%; object-fit: cover; }
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
  <div class="seal"><img src="https://iupghubmnibbdipingnj.supabase.co/storage/v1/object/public/app-assets/seal-full.png" alt=""></div>
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

// ✅ Upload direct de la version vidéo (avec musique) des Olympiades, exportée
// depuis Canva — même mécanisme que les vidéos de challenges, chemin fixe pour
// que tout le monde y accède automatiquement une fois uploadée.
async function uploadOlympiadesVideo(inputEl) {
  const file = inputEl.files[0];
  if (!file) return;
  const progressEl = document.getElementById('olympiades-video-progress');
  if (progressEl) progressEl.textContent = '⏳ Envoi en cours...';

  try {
    const publicUrl = await uploadFileToStorage('challenge-videos', 'olympiades.mp4', file);
    const player = document.getElementById('olympiades-video-player');
    if (player) {
      player.src = `${publicUrl}?t=${Date.now()}`;
      player.style.display = 'block';
    }
    document.getElementById('olympiades-video-upload').style.display = 'none';
    showNotification('🎥 Vidéo des Olympiades ajoutée !', 'success');
  } catch (err) {
    console.error('Échec upload vidéo Olympiades:', err);
    if (progressEl) progressEl.textContent = '❌ Échec, réessaie.';
  }
}


function revealSurprise() {
  const input = document.getElementById('surprise-code');
  if (input.value.toUpperCase() === 'MAGIA') {
    document.getElementById('surprise-content').innerHTML = `
      <div class="card" style="background: linear-gradient(135deg, var(--accent-gold), var(--accent-pink)); color: white; text-align: center; margin-top: 12px; border: none;">
        <h3 style="font-family: var(--font-display); font-weight: 500; font-size: 20px; margin-bottom: 4px;">🎉 Les Olympiades de Saraillon</h3>
        <p style="font-size: 12px; opacity: 0.9; margin-bottom: 16px;">Dimanche · Lieu secret 🤫 · 10h30 – 00h00</p>
        <div style="text-align: left; background: rgba(255,255,255,0.15); border-radius: 12px; padding: 16px; font-size: 12.5px; line-height: 1.7;">
          <strong>Règles du jeu</strong><br>
          🏆 2 points par épreuve remportée<br>
          📉 -0,5 point si un membre n'écoute pas les consignes<br>
          🔍 +0,25 point par référence débusquée dans le support visuel/sonore<br>
          🏃 +0,5 point pour l'équipe arrivée au complet en premier
        </div>
        <div style="text-align: left; margin-top: 14px; font-size: 12.5px; line-height: 1.8;">
          <strong>Ⅰ. Examen Chūnin</strong> — Garage · 2 matchs en 11 points<br>
          <span style="opacity: 0.85; font-size: 11.5px;">Service raté → commenter façon journaliste sportif. Équipe perdante : chanson ou choré au dîner.</span><br><br>
          <strong>Ⅱ. Licence Hunter</strong> — Route du jardin · 2 matchs en 13 points<br>
          <span style="opacity: 0.85; font-size: 11.5px;">Équipe perdante prépare les cocktails du soir.</span><br><br>
          <strong>Ⅲ. L'Entraînement de Rock Lee</strong> — Route du jardin<br>
          <span style="opacity: 0.85; font-size: 11.5px;">Ballon 7 rebonds pieds/genoux + Pierre-Feuille-Ciseaux inversé. Équipe perdante dresse la table.</span><br><br>
          <strong>Ⅳ. Épreuve finale — Karaoké</strong><br>
          <span style="opacity: 0.85; font-size: 11.5px;">Artiste, titre, paroles, suite inventée, funfact, backs, choré — 1 point chacun. Équipe perdante gère les inscriptions aux activités.</span>
        </div>
        <div style="margin-top: 16px;">
          <div style="border-radius: 12px; overflow: hidden; box-shadow: 0 6px 18px rgba(0,0,0,0.2); background: #fff;">
            <iframe loading="lazy" style="width: 100%; aspect-ratio: 16/9; border: none; display: block;" src="https://www.canva.com/design/DAHJ270_OqQ/view?embed" allowfullscreen allow="fullscreen"></iframe>
          </div>
          <a href="https://www.canva.com/d/vtjIiXCFg_OPhF6" target="_blank" rel="noopener" style="display: inline-block; margin-top: 8px; font-size: 12px; font-weight: 600; color: white; text-decoration: underline;">🔗 Ouvrir en plein écran sur Canva</a>
          <br>
          <a href="https://canva.link/saraillon" target="_blank" rel="noopener" style="display: inline-block; margin-top: 6px; font-size: 12px; font-weight: 600; color: white; text-decoration: underline;">🔗 Lien public de la surprise</a>
        </div>
        <div style="margin-top: 16px;" id="olympiades-video-slot">
          <video id="olympiades-video-player" src="https://iupghubmnibbdipingnj.supabase.co/storage/v1/object/public/challenge-videos/olympiades.mp4" controls style="width: 100%; border-radius: 12px; display: none; box-shadow: 0 6px 18px rgba(0,0,0,0.2);" onloadeddata="document.getElementById('olympiades-video-player').style.display='block'; document.getElementById('olympiades-video-upload').style.display='none';" onerror="document.getElementById('olympiades-video-upload').style.display='block';"></video>
          <div id="olympiades-video-upload" style="display: none;">
            <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: white; cursor: pointer; padding: 8px 12px; border-radius: 8px; background: rgba(255,255,255,0.2);">
              🎥 Ajouter la version vidéo avec musique
              <input type="file" accept="video/mp4,video/*" style="display: none;" onchange="uploadOlympiadesVideo(this)">
            </label>
            <span id="olympiades-video-progress" style="font-size: 11px; color: white; opacity: 0.85; margin-left: 8px;"></span>
          </div>
        </div>
      </div>
    `;
    showNotification('🎉 Surprise débloquée !', 'success');
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

