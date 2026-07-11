// ============== CHALLENGES ==============
function renderChallenges() {
  const html = challenges.map(ch => {
    const userLiked = (ch.likes || []).includes(currentUser.id);
    const likesCount = (ch.likes || []).length;
    const completedBy = ch.completedBy || [];
    const userCompleted = completedBy.includes(currentUser.id);
    const xp = ch.xp || 20;
    const totalParticipants = PARTICIPANTS.length;
    const progressPct = Math.round((completedBy.length / totalParticipants) * 100);
    const title = ch.isQuest ? (ch.questLabel || 'QUÊTE') : ch.creator;
    const rowIcon = ch.isQuest
      ? `<div style="width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, var(--accent-gold), #ffb700); display: flex; align-items: center; justify-content: center; color: white; font-size: 15px; flex-shrink: 0;">🎮</div>`
      : `<div style="width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-gold), var(--accent-pink)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 13px; flex-shrink: 0;">${ch.creator.charAt(0)}</div>`;

    return `
    <div class="card" style="border-radius: 12px; overflow: hidden; margin-bottom: 8px; ${userCompleted ? 'box-shadow: 0 0 0 1.5px rgba(227, 185, 79, 0.4);' : ''}">
      <div onclick="toggleChallengeDetail(${ch.id})" style="display: flex; align-items: center; gap: 10px; padding: 12px 14px; cursor: pointer;">
        ${rowIcon}
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 700; font-size: 13px; color: var(--primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(title)}</div>
          <div style="font-size: 10.5px; color: var(--primary-light);">${completedBy.length}/${totalParticipants} relevé${completedBy.length > 1 ? 's' : ''} · ${xp} XP</div>
        </div>
        ${userCompleted ? '<span style="font-size: 16px;">✅</span>' : ''}
        <span id="ch-chevron-${ch.id}" style="color: var(--primary-light); font-size: 12px; transition: transform 0.2s ease;">▾</span>
      </div>
      <div id="ch-detail-${ch.id}" style="display: none; padding: 0 14px 14px;">
        <div style="display: flex; justify-content: flex-end; gap: 6px; margin-bottom: 10px;">
          <button class="btn-icon-small" onclick="event.stopPropagation(); editChallenge(${ch.id})" title="Éditer" style="background: var(--bg-sunken); border: none; border-radius: 8px; width: 30px; height: 30px; cursor: pointer; font-size: 13px;">✏️</button>
          <button class="btn-icon-small" onclick="event.stopPropagation(); duplicateChallenge(${ch.id})" title="Dupliquer" style="background: var(--bg-sunken); border: none; border-radius: 8px; width: 30px; height: 30px; cursor: pointer; font-size: 13px;">📋</button>
          <button class="btn-icon-small" onclick="event.stopPropagation(); confirmDeleteChallenge(${ch.id})" title="Supprimer" style="background: var(--bg-sunken); border: none; border-radius: 8px; width: 30px; height: 30px; cursor: pointer; font-size: 13px; color: var(--danger);">🗑️</button>
        </div>
        ${ch.media ? `<div style="margin-bottom: 12px; border-radius: 8px; overflow: hidden; max-height: 300px;">${ch.media.type === 'video' ? `<video src="${ch.media.src}" style="width: 100%; height: auto;" controls></video>` : `<img src="${ch.media.src}" style="width: 100%; height: auto;">`}</div>` : ''}
        ${/^CHALLENGE \d+$/.test(ch.creator) ? `
        <div style="margin-bottom: 12px;">
          <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--accent-cyan); cursor: pointer; padding: 8px 12px; border-radius: 8px; background: rgba(31, 182, 201, 0.1);">
            🎥 ${ch.media ? 'Remplacer' : 'Uploader'} la vidéo
            <input type="file" accept="video/mp4,video/quicktime,video/*" style="display: none;" onchange="uploadChallengeVideo(${ch.id}, this)">
          </label>
          <span id="upload-progress-${ch.id}" style="font-size: 11px; color: var(--primary-light); margin-left: 8px;"></span>
        </div>
        ` : ''}
        <div style="margin-bottom: 12px; font-size: 13px; line-height: 1.5; white-space: pre-line; color: var(--primary);">${escapeHtml(ch.description)}</div>
        <div style="margin-bottom: 10px;">
          <div style="height: 5px; border-radius: 3px; background: var(--bg-sunken); overflow: hidden;">
            <div style="height: 100%; width: ${progressPct}%; background: linear-gradient(90deg, var(--accent-gold) 0%, #ffb700 100%); transition: width 0.4s ease;"></div>
          </div>
        </div>
        ${completedBy.length > 0 ? `
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 12px; flex-wrap: wrap;">
          ${completedBy.map(pid => {
            const p = PARTICIPANTS.find(pp => pp.id === pid);
            return p ? `<span style="font-size: 11px; background: var(--bg-sunken); padding: 3px 8px; border-radius: 10px;">✅ ${escapeHtml(p.name)}</span>` : '';
          }).join('')}
        </div>` : ''}
        <div style="display: flex; gap: 8px; margin-bottom: 10px;">
          <button class="btn btn-small" style="background: ${userCompleted ? 'linear-gradient(135deg, var(--accent-gold) 0%, #ffb700 100%)' : 'var(--bg-sunken)'}; color: ${userCompleted ? 'white' : 'var(--primary)'}; flex: 1.4; font-weight: 700; border: none;" onclick="event.stopPropagation(); toggleChallengeCompletion(${ch.id})">${userCompleted ? '✅ Relevé !' : '🎯 Relever le défi'}</button>
          <button class="btn btn-small" style="background: ${userLiked ? 'linear-gradient(135deg, var(--accent-pink) 0%, #d946a6 100%)' : 'var(--bg-sunken)'}; color: ${userLiked ? 'white' : 'var(--primary)'}; flex: 1; border: none;" onclick="event.stopPropagation(); likeCh(${ch.id})">❤️ ${likesCount}</button>
          <button class="btn btn-small" style="background: var(--bg-sunken); color: var(--primary); flex: 1; border: none;" onclick="event.stopPropagation(); toggleChallengeComments(${ch.id})">💬 ${ch.comments.length}</button>
        </div>
        <div id="ch-comments-${ch.id}" style="display: none; margin-top: 10px; padding: 12px; background: var(--bg-sunken); border-radius: 8px;">
          ${ch.comments.map(c => `<div style="font-size: 12px; margin-bottom: 8px; padding: 8px; background: var(--bg-raised); border-radius: 4px;"><strong>${escapeHtml(c.author)}:</strong> ${escapeHtml(c.text)}</div>`).join('')}
          <div style="display: flex; gap: 8px; margin-top: 10px;">
            <input type="text" placeholder="Commenter..." id="ch-comment-${ch.id}" style="flex: 1; margin-bottom: 0; border: none; padding: 10px; border-radius: 6px; background: var(--bg-raised);">
            <button class="btn btn-small btn-primary" style="border: none;" onclick="addChallengeComment(${ch.id})">📤</button>
          </div>
        </div>
      </div>
    </div>
  `;
  }).join('');
  
  document.getElementById('challenges-content').innerHTML = html || '<div style="text-align: center; color: var(--primary-light); padding: 50px 20px;"><div style="font-size: 40px; margin-bottom: 10px;">🏝️</div><p style="margin: 0; font-size: 14px;">Aucun défi pour le moment — lance le premier !</p></div>';
}

