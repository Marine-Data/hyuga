// ============== GALLERY ==============
// ✅ Bascule grille (miniatures, pour retrouver vite un souvenir) / fil (vue détaillée
// avec likes et commentaires, conservée telle quelle) — par défaut sur "fil" pour ne
// pas changer le comportement existant tant qu'on ne choisit pas explicitement.
let galleryViewMode = 'feed';

function setGalleryViewMode(mode) {
  galleryViewMode = mode;
  const gridBtn = document.getElementById('gallery-view-grid-btn');
  const feedBtn = document.getElementById('gallery-view-feed-btn');
  if (gridBtn) gridBtn.classList.toggle('active', mode === 'grid');
  if (feedBtn) feedBtn.classList.toggle('active', mode === 'feed');
  renderGallery();
}

function populateGalleryFilters() {
  const daySelect = document.getElementById('gallery-filter-day');
  const personSelect = document.getElementById('gallery-filter-person');
  if (!daySelect || !personSelect) return;

  if (daySelect.options.length <= 1) {
    planningData.forEach((day, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${day.jour}`;
      daySelect.appendChild(opt);
    });
  }
  if (personSelect.options.length <= 1) {
    PARTICIPANTS.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.name;
      personSelect.appendChild(opt);
    });
  }
  daySelect.value = galleryFilterDay;
  personSelect.value = galleryFilterCreatorId;
}

function applyGalleryFilters() {
  const daySelect = document.getElementById('gallery-filter-day');
  const personSelect = document.getElementById('gallery-filter-person');
  galleryFilterDay = daySelect ? daySelect.value : "";
  galleryFilterCreatorId = personSelect ? personSelect.value : "";
  renderGallery();
}

function renderGallery() {
  populateGalleryFilters();

  let items = galleryItems.slice().reverse();

  if (galleryFilterCreatorId !== "") {
    items = items.filter(item => String(item.creatorId) === String(galleryFilterCreatorId));
  }
  if (galleryFilterDay !== "") {
    items = items.filter(item => getTripDayIndex(item.timestamp) === parseInt(galleryFilterDay, 10));
  }

  // ✅ Mode grille : miniatures compactes (3 colonnes), avec un repère ▶ sur les vidéos
  // pour ne pas les confondre avec une photo cassée dans une si petite vignette.
  if (galleryViewMode === 'grid') {
    const gridHtml = items.map(item => `
      <div onclick="viewGallery(${galleryItems.indexOf(item)})" style="position: relative; aspect-ratio: 1; background: var(--bg-sunken); cursor: pointer; overflow: hidden;">
        ${item.type === 'image'
          ? `<img src="${item.src}" alt="" style="width: 100%; height: 100%; object-fit: cover; display: block;">`
          : `<video src="${item.src}" style="width: 100%; height: 100%; object-fit: cover; display: block;" playsinline muted preload="metadata"></video>
             <span style="position: absolute; top: 6px; right: 6px; width: 18px; height: 18px; border-radius: 50%; background: rgba(0,0,0,0.55); color: #fff; font-size: 9px; display: flex; align-items: center; justify-content: center;">▶</span>`}
      </div>
    `).join('');
    document.getElementById('gallery-grid').innerHTML = items.length
      ? `<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px;">${gridHtml}</div>`
      : `<div style="text-align: center; padding: 60px 20px;"><div style="font-size: 40px; margin-bottom: 12px;">📷</div><p style="color: var(--primary-light); font-size: 13px;">Aucune photo à afficher</p></div>`;
    return;
  }

  const html = items.map((item) => {
    const userLiked = (item.likes || []).includes(currentUser.id);
    const likesCount = (item.likes || []).length;
    const commentsCount = (item.comments || []).length;
    const taggedUsers = item.tags ? item.tags.map(tid => PARTICIPANTS.find(p => p.id === tid)?.name).filter(Boolean) : [];
    const creatorAvatarRaw = (personalsData[item.creatorId] && personalsData[item.creatorId].avatar) || null;
    const creatorAvatar = (creatorAvatarRaw && creatorAvatarRaw.startsWith('data:image')) ? creatorAvatarRaw : null;
    const timeago = getTimeAgo(item.timestamp);

    return `
    <div class="ig-post" id="gal-item-${item.id}">
      <!-- En-tête du post -->
      <div style="display: flex; align-items: center; gap: 12px; padding: 14px 16px; cursor: pointer;" onclick="showPublicProfileFromGallery('${item.creator}')">
        <div class="ig-avatar-ring">
          <div class="ig-avatar-inner">
            ${creatorAvatar ? `<img src="${creatorAvatar}" style="width: 100%; height: 100%; object-fit: cover;">` : item.creator[0]}
          </div>
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 700; font-size: 13.5px; color: var(--primary); letter-spacing: 0.1px;">${item.creator}</div>
          <div style="font-size: 11px; color: var(--primary-light);">${timeago}</div>
        </div>
        <button onclick="event.stopPropagation(); editGalleryItem(${item.id})" style="background: var(--bg-sunken); border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 14px; color: var(--primary-light); cursor: pointer;">✏️</button>
      </div>

      <!-- Photo/vidéo pleine largeur -->
      <div style="width: 100%; aspect-ratio: 4/5; background: var(--bg-sunken); position: relative;">
        ${item.type === 'image'
          ? `<img src="${item.src}" alt="" style="width: 100%; height: 100%; object-fit: cover; display: block;">`
          : `<video src="${item.src}" controls playsinline preload="metadata" style="width: 100%; height: 100%; object-fit: cover; display: block;"></video>`}
        <div class="ig-location-badge">📍 ${escapeHtml(item.location)}</div>
      </div>

      <!-- Barre d'actions SOUS la photo -->
      <div style="display: flex; align-items: center; gap: 10px; padding: 14px 16px 10px;">
        <button class="ig-action-btn ${userLiked ? 'liked' : ''}" onclick="likeGalleryItem(${item.id})">${userLiked ? '❤️' : '🤍'}</button>
        <button class="ig-action-btn" onclick="toggleGalleryComments(${item.id})">💬</button>
      </div>

      <!-- Likes, légende, commentaires -->
      <div style="padding: 0 16px 16px;">
        ${likesCount > 0 ? `<div style="font-weight: 700; font-size: 12.5px; color: var(--primary); margin-bottom: 6px;">${likesCount} mention${likesCount > 1 ? 's' : ''} J'aime</div>` : ''}
        ${item.description ? `<div style="font-size: 12.5px; color: var(--primary); margin-bottom: 8px; line-height: 1.5;"><strong>${escapeHtml(item.creator)}</strong> ${escapeHtml(item.description)}</div>` : ''}
        ${taggedUsers.length > 0 ? `
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">
            ${taggedUsers.map(name => `<button class="ig-tag-chip" onclick="filterGalleryByTag('${name}')">🏷️ ${name}</button>`).join('')}
          </div>
        ` : ''}
        ${commentsCount > 0 ? `<div onclick="toggleGalleryComments(${item.id})" style="font-size: 12px; color: var(--primary-light); cursor: pointer;">Voir ${commentsCount > 1 ? `les ${commentsCount} commentaires` : 'le commentaire'}</div>` : ''}
      </div>
    </div>
    `;
  }).join('');
  
  const isFiltered = galleryFilterCreatorId !== "" || galleryFilterDay !== "";
  document.getElementById('gallery-grid').innerHTML = html || `
    <div style="text-align: center; padding: 60px 20px;">
      <div style="font-size: 40px; margin-bottom: 12px;">📷</div>
      <p style="color: var(--primary-light); font-size: 13px;">${isFiltered ? 'Aucune photo ne correspond à ce filtre' : 'Galerie vide — ajoute la première photo !'}</p>
    </div>
  `;
}

function showUploadForm() {
  const form = document.getElementById('upload-form');
  const isVisible = form.style.display !== 'none';
  
  if (!isVisible) {
    // Initialiser checkboxes quand on ouvre le formulaire
    let html = '';
    PARTICIPANTS.forEach(p => {
      html += `
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px; border-radius: 4px; transition: background 0.2s;">
          <input type="checkbox" id="tag-${p.id}" style="cursor: pointer; width: 16px; height: 16px;">
          <span style="font-size: 12px;">${p.name}</span>
        </label>
      `;
    });
    document.getElementById('gallery-tags-checkboxes').innerHTML = html;
  }
  
  form.style.display = isVisible ? 'none' : 'block';
}

function uploadGallery() {
  const input = document.getElementById('gallery-input');
  const location = document.getElementById('gallery-location').value;
  const desc = document.getElementById('gallery-desc').value;
  
  if (!input.files[0] || !location) { showNotification('Remplis les champs!', 'error'); return; }
  
  // Récupérer les tags cochés
  const tags = [];
  PARTICIPANTS.forEach(p => {
    if (document.getElementById(`tag-${p.id}`)?.checked) {
      tags.push(p.id);
    }
  });
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const isImage = input.files[0].type.startsWith('image');

    const finishUpload = (src) => {
      const item = {
        id: Date.now(),
        src: src,
        type: isImage ? 'image' : 'video',
        location: location,
        description: desc,
        creator: currentUser.name,
        creatorId: currentUser.id,
        timestamp: new Date(),
        likes: [],
        comments: [],
        tags: tags
      };
      galleryItems.push(item);
      saveAllData();
      renderGallery();
      renderFeed();  // ✅ Mettre à jour le feed aussi!
      showUploadForm();
      
      // Réinitialiser le formulaire
      document.getElementById('gallery-location').value = '';
      document.getElementById('gallery-desc').value = '';
      input.value = '';
      document.getElementById('gallery-tags-checkboxes').innerHTML = '';
      
      addNotification('📸 Nouvelle preuve versée au dossier.', '📸', 'gallery');
      addFeedEntry(`a partagé une photo: "${location}"`, '📸');
    };

    if (isImage) {
      // ✅ 1080px / qualité 82% : net sur téléphone (contre 600px/70% avant, très flou en plein écran),
      // tout en restant raisonnable en taille de base64 pour Supabase (~200-350 Ko au lieu de ~60 Ko).
      compressImage(e.target.result, finishUpload, 1080, 0.82);
    } else {
      finishUpload(e.target.result); // Vidéos : pas de compression canvas possible
    }
  };
  reader.readAsDataURL(input.files[0]);
}

function likeGalleryItem(itemId) {
  const item = galleryItems.find(i => i.id === itemId);
  if (!item) return;
  
  if (!item.likes) item.likes = [];
  const idx = item.likes.indexOf(currentUser.id);
  
  if (idx > -1) {
    item.likes.splice(idx, 1);
    addNotification(`vous a retiré un ❤️`, '❌', 'gallery', true, item.id);
  } else {
    item.likes.push(currentUser.id);
    addNotification(`❤️ ${currentUser.name} a aimé votre photo`, '❤️', 'gallery', true, item.id);
    addFeedEntry(`a aimé la photo de ${item.creator} (${item.location})`, '❤️');
  }
  
  saveAllData();
  renderGallery();
}

function toggleGalleryComments(itemId) {
  const item = galleryItems.find(i => i.id === itemId);
  if (!item) return;
  
  if (!item.comments) item.comments = [];
  
  let commentsDiv = document.getElementById(`gal-comments-${itemId}`);
  if (commentsDiv) {
    const showing = commentsDiv.style.display !== 'none';
    commentsDiv.style.display = showing ? 'none' : 'block';
    const backdrop = document.getElementById(`gal-comments-backdrop-${itemId}`);
    if (backdrop) backdrop.style.display = showing ? 'none' : 'block';
    return;
  }
  
  // ✅ Voile sombre derrière (style Instagram) pour isoler le modal du reste de la page
  const backdrop = document.createElement('div');
  backdrop.id = `gal-comments-backdrop-${itemId}`;
  backdrop.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9998;';
  backdrop.onclick = () => closeGalleryCommentsModal(itemId);

  // ✅ Bottom sheet opaque (fond plein, pas de transparence) ancré en bas de l'écran
  const container = document.createElement('div');
  container.id = `gal-comments-${itemId}`;
  container.style.cssText = 'position: fixed; bottom: 0; left: 0; right: 0; background: var(--bg-raised); padding: 12px 20px 20px; border-radius: 16px 16px 0 0; max-height: 70vh; display: flex; flex-direction: column; box-shadow: 0 -8px 24px rgba(0,0,0,0.3); z-index: 9999;';
  
  let html = `
    <div style="width: 36px; height: 4px; background: var(--border); border-radius: 4px; margin: 0 auto 14px;"></div>
    <div style="font-size: 14px; font-weight: 700; margin-bottom: 12px; color: var(--primary); display: flex; justify-content: space-between; align-items: center;">
      💬 Commentaires
      <button onclick="closeGalleryCommentsModal(${itemId})" style="background: none; border: none; font-size: 18px; color: var(--primary-light); cursor: pointer;">✕</button>
    </div>
    <div style="overflow-y: auto; flex: 1; margin-bottom: 12px;">
  `;
  
  if (item.comments.length === 0) {
    html += `<div style="font-size: 12px; color: var(--primary-light); text-align: center; padding: 20px 0;">Aucun commentaire pour le moment</div>`;
  }
  item.comments.forEach(c => {
    html += `
      <div style="font-size: 12px; margin-bottom: 10px; padding-bottom: 10px; box-shadow: 0 1px 0 var(--border);">
        <strong>${escapeHtml(c.user)}:</strong> ${highlightMentions(c.text)}
        <div style="font-size: 10px; color: var(--primary-light);">${new Date(c.timestamp).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</div>
      </div>
    `;
  });
  html += `</div>`;
  
  html += `
    <div style="display: flex; gap: 8px; padding-top: 8px; box-shadow: 0 -1px 0 var(--border);">
      <input type="text" placeholder="Commenter... @pseudo pour mentionner" id="gal-comment-${itemId}" style="flex: 1; margin-bottom: 0; font-size: 13px;">
      <button class="btn btn-small btn-primary" onclick="addGalleryComment(${itemId})">📤</button>
    </div>
  `;
  
  container.innerHTML = html;
  document.body.appendChild(backdrop);
  document.body.appendChild(container);
  document.getElementById(`gal-comment-${itemId}`).focus();
}

// ✅ Fermeture sécurisée du modal de commentaires (évite les blocages)
function closeGalleryCommentsModal(itemId) {
  try {
    const el = document.getElementById(`gal-comments-${itemId}`);
    if (el) el.remove();
    const backdrop = document.getElementById(`gal-comments-backdrop-${itemId}`);
    if (backdrop) backdrop.remove();
  } catch (err) {
    console.error('Erreur fermeture modal commentaires:', err);
  }
}

function addGalleryComment(itemId) {
  const item = galleryItems.find(i => i.id === itemId);
  if (!item) return;
  
  const input = document.getElementById(`gal-comment-${itemId}`);
  if (!input || !input.value.trim()) return;
  
  if (!item.comments) item.comments = [];
  const mentions = parseMentions(input.value); // ✅ Détecte les @pseudo dans le commentaire
  item.comments.push({
    id: Date.now(),
    user: currentUser.name,
    userId: currentUser.id,
    text: input.value,
    timestamp: new Date(),
    mentions: mentions
  });
  
  saveAllData();
  addNotification(`💬 ${currentUser.name} a commenté la photo`, '💬', 'gallery', true, item.id);
  addFeedEntry(`a commenté la photo de ${item.creator}: "${input.value.substring(0, 40)}"`, '💬');
  
  // Fermer et réouvrir pour voir le nouveau commentaire
  closeGalleryCommentsModal(itemId);
  toggleGalleryComments(itemId);
  renderGallery();
}

// ✅ Détecte les @pseudo mentionnés dans un texte et retourne les IDs des participants correspondants
function parseMentions(text) {
  const matches = text.match(/@([a-zA-Z0-9_À-ÿ]+)/g) || [];
  const mentioned = [];
  matches.forEach(m => {
    const handle = m.slice(1).toLowerCase();
    const p = PARTICIPANTS.find(pp => (pp.pseudo || '').toLowerCase() === handle || pp.name.toLowerCase() === handle);
    if (p && !mentioned.includes(p.id)) mentioned.push(p.id);
  });
  return mentioned;
}

// ✅ Met en surbrillance les @pseudo dans le texte affiché (façon Instagram)
function highlightMentions(text) {
  // ✅ On échappe d'abord tout le texte (faille XSS), puis on surligne les @mentions
  // sur le texte déjà nettoyé — le HTML injecté ici est le seul HTML volontaire.
  return escapeHtml(text).replace(/@([a-zA-Z0-9_À-ÿ]+)/g, '<span style="color: var(--accent-cyan); font-weight: 600;">@$1</span>');
}

// ✅ Vérifie si l'utilisateur courant a été mentionné dans un nouveau commentaire, et notifie localement
function checkGalleryMentions() {
  if (!currentUser) return;
  const notifiedKey = 'notifiedMentionIds';
  let notifiedIds = [];
  try { notifiedIds = JSON.parse(localStorage.getItem(notifiedKey) || '[]'); } catch (e) { notifiedIds = []; }
  const newlyNotified = [];
  
  galleryItems.forEach(item => {
    (item.comments || []).forEach(c => {
      if (c.mentions && c.mentions.includes(currentUser.id) && c.userId !== currentUser.id) {
        const cId = String(c.id || `${item.id}-${c.timestamp}`);
        if (!notifiedIds.includes(cId)) {
          addNotification(`${c.user} vous a mentionné(e) dans un commentaire: "${c.text.substring(0, 40)}"`, '🔔', 'gallery', false, item.id);
          newlyNotified.push(cId);
        }
      }
    });
  });
  
  if (newlyNotified.length > 0) {
    localStorage.setItem(notifiedKey, JSON.stringify([...notifiedIds, ...newlyNotified]));
  }
}

function editGalleryItem(itemId) {
  const item = galleryItems.find(i => i.id === itemId);
  if (!item) return;
  
  // Afficher modal édition
  const modal = document.createElement('div');
  modal.id = 'gallery-edit-modal'; // ✅ ID unique — évite de cibler par erreur un autre écran "position: fixed"
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;';
  
  let tagsHTML = '';
  PARTICIPANTS.forEach(p => {
    const isTagged = (item.tags || []).includes(p.id);
    tagsHTML += `
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px; border-radius: 4px;">
        <input type="checkbox" id="edit-tag-${p.id}" ${isTagged ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px;">
        <span style="font-size: 12px; color: white;">${p.name}</span>
      </label>
    `;
  });
  
  modal.innerHTML = `
    <div style="background: var(--bg-raised); padding: 20px; border-radius: 12px; width: 100%; max-width: 400px; max-height: 90vh; overflow-y: auto; box-shadow: 0 0 0 2px var(--border), 0 20px 50px rgba(0,0,0,0.35);">
      <div style="font-size: 16px; font-weight: 700; margin-bottom: 16px; color: var(--primary);">✏️ Éditer la photo</div>
      
      <div style="margin-bottom: 12px;">
        <label style="font-size: 11px; color: var(--primary-light); display: block; margin-bottom: 6px;">📍 Lieu:</label>
        <input type="text" id="edit-location" value="${escapeHtml(item.location)}" style="width: 100%; padding: 8px; border-radius: 6px; background: var(--bg-sunken); color: var(--primary); box-shadow: inset 0 2px 6px rgba(12, 47, 58, 0.1);">
      </div>
      
      <div style="margin-bottom: 12px;">
        <label style="font-size: 11px; color: var(--primary-light); display: block; margin-bottom: 6px;">📝 Description:</label>
        <textarea id="edit-desc" style="width: 100%; padding: 8px; min-height: 80px; border-radius: 6px; background: var(--bg-sunken); color: var(--primary); font-size: 12px; box-shadow: inset 0 2px 6px rgba(12, 47, 58, 0.1);">${escapeHtml(item.description)}</textarea>
      </div>
      
      <div style="margin-bottom: 12px; padding: 12px; background: var(--bg-sunken); border-radius: 6px;">
        <label style="font-size: 11px; color: var(--primary-light); display: block; margin-bottom: 8px;">🏷️ Personnes:</label>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">${tagsHTML}</div>
      </div>
      
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-primary" style="flex: 1;" onclick="saveGalleryEdit(${itemId})">💾 Enregistrer</button>
        <button class="btn" style="flex: 1; background: var(--bg-sunken); color: var(--primary);" onclick="document.getElementById('gallery-edit-modal')?.remove()">❌ Annuler</button>
      </div>
      <button class="btn btn-danger" style="width: 100%; margin-top: 8px; border: none; background: rgba(239, 68, 68, 0.1); color: var(--danger);" onclick="confirmDeleteGalleryItem(${itemId})">🗑️ Supprimer la photo</button>
    </div>
  `;
  
  document.body.appendChild(modal);
}

function saveGalleryEdit(itemId) {
  const item = galleryItems.find(i => i.id === itemId);
  if (!item) return;
  
  item.location = document.getElementById('edit-location').value;
  item.description = document.getElementById('edit-desc').value;
  
  item.tags = [];
  PARTICIPANTS.forEach(p => {
    if (document.getElementById(`edit-tag-${p.id}`)?.checked) {
      item.tags.push(p.id);
    }
  });
  
  saveAllData();
  document.getElementById('gallery-edit-modal')?.remove();
  renderGallery();
  addNotification('📸 Photo modifiée!', '📸', 'gallery');
}

function confirmDeleteGalleryItem(itemId) {
  const item = galleryItems.find(i => i.id === itemId);
  if (!item) return;
  showConfirmation('Supprimer définitivement cette photo ?', () => {
    galleryItems = galleryItems.filter(i => i.id !== itemId);
    saveAllData();
    document.getElementById('gallery-edit-modal')?.remove();
    renderGallery();
    window.deleteFromSupabase('gallery_items', itemId);
    showNotification('🗑️ Photo supprimée', 'success');
  });
}

function filterGalleryByTag(tagName) {
  const person = PARTICIPANTS.find(p => p.name === tagName);
  if (!person) return;
  
  const filtered = galleryItems.filter(item => (item.tags || []).includes(person.id));
  
  if (filtered.length === 0) {
    document.getElementById('gallery-grid').innerHTML = `<p style="text-align: center; color: var(--primary-light); padding: 20px;">Aucune photo avec ${tagName}</p>`;
    return;
  }
  
  // Afficher galerie filtrée avec bouton retour
  let html = `<div style="width: 100%; padding: 12px; background: var(--bg-sunken); border-radius: 6px; margin-bottom: 16px; text-align: center;">
    <strong>📷 Photos de ${tagName}</strong>
    <button class="btn btn-small" style="margin-left: 12px;" onclick="renderGallery()">← Retour</button>
  </div>`;
  
  html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px;">`;
  filtered.forEach(item => {
    html += `
      <div style="position: relative; aspect-ratio: 1; background: var(--bg-sunken); border-radius: 10px; overflow: hidden; box-shadow: 0 0 0 1.5px var(--border), 0 2px 6px rgba(0,0,0,0.1);">
        ${item.type === 'image' ? `<img src="${item.src}" alt="" style="width: 100%; height: 100%; object-fit: cover;">` : `<video src="${item.src}" style="width: 100%; height: 100%; object-fit: cover;" playsinline muted preload="metadata"></video>`}
        <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.6); color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600;">${escapeHtml(item.location)}</div>
      </div>
    `;
  });
  html += '</div>';
  
  document.getElementById('gallery-grid').innerHTML = html;
}

// ✅ Depuis une miniature en mode grille : bascule vers le fil détaillé (photo, likes,
// commentaires) et défile jusqu'au bon souvenir — remplace l'ancien viewGallery() qui
// se contentait d'une alerte texte sans afficher la photo.
function viewGallery(idx) {
  const item = galleryItems[idx];
  if (!item) return;
  setGalleryViewMode('feed');
  setTimeout(() => {
    const el = document.getElementById(`gal-item-${item.id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 60);
}

