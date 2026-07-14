// ============== ANIMATIONS MÉDITERRANÉE ==============
// Principe : une animation = un événement réel. Courtes, non intrusives,
// respectent prefers-reduced-motion, et jamais pendant la saisie d'un formulaire.
const MedAnim = (() => {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function layer() { return document.getElementById('anim-layer'); }
  function isTyping() {
    const el = document.activeElement;
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT');
  }
  function spawn(html, lifespanMs) {
    if (prefersReduced) return;
    const l = layer();
    if (!l) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    const nodes = Array.from(wrap.children);
    nodes.forEach(n => l.appendChild(n));
    setTimeout(() => nodes.forEach(n => n.remove()), lifespanMs);
  }

  // 🐬 Dauphin qui saute — feedback d'inscription
  function dolphin() {
    if (isTyping()) return;
    const svg = `<div class="anim-dolphin"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="dolG" x1="0" y1="0" x2="0.4" y2="1">
        <stop offset="0" stop-color="#7fd8e8"/><stop offset="1" stop-color="#2b7f9e"/></linearGradient></defs>
      <path d="M18 70 C22 40 46 20 82 16 C70 26 66 40 62 52 C58 66 44 80 24 82 C20 82 17 78 18 70 Z" fill="url(#dolG)"/>
      <path d="M62 52 C74 50 84 56 90 66 C80 62 72 62 64 66 Z" fill="#2b7f9e"/>
      <path d="M30 74 C24 82 16 84 8 82 C16 78 20 72 24 66 Z" fill="#3a91ad"/>
      <path d="M78 22 C86 18 92 20 96 26 C88 26 84 30 80 34 Z" fill="#3a91ad"/>
      <circle cx="74" cy="30" r="3.2" fill="#0c2f3a"/>
      <path d="M20 64 C34 58 50 56 60 58" stroke="#cdeef4" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.6"/>
    </svg></div>
    <div class="anim-splash">💦</div>`;
    spawn(svg, 2400);
  }

  // 🕊️ Mouette qui traverse — rappel (avec petite banderole facultative)
  function seagull(labelText) {
    const label = labelText ? `<div class="anim-gull-label">🕊️ ${labelText}</div>` : '';
    const svg = `<div class="anim-gull"><svg viewBox="0 0 60 44" xmlns="http://www.w3.org/2000/svg">
      <g class="wing" fill="none" stroke="#0c2f3a" stroke-width="4" stroke-linecap="round">
        <path d="M4 26 Q18 8 30 24"/><path d="M30 24 Q42 8 56 26"/>
      </g>
    </svg></div>${label}`;
    spawn(svg, 7200);
  }

  // ⛵ Bateau qui passe — rappel d'activité en mer
  function boat() {
    const svg = `<div class="anim-boat"><svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 14 L52 60 L20 60 Z" fill="#ffffff"/>
      <path d="M56 24 L56 60 L82 60 Z" fill="#ef6a7c"/>
      <rect x="49" y="12" width="3" height="50" rx="1.5" fill="#8a6a3a"/>
      <path d="M16 62 L84 62 L74 78 Q72 82 66 82 L34 82 Q28 82 26 78 Z" fill="#c9821f"/>
      <path d="M16 62 L84 62 L80 68 L20 68 Z" fill="#0c2f3a" opacity="0.15"/>
    </svg></div>`;
    spawn(svg, 9200);
  }

  // ✨ Éclat de confettis dorés — feedback ponctuel quand une quête, une corvée
  // ou une surprise est débloquée. Courte pluie de petits carrés en chute libre.
  function confetti() {
    if (prefersReduced) return;
    const colors = ['#f4b942', '#1fb6c9', '#ef6a7c', '#2fae6e', '#f6f3ea'];
    let pieces = '';
    for (let i = 0; i < 22; i++) {
      const left = Math.round(Math.random() * 100);
      const delay = (Math.random() * 0.3).toFixed(2);
      const duration = (1.1 + Math.random() * 0.6).toFixed(2);
      const rotate = Math.round(Math.random() * 360);
      const color = colors[i % colors.length];
      pieces += `<div class="anim-confetti-piece" style="left:${left}%; background:${color}; animation-delay:${delay}s; animation-duration:${duration}s; transform: rotate(${rotate}deg);"></div>`;
    }
    spawn(`<div class="anim-confetti">${pieces}</div>`, 2200);
  }

  // ✈️ Avion qui traverse — jour de départ / jour de retour
  function plane() {
    const svg = `<div class="anim-plane"><svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 22 L40 20 L58 6 L66 6 L54 20 L74 20 L84 12 L92 12 L86 22 L92 24 L84 24 L74 22 L54 22 L66 34 L58 34 L40 24 L4 22 Z" fill="#0c2f3a"/>
    </svg></div>`;
    spawn(svg, 5200);
  }

  // 🐟 Poisson qui nage — rappel d'activité aquatique (plongée, snorkeling, baignade)
  function fish() {
    const svg = `<div class="anim-fish"><svg viewBox="0 0 60 34" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="fishG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f4b942"/><stop offset="1" stop-color="#ef6a7c"/></linearGradient></defs>
      <path d="M6 17 C6 9 16 4 30 4 C42 4 50 10 54 17 C50 24 42 30 30 30 C16 30 6 25 6 17 Z" fill="url(#fishG)"/>
      <path d="M6 17 L0 8 L2 17 L0 26 Z" fill="#c9821f"/>
      <circle cx="38" cy="13" r="2.4" fill="#0c2f3a"/>
    </svg></div>`;
    spawn(svg, 4200);
  }

  // 🌠 Étoile filante — appelée depuis l'extérieur de la fermeture MedAnim
  function shootingStar(topPct, leftPct) {
    spawn(`<div class="anim-shootingstar" style="top:${topPct}%; left:${leftPct}%;"></div>`, 1800);
  }

  return { dolphin, seagull, boat, plane, fish, confetti, shootingStar, prefersReduced, spawn };
})();

