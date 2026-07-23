// ============== CHALLENGES ==============
// ✅ Refonte visuelle (23/07) d'après la direction produite dans Claude Design.
// L'onglet a désormais son propre fond marin profond (voir #challenges dans styles.css) :
// c'est la seule section "jeu" de l'app, elle assume son identité. Les couleurs vives
// ressortent sur le fond sombre, ce qui était impossible sur le sable.

// Le classement se déplie en touchant le bandeau de score, pour ne pas occuper
// l'écran en permanence.
// Le classement se déplie sous le bandeau de score, là où on le cherche.
let classementDeplie = false;
function toggleClassementDefis() {
  classementDeplie = !classementDeplie;
  renderChallenges();
}

// Menu « ⋯ » (modifier / dupliquer / supprimer), réservé à l'autrice du défi.
// Avant, ces trois icônes étaient visibles par tout le monde en permanence.
let menuDefiOuvert = null;
function toggleMenuDefi(id) {
  menuDefiOuvert = (menuDefiOuvert === id) ? null : id;
  renderChallenges();
}

function couleurParticipante(nom) {
  const palette = ['#ef6a7c', '#f4b942', '#0e7a90', '#2fae6e', '#1fb6c9', '#c99a3f', '#8e6bb5', '#e08a3c'];
  const p = PARTICIPANTS.find(x => x.name === nom);
  return palette[(p ? p.id : (nom || '').length) % palette.length];
}

// ✅ (23/07) Les vraies photos de profil sont réutilisées ici. Elles vivent dans
// personalsData[id].avatar — mes pastilles à initiale les ignoraient, alors que chacune
// a choisi son personnage. L'initiale colorée ne sert plus que de secours.
function avatarDefi(personne, taille, bordure) {
  const photo = (typeof personalsData !== 'undefined' && personalsData[personne.id] && personalsData[personne.id].avatar) || personne.avatar || null;
  const contour = bordure ? `border: 3px solid ${bordure};` : '';
  const base = `width: ${taille}px; height: ${taille}px; border-radius: 50%; flex-shrink: 0; box-sizing: border-box; ${contour}`;
  if (photo && typeof photo === 'string' && (photo.startsWith('data:image') || photo.startsWith('http'))) {
    return `<img src="${photo}" alt="${escapeHtml(personne.name)}" style="${base} object-fit: cover; display: block;">`;
  }
  // Certaines ont un emoji en guise d'avatar plutôt qu'une photo.
  const contenu = (photo && typeof photo === 'string' && !photo.startsWith('data:') && photo.length <= 4)
    ? photo : escapeHtml(personne.name.charAt(0));
  return `<div style="${base} background: ${couleurParticipante(personne.name)}; display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'Baloo 2', sans-serif; font-weight: 800; font-size: ${Math.round(taille * 0.42)}px;">${contenu}</div>`;
}

// ✅ Bandeau de score — rendu à part car il vit AU-DESSUS des sous-onglets
// (visible aussi bien depuis Quêtes que depuis Trésor).
function renderChallengesScore() {
  const el = document.getElementById('challenges-score');
  if (!el) return;

  const classement = computeXpLeaderboard();
  const moi = classement.find(r => r.p.id === currentUser.id);
  const monXp = moi ? moi.xp : 0;
  const monRang = moi ? (classement.indexOf(moi) + 1) : classement.length;
  const meilleur = classement.length ? classement[0].xp : 0;
  const pct = meilleur > 0 ? Math.round((monXp / meilleur) * 100) : 0;
  const releves = challenges.filter(ch => (ch.completedBy || []).includes(currentUser.id)).length;

  const devant = classement[classement.indexOf(moi) - 1];
  let phrase;
  if (challenges.length === 0) phrase = 'aucun défi pour l\'instant';
  else if (devant && devant.xp > monXp) phrase = `plus que ${devant.xp - monXp} XP pour doubler ${escapeHtml(devant.p.name)}`;
  else if (monRang === 1 && classement.length > 1) phrase = 'tu es en tête 👑';
  else phrase = 'lance-toi, tout est à gagner';

  el.innerHTML = `
    <div onclick="toggleClassementDefis()" style="cursor: pointer; position: relative; border-radius: 26px; background: linear-gradient(160deg, #0e7a90, #1fb6c9); box-shadow: 0 6px 0 #06323d; padding: 20px; overflow: hidden; margin-bottom: ${classementDeplie ? '10px' : '18px'};">
      <div style="position: absolute; top: -36px; right: -36px; width: 130px; height: 130px; border-radius: 50%; background: rgba(255,255,255,0.08);"></div>
      <div style="display: flex; justify-content: space-between; align-items: flex-start; position: relative;">
        <span class="jeu-arcade" style="color: rgba(255,253,247,.72); font-size: 10px;">Ton score</span>
        <div style="text-align: right;">
          <div class="jeu-arcade" style="color: rgba(196,236,243,.8); font-size: 9px;">Rang</div>
          <div class="jeu-hero" style="color: #f4b942; font-size: 27px; margin-top: 3px; line-height: 1;">${monRang}<span style="font-size: 14px;">e</span></div>
        </div>
      </div>
      <div class="jeu-hero" style="color: #fffdf7; font-size: 52px; line-height: 1; margin: 10px 0 14px; position: relative;">${monXp}<span class="jeu-arcade" style="font-size: 14px; color: #f4b942; letter-spacing: 1px; margin-left: 4px;">XP</span></div>
      <div style="height: 18px; border-radius: 9px; background: rgba(0,0,0,0.24); overflow: hidden; position: relative;">
        <div style="height: 100%; width: ${pct}%; border-radius: 9px; background: linear-gradient(90deg, #f4b942, #ffe08a);"></div>
      </div>
      <div style="color: #fffdf7; font-size: 13px; font-weight: 600; margin-top: 10px; position: relative;">${releves} défi${releves > 1 ? 's' : ''} relevé${releves > 1 ? 's' : ''} sur ${challenges.length} · ${phrase}</div>
      <div style="text-align: center; color: rgba(255,253,247,0.65); font-size: 17px; margin-top: 6px; position: relative; line-height: 1;">${classementDeplie ? '▴' : '▾'}</div>
    </div>
    <div id="classement-content" style="display: ${classementDeplie ? 'block' : 'none'}; margin-bottom: 18px;"></div>
  `;

  if (classementDeplie && typeof renderHomeLeaderboard === 'function') renderHomeLeaderboard();
}

