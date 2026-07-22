// ============== FEED ==============

// ============== PROFILE MANAGEMENT ==============
function showMyProfile() {
  document.getElementById('my-profile-content').style.display = 'block';
  document.getElementById('all-profiles-content').style.display = 'none';
  renderMyProfile();
}

function showGroupProfiles() {
  showAllProfiles();
}

function showAllProfiles() {
  document.getElementById('my-profile-content').style.display = 'none';
  document.getElementById('all-profiles-content').style.display = 'block';
  renderAllProfiles();
}

// ✅ XP total + rang, calculés à la volée depuis computeXpLeaderboard() (la même
// source que le Classement de l'onglet Défis) — jamais une valeur figée séparée qui
// pourrait se désynchroniser.
function renderProfileXpStats() {
  const el = document.getElementById('profile-xp-stats');
  if (!el) return;
  if (typeof computeXpLeaderboard !== 'function') { el.innerHTML = ''; return; }

  const ranking = computeXpLeaderboard();
  const myRankIdx = ranking.findIndex(r => r.p.id === currentUser.id);
  const myXp = myRankIdx !== -1 ? ranking[myRankIdx].xp : 0;
  const myRank = myRankIdx !== -1 ? myRankIdx + 1 : '—';

  el.innerHTML = `
    <div style="flex: 1; background: var(--bg-raised); border-radius: 12px; box-shadow: 0 2px 8px rgba(12,47,58,0.08); text-align: center; padding: 10px 4px;">
      <div style="font-family: var(--font-display); font-weight: 700; font-size: 17px; color: var(--primary);">${myXp}</div>
      <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.4px; color: var(--primary-light);">XP total</div>
    </div>
    <div onclick="switchTab('challenges'); setTimeout(() => switchQuestPanel('classement'), 60);" style="cursor: pointer; flex: 1; background: var(--bg-raised); border-radius: 12px; box-shadow: 0 2px 8px rgba(12,47,58,0.08); text-align: center; padding: 10px 4px;">
      <div style="font-family: var(--font-display); font-weight: 700; font-size: 17px; color: var(--primary);">#${myRank}</div>
      <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.4px; color: var(--primary-light);">Rang</div>
    </div>
  `;
}