// ✅ Point d'entrée global court, appelé depuis les complétions de corvées,
// quêtes/défis et la surprise débloquée.
function celebrateWithConfetti() {
  MedAnim.confetti();
}
// Accès global pour test rapide (console) : MedAnim.dolphin(), MedAnim.seagull('Plongée dans 1h'), MedAnim.boat()
window.MedAnim = MedAnim;

// --- Rappels automatiques : mouette 1h avant, bateau si activité en mer ---
// On ne notifie qu'une fois par activité et par session.
const _remindedActivities = new Set();

const MOIS_FR = { 'janvier':0,'février':1,'fevrier':1,'mars':2,'avril':3,'mai':4,'juin':5,'juillet':6,'août':7,'aout':7,'septembre':8,'octobre':9,'novembre':10,'décembre':11,'decembre':11 };

function parseActivityDateTime(day, activity) {
  // Combine la vraie date du jour (ex. "21 août 2026") avec l'heure de l'activité (ex. "22h00").
  // Renvoie un objet Date complet, ou null si l'un des deux manque.
  if (!activity || !activity.horaires || !day || !day.date) return null;
  const hm = String(activity.horaires).match(/(\d{1,2})\s*h\s*(\d{0,2})/i);
  if (!hm) return null;
  const hh = parseInt(hm[1], 10);
  const mm = hm[2] ? parseInt(hm[2], 10) : 0;
  if (isNaN(hh)) return null;

  const dm = String(day.date).match(/(\d{1,2})\s+([a-zà-ÿ]+)\s+(\d{4})/i);
  if (!dm) return null;
  const jour = parseInt(dm[1], 10);
  const moisNom = dm[2].toLowerCase();
  const annee = parseInt(dm[3], 10);
  const mois = MOIS_FR[moisNom];
  if (mois === undefined || isNaN(jour) || isNaN(annee)) return null;

  return new Date(annee, mois, jour, hh, mm, 0);
}