// ✅ Déplie/replie le détail d'une quête (description, média, actions) — la ligne
// résumée suffit pour parcourir la liste, le détail ne s'ouvre qu'à la demande.
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
    saveAllData();
    renderChallenges();
    showNotification('🗑️ Supprimé', 'success');
  });
}

function toggleChallengeCompletion(id) {
  const ch = challenges.find(c => c.id === id);
  if (!ch) return;
  ch.completedBy = ch.completedBy || [];
  const idx = ch.completedBy.indexOf(currentUser.id);
  if (idx > -1) {
    ch.completedBy.splice(idx, 1);
    showNotification('Défi annulé', 'success');
  } else {
    ch.completedBy.push(currentUser.id);
    const xp = ch.xp || 20;
    addNotification(`🏆 ${currentUser.name} a relevé "${(ch.questLabel || ch.creator)}" (+${xp} XP) !`, '🏆', 'challenge');
    addFeedEntry(`a relevé le défi ${ch.isQuest ? ch.questLabel : ''} (+${xp} XP) !`, '🏆');
    showNotification(`🏆 Défi relevé ! +${xp} XP`, 'success');
    celebrateWithConfetti();
  }
  saveAllData();
  renderChallenges();
  renderHomeGroupSpirit();
  renderHomeLeaderboard();
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
  choreLog.forEach(entry => {
    if (totals[entry.personId] !== undefined) totals[entry.personId] += (entry.xp || 15);
  });
  return PARTICIPANTS
    .map(p => ({ p, xp: totals[p.id] || 0 }))
    .sort((a, b) => b.xp - a.xp);
}

