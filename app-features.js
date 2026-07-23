// ============== NOUVELLES FONCTIONNALITÉS (météo, décompte, photo mystère, bilan, trésor) ==============

// ---------------------------------------------------------------
// 1) MÉTÉO DU JOUR
// ---------------------------------------------------------------
// 🔧 Coordonnées de la maison — à ajuster si besoin (actuellement Toulon/Var,
// zone du séjour d'après les activités du planning : Le Revest, Le Mourillon, Hyères...)
const WEATHER_LOCATION = { lat: 43.1242, lon: 5.9280, label: 'Toulon' };

function weatherCodeToInfo(code) {
  if (code === 0) return { emoji: '☀️', label: 'Grand soleil' };
  if ([1, 2].includes(code)) return { emoji: '🌤️', label: 'Plutôt ensoleillé' };
  if (code === 3) return { emoji: '☁️', label: 'Nuageux' };
  if ([45, 48].includes(code)) return { emoji: '🌫️', label: 'Brumeux' };
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return { emoji: '🌧️', label: 'Pluie' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { emoji: '🌨️', label: 'Neige' };
  if ([95, 96, 99].includes(code)) return { emoji: '⛈️', label: 'Orage' };
  return { emoji: '🌡️', label: 'Météo du jour' };
}

async function renderWeatherBanner() {
  const container = document.getElementById('home-weather');
  if (!container) return;

  // Cache 30 min pour éviter de re-fetch à chaque rafraîchissement du poll 25s
  const cacheKey = 'saraillon_weather_cache';
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    if (cached && Date.now() - cached.ts < 30 * 60 * 1000) {
      paintWeatherBanner(container, cached.data);
      return;
    }
  } catch (e) { /* cache corrompu, on refetch */ }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER_LOCATION.lat}&longitude=${WEATHER_LOCATION.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,wind_speed_10m_max&timezone=Europe%2FParis&forecast_days=1`;
    const res = await fetch(url);
    const data = await res.json();
    const payload = {
      code: data.daily.weather_code[0],
      tmax: Math.round(data.daily.temperature_2m_max[0]),
      tmin: Math.round(data.daily.temperature_2m_min[0]),
      uv: data.daily.uv_index_max[0],
      wind: Math.round(data.daily.wind_speed_10m_max[0])
    };
    localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: payload }));
    paintWeatherBanner(container, payload);
  } catch (e) {
    console.error('Météo indisponible', e);
    container.innerHTML = '';
  }
}

function paintWeatherBanner(container, { code, tmax, tmin, uv, wind }) {
  const info = weatherCodeToInfo(code);
  let uvNote = '';
  if (uv >= 8) uvNote = ' · ☀️ UV très fort, crème solaire indispensable';
  else if (uv >= 6) uvNote = ' · 🧴 UV fort, pense à la crème';
  const isRainy = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code);
  // ✅ Pluie visuelle en écho à la météo — une fois par jour seulement
  if (isRainy && typeof MedAnim !== 'undefined' && MedAnim.rain) {
    const todayKey = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem('saraillon_rain_anim_shown') !== todayKey) {
      localStorage.setItem('saraillon_rain_anim_shown', todayKey);
      setTimeout(() => MedAnim.rain(), 600);
    }
  }
  // ✅ Blague Mistral, validée avec Marine — s'affiche au-delà de 40 km/h de vent
  const mistralNote = (wind && wind >= 40) ? ' · 💨 Bulletin météo : Mistral annoncé, tenue discriminante recommandée' : '';

  container.innerHTML = `
    <div class="card-luxe" style="display: flex; align-items: center; gap: 12px; padding: 14px 16px;">
      <div style="width: 36px; height: 36px; flex-shrink: 0;">${EXPLORE_ICONS_3D.meteo}</div>
      <div style="flex: 1;">
        <div class="title-serif" style="font-size: 14px;">${info.label} à ${WEATHER_LOCATION.label} · ${tmin}°–${tmax}°C</div>
        <div style="font-size: 11.5px; color: var(--primary-light); margin-top: 2px;">UV ${uv}${uvNote}${isRainy ? ' · pense aux activités indoor aujourd\'hui' : ''}${mistralNote}</div>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------
// 2) DÉCOMPTE VISUEL FIN DE SÉJOUR
// ---------------------------------------------------------------
function renderCountdownBanner() {
  const container = document.getElementById('home-countdown');
  if (!container) return;

  const tripStart = new Date(2026, 7, 21);
  tripStart.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilStart = Math.round((tripStart - today) / 86400000);

  const dayIdx = getTripDayIndex(new Date());

  // ✅ Décompte AVANT le séjour, à partir de J-15
  if (dayIdx === null && daysUntilStart > 0) {
    if (daysUntilStart > 15) { container.innerHTML = ''; return; }
    let message, color;
    if (daysUntilStart > 7) {
      message = "L'excitation monte, préparez vos valises ✨";
      color = 'var(--accent-gold)';
    } else if (daysUntilStart > 1) {
      message = 'Plus que quelques dodos avant le grand départ 🧳';
      color = 'var(--accent-cyan)';
    } else {
      message = 'Demain, le séjour commence ! 🎉';
      color = 'var(--accent-pink)';
    }
    container.innerHTML = `
      <div style="border-radius: 14px; padding: 12px 16px; text-align: center; border: 1.5px solid ${color}; background: var(--bg-raised);">
        <div style="font-family: var(--font-display); font-weight: 500; font-size: 15px; color: ${color};">🧳 J-${daysUntilStart} avant le départ</div>
        <div style="font-size: 11.5px; color: var(--primary-light); margin-top: 3px;">${message}</div>
      </div>
    `;
    return;
  }

  if (dayIdx === null) { container.innerHTML = ''; return; }

  const daysLeft = planningData.length - 1 - dayIdx;
  let message, color;
  if (daysLeft >= 5) {
    message = 'Encore plein de journées devant vous ☀️';
    color = 'var(--accent-gold)';
  } else if (daysLeft >= 2) {
    message = 'Les derniers jours filent vite, profitez-en 🌅';
    color = 'var(--accent-cyan)';
  } else if (daysLeft === 1) {
    message = "Demain, c'est déjà le retour... 🌙";
    color = 'var(--accent-pink)';
  } else {
    message = 'Dernier jour. Gardez-en un souvenir plein la tête 💛';
    color = 'var(--primary)';
  }

  container.innerHTML = `
    <div style="border-radius: 14px; padding: 12px 16px; text-align: center; border: 1.5px solid ${color}; background: var(--bg-raised);">
      <div style="font-family: var(--font-display); font-weight: 500; font-size: 15px; color: ${color};">📅 ${daysLeft <= 0 ? 'Dernier jour' : `J-${daysLeft} avant le retour`}</div>
      <div style="font-size: 11.5px; color: var(--primary-light); margin-top: 3px;">${message}</div>
    </div>
  `;
}

// ---------------------------------------------------------------
// 3) CAGNOTTE PHOTO MYSTÈRE
// ---------------------------------------------------------------
const MYSTERY_THEMES = [
  "le plus beau ciel du moment",
  "un détail que personne n'a remarqué",
  "le sourire le plus sincère",
  "une texture insolite",
  "un reflet",
  "quelque chose de minuscule",
  "une ombre qui raconte une histoire",
  "le plat le plus appétissant",
  "un moment de complicité",
  "un objet oublié quelque part",
  "la meilleure vue du jour",
  "un fou rire capturé sur le vif"
];

function getMysteryOfTheDay(dayIdx) {
  const person = PARTICIPANTS[dayIdx % PARTICIPANTS.length];
  const theme = MYSTERY_THEMES[(dayIdx * 7) % MYSTERY_THEMES.length];
  return { person, theme };
}

function renderMysteryPhoto() {
  const container = document.getElementById('mystery-photo-content');
  if (!container) return;

  const dayIdx = getTripDayIndex(new Date());

  // ✅ Avant le séjour : aperçu du thème du jour 1, pour vérifier que ça fonctionne
  // sans attendre le départ (l'affichage change automatiquement une fois sur place).
  if (dayIdx === null) {
    const { person, theme } = getMysteryOfTheDay(0);
    container.innerHTML = `
      <div style="background: linear-gradient(135deg, #1D5FA8 0%, #1690A3 100%); border-radius: 14px; padding: 16px; color: white; box-shadow: 0 8px 20px rgba(29, 95, 168, 0.2); opacity: 0.7;">
        <div style="font-family: var(--font-display); font-weight: 500; font-size: 15px; letter-spacing: 0.3px;">🎲 Photo mystère du jour · aperçu</div>
        <div style="font-size: 12.5px; margin-top: 6px; opacity: 0.95;">Jour 1 : <strong>${escapeHtml(person.name)}</strong> devra poster une photo sur le thème « ${theme} »</div>
        <div style="font-size: 10.5px; margin-top: 6px; opacity: 0.8;">S'activera automatiquement le premier jour du séjour</div>
      </div>
    `;
    return;
  }

  const { person, theme } = getMysteryOfTheDay(dayIdx);

  container.innerHTML = `
    <div style="background: linear-gradient(135deg, #1D5FA8 0%, #1690A3 100%); border-radius: 14px; padding: 16px; color: white; box-shadow: 0 8px 20px rgba(29, 95, 168, 0.2);">
      <div style="font-family: var(--font-display); font-weight: 500; font-size: 15px; letter-spacing: 0.3px;">🎲 Photo mystère du jour</div>
      <div style="font-size: 12.5px; margin-top: 6px; opacity: 0.95;"><strong>${escapeHtml(person.name)}</strong> doit poster une photo sur le thème : « ${theme} »</div>
    </div>
  `;
}

// ---------------------------------------------------------------
// 4) BILAN DE FIN DE SÉJOUR (auto-généré, visible le dernier jour)
// ---------------------------------------------------------------
function computeTripRecap() {
  const choreCompletions = (typeof getAllChoreCompletions === 'function') ? getAllChoreCompletions() : [];
  const choresXp = choreCompletions.reduce((s, c) => s + (c.xp || 15), 0);
  const choresDone = choreCompletions.length;

  const questsDone = challenges.reduce((s, ch) => s + ((ch.completedBy || []).length), 0);
  const questsXp = challenges.reduce((s, ch) => s + ((ch.completedBy || []).length) * (ch.xp || 20), 0);

  const topPhotos = [...galleryItems]
    .sort((a, b) => ((b.likes || []).length) - ((a.likes || []).length))
    .filter(p => (p.likes || []).length > 0)
    .slice(0, 3);

  return {
    totalXp: choresXp + questsXp,
    choresDone,
    questsDone,
    topPhotos
  };
}

function renderTripRecap() {
  const container = document.getElementById('home-recap');
  if (!container) return;

  const dayIdx = getTripDayIndex(new Date());
  const isLastDay = dayIdx !== null && dayIdx === planningData.length - 1;
  if (!isLastDay) { container.innerHTML = ''; return; }

  const r = computeTripRecap();

  container.innerHTML = `
    <div style="background: var(--bg-raised); border-radius: 14px; padding: 16px; box-shadow: var(--shadow); border: 1.5px solid var(--accent-gold);">
      <div class="title-serif" style="font-size: 16px; margin-bottom: 10px;">🏆 Bilan du séjour</div>
      <div style="font-size: 12.5px; color: var(--primary); line-height: 1.9;">
        ✨ <strong>${r.totalXp} XP</strong> cumulés par le groupe<br>
        ⚡ <strong>${r.choresDone}</strong> tirage${r.choresDone > 1 ? 's' : ''} fait${r.choresDone > 1 ? 's' : ''}<br>
        🏆 <strong>${r.questsDone}</strong> défi${r.questsDone > 1 ? 's' : ''} relevé${r.questsDone > 1 ? 's' : ''}
      </div>
      ${r.topPhotos.length > 0 ? `
        <div style="margin-top: 10px; font-size: 11.5px; color: var(--primary-light);">
          📸 Photos les plus aimées : ${r.topPhotos.map(p => `${escapeHtml(p.location)} (${(p.likes || []).length}❤️)`).join(', ')}
        </div>
      ` : ''}
      <div style="margin-top: 10px; font-size: 11px; color: var(--primary-light); font-style: italic;">Merci pour ce séjour, à très vite pour le prochain 🏝️</div>
      <button class="btn btn-cta" onclick="exportTripSouvenir()" style="width: 100%; margin-top: 14px;">📖 Télécharger le souvenir du séjour</button>
    </div>
  `;
}

// ---------------------------------------------------------------
// 5) CHASSE AU TRÉSOR GÉOLOCALISÉE (light)
// ---------------------------------------------------------------
// 🔧 Liste par défaut — à personnaliser selon vos envies pour le séjour.
const DEFAULT_TREASURE_HUNT_ITEMS = [
  { id: 1, item: 'Un coquillage en forme de cœur', emoji: '🐚', xp: 10 },
  { id: 2, item: 'Une porte de couleur improbable', emoji: '🚪', xp: 10 },
  { id: 3, item: 'Un chat du quartier', emoji: '🐱', xp: 15 },
  { id: 4, item: 'Le meilleur coucher de soleil du séjour', emoji: '🌇', xp: 15 },
  { id: 5, item: 'Une plante qu\'aucun de vous ne sait nommer', emoji: '🌿', xp: 10 },
  { id: 6, item: 'Un panneau avec une faute d\'orthographe', emoji: '📛', xp: 15 },
  { id: 7, item: 'Une glace à un parfum jamais goûté avant', emoji: '🍦', xp: 10 },
  { id: 8, item: 'Un point de vue à plus de 100m de hauteur', emoji: '🏔️', xp: 15 },
  { id: 9, item: 'Un souvenir kitsch pour la maison', emoji: '🎁', xp: 10 },
  { id: 10, item: 'Toute l\'équipe réunie sur une même photo', emoji: '👯', xp: 20 }
];

let treasureHuntItems = [];

async function loadTresorFromCloud() {
  if (!window.supabaseReady || !window.loadFromSupabase) return;
  const rows = await window.loadFromSupabase('treasure_hunt_items');
  if (rows && rows.length > 0) {
    treasureHuntItems = rows.sort((a, b) => a.id - b.id);
  } else {
    // Rien en base encore : on initialise avec la liste par défaut et on synchronise
    treasureHuntItems = DEFAULT_TREASURE_HUNT_ITEMS.map(i => ({ ...i, found: false, found_by: null, photo_url: null }));
    treasureHuntItems.forEach(i => {
      window.syncToSupabase('treasure_hunt_items', {
        id: i.id, item: i.item, emoji: i.emoji, xp: i.xp, found: false, found_by: null, photo_url: null
      }).catch(err => console.error('Sync trésor échouée:', err));
    });
  }
  renderTresor();
}

function toggleTresorItem(id) {
  const item = treasureHuntItems.find(i => i.id === id);
  if (!item) return;

  const nowFound = !item.found;
  item.found = nowFound;
  item.found_by = nowFound ? currentUser.name : null;

  window.syncToSupabase('treasure_hunt_items', {
    id: item.id,
    item: item.item,
    emoji: item.emoji,
    xp: item.xp,
    found: nowFound,
    found_by: item.found_by,
    found_at: nowFound ? new Date().toISOString() : null,
    photo_url: item.photo_url || null
  }).catch(err => console.error('Sync trésor échouée:', err));

  if (nowFound) {
    addNotification(`🗺️ ${currentUser.name} a trouvé "${item.item}" (+${item.xp} XP) !`, '🗺️', 'tresor', true, item.id);
    addFeedEntry(`a trouvé un trésor : "${item.item}" (+${item.xp} XP) !`, '🗺️', 'tresor', item.id);
    if (typeof celebrateWithConfetti === 'function') celebrateWithConfetti();
  }

  renderTresor();
}

// ✅ Upload direct de la photo-preuve d'un trésor, vers Supabase Storage (même
// mécanisme que la vidéo des challenges) — coche automatiquement l'objet comme trouvé.
async function uploadTresorPhoto(id, inputEl) {
  const file = inputEl.files[0];
  if (!file) return;

  const item = treasureHuntItems.find(i => i.id === id);
  if (!item) return;

  const progressEl = document.getElementById(`tresor-progress-${id}`);
  if (progressEl) progressEl.textContent = '⏳ Envoi en cours...';

  try {
    const path = `item-${id}-${Date.now()}.jpg`;
    const publicUrl = await uploadFileToStorage('treasure-photos', path, file);

    item.photo_url = publicUrl;
    item.found = true;
    item.found_by = currentUser.name;

    window.syncToSupabase('treasure_hunt_items', {
      id: item.id,
      item: item.item,
      emoji: item.emoji,
      xp: item.xp,
      found: true,
      found_by: item.found_by,
      found_at: new Date().toISOString(),
      photo_url: publicUrl
    }).catch(err => console.error('Sync trésor échouée:', err));

    addNotification(`🗺️📸 ${currentUser.name} a trouvé "${item.item}" avec une photo à l'appui (+${item.xp} XP) !`, '🗺️', 'tresor', true, item.id);
    addFeedEntry(`a trouvé un trésor avec une photo : "${item.item}" (+${item.xp} XP) !`, '🗺️', 'tresor', item.id);
    if (typeof celebrateWithConfetti === 'function') celebrateWithConfetti();

    renderTresor();
  } catch (err) {
    console.error('Échec upload photo trésor:', err);
    const detail = (err && err.message) ? err.message : 'erreur inconnue';
    if (progressEl) progressEl.textContent = `❌ Échec : ${detail}`;
    showNotification(`❌ Échec upload : ${detail}`, 'error');
  }
}

function renderTresor() {
  const container = document.getElementById('tresor-content');
  if (!container) return;

  if (treasureHuntItems.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding: 34px; color: rgba(255,253,247,0.7); font-size: 13px;">Chargement de la chasse au trésor…</div>';
    return;
  }

  const trouves = treasureHuntItems.filter(i => i.found).length;
  const total = treasureHuntItems.length;
  const pct = Math.round((trouves / total) * 100);
  const xpTotal = treasureHuntItems.filter(i => i.found).reduce((sum, i) => sum + (i.xp || 0), 0);

  // ✅ Refonte 23/07 : le Trésor était une liste de cases à cocher sur fond sable, qui
  // jurait avec le reste de la section. Il devient un tableau de butin : chaque objet
  // est une carte, verrouillée tant qu'on ne l'a pas trouvée, puis dorée avec sa preuve.
  let html = `
    <div style="position: relative; border-radius: 24px; background: linear-gradient(160deg, #c99a3f, #8a6414); box-shadow: 0 6px 0 rgba(6,43,53,0.5); padding: 20px; overflow: hidden; margin-bottom: 18px;">
      <div style="position: absolute; top: -40px; right: -30px; font-size: 120px; opacity: 0.13; line-height: 1;">🗺️</div>
      <div style="position: relative;">
        <span class="jeu-arcade" style="font-size: 10px; color: #ffe9b8; letter-spacing: 1px;">BUTIN</span>
        <div class="jeu-arcade" style="font-size: 32px; color: #fffdf7; text-shadow: 0 3px 0 rgba(0,0,0,0.25); margin: 12px 0 4px;">${trouves}<span style="font-size: 15px; color: #ffe9b8;">/${total}</span></div>
        <div class="jeu-texte" style="font-size: 13px; color: #ffe9b8;">objets trouvés · ${xpTotal} XP amassés</div>
        <div style="height: 16px; border-radius: 8px; background: rgba(0,0,0,0.28); overflow: hidden; margin-top: 13px;">
          <div style="height: 100%; width: ${pct}%; border-radius: 8px; background: linear-gradient(90deg, #f4b942, #fffdf7);"></div>
        </div>
      </div>
    </div>
  `;

  html += treasureHuntItems.map(item => {
    const trouve = !!item.found;
    return `
      <div id="tresor-item-${item.id}" class="jeu-carte" style="${trouve ? 'background: linear-gradient(160deg, #fff6e2, #f9e6bd);' : 'background: rgba(255,253,247,0.09); box-shadow: none;'} gap: 11px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <label style="cursor: pointer; flex-shrink: 0; width: 40px; height: 40px; border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 21px; background: ${trouve ? '#f4b942' : 'rgba(0,0,0,0.22)'}; ${trouve ? 'box-shadow: 0 3px 0 #c99a3f;' : ''}">
            <span style="${trouve ? '' : 'opacity: .45; filter: grayscale(1);'}">${item.emoji || '🗺️'}</span>
            <input type="checkbox" ${trouve ? 'checked' : ''} onchange="toggleTresorItem(${item.id})" style="display: none;">
          </label>
          <div style="flex: 1; min-width: 0;">
            <div class="jeu-titre" style="font-size: 16px; color: ${trouve ? '#4a2c00' : '#fffdf7'}; line-height: 1.2;">${escapeHtml(item.item)}</div>
            ${item.found_by
              ? `<div class="jeu-texte" style="font-size: 11.5px; color: #8a6414; margin-top: 3px;">déniché par ${escapeHtml(item.found_by)}</div>`
              : `<div class="jeu-arcade" style="font-size: 7.5px; color: rgba(255,253,247,0.5); margin-top: 5px; letter-spacing: .5px;">PAS ENCORE TROUVÉ</div>`}
          </div>
          <span class="jeu-arcade" style="flex-shrink: 0; font-size: 9px; padding: 7px 8px; border-radius: 10px; background: ${trouve ? '#f4b942' : 'rgba(244,185,66,0.16)'}; color: ${trouve ? '#4a2c00' : '#f4b942'}; ${trouve ? 'box-shadow: 0 3px 0 #c99a3f;' : ''}">+${item.xp}</span>
        </div>

        ${item.photo_url ? `
          <div style="border-radius: 14px; overflow: hidden; max-height: 240px;">
            <img src="${item.photo_url}" style="width: 100%; height: auto; display: block;">
          </div>` : `
          <label class="jeu-btn" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 14px; cursor: pointer; background: ${trouve ? 'rgba(201,154,63,0.18)' : 'rgba(255,253,247,0.1)'}; color: ${trouve ? '#8a6414' : 'rgba(255,253,247,0.85)'}; --ombre-btn: transparent;">
            <span style="font-size: 15px;">📷</span>
            <span class="jeu-arcade" style="font-size: 8.5px; letter-spacing: .4px;">AJOUTER LA PREUVE</span>
            <input type="file" accept="image/*" style="display: none;" onchange="uploadTresorPhoto(${item.id}, this)">
          </label>
          <span id="tresor-progress-${item.id}" class="jeu-texte" style="font-size: 11px; color: rgba(255,253,247,0.7); text-align: center;"></span>`}
      </div>`;
  }).join('');

  container.innerHTML = html;
}