function checkUpcomingActivityReminders() {
  if (MedAnim.prefersReduced) return;
  if (typeof planningData === 'undefined' || !Array.isArray(planningData)) return;
  const now = new Date();
  // ✅ Corrigé : la couche d'animation (#anim-layer) est un calque persistant
  // au-dessus de toute l'app, pas seulement de l'accueil — cette restriction
  // empêchait les rappels de se déclencher dans 99% des cas.

  planningData.forEach((day, dayIdx) => {
    (day.activities || []).forEach((act, actIdx) => {
      const dt = parseActivityDateTime(day, act);
      if (!dt) return;
      const diffMin = (dt - now) / 60000;
      const key = `${dayIdx}-${actIdx}-${dt.toDateString()}`;
      // Fenêtre élargie : entre 50 et 60 min avant → mouette de rappel (une seule fois)
      if (diffMin <= 60 && diffMin > 50 && !_remindedActivities.has(key)) {
        _remindedActivities.add(key);
        MedAnim.seagull(`${act.nom} dans 1h`);
        // Activité en mer/nautique → bateau ou poisson selon le type
        const texte = `${act.lieu || ''} ${act.nom || ''}`.toLowerCase();
        const isDiving = texte.includes('plong') || texte.includes('snorkel') || texte.includes('baignade') || texte.includes('nage');
        const isBoat = texte.includes('bateau') || texte.includes('voile') || texte.includes('mer') || texte.includes('calanque') || texte.includes('anse');
        if (isDiving) {
          setTimeout(() => MedAnim.fish(), 1500);
        } else if (isBoat) {
          setTimeout(() => MedAnim.boat(), 1500);
        }
      }
    });
  });
}

// ✅ Avion : une fois le jour du départ, une fois le jour du retour
function checkPlaneAnimationDue() {
  if (MedAnim.prefersReduced) return;
  if (typeof getTripDayIndex !== 'function' || typeof planningData === 'undefined') return;
  const dayIdx = getTripDayIndex(new Date());
  if (dayIdx === null) return;
  const isDepartureOrReturn = dayIdx === 0 || dayIdx === planningData.length - 1;
  if (!isDepartureOrReturn) return;

  const todayKey = new Date().toISOString().slice(0, 10);
  const flagKey = 'saraillon_plane_anim_shown';
  if (localStorage.getItem(flagKey) === todayKey) return;
  localStorage.setItem(flagKey, todayKey);
  setTimeout(() => MedAnim.plane(), 800);
}

// Vérifie toutes les minutes (léger) + une fois au chargement
setInterval(checkUpcomingActivityReminders, 60000);
checkPlaneAnimationDue();

// Petites vaguelettes décoratives dans le hero d'accueil (ajoutées au DOM une seule fois)
function injectHeroWaves() {
  if (MedAnim.prefersReduced) return;
  const hero = document.querySelector('#home > div[style*="height: 260px"]');
  if (!hero || hero.querySelector('.hero-waves')) return;
  const waves = document.createElement('div');
  waves.className = 'hero-waves';
  waves.innerHTML = `
    <svg class="wv2" viewBox="0 0 1200 60" preserveAspectRatio="none"><path d="M0 30 Q150 10 300 30 T600 30 T900 30 T1200 30 V60 H0 Z" fill="#bff0f2"/></svg>
    <svg class="wv1" viewBox="0 0 1200 60" preserveAspectRatio="none"><path d="M0 38 Q150 20 300 38 T600 38 T900 38 T1200 38 V60 H0 Z" fill="#7fdce4"/></svg>`;
  hero.appendChild(waves);
}

// 🌅 BASCULE JOUR / NUIT DE LA SCÈNE D'ACCUEIL
// 🔧 Heures approximatives de lever/coucher du soleil à Toulon fin août —
// pas besoin d'un appel réseau dédié pour une simple ambiance visuelle.
const HERO_SUNRISE_HOUR = 6.8;  // ~6h50
const HERO_SUNSET_HOUR = 20.6;  // ~20h35