function renderMyProfile() {
  const user = currentUser;
  const personalData = personalsData[user.id] || {};
  // ✅ La bio personnalisée en app (personalData.bio) gagne toujours sur la bio par défaut (user.bio)
  const officialBio = (personalData.bio && personalData.bio.trim()) ? personalData.bio : (user.bio || '');
  
  // Déterminer comment afficher l'avatar
  let avatarHTML = '';
  if (personalData.avatar && personalData.avatar.startsWith('data:image')) {
    // C'est une image compressée
    avatarHTML = `<img src="${personalData.avatar}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
  } else {
    // C'est un emoji ou vide
    avatarHTML = personalData.avatar || '👤';
  }
  
  const html = `
    <div class="card" style="text-align: center; padding: 24px;">
      <div onclick="document.getElementById('avatarInput')?.click()" style="cursor: pointer; position: relative; font-size: 80px; margin-bottom: 20px; display: inline-block; padding: 20px; background: linear-gradient(135deg, #1D5FA8 0%, #1690A3 100%); border-radius: 50%; width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(29, 95, 168, 0.2);" title="Toucher pour changer la photo">
        ${avatarHTML}
        <span style="position: absolute; bottom: 4px; right: 4px; width: 34px; height: 34px; border-radius: 50%; background: var(--accent-gold); border: 3px solid var(--bg); display: flex; align-items: center; justify-content: center; font-size: 15px;">📷</span>
      </div>
      <div style="font-size: 20px; font-weight: 700; margin-bottom: 10px; color: var(--primary);">${user.name}</div>
      <div style="font-size: 14px; color: var(--primary-light); font-style: italic; margin-bottom: 18px;">
        "${officialBio || 'Aventurier(e) du groupe'}"
      </div>

      <!-- ✅ XP et rang : n'apparaissaient nulle part sur le profil (seulement dans
           Défis > Classement), donnant l'impression que rien ne se passait en validant
           un défi. Recalculé à chaque affichage du profil, jamais figé. -->
      <div id="profile-xp-stats" style="display: flex; gap: 10px; margin-bottom: 24px;"></div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
        <button class="btn btn-primary" onclick="showMyProfileTab('infos')" id="btn-infos" style="background: linear-gradient(135deg, #1D5FA8 0%, #1690A3 100%); color: white; border: none; box-shadow: 0 4px 12px rgba(29, 95, 168, 0.2);">📋 Infos</button>
        <button class="btn" onclick="showMyProfileTab('valise')" id="btn-valise" style="background: var(--bg-sunken); color: var(--primary); border: none; box-shadow: 0 2px 6px rgba(12, 47, 58, 0.08);">🎒 Valise</button>
      </div>
      
      <div id="my-profile-tab-content"></div>
      
      <div style="margin-top: 16px;">
        <button class="btn" onclick="localStorage.getItem('pushActivated') ? desactiverNotificationsPush() : activerNotificationsPush(); setTimeout(renderMyProfile, 300);" style="width: 100%; background: ${localStorage.getItem('pushActivated') ? 'var(--bg-sunken)' : 'linear-gradient(135deg, var(--accent-gold) 0%, #ffb700 100%)'}; color: ${localStorage.getItem('pushActivated') ? 'var(--primary)' : 'white'}; border: none; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          ${localStorage.getItem('pushActivated') ? '🔕 Désactiver les notifs push' : '🔔 Activer les notifs push'}
        </button>
      </div>
      
      <div id="travel-section" style="margin-top: 16px;"></div>

      ${user.name === 'Marine' ? renderPrivateMessageComposer() : ''}

      <div style="margin-top: 16px; padding-top: 24px; box-shadow: inset 0 1px 3px rgba(12, 47, 58, 0.05);">
        <button class="btn btn-primary" onclick="showAllProfiles()" style="width: 100%; border: none; box-shadow: 0 4px 12px rgba(12, 47, 58, 0.15);">👥 Voir les autres</button>
      </div>
    </div>
  `;
  
  document.getElementById('my-profile-content').innerHTML = html;
  renderProfileXpStats();
  showMyProfileTab('infos');
  loadTravelSection(); // ✅ 🧳 Infos d'arrivée/départ + billets
  if (user.name === 'Marine') loadPendingPrivateMessages(); // ✅ Liste des envois programmés
}

// ============== MESSAGE PRIVÉ (réservé au profil de Marine) ==============
// ✅ Formulaire visible seulement sur le profil de Marine : choisir un
// destinataire, écrire un message libre, choisir une heure d'envoi (ou
// "maintenant"). Le message n'est jamais visible que par le destinataire
// choisi (ni broadcast, ni fil d'activité) — voir checkPrivateMessages()
// côté réception. Envoyé en push même si le destinataire a fermé l'app,
// via la table private_messages + la tâche planifiée send-private-message.
function renderPrivateMessageComposer() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // format datetime-local en heure locale
  const nowLocal = now.toISOString().slice(0, 16);
  const others = PARTICIPANTS.filter(p => p.id !== currentUser.id);

  return `
    <div style="margin-top: 16px; padding-top: 24px; box-shadow: inset 0 1px 3px rgba(12, 47, 58, 0.05); text-align: left;">
      <div style="font-family: var(--font-display); font-weight: 500; font-size: 15px; color: var(--primary); margin-bottom: 12px;">💌 Envoyer un message privé</div>

      <label style="font-weight: 700; display: block; margin-bottom: 6px; color: var(--primary); font-size: 12.5px;">À qui ? <span style="font-weight: 400; color: var(--primary-light);">(plusieurs choix possibles)</span></label>
      <div style="display: flex; justify-content: flex-end; margin-bottom: 6px;">
        <button type="button" onclick="togglePmSelectAll()" style="background: none; border: none; color: var(--accent-pink); font-size: 12px; font-weight: 700; cursor: pointer; padding: 2px 4px;">Tout sélectionner / désélectionner</button>
      </div>
      <div id="pm-targets" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px;">
        ${others.map(p => `
          <label style="display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 20px; background: var(--bg-sunken); box-shadow: inset 0 2px 6px rgba(12, 47, 58, 0.08); color: var(--primary); font-size: 13px; cursor: pointer;">
            <input type="checkbox" class="pm-target-checkbox" value="${p.id}" style="accent-color: var(--accent-pink);">
            ${escapeHtml(p.name)}
          </label>
        `).join('')}
      </div>

      <label style="font-weight: 700; display: block; margin-bottom: 6px; color: var(--primary); font-size: 12.5px;">Message</label>
      <textarea id="pm-message" placeholder="Passe une belle journée..." style="width: 100%; padding: 12px; border: none; border-radius: 8px; min-height: 70px; font-family: inherit; resize: vertical; background: var(--bg-sunken); box-shadow: inset 0 2px 6px rgba(12, 47, 58, 0.08); color: var(--primary); margin-bottom: 14px;"></textarea>

      <div style="display: grid; grid-template-columns: 70px 1fr; gap: 10px; margin-bottom: 14px;">
        <div>
          <label style="font-weight: 700; display: block; margin-bottom: 6px; color: var(--primary); font-size: 12.5px;">Emoji</label>
          <input type="text" id="pm-emoji" value="❤️" maxlength="4" style="width: 100%; padding: 12px; text-align: center; font-size: 16px; border: none; border-radius: 8px; background: var(--bg-sunken); box-shadow: inset 0 2px 6px rgba(12, 47, 58, 0.08);">
        </div>
        <div>
          <label style="font-weight: 700; display: block; margin-bottom: 6px; color: var(--primary); font-size: 12.5px;">Quand ?</label>
          <input type="datetime-local" id="pm-when" value="${nowLocal}" style="width: 100%; padding: 11px; border: none; border-radius: 8px; background: var(--bg-sunken); box-shadow: inset 0 2px 6px rgba(12, 47, 58, 0.08); color: var(--primary);">
        </div>
      </div>

      <button class="btn btn-primary" onclick="sendPrivateMessage()" style="width: 100%; border: none; box-shadow: 0 4px 12px rgba(12, 47, 58, 0.15); background: linear-gradient(135deg, var(--accent-pink) 0%, #d946a6 100%); color: white; font-weight: 700;">💌 Envoyer</button>
      <div id="pm-status" style="font-size: 11.5px; color: var(--primary-light); margin-top: 8px; text-align: center;"></div>
      <div id="pm-pending" style="margin-top: 14px;"></div>
    </div>
  `;
}

// ✅ Liste des messages programmés pas encore envoyés, avec annulation — avant, une
// fois un envoi programmé validé, aucun moyen de le revoir ni de l'annuler.
async function loadPendingPrivateMessages() {
  const box = document.getElementById('pm-pending');
  if (!box || !window.supabaseReady) return;
  try {
    const { data, error } = await window.supabase
      .from('private_messages')
      .select('*')
      .eq('sent', false)
      .order('scheduled_at', { ascending: true });
    if (error || !data || data.length === 0) { box.innerHTML = ''; return; }

    box.innerHTML = `
      <div style="font-size: 12px; font-weight: 700; color: var(--primary); margin-bottom: 8px;">⏳ Programmés (pas encore envoyés)</div>
      ${data.map(m => {
        const target = PARTICIPANTS.find(p => p.id === m.target_id)?.name || '?';
        const when = new Date(m.scheduled_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        return `
          <div style="display: flex; align-items: center; gap: 8px; padding: 8px 10px; margin-bottom: 6px; background: var(--bg-sunken); border-radius: 8px; font-size: 12px;">
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 700; color: var(--primary);">${m.emoji || '❤️'} Pour ${escapeHtml(target)} · ${when}</div>
              <div style="color: var(--primary-light); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(m.message)}</div>
            </div>
            <button onclick="cancelPendingPrivateMessage(${m.id})" title="Annuler" style="background: rgba(239, 68, 68, 0.1); color: var(--danger); border: none; border-radius: 6px; padding: 6px 9px; cursor: pointer; flex-shrink: 0;">✕</button>
          </div>`;
      }).join('')}
    `;
  } catch (e) { box.innerHTML = ''; }
}

function cancelPendingPrivateMessage(id) {
  showConfirmation('Annuler cet envoi programmé ?', async () => {
    try {
      // Sécurité anti-course : on ne supprime que s'il n'est toujours pas parti
      const { error } = await window.supabase.from('private_messages').delete().eq('id', id).eq('sent', false);
      if (error) throw error;
      showNotification('✕ Envoi annulé', 'success');
    } catch (e) {
      showNotification('❌ Annulation impossible (déjà envoyé ?)', 'error');
    }
    loadPendingPrivateMessages();
  });
}

function togglePmSelectAll() {
  const boxes = document.querySelectorAll('.pm-target-checkbox');
  const allChecked = Array.from(boxes).every(b => b.checked);
  boxes.forEach(b => { b.checked = !allChecked; });
}

async function sendPrivateMessage() {
  const targetIds = Array.from(document.querySelectorAll('.pm-target-checkbox:checked')).map(b => parseInt(b.value, 10));
  const message = document.getElementById('pm-message').value.trim();
  const emoji = document.getElementById('pm-emoji').value.trim() || '❤️';
  const whenLocal = document.getElementById('pm-when').value;
  const statusEl = document.getElementById('pm-status');

  if (targetIds.length === 0) { showNotification('⚠️ Sélectionne au moins une personne', 'error'); return; }
  if (!message) { showNotification('⚠️ Écris un message avant d\'envoyer', 'error'); return; }
  if (!whenLocal) { showNotification('⚠️ Choisis une heure d\'envoi', 'error'); return; }

  const scheduledAt = new Date(whenLocal); // interprété en heure locale du navigateur
  if (statusEl) statusEl.textContent = '⏳ Envoi en cours...';

  try {
    // ✅ Une ligne par destinataire : chacun reçoit le même message/heure, mais indépendamment
    // (si un envoi échoue pour l'un, les autres ne sont pas bloqués — voir le compte-rendu ci-dessous).
    const rows = targetIds.map(targetId => ({
      sender_id: currentUser.id,
      target_id: targetId,
      message,
      emoji,
      scheduled_at: scheduledAt.toISOString()
    }));
    const { error } = await window.supabase.from('private_messages').insert(rows);
    if (error) throw error;

    const names = targetIds.map(id => PARTICIPANTS.find(p => p.id === id)?.name || '?').join(', ');
    const isNow = scheduledAt.getTime() <= Date.now() + 30000; // marge de 30s
    if (statusEl) statusEl.textContent = isNow
      ? `✅ Message envoyé à ${names} !`
      : `✅ Programmé pour ${names} le ${scheduledAt.toLocaleString('fr-FR')}`;
    showNotification(`💌 Message privé enregistré pour ${targetIds.length} personne${targetIds.length > 1 ? 's' : ''} !`, 'success');
    loadPendingPrivateMessages();
    document.getElementById('pm-message').value = '';
    document.querySelectorAll('.pm-target-checkbox').forEach(b => { b.checked = false; });
  } catch (err) {
    console.error('Échec envoi message privé:', err);
    if (statusEl) statusEl.textContent = '❌ Échec de l\'envoi, réessaie.';
    showNotification('❌ Échec de l\'envoi du message privé', 'error');
  }
}

function showMyProfileTab(tab) {
  const content = document.getElementById('my-profile-tab-content');
  
  // Update buttons
  document.getElementById('btn-infos').style.background = tab === 'infos' ? 'linear-gradient(135deg, #1D5FA8 0%, #1690A3 100%)' : 'var(--bg-sunken)';
  document.getElementById('btn-infos').style.color = tab === 'infos' ? 'white' : 'var(--primary)';
  document.getElementById('btn-infos').style.boxShadow = tab === 'infos' ? '0 4px 12px rgba(29, 95, 168, 0.2)' : '0 2px 6px rgba(12, 47, 58, 0.08)';
  document.getElementById('btn-valise').style.background = tab === 'valise' ? 'linear-gradient(135deg, #1D5FA8 0%, #1690A3 100%)' : 'var(--bg-sunken)';
  document.getElementById('btn-valise').style.color = tab === 'valise' ? 'white' : 'var(--primary)';
  document.getElementById('btn-valise').style.boxShadow = tab === 'valise' ? '0 4px 12px rgba(29, 95, 168, 0.2)' : '0 2px 6px rgba(12, 47, 58, 0.08)';
  
  if (tab === 'infos') {
    content.innerHTML = `
      <div style="text-align: left;">
        <input type="file" id="avatarInput" accept="image/*" style="display: none;" onchange="previewAvatar(event)">
        
        <label style="font-weight: 700; display: block; margin-bottom: 8px; color: var(--primary);">📝 Pseudo</label>
        <input type="text" id="pseudoInput" placeholder="Ton pseudo..." style="width: 100%; padding: 12px; border: none; border-radius: 8px; background: var(--bg-sunken); box-shadow: inset 0 2px 6px rgba(12, 47, 58, 0.08); color: var(--primary); margin-bottom: 16px;" value="${escapeHtml(currentUser.pseudo || '')}">
        
        <label style="font-weight: 700; display: block; margin-bottom: 8px; color: var(--primary);">💬 Bio</label>
        <textarea id="bioInput" style="width: 100%; padding: 12px; border: none; border-radius: 8px; min-height: 80px; font-family: inherit; resize: vertical; background: var(--bg-sunken); box-shadow: inset 0 2px 6px rgba(12, 47, 58, 0.08); color: var(--primary); margin-bottom: 16px;">${personalsData[currentUser.id]?.bio || ''}</textarea>
        
        <button class="btn btn-primary" onclick="saveMyProfile()" style="width: 100%; border: none; box-shadow: 0 4px 12px rgba(12, 47, 58, 0.15); background: linear-gradient(135deg, var(--accent-cyan) 0%, #00d9d9 100%); color: white; font-weight: 700;">💾 Sauvegarder mon profil</button>
      </div>
    `;
  } else if (tab === 'valise') {
    renderChecklistValise();
  }
}

function renderChecklistValise() {
  const content = document.getElementById('my-profile-tab-content');

  // ✅ On regroupe par nom d'objet normalisé (insensible à la casse/espaces) pour éviter
  // qu'un même objet ("Maillot de bain") apparaisse en double/triple s'il est demandé
  // par plusieurs activités différentes. La clé de la valise est basée sur ce nom normalisé
  // (préfixe "pack:" pour ne pas entrer en collision avec les clés par activité utilisées
  // dans l'onglet Planning, qui restent indépendantes).
  const grouped = {};
  planningData.forEach((day, dayIdx) => {
    day.activities.forEach((activity, actIdx) => {
      const list = Array.isArray(activity.apporter) ? activity.apporter : [];
      list.forEach((itemName) => {
        const norm = String(itemName || '').trim().toLowerCase();
        if (!norm) return;
        if (!grouped[norm]) {
          grouped[norm] = { key: `pack:${norm}`, name: itemName.trim(), sources: [] };
        }
        const sourceLabel = `${activity.nom} · ${day.jour}`;
        if (!grouped[norm].sources.includes(sourceLabel)) {
          grouped[norm].sources.push(sourceLabel);
        }
      });
    });
  });

  const items = Object.values(grouped).sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  if (items.length === 0) {
    content.innerHTML = '<div style="text-align: center; color: var(--primary-light); padding: 40px 20px;">📭 Aucun objet à préparer pour l\'instant</div>';
    return;
  }

  const packedCount = items.filter(i => checklistValise[i.key]).length;
  const pct = Math.round((packedCount / items.length) * 100);

  let html = `
    <div class="card" style="background: linear-gradient(135deg, rgba(227, 185, 79, 0.14) 0%, rgba(227, 185, 79, 0.03) 100%); padding: 18px; margin-bottom: 16px; text-align: center;">
      <div style="font-weight: 800; font-size: 17px; margin-bottom: 6px;">🎒 ${packedCount} / ${items.length} dans la valise</div>
      <div style="height: 8px; border-radius: 4px; background: var(--bg-sunken); overflow: hidden; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);">
        <div style="height: 100%; width: ${pct}%; background: linear-gradient(90deg, var(--accent-gold) 0%, #ffb700 100%); transition: width 0.4s ease;"></div>
      </div>
    </div>
  `;

  html += items.map(i => {
    const packed = checklistValise[i.key] || false;
    const sourceLabel = i.sources.length > 1 ? `${i.sources.length} activités` : i.sources[0];
    return `
      <div onclick="toggleApporterItem('${i.key}'); renderChecklistValise();" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-raised); border-radius: 10px; margin-bottom: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(12, 47, 58, 0.06);">
        <input type="checkbox" ${packed ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer; accent-color: var(--accent-cyan); flex-shrink: 0;" onclick="event.stopPropagation();">
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 13px; font-weight: 600; text-decoration: ${packed ? 'line-through' : 'none'}; opacity: ${packed ? '0.55' : '1'};">${escapeHtml(i.name)}</div>
          <div style="font-size: 10px; color: var(--primary-light);" title="${escapeHtml(i.sources.join(', '))}">${escapeHtml(sourceLabel)}</div>
        </div>
        <span style="font-size: 12px; flex-shrink: 0;">${packed ? '✅' : '⬜'}</span>
      </div>
    `;
  }).join('');

  content.innerHTML = html;
}

function saveMyProfile() {
  const newBio = document.getElementById('bioInput').value;
  const newPseudo = document.getElementById('pseudoInput').value;
  
  // Sauvegarder les données personnelles
  personalsData[currentUser.id] = personalsData[currentUser.id] || {};
  personalsData[currentUser.id].bio = newBio;
  
  // Sauvegarder le pseudo dans currentUser
  currentUser.pseudo = newPseudo;
  
  // Sauvegarder aussi dans PARTICIPANTS
  const participant = PARTICIPANTS.find(p => p.id === currentUser.id);
  if (participant) {
    participant.pseudo = newPseudo;
  }
  
  saveAllData();
  showNotification('✅ Profil mis à jour !', 'success');
  addFeedEntry(`👤 ${currentUser.name} a mis à jour son profil`, '✨', 'profile', currentUser.id);
  renderMyProfile();
  if (typeof renderHeaderAvatar === 'function') renderHeaderAvatar();
}

// Upload de photo de profil
function previewAvatar(event) {
  const file = event.target.files[0];
  if (file) {
    // Limiter la taille (max 2MB)
    if (file.size > 2000000) {
      showNotification('⚠️ Image trop grande (max 2MB)', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      // ✅ Compression revue à la hausse (500px / 85%, comme l'autre point d'upload avatar) —
      // 300px/70% donnait des photos de profil floues.
      compressImage(e.target.result, (compressedImage) => {
        // Sauvegarder l'image compressée
        personalsData[currentUser.id] = personalsData[currentUser.id] || {};
        personalsData[currentUser.id].avatar = compressedImage;
        
        // Mettre à jour l'affichage du profil immédiatement
        renderMyProfile();
        if (typeof renderHeaderAvatar === 'function') renderHeaderAvatar();
        
        saveAllData();
        showNotification('📸 Photo mise à jour !', 'success');
      }, 500, 0.85);
    };
    reader.readAsDataURL(file);
  }
}

// Compresser l'image (redimensionner + réduire qualité)
function compressImage(imageSource, callback, maxSize = 300, quality = 0.7) {
  const img = new Image();
  img.src = imageSource;
  
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Redimensionner à maxSize max (300 pour avatars, 1080 pour galerie)
    let width = img.width;
    let height = img.height;
    
    if (width > height) {
      if (width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      }
    } else {
      if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    
    // Convertir en JPEG avec qualité réduite
    const compressedImage = canvas.toDataURL('image/jpeg', quality);
    callback(compressedImage);
  };
  
  img.onerror = () => {
    showNotification('⚠️ Erreur lors du chargement de l\'image', 'error');
    callback(imageSource); // Fallback
  };
}

// ✅ Grille de cartes façon trombinoscope (au lieu d'une liste verticale) — médaille
// sur l'avatar pour les 3 premiers du classement XP, pour voir tout le groupe d'un coup.
function renderAllProfiles() {
  const section = document.getElementById('all-profiles-content');
  const ranking = (typeof computeXpLeaderboard === 'function') ? computeXpLeaderboard() : [];
  const medals = ['🥇', '🥈', '🥉'];

  section.innerHTML = `
    <div id="shuttle-recap" style="margin-bottom: 16px;"></div>
    <div style="margin-bottom: 15px; font-size: 12px; color: var(--primary-light); font-weight: 600;">👥 ${PARTICIPANTS.length} participants</div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
      ${PARTICIPANTS.map(user => {
        const personalData = personalsData[user.id] || {};
        const avatarHTML = (personalData.avatar && personalData.avatar.startsWith('data:image'))
          ? `<img src="${personalData.avatar}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`
          : (personalData.avatar || user.name.charAt(0));
        const rankIdx = ranking.findIndex(r => r.p.id === user.id);
        const xp = rankIdx !== -1 ? ranking[rankIdx].xp : 0;
        const medal = rankIdx >= 0 && rankIdx < 3 ? medals[rankIdx] : null;
        return `
          <div onclick="showPublicProfile(${user.id})" style="cursor: pointer; background: var(--bg-raised); border-radius: 14px; padding: 12px 6px; text-align: center; box-shadow: 0 2px 10px rgba(12, 47, 58, 0.07);">
            <div style="position: relative; width: 46px; height: 46px; margin: 0 auto 6px; border-radius: 50%; background: ${avatarHTML.startsWith('<img') ? 'transparent' : (typeof getPersonGradient === 'function' ? getPersonGradient(user.id) : 'linear-gradient(135deg, #1D5FA8, #1690A3)')}; display: flex; align-items: center; justify-content: center; font-size: ${avatarHTML.startsWith('<img') ? '0' : '18px'}; color: white; font-weight: 700; overflow: hidden;">
              ${avatarHTML}
              ${medal ? `<span style="position: absolute; bottom: -2px; right: -2px; font-size: 13px; background: var(--bg-raised); border-radius: 50%; padding: 1px;">${medal}</span>` : ''}
            </div>
            <div style="font-size: 12px; font-weight: 700; color: var(--primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(user.name)}</div>
            <div style="font-size: 10px; color: var(--primary-light);">${xp} XP</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
  loadShuttleRecap(); // ✅ 🗺️ Récap des arrivées/départs de tout le monde
}

function showPublicProfile(userId) {
  currentViewingProfileId = userId;
  const section = document.getElementById('all-profiles-content');
  const user = PARTICIPANTS.find(u => u.id === userId);
  const personalData = personalsData[userId] || {};
  const hasRealPhoto = personalData.avatar && personalData.avatar.startsWith('data:image');
  const avatarHTML = hasRealPhoto
    ? `<img src="${personalData.avatar}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`
    : (personalData.avatar || '👤');
  const avatarWrapStyle = hasRealPhoto
    ? `margin-bottom: 20px; display: inline-flex; width: 140px; height: 140px; border-radius: 50%; align-items: center; justify-content: center; overflow: hidden; padding: 3px; background: var(--bg-raised); box-shadow: 0 8px 20px rgba(12, 47, 58, 0.12);`
    : `font-size: 70px; margin-bottom: 20px; display: inline-flex; padding: 20px; background: linear-gradient(135deg, #1D5FA8 0%, #1690A3 100%); border-radius: 50%; width: 140px; height: 140px; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(29, 95, 168, 0.2); overflow: hidden;`;

  const html = `
    <div class="card" style="text-align: center; padding: 24px;">
      <button class="btn" onclick="showAllProfiles()" style="width: 100%; margin-bottom: 18px; background: var(--bg-sunken); color: var(--primary); border: none; box-shadow: 0 2px 6px rgba(12, 47, 58, 0.08);">← Retour aux participants</button>
      
      <div style="${avatarWrapStyle} cursor: pointer;" onclick="showPublicProfileTab(${userId}, 'feed')" title="Voir les activités">${avatarHTML}</div>
      <div class="title-serif" style="font-size: 21px; margin-bottom: 8px;">${user.name}</div>
      <div style="font-size: 13px; color: var(--primary-light); font-style: italic; margin-bottom: 16px;">
        "${escapeHtml(personalData.bio || user.bio) || 'Aventurier(e) du groupe'}"
      </div>
      <div class="divider-gold" style="width: 60px; margin: 0 auto 20px;"></div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
        <button class="btn btn-primary" onclick="showPublicProfileTab(${userId}, 'feed')" id="btn-feed-pub" style="background: linear-gradient(135deg, #1D5FA8 0%, #1690A3 100%); color: white; border: none; box-shadow: 0 4px 12px rgba(29, 95, 168, 0.2);">📝 Feed</button>
        <button class="btn" onclick="showPublicProfileTab(${userId}, 'photos')" id="btn-photos-pub" style="background: var(--bg-sunken); color: var(--primary); border: none; box-shadow: 0 2px 6px rgba(12, 47, 58, 0.08);">🖼️ Photos</button>
      </div>
      
      <div id="public-profile-tab-content"></div>
    </div>
  `;
  
  section.innerHTML = html;
  showPublicProfileTab(userId, 'feed');
}

function showPublicProfileTab(userId, tab) {
  const content = document.getElementById('public-profile-tab-content');
  
  // Update buttons
  document.getElementById('btn-feed-pub').style.background = tab === 'feed' ? 'linear-gradient(135deg, #1D5FA8 0%, #1690A3 100%)' : 'var(--bg-sunken)';
  document.getElementById('btn-feed-pub').style.color = tab === 'feed' ? 'white' : 'var(--primary)';
  document.getElementById('btn-feed-pub').style.boxShadow = tab === 'feed' ? '0 4px 12px rgba(29, 95, 168, 0.2)' : '0 2px 6px rgba(12, 47, 58, 0.08)';
  document.getElementById('btn-photos-pub').style.background = tab === 'photos' ? 'linear-gradient(135deg, #1D5FA8 0%, #1690A3 100%)' : 'var(--bg-sunken)';
  document.getElementById('btn-photos-pub').style.color = tab === 'photos' ? 'white' : 'var(--primary)';
  document.getElementById('btn-photos-pub').style.boxShadow = tab === 'photos' ? '0 4px 12px rgba(29, 95, 168, 0.2)' : '0 2px 6px rgba(12, 47, 58, 0.08)';
  
  if (tab === 'feed') {
    const userFeed = feed.filter(e => e.userId === userId);
    if (userFeed.length === 0) {
      content.innerHTML = '<div style="text-align: center; color: var(--primary-light); margin-top: 28px; padding: 20px;">📭 Aucune activité pour le moment</div>';
    } else {
      content.innerHTML = '<div style="margin-top: 20px; display: flex; flex-direction: column; gap: 12px;">' + userFeed.slice(0, 5).map(entry => `
        <div style="background: linear-gradient(135deg, var(--bg-raised) 0%, var(--bg-sunken) 100%); padding: 14px; border-radius: 8px; box-shadow: inset 4px 0 0 var(--accent-cyan), 0 2px 6px rgba(111, 184, 176, 0.1);">
          <div style="font-weight: 700; font-size: 13px; color: var(--primary);">${entry.emoji} ${escapeHtml(entry.message)}</div>
          <div style="font-size: 11px; color: var(--primary-light); margin-top: 6px;">Il y a peu</div>
        </div>
      `).join('') + '</div>';
    }
  } else if (tab === 'photos') {
    const userName = PARTICIPANTS.find(u => u.id === userId)?.name;
    const userPhotos = galleryItems.filter(p => p.creator === userName);
    if (userPhotos.length === 0) {
      content.innerHTML = '<div style="text-align: center; color: var(--primary-light); margin-top: 20px;">Aucune photo 📸</div>';
    } else {
      content.innerHTML = '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 20px;">' + userPhotos.slice(0, 9).map(p => `
        <div class="photo-frame" style="aspect-ratio: 1; cursor: pointer;" onclick="switchTab('gallery')">
          ${p.type === 'image'
            ? `<img src="${p.src}" alt="">`
            : `<video src="${p.src}" playsinline muted preload="metadata"></video>`}
        </div>
      `).join('') + '</div>';
    }
  }
}

// Helper: Clic sur créateur dans Galerie → Ouvre profil public
function showPublicProfileFromGallery(creatorName) {
  const user = PARTICIPANTS.find(u => u.name === creatorName);
  if (user) {
    previousTab = 'gallery';
    switchTab('profile');
    showAllProfiles();
    showPublicProfile(user.id);
  }
}

// Helper: Clic sur auteur dans Feed → Ouvre profil public
function showPublicProfileFromFeed(userId) {
  previousTab = 'feed';
  switchTab('profile');
  showAllProfiles();
  showPublicProfile(userId);
}

// ============== ENHANCED FEED ==============
// ✅ Composeur manuel : contrairement aux autres entrées du fil (générées automatiquement
// par les actions de l'app), celle-ci permet de poster librement, comme un vrai mur d'activité.
function postToFeed() {
  const input = document.getElementById('feed-post-input');
  const emojiInput = document.getElementById('feed-emoji');
  const message = input.value.trim();
  if (!message) { showNotification('⚠️ Écris quelque chose avant de publier', 'error'); return; }

  const entry = addFeedEntry(message, emojiInput.value.trim() || '✨', null, null);
  entry.manual = true; // ✅ Sert à savoir si "Voir →" doit s'afficher, et pour l'auto-suppression future
  input.value = '';
  showNotification('✅ Publié sur le fil !', 'success');
}

function addFeedEntry(message, emoji = '📌', refType = null, refId = null) {
  const entry = {
    id: Date.now(),
    message,
    user: currentUser.name,
    userId: currentUser.id,
    emoji,
    refType,
    refId: refId !== null ? String(refId) : null,
    timestamp: new Date(),
    likes: [],
    comments: []
  };
  feed.unshift(entry);
  if (feed.length > 100) feed.pop();
  saveAllData();
  renderFeed();
  return entry;
}

// ✅ Filtre du fil : les publications volontaires (composeur en haut du fil) se noient
// vite au milieu des événements automatiques ("a aimé...", "a coché..."). Trois puces
// permettent de basculer d'un tap. Note : les publications manuelles antérieures au
// 21/07 (avant que le flag "manual" soit persisté) apparaissent dans "activité".
let feedFilterMode = 'all';

function setFeedFilter(mode) {
  feedFilterMode = mode;
  renderFeed();
}

function renderFeed() {
  const content = document.getElementById('feed-content');
  if (!content) return; // ✅ Évite de planter si l'élément n'existe pas encore

  try {
    const chip = (mode, label) => `<button onclick="setFeedFilter('${mode}')" style="border: none; cursor: pointer; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; background: ${feedFilterMode === mode ? 'linear-gradient(135deg, var(--accent-pink) 0%, #d946a6 100%)' : 'var(--bg-sunken)'}; color: ${feedFilterMode === mode ? 'white' : 'var(--primary)'};">${label}</button>`;
    const filterBar = `<div style="display: flex; gap: 8px; margin-bottom: 14px;">${chip('all', 'Tout')}${chip('posts', '💬 Publications')}${chip('auto', '🤖 Activité')}</div>`;

    const visibleFeed = feed.filter(entry => {
      if (feedFilterMode === 'posts') return !!entry.manual;
      if (feedFilterMode === 'auto') return !entry.manual;
      return true;
    });

    if (visibleFeed.length === 0) {
      content.innerHTML = filterBar + `<div style="padding: 40px 20px; text-align: center;"><p style="color: var(--primary-light); font-size: 14px;">${feedFilterMode === 'posts' ? '💬 Aucune publication — écris la première dans le champ ci-dessus !' : '📭 Aucune activité pour le moment'}</p></div>`;
      return;
    }
    content.innerHTML = filterBar + visibleFeed.map(entry => {
    const date = new Date(entry.timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${mins}`;
    const participant = PARTICIPANTS.find(p => p.id === entry.userId) || { name: entry.user };
    const personalData = personalsData[participant.id] || {};
    const avatarContent = (personalData.avatar && personalData.avatar.startsWith('data:image'))
      ? `<img src="${personalData.avatar}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`
      : (personalData.avatar || '👤');
    const avatarImg = `<div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #1D5FA8 0%, #1690A3 100%); display: flex; align-items: center; justify-content: center; font-size: 20px; color: white; cursor: pointer; box-shadow: 0 4px 12px rgba(29, 95, 168, 0.2); flex-shrink: 0; overflow: hidden;" onclick="showPublicProfileFromFeed(${participant.id})">${avatarContent}</div>`;
    const userLiked = entry.likes.includes(currentUser.id);
    return `
      <div class="card" style="margin-bottom: 14px; padding: 14px; transition: all 0.3s ease;" onmouseenter="this.style.boxShadow='0 6px 16px rgba(12, 47, 58, 0.15)'; this.style.transform='translateY(-2px)';" onmouseleave="this.style.boxShadow='0 2px 8px rgba(12, 47, 58, 0.08)'; this.style.transform='translateY(0)';">
        <div style="display: flex; gap: 12px;">
          <div>${avatarImg}</div>
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <div style="font-weight: 700; color: var(--primary); cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 6px;" onclick="showPublicProfileFromFeed(${participant.id})">${entry.emoji} <span>${participant.name}</span></div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="font-size: 11px; background: var(--bg-sunken); padding: 4px 8px; border-radius: 4px; color: var(--primary-light); font-weight: 500;">${timeStr}</div>
                ${entry.userId === currentUser.id ? `<button onclick="deleteFeedEntry(${entry.id})" title="Supprimer" style="background: none; border: none; cursor: pointer; font-size: 12px; color: var(--primary-light); padding: 2px;">🗑️</button>` : ''}
              </div>
            </div>
            <div style="font-size: 13px; color: var(--primary); margin-bottom: 10px; line-height: 1.4;">${highlightMentions(entry.message)}</div>
            ${entry.refType ? `<div onclick="openFeedEntry('${entry.refType}', '${escapeHtml(String(entry.refId))}')" style="cursor: pointer; font-size: 11.5px; font-weight: 700; color: var(--accent-sand); margin: -4px 0 10px;">Voir →</div>` : ''}
            <div style="display: flex; gap: 12px;">
              <button onclick="likeFeedEntry(${entry.id})" style="background: none; border: none; cursor: pointer; font-size: 13px; color: ${userLiked ? 'var(--accent-pink)' : 'var(--primary-light)'}; font-weight: ${userLiked ? '700' : '500'}; transition: all 0.3s ease; padding: 4px 0;" onmouseover="this.style.transform='scale(1.1)';" onmouseout="this.style.transform='scale(1)';">❤️</button><span onclick="showLikersPanel(${JSON.stringify(entry.likes)})" style="font-size: 13px; color: ${userLiked ? 'var(--accent-pink)' : 'var(--primary-light)'}; font-weight: ${userLiked ? '700' : '500'}; cursor: pointer; padding: 4px 2px;">${entry.likes.length}</span>
              <button onclick="toggleFeedComments(${entry.id})" style="background: none; border: none; cursor: pointer; font-size: 13px; color: var(--primary-light); font-weight: 500; transition: all 0.3s ease; padding: 4px 0;" onmouseover="this.style.transform='scale(1.1)'; this.style.color='var(--primary)';" onmouseout="this.style.transform='scale(1)'; this.style.color='var(--primary-light)';">💬 ${entry.comments.length}</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  } catch (err) {
    console.error('Erreur renderFeed:', err);
  }
}

async function likeFeedEntry(entryId) {
  const entry = feed.find(e => e.id === entryId);
  if (entry) {
    // ✅ Version cloud la plus fraîche avant bascule (les likes du fil vivent dans le
    // blob JSON "data" de feed_entries — voir refreshLikesFromCloud, app-core.js)
    const cloudLikes = await refreshLikesFromCloud('feed_entries', entryId, (row) => {
      try { return (row.data ? JSON.parse(row.data) : {}).likes || []; } catch (e) { return null; }
    });
    if (cloudLikes !== null) entry.likes = cloudLikes;
    const idx = entry.likes.indexOf(currentUser.id);
    if (idx > -1) {
      entry.likes.splice(idx, 1);
    } else {
      entry.likes.push(currentUser.id);
      addNotification(`❤️ ${currentUser.name} a aimé`, '❤️', 'feed');
    }
    saveAllData();
    renderFeed();
  }
}

// ✅ Remplace l'ancien prompt() natif (moche, et les commentaires n'étaient jamais
// affichés nulle part, juste comptés) par un vrai panneau, cohérent avec celui de la
// Galerie : on peut enfin RELIRE les commentaires, pas juste voir leur nombre.
// ✅ Permet de rafraîchir en live un modal de commentaires resté ouvert pendant qu'un
// autre participant commente/publie au même moment (voir refreshOpenFeedCommentsModal,
// appelée après chaque rechargement cloud du fil) — sans ça, il fallait fermer/rouvrir
// le panneau pour voir les commentaires des autres arriver.
let openFeedCommentsEntryId = null;

function renderFeedCommentsList(entry) {
  if (!entry.comments || entry.comments.length === 0) {
    return `<div style="font-size: 12px; color: var(--primary-light); text-align: center; padding: 20px 0;">Aucun commentaire pour le moment</div>`;
  }
  return entry.comments.map(c => `
    <div style="font-size: 12px; margin-bottom: 10px; padding-bottom: 10px; box-shadow: 0 1px 0 var(--border);">
      <strong>${escapeHtml(c.user)}:</strong> ${highlightMentions(c.text)}
      <div style="font-size: 10px; color: var(--primary-light);">${new Date(c.timestamp).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</div>
    </div>
  `).join('');
}

// ✅ Appelée après chaque rechargement cloud du fil (voir la boucle de polling 25s dans
// app-core.js) : si un modal de commentaires est ouvert, on ne touche QUE la liste des
// commentaires (jamais le champ de saisie, pour ne pas effacer ce que la personne est en
// train de taper) — sans ça, il fallait fermer/rouvrir le panneau pour voir arriver les
// commentaires des autres pendant qu'on avait le sien ouvert.
function refreshOpenFeedCommentsModal() {
  if (openFeedCommentsEntryId === null) return;
  const listEl = document.getElementById(`feed-comments-list-${openFeedCommentsEntryId}`);
  if (!listEl) { openFeedCommentsEntryId = null; return; } // modal fermé entre-temps
  const entry = feed.find(e => e.id === openFeedCommentsEntryId);
  if (!entry) return;
  listEl.innerHTML = renderFeedCommentsList(entry);
}

function toggleFeedComments(entryId) {
  const entry = feed.find(e => e.id === entryId);
  if (!entry) return;
  if (!entry.comments) entry.comments = [];

  let commentsDiv = document.getElementById(`feed-comments-${entryId}`);
  if (commentsDiv) {
    closeFeedCommentsModal(entryId);
    return;
  }
  openFeedCommentsEntryId = entryId;

  const backdrop = document.createElement('div');
  backdrop.id = `feed-comments-backdrop-${entryId}`;
  backdrop.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9998;';
  backdrop.onclick = () => closeFeedCommentsModal(entryId);

  const container = document.createElement('div');
  container.id = `feed-comments-${entryId}`;
  container.style.cssText = 'position: fixed; bottom: 0; left: 0; right: 0; background: var(--bg-raised); padding: 12px 20px 20px; border-radius: 16px 16px 0 0; max-height: 70vh; display: flex; flex-direction: column; box-shadow: 0 -8px 24px rgba(0,0,0,0.3); z-index: 9999;';

  let html = `
    <div style="width: 36px; height: 4px; background: var(--border); border-radius: 4px; margin: 0 auto 14px;"></div>
    <div style="font-size: 14px; font-weight: 700; margin-bottom: 12px; color: var(--primary); display: flex; justify-content: space-between; align-items: center;">
      💬 Commentaires
      <button onclick="closeFeedCommentsModal(${entryId})" style="background: none; border: none; font-size: 18px; color: var(--primary-light); cursor: pointer;">✕</button>
    </div>
    <div id="feed-comments-list-${entryId}" style="overflow-y: auto; flex: 1; margin-bottom: 12px;">
      ${renderFeedCommentsList(entry)}
    </div>
  `;
  html += `
    <div style="display: flex; gap: 8px; padding-top: 8px; box-shadow: 0 -1px 0 var(--border);">
      <input type="text" placeholder="Commenter... @pseudo pour mentionner" id="feed-comment-${entryId}" style="flex: 1; margin-bottom: 0; font-size: 13px;">
      <button class="btn btn-small btn-primary" onclick="addFeedComment(${entryId})">📤</button>
    </div>
  `;

  container.innerHTML = html;
  document.body.appendChild(backdrop);
  document.body.appendChild(container);
  document.getElementById(`feed-comment-${entryId}`).focus();
}

function closeFeedCommentsModal(entryId) {
  try {
    const el = document.getElementById(`feed-comments-${entryId}`);
    if (el) el.remove();
    const backdrop = document.getElementById(`feed-comments-backdrop-${entryId}`);
    if (backdrop) backdrop.remove();
    if (openFeedCommentsEntryId === entryId) openFeedCommentsEntryId = null;
  } catch (err) {
    console.error('Erreur fermeture modal commentaires du fil:', err);
  }
}

function addFeedComment(entryId) {
  const entry = feed.find(e => e.id === entryId);
  if (!entry) return;
  const input = document.getElementById(`feed-comment-${entryId}`);
  if (!input || !input.value.trim()) return;

  if (!entry.comments) entry.comments = [];
  const mentions = parseMentions(input.value); // ✅ Détecte les @pseudo, comme dans la Galerie
  entry.comments.push({
    id: Date.now(),
    user: currentUser.name,
    userId: currentUser.id,
    text: input.value,
    timestamp: new Date(),
    mentions
  });
  saveAllData();
  addNotification(`💬 ${currentUser.name} a commenté ton activité`, '💬', 'feed');
  closeFeedCommentsModal(entryId);
  renderFeed();
  toggleFeedComments(entryId); // ✅ Rouvre directement pour voir le commentaire fraîchement posté
}

// ✅ Uniquement ses propres publications (voir le bouton 🗑️, affiché seulement si
// entry.userId === currentUser.id dans renderFeed) — jamais celles des autres.
function deleteFeedEntry(entryId) {
  showConfirmation('Supprimer cette publication du fil ?', () => {
    const idx = feed.findIndex(e => e.id === entryId && e.userId === currentUser.id);
    if (idx === -1) return;
    feed.splice(idx, 1);
    if (window.supabaseReady && window.deleteFromSupabase) {
      window.deleteFromSupabase('feed_entries', entryId).catch(err => console.error('Suppression Supabase échouée:', err));
    }
    // 🪦 Pierre tombale (anti-résurrection) — voir app-core.js
    if (window.supabase) {
      window.supabase.from('deleted_items').upsert({ table_name: 'feed_entries', item_id: entryId })
        .then(() => { if (deletedItemIds.feed_entries) deletedItemIds.feed_entries.add(Number(entryId)); })
        .catch(err => console.error('Pose de pierre tombale échouée:', err));
    }
    saveAllData();
    renderFeed();
    showNotification('🗑️ Publication supprimée', 'success');
  });
}


// ============== 💬 CHAT DE GROUPE (panneau indépendant, sous le bouton 🎵) ==============
// Architecture volontairement différente du reste de l'app : le chat est 100% cloud
// (insertion directe + lecture + TEMPS RÉEL via Supabase Realtime), jamais inclus dans
// saveAllData/localStorage — donc aucun risque d'écrasement "dernière écriture gagne"
// ni de résurrection. Repli : si le temps réel ne se connecte pas (réseau filtré...),
// un rafraîchissement léger toutes les 15s prend le relais quand le panneau est ouvert.
let chatMessages = [];
let chatRealtimeOk = false;
let chatInitDone = false;

function toggleChatPanel() {
  const panel = document.getElementById('chatPanel');
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) {
    loadChatMessages().then(() => {
      renderChat();
      markChatRead();
    });
  }
}

async function loadChatMessages() {
  if (!window.supabaseReady || !window.supabase) return;
  try {
    const { data, error } = await window.supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(300);
    if (!error && data) {
      chatMessages = data;
      chatMessages.forEach(checkChatMentionForMessage); // ✅ Rattrape les mentions manquées hors-ligne
    }
  } catch (e) { /* hors-ligne : on garde ce qu'on a */ }
}

function renderChat() {
  const box = document.getElementById('chat-messages');
  if (!box) return;

  if (chatMessages.length === 0) {
    box.innerHTML = '<div style="text-align: center; color: var(--primary-light); font-size: 12.5px; padding: 30px 10px;">💬 Aucun message — lance la conversation !</div>';
    return;
  }

  let lastDay = null;
  let lastPersonId = null;
  box.innerHTML = chatMessages.map(msg => {
    const p = PARTICIPANTS.find(pp => pp.id === msg.person_id) || { name: '?' };
    const mine = currentUser && msg.person_id === currentUser.id;
    const d = new Date(msg.created_at);
    const dayKey = d.toDateString();
    const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    // Séparateur de jour
    let sep = '';
    if (dayKey !== lastDay) {
      sep = `<div style="text-align: center; font-size: 10.5px; color: var(--primary-light); margin: 12px 0 6px;">${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>`;
      lastDay = dayKey;
      lastPersonId = null; // nouveau jour → réafficher le nom
    }

    // Nom affiché seulement au premier message d'une série (pas le sien)
    const showName = !mine && msg.person_id !== lastPersonId;
    lastPersonId = msg.person_id;

    // Réactions existantes { "❤️": [ids], ... }
    const reactions = msg.reactions || {};
    const reactionChips = Object.entries(reactions)
      .filter(([, ids]) => Array.isArray(ids) && ids.length > 0)
      .map(([emo, ids]) => {
        const mineR = currentUser && ids.includes(currentUser.id);
        return `<span onclick="event.stopPropagation(); toggleChatReaction(${msg.id}, '${emo}')" style="display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 10px; font-size: 11px; cursor: pointer; background: ${mineR ? 'rgba(255,255,255,0.95)' : 'var(--bg-raised)'}; box-shadow: 0 1px 3px rgba(0,0,0,0.15); color: var(--primary);">${emo} ${ids.length}</span>`;
      }).join('');

    return `${sep}
      <div style="display: flex; align-items: flex-end; gap: 4px; ${mine ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}">
        ${mine ? `<button onclick="deleteChatMessage(${msg.id})" title="Supprimer" style="background: none; border: none; color: var(--primary-light); font-size: 12px; cursor: pointer; padding: 4px; flex-shrink: 0;">🗑️</button>` : ''}
        <div onclick="showChatReactionPicker(${msg.id}, this)" style="max-width: 80%; padding: 7px 11px; border-radius: ${mine ? '12px 12px 3px 12px' : '12px 12px 12px 3px'}; font-size: 13px; line-height: 1.4; cursor: pointer; ${mine
          ? 'background: linear-gradient(135deg, var(--accent-pink) 0%, #d946a6 100%); color: white;'
          : 'background: var(--bg-sunken); color: var(--primary);'}">
          ${showName ? `<div style="font-size: 10.5px; font-weight: 700; margin-bottom: 2px; ${mine ? 'color: rgba(255,255,255,0.85);' : 'color: var(--accent-pink);'}">${escapeHtml(p.name)}</div>` : ''}
          ${mine ? escapeHtml(msg.text) : highlightMentions(msg.text)}
          <div style="font-size: 9.5px; margin-top: 2px; text-align: right; ${mine ? 'color: rgba(255,255,255,0.7);' : 'color: var(--primary-light);'}">${time}</div>
          ${reactionChips ? `<div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px;">${reactionChips}</div>` : ''}
        </div>
      </div>`;
  }).join('');

  box.scrollTop = box.scrollHeight;
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text || !currentUser) return;
  if (!window.supabaseReady || !window.supabase) {
    showNotification('⚠️ Hors ligne — le chat nécessite une connexion', 'error');
    return;
  }
  input.value = '';
  try {
    const { data, error } = await window.supabase
      .from('chat_messages')
      .insert({ person_id: currentUser.id, text })
      .select()
      .single();
    if (error) throw error;
    // Affichage immédiat (le temps réel dédoublonnera par id)
    if (data && !chatMessages.some(m => m.id === data.id)) {
      chatMessages.push(data);
      renderChat();
      markChatRead();
    }
  } catch (err) {
    console.error('Envoi chat échoué:', err);
    input.value = text; // ne pas perdre le message tapé
    showNotification('❌ Message non envoyé, réessaie', 'error');
  }
}

// ✅ Réactions : tap sur une bulle → mini-sélecteur ❤️ 😂 👍 juste au-dessus.
// La bascule relit d'abord la version cloud du message (comme les likes de la
// galerie) pour ne jamais écraser la réaction posée par quelqu'un d'autre.
function showChatReactionPicker(msgId, bubbleEl) {
  document.getElementById('chat-reaction-picker')?.remove();
  const picker = document.createElement('div');
  picker.id = 'chat-reaction-picker';
  const rect = bubbleEl.getBoundingClientRect();
  picker.style.cssText = `position: fixed; top: ${Math.max(8, rect.top - 44)}px; left: ${Math.min(Math.max(8, rect.left), window.innerWidth - 150)}px; z-index: 100000; background: var(--bg-raised); border-radius: 20px; padding: 6px 10px; display: flex; gap: 8px; box-shadow: 0 6px 20px rgba(0,0,0,0.25);`;
  picker.innerHTML = ['❤️', '😂', '👍'].map(emo =>
    `<button onclick="toggleChatReaction(${msgId}, '${emo}'); document.getElementById('chat-reaction-picker').remove();" style="background: none; border: none; font-size: 20px; cursor: pointer; padding: 2px;">${emo}</button>`
  ).join('');
  document.body.appendChild(picker);
  setTimeout(() => {
    const closeOnTap = (e) => { if (!picker.contains(e.target)) { picker.remove(); document.removeEventListener('click', closeOnTap); } };
    document.addEventListener('click', closeOnTap);
  }, 50);
}

async function toggleChatReaction(msgId, emoji) {
  if (!currentUser || !window.supabaseReady) return;
  try {
    const { data, error } = await window.supabase.from('chat_messages').select('reactions').eq('id', msgId).maybeSingle();
    if (error || !data) return;
    const reactions = data.reactions || {};
    const ids = Array.isArray(reactions[emoji]) ? reactions[emoji] : [];
    const idx = ids.indexOf(currentUser.id);
    if (idx > -1) ids.splice(idx, 1); else ids.push(currentUser.id);
    reactions[emoji] = ids;

    const { error: upErr } = await window.supabase.from('chat_messages').update({ reactions }).eq('id', msgId);
    if (upErr) throw upErr;

    // Mise à jour locale immédiate (le temps réel confirmera pour les autres)
    const local = chatMessages.find(m => m.id === msgId);
    if (local) { local.reactions = reactions; renderChat(); }
  } catch (e) {
    console.error('Réaction échouée:', e);
  }
}

// ✅ (audit 21/07, point 4) Suppression — le fil et la galerie l'avaient déjà, pas le
// chat. Uniquement ses propres messages (double vérification : côté affichage ET côté
// requête Supabase avec .eq('person_id', currentUser.id)).
function deleteChatMessage(msgId) {
  showConfirmation('Supprimer ce message ?', async () => {
    try {
      const { error } = await window.supabase.from('chat_messages').delete().eq('id', msgId).eq('person_id', currentUser.id);
      if (error) throw error;
      chatMessages = chatMessages.filter(m => m.id !== msgId);
      renderChat();
    } catch (e) {
      console.error('Suppression message chat échouée:', e);
      showNotification('❌ Suppression impossible', 'error');
    }
  });
}

// ✅ (audit 21/07, point 4) Les @mentions dans le chat ne notifiaient personne,
// contrairement à la galerie et au fil — incohérent. Dédup via localStorage (comme
// checkGalleryMentions/checkPrivateMessages) pour ne jamais notifier deux fois le
// même message. alreadySeenByCaller=false : reçu passivement, pas encore "vu".
function checkChatMentionForMessage(msg) {
  if (!currentUser || msg.person_id === currentUser.id || !msg.text) return;
  const mentioned = parseMentions(msg.text);
  if (!mentioned.includes(currentUser.id)) return;

  const notifiedKey = 'notifiedChatMentionIds';
  let notifiedIds = [];
  try { notifiedIds = JSON.parse(localStorage.getItem(notifiedKey) || '[]'); } catch (e) { notifiedIds = []; }
  if (notifiedIds.includes(msg.id)) return;

  const p = PARTICIPANTS.find(pp => pp.id === msg.person_id);
  addNotification(`💬 ${p ? p.name : 'Quelqu\'un'} t'a mentionné(e) dans le chat : "${msg.text.substring(0, 40)}"`, '🔔', 'chat', false, null, false);
  notifiedIds.push(msg.id);
  localStorage.setItem(notifiedKey, JSON.stringify(notifiedIds));
}

function markChatRead() {
  if (chatMessages.length > 0) {
    localStorage.setItem('chatLastReadAt', chatMessages[chatMessages.length - 1].created_at);
  }
  const dot = document.getElementById('chat-unread-dot');
  if (dot) dot.style.display = 'none';
}

function updateChatUnreadDot() {
  const dot = document.getElementById('chat-unread-dot');
  const panel = document.getElementById('chatPanel');
  if (!dot || chatMessages.length === 0) return;
  if (panel && panel.classList.contains('open')) { markChatRead(); return; }
  const lastRead = localStorage.getItem('chatLastReadAt') || '';
  const lastMsg = chatMessages[chatMessages.length - 1];
  // Ne pas signaler ses propres messages comme non lus
  if (lastMsg.created_at > lastRead && (!currentUser || lastMsg.person_id !== currentUser.id)) {
    dot.style.display = 'block';
  }
}

// ✅ Initialisation différée : attend que Supabase soit prêt, puis 1) charge
// l'historique (pour le point "non lu"), 2) s'abonne au temps réel — chaque
// nouveau message arrive instantanément, panneau ouvert ou non.
(function initChatWhenReady() {
  const timer = setInterval(async () => {
    if (chatInitDone) { clearInterval(timer); return; }
    if (!window.supabaseReady || !window.supabase || !window.currentUser && !currentUser) return;
    chatInitDone = true;
    clearInterval(timer);

    await loadChatMessages();
    updateChatUnreadDot();

    try {
      window.supabase
        .channel('chat-room')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
          if (!chatMessages.some(m => m.id === payload.new.id)) {
            chatMessages.push(payload.new);
            checkChatMentionForMessage(payload.new); // ✅ Notifie si @mention en temps réel
            const panel = document.getElementById('chatPanel');
            if (panel && panel.classList.contains('open')) {
              renderChat();
              markChatRead();
            } else {
              updateChatUnreadDot();
            }
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages' }, (payload) => {
          // ✅ Réactions posées par les autres, en temps réel
          const local = chatMessages.find(m => m.id === payload.new.id);
          if (local) {
            local.reactions = payload.new.reactions || {};
            const panel = document.getElementById('chatPanel');
            if (panel && panel.classList.contains('open')) renderChat();
          }
        })
        .subscribe((status) => { chatRealtimeOk = (status === 'SUBSCRIBED'); });
    } catch (e) {
      console.warn('Temps réel indisponible, repli sur rafraîchissement périodique', e);
    }

    // Repli : si le temps réel n'a pas pris, rafraîchir toutes les 15s (panneau ouvert
    // seulement) et vérifier le point "non lu" toutes les 60s.
    setInterval(async () => {
      const panel = document.getElementById('chatPanel');
      if (!chatRealtimeOk && panel && panel.classList.contains('open')) {
        await loadChatMessages();
        renderChat();
        markChatRead();
      }
    }, 15000);
    setInterval(async () => {
      if (!chatRealtimeOk) {
        await loadChatMessages();
        updateChatUnreadDot();
      }
    }, 60000);
  }, 500);
})();

// ============== 🧳 MON VOYAGE (arrivée / départ / billets) ==============
// Chaque personne renseigne sur SON profil : jour, heure et lieu d'arrivée et de
// départ (Gare de Toulon / Aéroport de Marseille / Aéroport de Hyères / Autre),
// une note libre (info à partager), et peut téléverser ses billets
// (PDF ou photo). 100% cloud-natif : lecture/écriture directes dans Supabase,
// jamais dans saveAllData → aucun risque d'écrasement entre appareils.
const TRAVEL_PLACES = ['Gare de Toulon', 'Aéroport de Marseille', 'Aéroport de Hyères', 'Autre'];

async function loadTravelSection() {
  const box = document.getElementById('travel-section');
  if (!box || !currentUser) return;
  if (!window.supabaseReady) { box.innerHTML = ''; return; }

  let info = {};
  let tickets = [];
  try {
    const { data } = await window.supabase.from('travel_info').select('*').eq('person_id', currentUser.id).maybeSingle();
    if (data) info = data;
    const { data: tk } = await window.supabase.from('travel_tickets').select('*').eq('person_id', currentUser.id).order('created_at');
    if (tk) tickets = tk;
  } catch (e) { /* hors-ligne : section vide */ }

  // ✅ Design "Méditerranée" validé le 21/07 : bandeau mer avec vague, cartes blanches
  // arrondies, lieux en "galets" tapables, note libre sur sable doré, bouton en
  // dégradé mer (eau profonde → turquoise lagon, couleurs officielles de l'app —
  // pas d'orange/corail sur ce bouton, à la demande de Marine), frise de coquillages.
  const inputStyle = 'width: 100%; padding: 9px 10px; border: 1px solid rgba(31, 182, 201, 0.25); border-radius: 10px; background: #f2fbfa; color: var(--primary); font-size: 12.5px;';
  const labelStyle = 'font-weight: 700; display: block; margin-bottom: 3px; color: var(--sea-deep); font-size: 10px; letter-spacing: 0.5px;';

  const placeChips = (prefix, selected) => {
    const isCustom = selected && !TRAVEL_PLACES.slice(0, 3).includes(selected);
    return `
      <div id="travel-${prefix}-chips" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;">
        ${TRAVEL_PLACES.slice(0, 3).map(p => {
          const sel = selected === p;
          const emo = p.includes('Gare') ? '🚉' : '✈️';
          return `<button type="button" onclick="selectTravelPlace('${prefix}', '${p.replace(/'/g, "\\'")}')" data-place="${escapeHtml(p)}" style="border: none; cursor: pointer; font-size: 11px; padding: 6px 11px; border-radius: 14px; font-weight: ${sel ? '700' : '500'}; background: ${sel ? 'var(--sea-deep)' : '#eef6f5'}; color: ${sel ? '#ffffff' : 'var(--primary-light)'};">${emo} ${escapeHtml(p.replace('Aéroport de ', ''))}</button>`;
        }).join('')}
        <button type="button" onclick="selectTravelPlace('${prefix}', 'Autre')" data-place="Autre" style="border: none; cursor: pointer; font-size: 11px; padding: 6px 11px; border-radius: 14px; font-weight: ${isCustom ? '700' : '500'}; background: ${isCustom ? 'var(--sea-deep)' : '#eef6f5'}; color: ${isCustom ? '#ffffff' : 'var(--primary-light)'};">📍 Autre</button>
      </div>
      <input type="hidden" id="travel-${prefix}-place" value="${escapeHtml(selected || '')}">
      <input type="text" id="travel-${prefix}-place-custom" value="${isCustom ? escapeHtml(selected) : ''}" placeholder="Précise le lieu..." style="${inputStyle} margin-bottom: 8px; display: ${isCustom ? 'block' : 'none'};" oninput="document.getElementById('travel-${prefix}-place').value = this.value;">
    `;
  };

  const legBlock = (prefix, title, emoji, emojiBg) => `
    <div style="background: var(--bg-raised); border-radius: 16px; padding: 13px 14px; margin-bottom: 12px; box-shadow: 0 3px 10px rgba(14, 95, 116, 0.08);">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 3px;">
        <span style="width: 30px; height: 30px; border-radius: 50%; background: ${emojiBg}; display: inline-flex; align-items: center; justify-content: center; font-size: 15px;">${emoji}</span>
        <span style="font-weight: 700; font-size: 13.5px; color: var(--sea-deep);">${title}</span>
      </div>
      <div style="font-size: 10px; color: var(--primary-light); margin-bottom: 10px;">${prefix === 'arrival'
        ? 'Ta destination finale — là où on vient te chercher 🌊 (avion + train ? mets la dernière étape ici, le reste dans la note)'
        : 'Ton point de départ — là où on doit te déposer'}</div>
      <div style="display: grid; grid-template-columns: 1fr 90px; gap: 8px; margin-bottom: 8px;">
        <div><label style="${labelStyle}">JOUR</label><input type="date" id="travel-${prefix}-date" value="${info[prefix + '_date'] || ''}" style="${inputStyle}"></div>
        <div><label style="${labelStyle}">HEURE</label><input type="time" id="travel-${prefix}-time" value="${info[prefix + '_time'] || ''}" style="${inputStyle}"></div>
      </div>
      ${placeChips(prefix, info[prefix + '_place'])}
      <div style="background: #fdf3e3; border-radius: 10px; padding: 8px 10px;">
        <label style="${labelStyle} color: var(--accent-sand);">${prefix === 'arrival' ? '📍 UN DÉTAIL À PARTAGER ?' : '📍 UN DÉTAIL À PARTAGER ?'}</label>
        <input type="text" id="travel-${prefix}-note" value="${escapeHtml(info[prefix + '_note'] || '')}" placeholder="${prefix === 'arrival' ? 'Ex : avion à Marseille 18h40 puis train, arrivée gare 22h05' : 'Ex : départ prévu vers 13h30'}" style="width: 100%; border: none; background: transparent; color: #8a6a3b; font-size: 11.5px; padding: 2px 0;">
      </div>
    </div>
  `;

  box.innerHTML = `
    <div style="border-radius: 22px; overflow: hidden; background: var(--bg); box-shadow: 0 10px 30px rgba(12, 47, 58, 0.14); text-align: left;">
      <div style="background: linear-gradient(150deg, #0e5f74 0%, var(--sea-deep) 45%, var(--accent-cyan) 100%); padding: 16px 16px 0;">
        <div style="font-family: var(--font-display); font-size: 17px; font-weight: 500; color: #ffffff; letter-spacing: 0.3px;">🧳 Mon voyage</div>
        <div style="font-size: 11.5px; color: #d7f4ef; margin-top: 2px;">Dis-nous quand et où, pour que tout le monde sache 🐚</div>
        <div style="text-align: right; font-size: 14px; letter-spacing: 6px;">🐚⭐🐚</div>
        <svg viewBox="0 0 340 22" preserveAspectRatio="none" style="display: block; width: calc(100% + 32px); margin: 0 -16px; height: 22px;" aria-hidden="true"><path d="M0 12 Q 28 0 56 12 T 112 12 T 168 12 T 224 12 T 280 12 T 336 12 L 340 12 L 340 22 L 0 22 Z" fill="var(--bg)"/></svg>
      </div>
      <div style="padding: 6px 14px 16px;">
        ${legBlock('arrival', 'Mon arrivée', '🛬', '#e1f5f2')}
        ${legBlock('departure', 'Mon départ', '🛫', '#fdeee6')}

        <div style="background: var(--bg-raised); border-radius: 16px; padding: 13px 14px; margin-bottom: 14px; box-shadow: 0 3px 10px rgba(14, 95, 116, 0.08);">
          <div style="font-weight: 700; font-size: 13px; color: var(--sea-deep); margin-bottom: 8px;">🎫 Mes billets</div>
          ${tickets.map(t => `
            <div style="display: flex; align-items: center; gap: 8px; background: #f2fbfa; border-radius: 10px; padding: 8px 10px; margin-bottom: 6px;">
              <a href="${t.url}" target="_blank" rel="noopener" style="flex: 1; min-width: 0; color: var(--primary); font-weight: 600; font-size: 11.5px; text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">📄 ${escapeHtml(t.file_name)}</a>
              <button onclick="deleteTravelTicket(${t.id})" title="Supprimer" style="background: none; color: var(--accent-pink); border: none; font-size: 13px; cursor: pointer; flex-shrink: 0; padding: 2px 4px;">✕</button>
            </div>
          `).join('') || '<div style="font-size: 11px; color: var(--primary-light); margin-bottom: 8px;">Aucun billet pour le moment 🏖️</div>'}
          <label style="display: inline-block; cursor: pointer; font-size: 11px; padding: 7px 12px; border-radius: 14px; border: 1.5px dashed var(--accent-cyan); color: var(--sea-deep); font-weight: 700;">
            📎 Ajouter un billet (PDF ou photo)
            <input type="file" accept="application/pdf,image/*" style="display: none;" onchange="uploadTravelTicket(this)">
          </label>
          <span id="ticket-upload-status" style="font-size: 11px; color: var(--primary-light); margin-left: 8px;"></span>
        </div>

        <button onclick="saveTravelInfo()" style="width: 100%; border: none; cursor: pointer; background: linear-gradient(135deg, var(--sea-deep) 0%, var(--accent-cyan) 100%); border-radius: 14px; padding: 12px; text-align: center; color: #ffffff; font-weight: 700; font-size: 13.5px; box-shadow: 0 5px 14px rgba(31, 182, 201, 0.35);">🐚 Enregistrer mon voyage</button>
        <div id="travel-status" style="font-size: 11.5px; color: var(--primary-light); margin-top: 6px; text-align: center;"></div>
        <div style="text-align: center; font-size: 13px; letter-spacing: 8px; margin-top: 10px;">🌊🐚⭐🐚🌊</div>
      </div>
    </div>
  `;
}

// ✅ Sélection d'un "galet" de lieu : met à jour le champ caché + les styles des chips,
// et affiche le champ libre si "Autre" est choisi.
function selectTravelPlace(prefix, place) {
  const hidden = document.getElementById(`travel-${prefix}-place`);
  const customInput = document.getElementById(`travel-${prefix}-place-custom`);
  const chips = document.querySelectorAll(`#travel-${prefix}-chips button`);
  const isOther = place === 'Autre';

  hidden.value = isOther ? (customInput.value || '') : place;
  customInput.style.display = isOther ? 'block' : 'none';
  if (isOther) customInput.focus();

  chips.forEach(btn => {
    const sel = btn.dataset.place === place;
    btn.style.background = sel ? 'var(--sea-deep)' : '#eef6f5';
    btn.style.color = sel ? '#ffffff' : 'var(--primary-light)';
    btn.style.fontWeight = sel ? '700' : '500';
  });
}

async function saveTravelInfo() {
  if (!currentUser || !window.supabaseReady) { showNotification('⚠️ Hors ligne — réessaie plus tard', 'error'); return; }
  const val = (id) => (document.getElementById(id)?.value || '').trim() || null;
  const statusEl = document.getElementById('travel-status');
  if (statusEl) statusEl.textContent = '⏳ Enregistrement...';
  try {
    const { error } = await window.supabase.from('travel_info').upsert({
      person_id: currentUser.id,
      arrival_date: val('travel-arrival-date'),
      arrival_time: val('travel-arrival-time'),
      arrival_place: val('travel-arrival-place'),
      arrival_note: val('travel-arrival-note'),
      departure_date: val('travel-departure-date'),
      departure_time: val('travel-departure-time'),
      departure_place: val('travel-departure-place'),
      departure_note: val('travel-departure-note'),
      updated_at: new Date().toISOString()
    });
    if (error) throw error;
    if (statusEl) statusEl.textContent = '✅ Voyage enregistré !';
    showNotification('🧳 Infos de voyage enregistrées !', 'success');
  } catch (e) {
    console.error('Enregistrement voyage échoué:', e);
    if (statusEl) statusEl.textContent = '❌ Échec, réessaie.';
    showNotification('❌ Enregistrement impossible', 'error');
  }
}

async function uploadTravelTicket(inputEl) {
  const file = inputEl.files[0];
  if (!file || !currentUser) return;
  if (!window.supabaseReady) { showNotification('⚠️ Hors ligne — réessaie plus tard', 'error'); return; }
  const statusEl = document.getElementById('ticket-upload-status');
  if (statusEl) statusEl.textContent = '⏳ Envoi...';
  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${currentUser.id}/${Date.now()}-${safeName}`;
    const url = await uploadFileToStorage('travel-tickets', path, file);
    const { error } = await window.supabase.from('travel_tickets').insert({
      person_id: currentUser.id,
      file_name: file.name,
      url
    });
    if (error) throw error;
    showNotification('🎫 Billet ajouté !', 'success');
    loadTravelSection();
  } catch (e) {
    console.error('Upload billet échoué:', e);
    if (statusEl) statusEl.textContent = '❌ Échec';
    showNotification('❌ Envoi du billet impossible', 'error');
  }
}

function deleteTravelTicket(ticketId) {
  showConfirmation('Supprimer ce billet ?', async () => {
    try {
      // Récupérer l'URL pour supprimer aussi le fichier du Storage
      const { data } = await window.supabase.from('travel_tickets').select('url').eq('id', ticketId).eq('person_id', currentUser.id).maybeSingle();
      const { error } = await window.supabase.from('travel_tickets').delete().eq('id', ticketId).eq('person_id', currentUser.id);
      if (error) throw error;
      if (data && data.url) {
        const path = data.url.split('/travel-tickets/')[1];
        if (path) {
          fetch(`${window.SUPABASE_URL}/storage/v1/object/travel-tickets/${path}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${window.SUPABASE_ANON_KEY}`, 'apikey': window.SUPABASE_ANON_KEY }
          }).catch(() => {});
        }
      }
      showNotification('🗑️ Billet supprimé', 'success');
    } catch (e) {
      showNotification('❌ Suppression impossible', 'error');
    }
    loadTravelSection();
  });
}

// ============== 🗺️ RÉCAP ARRIVÉES/DÉPARTS (visible par tout le monde) ==============
// En haut de "Voir les autres" : toutes les arrivées et tous les départs renseignés
// dans les fiches "Mon voyage", triés par date puis heure, avec la note libre de
// chacun — LA page pour organiser les allers-retours gare/aéroports. Les personnes
// qui n'ont encore rien renseigné sont listées en bas (pratique pour les relancer).
async function loadShuttleRecap() {
  const box = document.getElementById('shuttle-recap');
  if (!box) return;
  if (!window.supabaseReady) { box.innerHTML = ''; return; }

  let rows = [];
  try {
    const { data } = await window.supabase.from('travel_info').select('*');
    if (data) rows = data;
  } catch (e) { box.innerHTML = ''; return; }

  const fmtDay = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : '';
  const placeEmoji = (p) => !p ? '' : (p.includes('Gare') ? '🚉' : (p.includes('Aéroport') ? '✈️' : '📍'));

  // 🐛 CORRECTIF (21/07) : avant, chaque personne avait sa propre carte même quand
  // plusieurs voyageaient ensemble (même train, même horaire) — Chunfei/Inès/Audrey
  // s'affichaient sur 3 lignes identiques au lieu d'une seule avec les 3 noms. On
  // regroupe maintenant par (date, heure, lieu, note) : les données étaient déjà
  // identiques pour elles, seul l'affichage ne fusionnait jamais.
  const buildLeg = (prefix) => {
    const groups = {};
    rows
      .filter(r => r[prefix + '_date'] || r[prefix + '_place'])
      .forEach(r => {
        const date = r[prefix + '_date'] || '9999-12-31';
        const time = r[prefix + '_time'] || '99:99';
        const place = r[prefix + '_place'] || '';
        const note = r[prefix + '_note'] || '';
        const key = `${date}|${time}|${place}|${note}`;
        if (!groups[key]) groups[key] = { names: [], date, time, place, note };
        const name = PARTICIPANTS.find(p => p.id === r.person_id)?.name;
        if (name) groups[key].names.push(name);
      });
    return Object.values(groups)
      .filter(g => g.names.length > 0)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  };

  // ✅ Personnes qui viennent/repartent par leurs propres moyens (voiture...) : une note
  // existe mais aucune date/lieu, donc rien à organiser — à ne pas confondre avec
  // "pas encore renseigné". Ex : Delphine en voiture, rien à signaler côté horaires.
  const selfTransport = PARTICIPANTS.filter(p => {
    const r = rows.find(row => row.person_id === p.id);
    if (!r) return false;
    const hasLogistics = r.arrival_date || r.arrival_place || r.departure_date || r.departure_place;
    const hasNote = r.arrival_note || r.departure_note;
    return hasNote && !hasLogistics;
  });

  const legHtml = (entries) => entries.length === 0
    ? '<div style="font-size: 11px; color: var(--primary-light); padding: 4px 0;">Rien de renseigné pour le moment 🏖️</div>'
    : entries.map(e => `
      <div style="display: flex; gap: 8px; align-items: flex-start; background: #f2fbfa; border-radius: 10px; padding: 8px 10px; margin-bottom: 6px;">
        <div style="flex-shrink: 0; text-align: center; min-width: 58px;">
          <div style="font-size: 10px; font-weight: 700; color: var(--sea-deep);">${e.date !== '9999-12-31' ? fmtDay(e.date) : '📅 ?'}</div>
          <div style="font-size: 12.5px; font-weight: 700; color: var(--primary);">${e.time !== '99:99' ? e.time : '—'}</div>
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 12px; color: var(--primary);"><strong>${e.names.map(escapeHtml).join(', ')}</strong>${e.place ? ` · ${placeEmoji(e.place)} ${escapeHtml(e.place.replace('Aéroport de ', ''))}` : ''}</div>
          ${e.note ? `<div style="font-size: 10.5px; color: #8a6a3b; background: #fdf3e3; border-radius: 6px; padding: 3px 7px; margin-top: 3px;">📍 ${escapeHtml(e.note)}</div>` : ''}
        </div>
      </div>
    `).join('');

  const filledIds = new Set(rows.filter(r => r.arrival_date || r.arrival_place || r.departure_date || r.departure_place || r.arrival_note || r.departure_note).map(r => r.person_id));
  const missing = PARTICIPANTS.filter(p => !filledIds.has(p.id));

  box.innerHTML = `
    <div style="border-radius: 18px; overflow: hidden; background: var(--bg-raised); box-shadow: 0 6px 20px rgba(12, 47, 58, 0.12);">
      <div style="background: linear-gradient(150deg, #0e5f74 0%, var(--sea-deep) 45%, var(--accent-cyan) 100%); padding: 12px 14px;">
        <div style="font-family: var(--font-display); font-size: 15px; font-weight: 500; color: #ffffff;">🗺️ Récap des arrivées et départs</div>
        <div style="font-size: 10.5px; color: #d7f4ef;">Qui arrive / part quand et où — pour que tout le monde soit au courant 🐚</div>
      </div>
      <div style="padding: 12px 14px 0;">
        <div style="background: #f2fbfa; border-radius: 12px; padding: 10px 12px; margin-bottom: 12px;">
          <div style="font-weight: 700; font-size: 12px; color: var(--sea-deep); margin-bottom: 2px;">🏡 Adresse de la maison</div>
          <div style="font-size: 12px; color: var(--primary);">972 route du barrage, Le Revest-les-Eaux</div>
          <a href="https://www.reseaumistral.com/" target="_blank" rel="noopener" style="display: inline-block; margin-top: 6px; font-size: 11px; font-weight: 700; color: var(--sea-deep); text-decoration: none;">🚌 Voir les bus (Réseau Mistral) →</a>
        </div>
      </div>
      <div style="padding: 0 14px 16px;">
        <div style="font-weight: 700; font-size: 12.5px; color: var(--sea-deep); margin-bottom: 6px;">🛬 Arrivées</div>
        ${legHtml(buildLeg('arrival'))}
        <div style="font-weight: 700; font-size: 12.5px; color: var(--sea-deep); margin: 10px 0 6px;">🛫 Départs</div>
        ${legHtml(buildLeg('departure'))}
        ${selfTransport.length > 0 ? `
          <div style="margin-top: 8px;">
            <div style="font-size: 11px; font-weight: 700; color: var(--primary-light); margin-bottom: 4px;">🚗 Par leurs propres moyens</div>
            ${selfTransport.map(p => {
              const r = rows.find(row => row.person_id === p.id) || {};
              const note = r.arrival_note || r.departure_note || '';
              return `<div style="font-size: 11px; color: var(--primary); margin-bottom: 4px;"><strong>${escapeHtml(p.name)}</strong>${note ? ` — ${escapeHtml(note)}` : ''}</div>`;
            }).join('')}
          </div>
        ` : ''}
        ${missing.length > 0 ? `
          <div style="font-size: 10.5px; color: var(--primary-light); margin-top: 10px;">✍️ Pas encore renseigné : ${missing.map(p => escapeHtml(p.name)).join(', ')} — remplissez votre fiche 🧳 sur votre profil !</div>
        ` : '<div style="font-size: 10.5px; color: var(--accent-green); margin-top: 10px; font-weight: 700;">✅ Tout le monde a renseigné son voyage !</div>'}
      </div>
    </div>
  `;
}