// ✅ Classement XP — affiché sur l'accueil (plus dans l'onglet Quêtes, pour ne
// pas encombrer la liste des défis).
function renderHomeLeaderboard() {
  const container = document.getElementById('home-leaderboard');
  if (!container) return;

  const ranking = computeXpLeaderboard();
  const medals = ['🥇', '🥈', '🥉'];
  const rows = ranking.map((r, i) => `
    <div style="display: flex; align-items: center; gap: 10px; padding: 8px 0; ${i < ranking.length - 1 ? 'box-shadow: 0 1px 0 var(--border);' : ''}">
      <span style="width: 22px; text-align: center; font-size: 15px;">${medals[i] || (i + 1)}</span>
      <span style="flex: 1; font-weight: ${i < 3 ? '700' : '400'}; font-size: 13px;">${r.p.name}${r.p.id === currentUser.id ? ' (toi)' : ''}</span>
      <span style="font-weight: 800; font-size: 13px; color: var(--accent-gold);">${r.xp} XP</span>
    </div>
  `).join('');
  container.innerHTML = `
    <div class="card" style="background: linear-gradient(135deg, rgba(227, 185, 79, 0.12) 0%, rgba(227, 185, 79, 0.03) 100%); padding: 18px;">
      <div style="font-weight: 800; font-size: 14px; margin-bottom: 12px; letter-spacing: 0.5px;">🏆 CLASSEMENT XP</div>
      ${rows}
    </div>
  `;
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
  addNotification(`📋 ${ch.isQuest ? (ch.questLabel || 'Quête') : 'Challenge de ' + ch.creator} dupliqué`, '📋', 'challenge');
  showNotification('📋 Challenge dupliqué !', 'success');
}

function confirmCreateChallenge() {
  const isEditing = !!currentEditChallenge;
  const message = isEditing ? 
    'Êtes-vous sûr de vouloir modifier ce challenge?' :
    'Êtes-vous sûr de vouloir créer ce challenge?';
  showConfirmation(message, createChallenge);
}

function createChallenge() {
  const creator = document.getElementById('challenge-creator').value;
  const desc = document.getElementById('challenge-desc').value;
  const mediaInput = document.getElementById('challenge-media');
  
  if (!creator || !desc) { showNotification('Remplis les champs!', 'error'); return; }

  const handleMedia = (media) => {
    if (currentEditChallenge) {
      // Mode édition
      const ch = challenges.find(c => c.id === currentEditChallenge);
      if (ch) {
        ch.creator = creator.toUpperCase();
        ch.description = desc;
        if (media) ch.media = media;
        addNotification(`✏️ Challenge de ${ch.creator} modifié`, '✏️', 'challenge');
      }
      currentEditChallenge = null;
    } else {
      // Mode création
      challenges.unshift({
        id: Date.now(),
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
      addFeedEntry(`a créé un nouveau challenge: "${desc.substring(0, 50)}${desc.length > 50 ? '...' : ''}"`, '🎯');
    }

    saveAllData();
    closeModal('createChallengeModal');
    document.getElementById('challenge-creator').value = '';
    document.getElementById('challenge-desc').value = '';
    mediaInput.value = '';
    renderChallenges();
    showNotification('✅ Challenge sauvegardé!', 'success');
  };

  if (mediaInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      handleMedia({
        src: e.target.result,
        type: mediaInput.files[0].type.startsWith('image') ? 'image' : 'video'
      });
    };
    reader.readAsDataURL(mediaInput.files[0]);
  } else {
    handleMedia(null);
  }
}

function likeCh(id) {
  const ch = challenges.find(c => c.id === id);
  if (ch) {
    if (!ch.likes) ch.likes = [];
    const idx = ch.likes.indexOf(currentUser.id);
    if (idx > -1) {
      ch.likes.splice(idx, 1);
    } else {
      ch.likes.push(currentUser.id);
      addNotification(`❤️ ${currentUser.name} a aimé le challenge de ${ch.creator}`, '❤️', 'challenge');
      addFeedEntry(`a aimé le challenge de ${ch.creator}`, '❤️');
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
      addNotification(`💬 ${currentUser.name} a commenté le challenge de ${ch.creator}`, '💬', 'challenge');
      addFeedEntry(`a commenté le challenge de ${ch.creator}: "${commentText.substring(0, 40)}"`, '💬');
    }
  }
}