function applyHeroDayNight() {
  const skyEls = [document.getElementById('sky-stop-1'), document.getElementById('sky-stop-2'), document.getElementById('sky-stop-3')];
  const seaEls = [document.getElementById('sea-stop-1'), document.getElementById('sea-stop-2'), document.getElementById('sea-stop-3')];
  const sunGroup = document.getElementById('hero-sun-group');
  const nightGroup = document.getElementById('hero-night-group');
  if (!skyEls[0] || !nightGroup) return;

  const now = new Date();
  const hourDecimal = now.getHours() + now.getMinutes() / 60;
  const isNight = hourDecimal < HERO_SUNRISE_HOUR || hourDecimal > HERO_SUNSET_HOUR;

  const daySky = ['#bdeef2', '#7fdce4', '#f3e6c0'];
  const nightSky = ['#3a3a68', '#2B2A4A', '#1c2340'];
  const daySea = ['#5fd6df', '#1fb6c9', '#0e7a90'];
  const nightSea = ['#1f5e78', '#164a63', '#0c2f3a'];

  const sky = isNight ? nightSky : daySky;
  const sea = isNight ? nightSea : daySea;
  skyEls.forEach((el, i) => el && el.setAttribute('stop-color', sky[i]));
  seaEls.forEach((el, i) => el && el.setAttribute('stop-color', sea[i]));
  if (sunGroup) sunGroup.style.opacity = isNight ? '0' : '1';
  nightGroup.style.opacity = isNight ? '1' : '0';

  // ✅ Fondu de la photo nuit sur l'écran de connexion (même détection jour/nuit)
  const nightPhoto = document.getElementById('hero-bg-photo-night');
  if (nightPhoto) nightPhoto.style.opacity = isNight ? '1' : '0';

  return isNight;
}

// ✨ Étoile filante occasionnelle, uniquement la nuit (probabiliste, vérifié toutes les 8s)
function maybeSpawnShootingStar() {
  const nightGroup = document.getElementById('hero-night-group');
  const isNight = nightGroup && nightGroup.style.opacity === '1';
  if (!isNight || MedAnim.prefersReduced) return;
  if (Math.random() < 0.18) {
    MedAnim.shootingStar(10 + Math.random() * 20, Math.random() * 20);
  }
}
setInterval(maybeSpawnShootingStar, 8000);

// Vérifie la bascule jour/nuit toutes les 5 min + une fois au chargement
setInterval(applyHeroDayNight, 5 * 60000);
applyHeroDayNight();

// 🌧️ Pluie légère en overlay — appelée depuis la bannière météo si pluie prévue
function rainOverlay() {
  if (MedAnim.prefersReduced) return;
  let drops = '';
  for (let i = 0; i < 26; i++) {
    const left = Math.round(Math.random() * 100);
    const delay = (Math.random() * 1.2).toFixed(2);
    const duration = (0.9 + Math.random() * 0.5).toFixed(2);
    drops += `<div class="anim-rain-drop" style="left:${left}%; animation-delay:${delay}s; animation-duration:${duration}s;"></div>`;
  }
  MedAnim.spawn(drops, 2200);
}
MedAnim.rain = rainOverlay;

// 🏆 Éclat doré quand l'utilisateur dépasse quelqu'un au classement XP
function rankOvertakeFlash() {
  if (MedAnim.prefersReduced) return;
  MedAnim.spawn('<div class="anim-rankflash"></div>', 1500);
}
MedAnim.rankFlash = rankOvertakeFlash;

// 🎈 Lanternes qui montent — surprise débloquée
function lanterns() {
  if (MedAnim.prefersReduced) return;
  let html = '';
  for (let i = 0; i < 5; i++) {
    const left = 15 + i * 16 + Math.round(Math.random() * 8);
    const delay = (i * 0.25).toFixed(2);
    const drift = Math.round((Math.random() - 0.5) * 60);
    const hue = ['#f4b942', '#ef6a7c', '#1690A3', '#2fae6e', '#c99a3f'][i % 5];
    html += `<div class="anim-lantern" style="left:${left}%; animation-delay:${delay}s; animation-duration:6s; --drift:${drift}px;">
      <svg viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="17" cy="22" rx="15" ry="19" fill="${hue}" opacity="0.9"/>
        <rect x="13" y="2" width="8" height="5" rx="1.5" fill="#8a6a3a"/>
        <rect x="13" y="38" width="8" height="5" rx="1.5" fill="#8a6a3a"/>
        <ellipse cx="17" cy="22" rx="6" ry="10" fill="#fff2c9" opacity="0.55"/>
      </svg>
    </div>`;
  }
  MedAnim.spawn(html, 6300);
}
MedAnim.lanterns = lanterns;