function renderChallenges() {
  renderChallengesScore();

  const zone = document.getElementById('challenges-content');
  if (!zone) return;

  if (challenges.length === 0) {
    zone.innerHTML = `<div style="text-align: center; padding: 40px 20px; color: rgba(255,253,247,0.75);">
      <div style="font-size: 40px; margin-bottom: 12px;">🎯</div>
      <div style="font-family: 'Baloo 2', sans-serif; font-weight: 700; font-size: 17px; color: #fffdf7;">Aucun défi pour l'instant</div>
      <div style="font-size: 13px; margin-top: 6px;">Lance le premier avec le bouton « Créer ».</div>
    </div>`;
    return;
  }

  zone.innerHTML = challenges.map(ch => {
    const completedBy = ch.completedBy || [];
    const parMoi = completedBy.includes(currentUser.id);
    const xp = ch.xp || 20;
    const pct = Math.round((completedBy.length / PARTICIPANTS.length) * 100);
    const jaime = (ch.likes || []).includes(currentUser.id);
    const estAutrice = ch.creator && currentUser.name && ch.creator.toUpperCase() === currentUser.name.toUpperCase();

    // ✅ Titre et description sont maintenant DEUX champs distincts (colonne `title`
    // ajoutée le 23/07). Avant, le titre était la première ligne de la description,
    // qui était ensuite réaffichée en entier — d'où la répétition et le pavé de texte.
    // `titre` existait déjà dans saraillon-data.js mais n'était jamais affiché ;
    // `title` est la colonne Supabase ajoutée le 23/07. On accepte les deux.
    const titre = ch.title || ch.titre || (ch.description || '').split('\n')[0] || 'Sans titre';
    const detail = (ch.description || '').trim();
    const detailCourt = detail.length > 150 ? detail.slice(0, 150) + '…' : detail;

    // 🎨 Plus de vert : les quêtes prennent l'or (elles valent 30 à 50 XP), les défis
    // gardent le corail. Le vert jurait avec la palette Méditerranée.
    const teinte = ch.isQuest ? '#f4b942' : '#1fb6c9';
    const fondJauge = ch.isQuest ? 'rgba(244,185,66,0.18)' : 'rgba(31,182,201,0.15)';

    const visibles = completedBy.slice(0, 4);
    const surplus = completedBy.length - visibles.length;
    const avatars = visibles.map((pid, i) => {
      const p = PARTICIPANTS.find(pp => pp.id === pid);
      if (!p) return '';
      return `<span style="display: inline-block; margin-left: ${i === 0 ? '0' : '-9px'};">${avatarDefi(p, 28, '#fffdf7')}</span>`;
    }).join('') + (surplus > 0
      ? `<div style="width: 28px; height: 28px; border-radius: 50%; background: #0c2f3a; border: 3px solid #fffdf7; margin-left: -9px; display: flex; align-items: center; justify-content: center; color: #fffdf7; font-size: 11px; font-weight: 700; box-sizing: border-box;">+${surplus}</div>`
      : '');

    return `
    <div style="background: #fffdf7; border-radius: 24px; box-shadow: 0 6px 0 rgba(6,50,61,0.4); padding: 17px; margin-bottom: 14px; display: flex; flex-direction: column; gap: 11px;">

      <div style="display: flex; align-items: flex-start; gap: 10px;">
        <div style="flex: 1; min-width: 0;">
          ${ch.isQuest
            ? `<span class="jeu-arcade" style="display: inline-block; background: #f4b942; color: #4a2c00; font-size: 9px; padding: 6px 10px; border-radius: 8px; box-shadow: 0 3px 0 #c99a3f; margin-bottom: 9px;">Quête</span>`
            : `<div class="jeu-arcade" style="color: #ef6a7c; font-size: 9px; margin-bottom: 8px;">Proposé par ${escapeHtml(ch.creator || '?')}</div>`}
          <div style="font-family: 'Baloo 2', sans-serif; color: #0c2f3a; font-size: 21px; font-weight: 800; line-height: 1.15;">${escapeHtml(titre)}</div>
        </div>
        <span class="jeu-score" style="background: #f4b942; color: #4a2c00; font-size: 13px; padding: 7px 11px; border-radius: 11px; box-shadow: 0 4px 0 #c99a3f; white-space: nowrap; flex-shrink: 0;">+${xp}</span>
      </div>

      ${detail ? `<div style="font-size: 13.5px; line-height: 1.5; color: rgba(12,47,58,0.72);">${escapeHtml(detailCourt).replace(/\n/g, '<br>')}${detail.length > 150 ? ` <span onclick="event.stopPropagation(); this.parentElement.innerHTML = this.dataset.full" data-full="${escapeHtml(detail).replace(/"/g, '&quot;').replace(/\n/g, '<br>')}" style="color: #0e7a90; font-weight: 700; cursor: pointer;">voir plus</span>` : ''}</div>` : ''}

      ${ch.media ? `<div style="border-radius: 18px; overflow: hidden; ${ch.media.type === 'video' ? 'background: #000;' : ''}">${ch.media.type === 'video'
        ? `<video src="${ch.media.src}" style="width: 100%; max-height: 60vh; display: block;" controls playsinline preload="metadata"></video>`
        : `<img src="${ch.media.src}" style="width: 100%; height: auto; display: block;">`}</div>` : ''}

      <div onclick="showLikersPanel(${JSON.stringify(completedBy)})" style="cursor: pointer; display: flex; align-items: center; gap: 10px;">
        ${completedBy.length > 0 ? `<div style="display: flex;">${avatars}</div>` : ''}
        <span style="font-size: 12.5px; color: #0c2f3a; font-weight: 600;">${completedBy.length === 0 ? 'Personne ne l\'a encore relevé' : `${completedBy.length} sur ${PARTICIPANTS.length} l'ont relevé`}</span>
      </div>

      <div style="height: 14px; border-radius: 7px; background: ${fondJauge}; overflow: hidden;">
        <div style="height: 100%; width: ${pct}%; border-radius: 7px; background: ${teinte};"></div>
      </div>

      <div style="display: flex; align-items: center; gap: 16px;">
        <button onclick="event.stopPropagation(); likeCh(${ch.id})" style="border: none; background: none; padding: 0; cursor: pointer; display: flex; align-items: center; gap: 6px; color: ${jaime ? '#ef6a7c' : 'rgba(12,47,58,0.45)'}; font-weight: 700; font-size: 14px;">
          <span style="font-size: 16px;">♥</span>${(ch.likes || []).length}
        </button>
        <button onclick="event.stopPropagation(); toggleChallengeComments(${ch.id})" style="border: none; background: none; padding: 0; cursor: pointer; color: rgba(12,47,58,0.6); font-weight: 700; font-size: 14px;">💬 ${(ch.comments || []).length}</button>
        <div style="flex: 1;"></div>
        ${estAutrice ? `
        <div style="position: relative;">
          <button onclick="event.stopPropagation(); toggleMenuDefi(${ch.id})" aria-label="Options du défi" style="border: none; background: none; padding: 4px 6px; cursor: pointer; color: rgba(12,47,58,0.45); font-size: 18px; line-height: 1;">⋯</button>
          ${menuDefiOuvert === ch.id ? `
          <div style="position: absolute; right: 0; top: 28px; background: #fffdf7; border-radius: 14px; box-shadow: 0 6px 18px rgba(6,50,61,0.3); padding: 8px; display: flex; flex-direction: column; z-index: 6; min-width: 132px;">
            <button onclick="event.stopPropagation(); menuDefiOuvert = null; editChallenge(${ch.id})" style="border: none; background: none; text-align: left; padding: 9px 10px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #0c2f3a; font-weight: 600;">Modifier</button>
            <button onclick="event.stopPropagation(); menuDefiOuvert = null; duplicateChallenge(${ch.id})" style="border: none; background: none; text-align: left; padding: 9px 10px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #0c2f3a; font-weight: 600;">Dupliquer</button>
            <button onclick="event.stopPropagation(); menuDefiOuvert = null; confirmDeleteChallenge(${ch.id})" style="border: none; background: none; text-align: left; padding: 9px 10px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #ef6a7c; font-weight: 700;">Supprimer</button>
          </div>` : ''}
        </div>` : ''}
      </div>

      <div id="ch-comments-${ch.id}" style="display: none; flex-direction: column; gap: 8px;">
        ${(ch.comments || []).map(c => `
          <div style="background: rgba(14,122,144,0.06); border-radius: 12px; padding: 9px 11px;">
            <span style="font-size: 12px; font-weight: 700; color: #0e7a90;">${escapeHtml(c.author)} </span>
            <span style="font-size: 12.5px; color: #0c2f3a;">${escapeHtml(c.text)}</span>
          </div>`).join('')}
        <div style="display: flex; gap: 8px;">
          <input id="ch-comment-${ch.id}" placeholder="Écrire un commentaire…" style="flex: 1; border: none; background: rgba(12,47,58,0.06); border-radius: 12px; padding: 10px 12px; font-size: 13px; color: #0c2f3a; margin-bottom: 0;">
          <button onclick="addChallengeComment(${ch.id})" style="border: none; background: #0e7a90; color: #fffdf7; font-weight: 700; padding: 0 15px; border-radius: 12px; box-shadow: 0 3px 0 #06323d; cursor: pointer;">OK</button>
        </div>
      </div>

      ${parMoi ? `
        <div style="display: flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #fdf3dd, #f9e6bd); border-radius: 16px; padding: 12px 14px;">
          <span style="font-size: 16px;">🏅</span>
          <span style="flex: 1;">
            <span class="jeu-arcade" style="display: block; font-size: 10px; color: #8a6414;">Complété</span>
            <span style="display: block; font-size: 13px; font-weight: 700; color: #4a2c00; margin-top: 4px;">+${xp} XP dans la poche</span>
          </span>
          <button onclick="event.stopPropagation(); toggleChallengeCompletion(${ch.id})" style="border: none; background: none; color: rgba(74,44,0,0.5); font-size: 11.5px; cursor: pointer; text-decoration: underline;">annuler</button>
        </div>`
      : `
        <label class="btn-go" style="position: relative; display: flex; align-items: center; justify-content: center; gap: 11px; width: 100%; padding: 15px 0; cursor: pointer; box-sizing: border-box;">
          <span style="position: relative; font-size: 11px; color: #f4b942;">▶</span>
          <span class="jeu-arcade" style="position: relative; font-size: 12px; color: #f4b942; letter-spacing: 3px;">Go</span>
          <input type="file" accept="image/*,video/*" style="display: none;" onchange="event.stopPropagation(); submitChallengeProof(${ch.id}, this)">
        </label>`}

    </div>`;
  }).join('');
}

function toggleChallengeDetail(id) {
  const detail = document.getElementById(`ch-detail-${id}`);
  const chevron = document.getElementById(`ch-chevron-${id}`);
  if (!detail) return;
  const isOpen = detail.style.display !== 'none';
  detail.style.display = isOpen ? 'none' : 'block';
  if (chevron) chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
}

function confirmDeleteChallenge(id) {
  const ch = challenges.find(c => c.id === id);
  if (!ch) return;
  const label = ch.isQuest ? (ch.questLabel || 'cette quête') : 'ce challenge';
  showConfirmation(`Supprimer ${label} ? Cette action est définitive.`, () => {
    challenges = challenges.filter(c => c.id !== id);
    if (window.supabaseReady) {
      window.deleteFromSupabase('challenges', id).catch(err => console.error('Suppression cloud échouée:', err));
    }
    // 🪦 Pierre tombale (anti-résurrection) — voir app-core.js
    if (window.supabase) {
      window.supabase.from('deleted_items').upsert({ table_name: 'challenges', item_id: id })
        .then(() => { if (deletedItemIds.challenges) deletedItemIds.challenges.add(Number(id)); })
        .catch(err => console.error('Pose de pierre tombale échouée:', err));
    }
    saveAllData();
    renderChallenges();
    showNotification('🗑️ Supprimé', 'success');
  });
}

// ✅ N'annule plus qu'un défi déjà relevé (la validation initiale passe désormais
// par submitChallengeProof, qui exige une photo/vidéo à l'appui).
function toggleChallengeCompletion(id) {
  const ch = challenges.find(c => c.id === id);
  if (!ch) return;
  ch.completedBy = ch.completedBy || [];
  const idx = ch.completedBy.indexOf(currentUser.id);
  if (idx > -1) {
    ch.completedBy.splice(idx, 1);
    if (ch.proofs) delete ch.proofs[currentUser.id];
    showNotification('Défi annulé', 'success');
    saveAllData();
    renderChallenges();
    renderHomeGroupSpirit();
    renderHomeLeaderboard();
  }
}

// ✅ Valide un défi UNIQUEMENT après avoir fourni une preuve (photo ou vidéo) — on ne peut
// plus se contenter de cliquer "relevé" sans rien joindre.
function submitChallengeProof(id, inputEl) {
  const file = inputEl.files[0];
  if (!file) return;
  const ch = challenges.find(c => c.id === id);
  if (!ch) return;

  const isVideo = file.type.startsWith('video/');
  if (isVideo && file.size > 15 * 1024 * 1024) {
    showNotification('⚠️ Vidéo trop lourde (max 15 Mo)', 'error');
    inputEl.value = '';
    return;
  }
  if (!isVideo && file.size > 8 * 1024 * 1024) {
    showNotification('⚠️ Image trop lourde (max 8 Mo)', 'error');
    inputEl.value = '';
    return;
  }

  const finalize = (src) => {
    ch.completedBy = ch.completedBy || [];
    ch.proofs = ch.proofs || {};
    if (!ch.completedBy.includes(currentUser.id)) ch.completedBy.push(currentUser.id);
    ch.proofs[currentUser.id] = { type: isVideo ? 'video' : 'image', src, timestamp: new Date().toISOString() };

    const xp = ch.xp || 20;
    addNotification(`🏆 ${currentUser.name} a relevé "${(ch.questLabel || ch.creator)}" (+${xp} XP) !`, '🏆', 'challenge', true, ch.id);
    addFeedEntry(`a relevé le défi ${ch.isQuest ? ch.questLabel : ''} (+${xp} XP), preuve à l'appui !`, '🏆', 'challenge', ch.id);
    showNotification(`🏆 Défi relevé ! +${xp} XP`, 'success');
    celebrateWithConfetti();

    saveAllData();
    renderChallenges();
    renderHomeGroupSpirit();
    renderHomeLeaderboard();
  };

  const reader = new FileReader();
  reader.onload = (e) => {
    if (isVideo) {
      finalize(e.target.result);
    } else {
      // Même qualité que la galerie (1080px / 82%), pas la compression basse des avatars.
      compressImage(e.target.result, finalize, 1080, 0.82);
    }
  };
  reader.onerror = () => showNotification('⚠️ Erreur lors de la lecture du fichier', 'error');
  reader.readAsDataURL(file);
}

function computeXpLeaderboard() {
  const totals = {};
  PARTICIPANTS.forEach(p => { totals[p.id] = 0; });
  challenges.forEach(ch => {
    const xp = ch.xp || 20;
    (ch.completedBy || []).forEach(pid => {
      if (totals[pid] !== undefined) totals[pid] += xp;
    });
  });
  // ✅ L'XP des corvées accomplies compte aussi dans le classement global
  // 🐛 CORRECTIF (v2) : on lisait uniquement choreLog (historique local à CET
  // appareil), donc les corvées cochées par les autres participantes n'apparaissaient
  // jamais. Mon premier correctif est passé à cloudChoreAssignments SEUL pour éviter
  // un doublon — mais ça a cassé l'XP des tâches du jour de départ (toggleDepartureTask,
  // app-planning.js), qui ne sont JAMAIS synchronisées vers Supabase et n'existent
  // donc que dans choreLog. On fusionne maintenant les deux sources, en dédoublonnant
  // par (personne + jour + nom de corvée) pour ne pas compter deux fois une corvée du
  // Grand Tirage déjà comptée via le cloud.
  const cloudChoreKeys = new Set();
  if (typeof cloudChoreAssignments !== 'undefined' && Array.isArray(cloudChoreAssignments)) {
    cloudChoreAssignments.filter(r => r.done).forEach(r => {
      if (totals[r.person_id] !== undefined) totals[r.person_id] += (r.xp || 15);
      cloudChoreKeys.add(`${r.person_id}-${r.day_idx}-${r.chore_name}`);
    });
  }
  choreLog.forEach(entry => {
    const key = `${entry.personId}-${entry.dayIdx}-${entry.choreName}`;
    if (cloudChoreKeys.has(key)) return; // déjà compté via le cloud, on évite le doublon
    if (totals[entry.personId] !== undefined) totals[entry.personId] += (entry.xp || 15);
  });
  // 🐛 CORRECTIF : l'XP des missions secrètes (secretMissionXpCache, rempli par
  // refreshSecretMissionXpCache) n'était jamais additionné ici — les missions secrètes
  // rapportaient de l'XP en base mais il n'apparaissait jamais dans le classement.
  if (typeof secretMissionXpCache === 'object' && secretMissionXpCache) {
    Object.keys(secretMissionXpCache).forEach(pid => {
      if (totals[pid] !== undefined) totals[pid] += secretMissionXpCache[pid];
    });
  }
  // 🐛 CORRECTIF : la chasse au trésor n'était jamais comptée dans le classement.
  // treasureHuntItems.found_by stocke un NOM (currentUser.name), pas un person_id —
  // il faut le faire correspondre au bon participant avant d'additionner son XP.
  if (typeof treasureHuntItems !== 'undefined' && Array.isArray(treasureHuntItems)) {
    treasureHuntItems.filter(i => i.found && i.found_by).forEach(i => {
      // Comparaison tolérante : « Inès » saisi « Ines », ou une casse différente,
      // ne doit pas faire disparaître les XP d'un objet trouvé.
      const cle = (t) => (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
      const person = PARTICIPANTS.find(p => cle(p.name) === cle(i.found_by));
      if (person && totals[person.id] !== undefined) totals[person.id] += (i.xp || 10);
    });
  }
  return PARTICIPANTS
    .map(p => ({ p, xp: totals[p.id] || 0 }))
    .sort((a, b) => b.xp - a.xp);
}

// ✅ Classement XP — déplacé de l'accueil (home-leaderboard) vers l'onglet Défis
// (sous-onglet Classement), pour ne plus encombrer l'accueil.
let _lastKnownRank = null; // ✅ pour détecter un dépassement au classement XP

function renderHomeLeaderboard() {
  const container = document.getElementById('classement-content');
  if (typeof renderProfileXpStats === 'function') { try { renderProfileXpStats(); } catch (e) {} }
  if (!container) return;

  const ranking = computeXpLeaderboard();

  // ✅ Éclat doré si l'utilisateur vient de dépasser quelqu'un (rang qui baisse numériquement)
  const myRank = ranking.findIndex(r => r.p.id === currentUser.id);
  if (myRank !== -1) {
    if (_lastKnownRank !== null && myRank < _lastKnownRank && typeof MedAnim !== 'undefined' && MedAnim.rankFlash) {
      MedAnim.rankFlash();
    }
    _lastKnownRank = myRank;
  }

  // ✅ Refonte 23/07 : le classement gardait le style « fiche » sur fond sable au milieu
  // d'une section sombre. Il devient un tableau de scores d'arcade : les trois premières
  // sur un podium, les autres en lignes de score.
  const maxXp = ranking.length ? Math.max(ranking[0].xp, 1) : 1;
  const orMedaille = ['#f4b942', '#d8dde3', '#c9803f'];
  const hauteurs = [78, 58, 46];
  const ordrePodium = [1, 0, 2]; // 2e, 1re, 3e — comme sur un vrai podium

  const podium = ranking.slice(0, 3);
  const suite = ranking.slice(3);

  const marche = (idx) => {
    const r = podium[idx];
    if (!r) return '<div style="flex: 1;"></div>';
    const moi = r.p.id === currentUser.id;
    return `
      <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 7px;">
        <span style="display: inline-block; border-radius: 50%; box-shadow: 0 0 0 3px ${orMedaille[idx]};">${avatarDefi(r.p, idx === 0 ? 52 : 42, null)}</span>
        <div class="jeu-titre" style="font-size: 13px; color: #fffdf7; text-align: center; line-height: 1.1;">${escapeHtml(r.p.name)}${moi ? '<br><span class="jeu-arcade" style="font-size: 6.5px; color: #f4b942;">TOI</span>' : ''}</div>
        <div style="width: 100%; height: ${hauteurs[idx]}px; border-radius: 12px 12px 0 0; background: linear-gradient(180deg, ${orMedaille[idx]}, rgba(0,0,0,0.25)); display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 8px; gap: 3px;">
          <span class="jeu-arcade" style="font-size: 15px; color: #2a1a00;">${idx + 1}</span>
          <span class="jeu-arcade" style="font-size: 8px; color: #2a1a00;">${r.xp}</span>
        </div>
      </div>`;
  };

  container.innerHTML = `
    <div style="border-radius: 24px; background: linear-gradient(180deg, rgba(0,0,0,0.34), rgba(0,0,0,0.18)); padding: 18px 14px 0; margin-bottom: 14px;">
      <div class="jeu-arcade" style="font-size: 9px; color: #f4b942; letter-spacing: 1px; text-align: center; margin-bottom: 16px;">TABLEAU DES SCORES</div>
      <div style="display: flex; align-items: flex-end; gap: 8px;">
        ${ordrePodium.map(marche).join('')}
      </div>
    </div>

    ${suite.length ? `<div style="display: flex; flex-direction: column; gap: 7px;">
      ${suite.map((r, i) => {
        const moi = r.p.id === currentUser.id;
        const pct = Math.round((r.xp / maxXp) * 100);
        return `
        <div style="position: relative; border-radius: 14px; overflow: hidden; background: ${moi ? 'rgba(244,185,66,0.2)' : 'rgba(255,253,247,0.08)'};">
          <div style="position: absolute; inset: 0 auto 0 0; width: ${pct}%; background: rgba(31,182,201,0.22);"></div>
          <div style="position: relative; display: flex; align-items: center; gap: 11px; padding: 11px 13px;">
            <span class="jeu-arcade" style="font-size: 10px; color: rgba(255,253,247,0.5); width: 20px;">${i + 4}</span>
            ${avatarDefi(r.p, 30, null)}
            <span class="jeu-titre" style="flex: 1; font-size: 15px; color: #fffdf7;">${escapeHtml(r.p.name)}${moi ? ' <span class="jeu-arcade" style="font-size: 7px; color: #f4b942;">TOI</span>' : ''}</span>
            <span class="jeu-arcade" style="font-size: 10px; color: #f4b942;">${r.xp}</span>
          </div>
        </div>`;
      }).join('')}
    </div>` : ''}
  `;
}

function toggleLeaderboardExpand() {
  const rest = document.getElementById('leaderboard-rest');
  const label = document.getElementById('leaderboard-toggle-label');
  if (!rest || !label) return;
  const isOpen = rest.style.display !== 'none';
  rest.style.display = isOpen ? 'none' : 'block';
  const count = rest.querySelectorAll(':scope > div').length;
  label.textContent = isOpen ? `Voir tout le classement (${count} de plus) ▾` : 'Réduire ▴';
}

// ✅ Alias — appelé depuis switchQuestPanel('classement')
function renderClassement() {
  renderHomeLeaderboard();
}

function showCreateChallenge() {
  currentEditChallenge = null;
  document.getElementById('challenge-creator').value = currentUser.pseudo || currentUser.name;
  document.getElementById('challenge-desc').value = '';
  document.getElementById('challenge-media').value = '';
  document.querySelector('#createChallengeModal .modal-header h2').textContent = 'Nouveau Challenge';
  document.getElementById('challengeSubmitBtn').textContent = 'Créer';
  openModal('createChallengeModal');
}

let currentEditChallenge = null;

function editChallenge(id) {
  const ch = challenges.find(c => c.id === id);
  if (!ch) return;
  currentEditChallenge = id;
  document.getElementById('challenge-creator').value = ch.creator || (currentUser.pseudo || currentUser.name);
  document.getElementById('challenge-desc').value = ch.description;
  document.getElementById('challenge-media').value = '';
  document.querySelector('#createChallengeModal .modal-header h2').textContent = 'Éditer le Challenge';
  document.getElementById('challengeSubmitBtn').textContent = 'Sauvegarder';
  openModal('createChallengeModal');
}

function duplicateChallenge(id) {
  const ch = challenges.find(c => c.id === id);
  if (!ch) return;
  const copy = {
    ...ch,
    id: Date.now(),
    likes: [],
    comments: [],
    completedBy: [],
    timestamp: new Date()
  };
  challenges.unshift(copy);
  saveAllData();
  renderChallenges();
  addNotification(`📋 ${ch.isQuest ? (ch.questLabel || 'Quête') : 'Challenge de ' + ch.creator} dupliqué`, '📋', 'challenge', true, null, true, false);
  showNotification('📋 Challenge dupliqué !', 'success');
}

// ✅ Plus de "Êtes-vous sûr ?" : créer un défi n'a rien de destructeur, et quand on
// vient de remplir tous les champs et d'attendre l'envoi d'une vidéo, on est sûr.
// La fonction reste pour ne pas casser le onclick du bouton dans index.html.
function confirmCreateChallenge() {
  createChallenge();
}

async function createChallenge() {
  const creator = document.getElementById('challenge-creator').value;
  const desc = document.getElementById('challenge-desc').value;
  const mediaInput = document.getElementById('challenge-media');
  const submitBtn = document.getElementById('challengeSubmitBtn');

  if (!creator || !desc) { showNotification('Remplis les champs !', 'error'); return; }

  // 🐛 CORRECTIF (23/07) : rien n'empêchait de relancer la publication pendant
  // l'envoi, ce qui créait deux défis identiques.
  if (submitBtn && submitBtn.disabled) return;
  const libelleBouton = submitBtn ? submitBtn.textContent : '';
  const rendreLeBouton = () => {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = libelleBouton; }
  };

  const handleMedia = (media) => {
    if (currentEditChallenge) {
      // Mode édition
      const ch = challenges.find(c => c.id === currentEditChallenge);
      if (ch) {
        ch.creator = creator.toUpperCase();
        ch.description = desc;
        if (media) ch.media = media;
        addNotification(`✏️ Challenge de ${ch.creator} modifié`, '✏️', 'challenge', true, null, true, false);
      }
      currentEditChallenge = null;
    } else {
      // Mode création
      const newId = Date.now();
      challenges.unshift({
        id: newId,
        creator: creator.toUpperCase(),
        description: desc,
        media: media,
        likes: [],
        comments: [],
        xp: 20,
        completedBy: [],
        timestamp: new Date()
      });
      addNotification(`🎯 ${creator.toUpperCase()} a créé un nouveau challenge !`, '🎯', 'challenge');
      addFeedEntry(`a créé un nouveau challenge: "${desc.substring(0, 50)}${desc.length > 50 ? '...' : ''}"`, '🎯', 'challenge', newId);
    }

    saveAllData();
    closeModal('createChallengeModal');
    document.getElementById('challenge-creator').value = '';
    document.getElementById('challenge-desc').value = '';
    mediaInput.value = '';
    rendreLeBouton();
    renderChallenges();
    showNotification('✅ Challenge publié !', 'success');
  };

  const fichier = mediaInput.files[0];
  if (!fichier) { handleMedia(null); return; }

  // 🐛 CORRECTIF (23/07) — c'est ce bloc qui faisait perdre les défis. Avant, la
  // vidéo était convertie en texte base64 et stockée TELLE QUELLE dans le défi :
  //   • le blob localStorage explosait le quota (des dizaines de Mo pour une vidéo) ;
  //   • l'envoi du même pavé vers Supabase échouait, et l'erreur était avalée par un
  //     .catch(console.error) — donc le défi n'existait plus qu'en mémoire et
  //     disparaissait au rechargement, sans que personne soit prévenu ;
  //   • pendant la lecture du fichier, aucun signe à l'écran : on cliquait "publier"
  //     et il ne se passait rien.
  // On envoie désormais le fichier dans le bucket Storage (comme la galerie depuis le
  // 21/07) et on ne garde que son adresse. Avec, cette fois, une vraie gestion d'erreur.
  const LIMITE_MO = 60;
  if (fichier.size > LIMITE_MO * 1024 * 1024) {
    showNotification(`🎬 Fichier trop lourd (${Math.round(fichier.size / 1048576)} Mo, maximum ${LIMITE_MO} Mo).`, 'error');
    return;
  }

  const estImage = fichier.type.startsWith('image');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '⏳ Envoi en cours…'; }

  try {
    if (!window.supabaseReady) throw new Error('hors ligne');
    const ext = estImage ? 'jpg' : (fichier.name.split('.').pop() || 'mp4');
    const chemin = `challenge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const url = await uploadFileToStorage('challenge-videos', chemin, fichier);
    handleMedia({ src: url, type: estImage ? 'image' : 'video' });
  } catch (err) {
    console.error('Envoi du média échoué :', err);
    rendreLeBouton();
    // On ne publie PAS à moitié : mieux vaut redemander que perdre le défi en silence.
    showConfirmation(
      "L'envoi du média a échoué (réseau ?). Publier le défi sans le média ? Ton texte est conservé.",
      () => handleMedia(null)
    );
  }
}

async function likeCh(id) {
  const ch = challenges.find(c => c.id === id);
  if (ch) {
    if (!ch.likes) ch.likes = [];
    // ✅ Version cloud la plus fraîche avant bascule (voir refreshLikesFromCloud, app-core.js)
    const cloudLikes = await refreshLikesFromCloud('challenges', id);
    if (cloudLikes !== null) ch.likes = cloudLikes;
    const idx = ch.likes.indexOf(currentUser.id);
    if (idx > -1) {
      ch.likes.splice(idx, 1);
    } else {
      ch.likes.push(currentUser.id);
      addNotification(`❤️ ${currentUser.name} a aimé le challenge de ${ch.creator}`, '❤️', 'challenge', true, null, true, false);
      addFeedEntry(`a aimé le challenge de ${ch.creator}`, '❤️', 'challenge', ch.id);
    }
    saveAllData();
    renderChallenges();
  }
}

function toggleChallengeComments(id) {
  const el = document.getElementById(`ch-comments-${id}`);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function addChallengeComment(id) {
  const input = document.getElementById(`ch-comment-${id}`);
  if (input && input.value.trim()) {
    const commentText = input.value;
    const ch = challenges.find(c => c.id === id);
    if (ch) {
      ch.comments.push({ author: currentUser.name, text: commentText });
      saveAllData();
      input.value = '';
      renderChallenges();
      addNotification(`💬 ${currentUser.name} a commenté le challenge de ${ch.creator}`, '💬', 'challenge', true, null, true, false);
      addFeedEntry(`a commenté le challenge de ${ch.creator}: "${commentText.substring(0, 40)}"`, '💬', 'challenge', ch.id);
    }
  }
}

