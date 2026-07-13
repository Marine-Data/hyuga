// ============== PLANNING ==============
let selectedPlanningDay = null;

function renderPlanning() {
  if (selectedPlanningDay !== null && planningData[selectedPlanningDay]) {
    renderPlanningDayDetail(selectedPlanningDay);
  } else {
    renderPlanningOverview();
  }
}

function renderPlanningOverview() {
  const html = `
    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;">
      ${planningData.map((day, dayIdx) => {
        const mainEmoji = day.activities[0]?.emoji || '📅';
        const totalItems = day.activities.reduce((sum, a) => sum + (Array.isArray(a.apporter) ? a.apporter.length : 0), 0);
        const isDeparture = dayIdx === planningData.length - 1;
        // Petit nom de jour abrégé (ex: "Vendredi (J8)" → "VEN.")
        const shortDay = (day.jour || '').replace(/\s*\(.*\)/, '').slice(0, 3).toUpperCase();
        return `
          <div class="card" onclick="openPlanningDay(${dayIdx})" style="cursor: pointer; padding: 10px 6px; text-align: center; aspect-ratio: 0.85; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 0;">
            <div class="eyebrow" style="margin-bottom: 2px; font-size: 9px;">${shortDay}</div>
            <div class="title-serif" style="font-size: 20px; line-height: 1;">${dayIdx + 1}</div>
            <div style="font-size: 20px; margin-top: 6px;">${isDeparture ? '🧳' : mainEmoji}</div>
            ${totalItems > 0 ? `<div style="font-size: 9px; color: var(--accent-sand); margin-top: 3px; font-weight: 700;">🎒${totalItems}</div>` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
  document.getElementById('planning-content').innerHTML = html;
}

function openPlanningDay(dayIdx) {
  selectedPlanningDay = dayIdx;
  renderPlanningDayDetail(dayIdx);
}

function closePlanningDay() {
  selectedPlanningDay = null;
  renderPlanningOverview();
}

// ✅ Correspondance jour → photo d'activité (uploadées dans Réglages)
const DAY_PHOTO_MAP = ['gare', 'avion', 'surprise', 'plongee', 'bateau', 'paddle', 'viaferrata', 'concert', 'piscine'];

function renderPlanningDayDetail(dayIdx) {
  const day = planningData[dayIdx];
  // ✅ Le dernier jour du séjour (jour de départ) est une succession de tâches ménage/rangement
  // à faire dans l'ordre avant de partir : on affiche une checklist unique sur une seule feuille,
  // avec horaires, plutôt que les cartes d'activité éditables classiques.
  if (dayIdx === planningData.length - 1) {
    renderDepartureDayChecklist(dayIdx);
    return;
  }
  const photoKey = DAY_PHOTO_MAP[dayIdx];
  let html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <button class="btn btn-small" onclick="closePlanningDay()" style="background: var(--bg-sunken); border: none; box-shadow: 0 2px 6px rgba(12, 47, 58, 0.1); margin-bottom: 0;">← Tous les jours</button>
      <span onclick="switchTab('inscriptions')" style="cursor: pointer; font-size: 11px; font-weight: 700; color: var(--accent-sand);">✍️ Voir toutes les inscriptions →</span>
    </div>
    ${photoKey ? `
    <div style="position: relative; border-radius: 16px; overflow: hidden; margin-bottom: 18px; height: 130px;">
      <img src="https://iupghubmnibbdipingnj.supabase.co/storage/v1/object/public/app-assets/day-${photoKey}.jpg" alt="" style="width: 100%; height: 100%; object-fit: cover; display: block;">
      <div style="position: absolute; inset: 0; background: linear-gradient(0deg, rgba(12,47,58,0.55), rgba(12,47,58,0.05)); display: flex; flex-direction: column; justify-content: flex-end; padding: 14px;">
        <div class="title-serif" style="font-size: 20px; color: #fff;">${escapeHtml(day.jour)}</div>
        <div style="font-size: 12.5px; color: #ffe9b8;">${escapeHtml(day.date || '')}</div>
      </div>
    </div>
    ` : `
    <div style="text-align: center; margin-bottom: 20px;">
      <div style="font-weight: 800; font-size: 20px;">${escapeHtml(day.jour)}</div>
      <div style="font-size: 13px; color: var(--primary-light);">${escapeHtml(day.date || '')}</div>
    </div>
    `}
  `;
  // ✅ Résumé des inscriptions REMONTÉ tout en haut de la journée (avant la liste des
  // activités) — auparavant la case à cocher était noyée dans chaque carte d'activité,
  // facile à rater si on ne scrolle pas jusqu'au bout.
  const needInscription = day.activities
    .map((activity, actIdx) => ({ activity, actIdx }))
    .filter(({ activity }) => activity.inscription);
  if (needInscription.length > 0) {
    html += `
      <div style="background: linear-gradient(135deg, rgba(111, 184, 176, 0.14) 0%, rgba(111, 184, 176, 0.04) 100%); border-radius: 12px; padding: 14px; margin-bottom: 16px; box-shadow: inset 4px 0 0 var(--accent-cyan);">
        <div style="font-weight: 700; font-size: 12.5px; color: var(--accent-cyan); margin-bottom: 10px;">📋 INSCRIPTIONS DE LA JOURNÉE</div>
        ${needInscription.map(({ activity, actIdx }) => {
          const inscrits = PARTICIPANTS.filter(p => inscriptions[`${p.id}-${dayIdx}-${actIdx}`] === true);
          const meInscrit = inscriptions[`${currentUser.id}-${dayIdx}-${actIdx}`] === true;
          return `
            <div style="display: flex; align-items: center; gap: 10px; padding: 8px 0; ${actIdx < day.activities.length - 1 ? 'box-shadow: 0 1px 0 rgba(111, 184, 176, 0.2);' : ''}">
              <span style="font-size: 18px; flex-shrink: 0;">${activity.emoji || '📌'}</span>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 13px; font-weight: 600; color: var(--primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(activity.nom)}</div>
                <div style="font-size: 10.5px; color: var(--primary-light);">${inscrits.length === 0 ? '⚠️ Personne inscrit(e)' : `${inscrits.length} inscrit${inscrits.length > 1 ? 's' : ''}`}</div>
              </div>
              <button class="btn btn-small" style="flex-shrink: 0; background: ${meInscrit ? 'var(--accent-cyan)' : 'white'}; color: ${meInscrit ? 'white' : 'var(--accent-cyan)'}; border: none; box-shadow: 0 2px 6px rgba(111, 184, 176, 0.15); font-size: 11px; padding: 7px 12px;" onclick="toggleInscription(${dayIdx}, ${actIdx})">${meInscrit ? '✅ Inscrit(e)' : "✍️ S'inscrire"}</button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
  html += day.activities.map((activity, actIdx) => renderActivityDetailCard(dayIdx, activity, actIdx)).join('');
  document.getElementById('planning-content').innerHTML = html;
}

function renderDepartureDayChecklist(dayIdx) {
  const day = planningData[dayIdx];
  const tasks = day.activities;
  const doneCount = tasks.filter((a, actIdx) => departureTasksDone[`${dayIdx}-${actIdx}`]).length;
  const pct = Math.round((doneCount / tasks.length) * 100);
  const xpPerTask = 10;

  let html = `
    <button class="btn btn-small" onclick="closePlanningDay()" style="margin-bottom: 16px; background: var(--bg-sunken); border: none; box-shadow: 0 2px 6px rgba(12, 47, 58, 0.1);">← Tous les jours</button>
    <div class="card" style="background: linear-gradient(135deg, var(--accent-gold) 0%, #ffb700 100%); color: white; padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 18px; box-shadow: 0 8px 20px rgba(227, 185, 79, 0.3);">
      <div style="font-size: 30px; margin-bottom: 4px;">🧳</div>
      <div style="font-weight: 800; font-size: 18px;">${escapeHtml(day.jour)} · Jour du départ</div>
      <div style="font-size: 12.5px; opacity: 0.9; margin-bottom: 12px;">${escapeHtml(day.date || '')} — coche chaque tâche dans l'ordre pour gagner de l'XP</div>
      <div style="height: 7px; border-radius: 4px; background: rgba(255,255,255,0.35); overflow: hidden;">
        <div style="height: 100%; width: ${pct}%; background: white; transition: width 0.4s ease;"></div>
      </div>
      <div style="font-size: 12px; margin-top: 6px; font-weight: 700;">${doneCount} / ${tasks.length} tâches faites</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px;">
  `;

  html += tasks.map((activity, actIdx) => {
    const key = `${dayIdx}-${actIdx}`;
    const done = !!departureTasksDone[key];
    return `
      <div onclick="toggleDepartureTask(${dayIdx}, ${actIdx})" class="card" style="display: flex; align-items: center; gap: 12px; padding: 12px 14px; cursor: pointer; background: ${done ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.03) 100%)' : 'var(--bg-raised)'}; border-radius: 12px; transition: background 0.25s ease;">
        <div style="width: 46px; flex-shrink: 0; text-align: center; font-size: 11px; font-weight: 700; color: var(--primary-light);">${escapeHtml(activity.horaires || '')}</div>
        <div style="font-size: 22px; flex-shrink: 0; opacity: ${done ? '0.5' : '1'};">${activity.emoji || '📌'}</div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 700; font-size: 13.5px; color: var(--primary); text-decoration: ${done ? 'line-through' : 'none'}; opacity: ${done ? '0.55' : '1'};">${escapeHtml(activity.nom)}</div>
          ${activity.notes ? `<div style="font-size: 11px; color: var(--primary-light); margin-top: 2px;">${escapeHtml(activity.notes)}</div>` : ''}
        </div>
        <input type="checkbox" ${done ? 'checked' : ''} style="width: 22px; height: 22px; cursor: pointer; accent-color: var(--accent-gold); flex-shrink: 0;" onclick="event.stopPropagation(); toggleDepartureTask(${dayIdx}, ${actIdx});">
      </div>
    `;
  }).join('');

  html += '</div>';
  document.getElementById('planning-content').innerHTML = html;
}

function toggleDepartureTask(dayIdx, actIdx) {
  const key = `${dayIdx}-${actIdx}`;
  const activity = planningData[dayIdx].activities[actIdx];
  const wasDone = !!departureTasksDone[key];
  departureTasksDone[key] = !wasDone;
  const xpPerTask = 10;

  if (!wasDone) {
    choreLog.push({
      id: Date.now(),
      personId: currentUser.id,
      personName: currentUser.name,
      choreName: `Départ : ${activity.nom}`,
      emoji: activity.emoji || '🧳',
      xp: xpPerTask,
      timestamp: new Date()
    });
    showNotification(`✅ +${xpPerTask} XP`, 'success');
    // ✅ Private joke : réaction spéciale quand Inès coche un truc de sa valise
    if (currentUser.name === 'Inès') {
      showNotification('🐟 Nickel !', 'success');
    }
  }

  saveAllData();
  renderDepartureDayChecklist(dayIdx);
}

function renderActivityDetailCard(dayIdx, activity, actIdx) {
  const apporterList = Array.isArray(activity.apporter) ? activity.apporter : (activity.apporter ? String(activity.apporter).split(',').map(s => s.trim()).filter(Boolean) : []);
  const inscrits = activity.inscription ? PARTICIPANTS.filter(p => inscriptions[`${p.id}-${dayIdx}-${actIdx}`] === true) : [];
  // ✅ La "Surprise" du jour n'est pas une activité comme les autres : c'est le mécanisme
  // à code secret (voir revealSurprise()). On la signale avec un bandeau dédié, tout en
  // gardant la carte éditable en dessous (horaires/lieu/notes restent modifiables).
  const isSurprise = /surprise/i.test(activity.nom || '');
  const surpriseBanner = isSurprise ? `
    <div onclick="switchTab('surprises')" style="cursor: pointer; display: flex; align-items: center; gap: 10px; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-soft) 100%); color: white; border-radius: 10px; padding: 12px 14px; margin-bottom: 12px;">
      <span style="font-size: 20px;">🔐</span>
      <div style="flex: 1;">
        <div style="font-weight: 700; font-size: 13px;">Surprise du jour</div>
        <div style="font-size: 11px; opacity: 0.9;">Touche pour entrer le code secret et la débloquer →</div>
      </div>
    </div>
  ` : '';

  return `
    <div style="display: flex; gap: 10px; margin-bottom: 12px;">
      <div style="width: 30px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center;">
        <div style="width: 30px; height: 30px; border-radius: 50%; background: var(--bg-raised); box-shadow: 0 2px 8px rgba(12,47,58,0.1); display: flex; align-items: center; justify-content: center; font-size: 14px;">${activity.emoji || '📌'}</div>
        <div style="flex: 1; width: 2px; background: var(--border); margin-top: 4px;"></div>
      </div>
      <div class="card" style="flex: 1; min-width: 0; margin-bottom: 0;">
      ${surpriseBanner}
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
        <span style="font-size: 26px;">${activity.emoji || '📌'}</span>
        <input type="text" value="${escapeHtml(activity.nom)}" placeholder="Nom de l'activité" onblur="updateActivityField(${dayIdx},${actIdx},'nom',this.value)" style="flex: 1; font-weight: 800; font-size: 15px; background: var(--bg-sunken); border-radius: 6px; padding: 8px 10px; box-shadow: inset 0 1px 3px rgba(12, 47, 58, 0.05);">
      </div>
      <div style="display: flex; gap: 8px; margin-bottom: 10px;">
        <div style="flex: 1;">
          <label style="display: block; font-size: 10px; font-weight: 700; color: var(--primary-light); margin-bottom: 4px;">⏰ HORAIRES</label>
          <input type="text" value="${escapeHtml(activity.horaires || '')}" placeholder="À définir" onblur="updateActivityField(${dayIdx},${actIdx},'horaires',this.value)" style="width: 100%; background: var(--bg-sunken); border-radius: 6px; padding: 8px; box-shadow: inset 0 1px 3px rgba(12, 47, 58, 0.05); font-size: 13px;">
        </div>
        <div style="flex: 1;">
          <label style="display: block; font-size: 10px; font-weight: 700; color: var(--primary-light); margin-bottom: 4px;">📍 LIEU</label>
          <input type="text" value="${escapeHtml(activity.lieu || '')}" placeholder="Lieu" onblur="updateActivityField(${dayIdx},${actIdx},'lieu',this.value)" style="width: 100%; background: var(--bg-sunken); border-radius: 6px; padding: 8px; box-shadow: inset 0 1px 3px rgba(12, 47, 58, 0.05); font-size: 13px;">
        </div>
      </div>
      <div style="margin-bottom: 10px;">
        <label style="display: block; font-size: 10px; font-weight: 700; color: var(--primary-light); margin-bottom: 4px;">📝 NOTES</label>
        <textarea placeholder="Précisions, consignes..." onblur="updateActivityField(${dayIdx},${actIdx},'notes',this.value)" style="width: 100%; min-height: 50px; background: var(--bg-sunken); border-radius: 6px; padding: 8px; box-shadow: inset 0 1px 3px rgba(12, 47, 58, 0.05); font-size: 13px;">${activity.notes || ''}</textarea>
      </div>
      <div style="padding: 12px; background: linear-gradient(135deg, rgba(111, 184, 176, 0.08) 0%, rgba(111, 184, 176, 0.02) 100%); border-radius: 8px; box-shadow: inset 4px 0 0 var(--accent-cyan), 0 3px 10px rgba(111, 184, 176, 0.1); margin-bottom: 10px;">
        <div style="font-weight: 700; font-size: 12px; color: var(--accent-cyan); margin-bottom: 10px;">🎒 À METTRE DANS LA VALISE</div>
        ${apporterList.map((item, itemIdx) => {
          const key = `${dayIdx}-${actIdx}-${itemIdx}`;
          const packed = checklistValise[key] || false;
          return `
            <div style="display: flex; align-items: center; gap: 8px; padding: 5px 0;">
              <input type="checkbox" ${packed ? 'checked' : ''} onchange="toggleApporterItem('${key}')" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-cyan); flex-shrink: 0;">
              <input type="text" value="${escapeHtml(item)}" onblur="updateApporterItemText(${dayIdx},${actIdx},${itemIdx},this.value)" style="flex: 1; background: white; border-radius: 4px; padding: 6px 8px; font-size: 12px; box-shadow: inset 0 1px 3px rgba(12, 47, 58, 0.05); text-decoration: ${packed ? 'line-through' : 'none'}; opacity: ${packed ? '0.55' : '1'};">
              <button onclick="removeApporterItem(${dayIdx},${actIdx},${itemIdx})" style="background: none; border: none; cursor: pointer; color: var(--accent-pink); font-size: 14px; padding: 4px; flex-shrink: 0;">🗑️</button>
            </div>
          `;
        }).join('')}
        <button class="btn btn-small" onclick="addApporterItem(${dayIdx},${actIdx})" style="margin-top: 8px; background: white; border: none; width: 100%; box-shadow: 0 2px 6px rgba(111, 184, 176, 0.1);">+ Ajouter un objet</button>
      </div>
      ${activity.comments && activity.comments.length > 0 ? `
        <div style="margin-bottom: 10px; display: flex; flex-direction: column; gap: 6px;">
          ${activity.comments.map(c => `<div style="padding: 8px 10px; background: var(--bg-sunken); border-radius: 6px; font-size: 12px; box-shadow: inset 0 1px 3px rgba(12, 47, 58, 0.05);">💬 <strong>${escapeHtml(c.author)}:</strong> ${escapeHtml(c.text)}</div>`).join('')}
        </div>
      ` : ''}
      ${activity.inscription ? `
        <div style="padding: 12px; background: linear-gradient(135deg, rgba(111, 184, 176, 0.1) 0%, rgba(111, 184, 176, 0.05) 100%); border-radius: 6px; box-shadow: inset 4px 0 0 var(--accent-cyan);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <div style="font-size: 11px; font-weight: 600; color: var(--accent-cyan);">📋 INSCRIPTIONS</div>
            <div style="font-size: 11px; background: var(--accent-cyan); color: white; padding: 3px 8px; border-radius: 3px; font-weight: 600;">${inscrits.length}/${PARTICIPANTS.filter(p => p.chores).length}</div>
          </div>
          ${inscrits.length === 0
            ? '<div style="font-size: 12px; color: var(--primary-light); font-style: italic; margin-bottom: 8px;">Pas encore d\'inscrits</div>'
            : `<div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px;">${inscrits.map(p => `<span style="font-size: 11px; background: white; color: var(--accent-cyan); padding: 4px 10px; border-radius: 4px; font-weight: 500; box-shadow: 0 2px 4px rgba(111, 184, 176, 0.1);">${p.name}</span>`).join('')}</div>`
          }
          <div style="display: flex; align-items: center; gap: 10px;">
            <input type="checkbox" ${inscriptions[`${currentUser.id}-${dayIdx}-${actIdx}`] === true ? 'checked' : ''} onchange="toggleInscription(${dayIdx}, ${actIdx})" style="width: 20px; height: 20px; cursor: pointer; accent-color: var(--accent-cyan);">
            <label style="flex: 1; cursor: pointer; font-size: 13px; color: var(--primary); font-weight: 600;">Je m'inscris</label>
          </div>
        </div>
      ` : ''}
      </div>
    </div>
  `;
}

function updateActivityField(dayIdx, actIdx, field, value) {
  planningData[dayIdx].activities[actIdx][field] = value;
  saveAllData();
}

function updateApporterItemText(dayIdx, actIdx, itemIdx, value) {
  const activity = planningData[dayIdx].activities[actIdx];
  if (Array.isArray(activity.apporter)) activity.apporter[itemIdx] = value;
  saveAllData();
}

function addApporterItem(dayIdx, actIdx) {
  const activity = planningData[dayIdx].activities[actIdx];
  if (!Array.isArray(activity.apporter)) activity.apporter = [];
  activity.apporter.push('Nouvel objet');
  saveAllData();
  renderPlanningDayDetail(dayIdx);
}

function removeApporterItem(dayIdx, actIdx, itemIdx) {
  const activity = planningData[dayIdx].activities[actIdx];
  if (Array.isArray(activity.apporter)) activity.apporter.splice(itemIdx, 1);
  saveAllData();
  renderPlanningDayDetail(dayIdx);
}

function toggleApporterItem(key) {
  checklistValise[key] = !checklistValise[key];
  saveAllData();
  renderPlanning();
}

function toggleInscription(dayIdx, actIdx) {
  // Utiliser le nouveau système toggleInscriptionTab avec currentUser
  toggleInscriptionTab(currentUser.id, dayIdx, actIdx);
  renderPlanningDayDetail(dayIdx);
}

function exportPlanning() {
  let csv = 'Jour,Date,Activité,Horaires,Lieu,À apporter,Notes\n';
  planningData.forEach(day => {
    day.activities.forEach(activity => {
      const apporterStr = Array.isArray(activity.apporter) ? activity.apporter.join('; ') : (activity.apporter || '');
      csv += `"${day.jour}","${day.date || ''}","${activity.nom}","${activity.horaires}","${activity.lieu}","${apporterStr}","${activity.notes || ''}"\n`;
    });
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'saraillon-planning.csv';
  link.click();
  addNotification('✅ Planning exporté', '✅', 'planning');
}

// ============== CORVEES ==============
function renderDaySelector() {
  const html = planningData.map((day, idx) => `
    <button class="tab-btn ${idx === 0 ? 'active' : ''}" onclick="selectDay(${idx})">${day.jour.substring(0, 3)}</button>
  `).join('');
  document.getElementById('day-selector').innerHTML = html;
}

function selectDay(idx) {
  selectedDay = idx;
  document.querySelectorAll('#day-selector .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#day-selector .tab-btn')[idx].classList.add('active');

  // ✅ Affiche les corvées déjà assignées pour ce jour (par n'importe qui du
  // groupe), au lieu de repartir d'un écran vide tant qu'on n'a pas re-tourné la roue.
  const dayRows = cloudChoreAssignments.filter(r => r.day_idx === idx);
  currentChoreAssignments = dayRows
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map(r => ({
      id: r.id,
      chore: { name: r.chore_name, emoji: r.emoji },
      person: PARTICIPANTS.find(p => p.id === r.person_id) || { id: r.person_id, name: '?' },
      xp: r.xp,
      dayIdx: r.day_idx,
      done: r.done
    }));
  renderChoresDisplay();
}

function spinRoulette() {
  // Désactiver le bouton pendant l'animation
  const btn = document.getElementById('spin-btn');
  if (btn.disabled) return;
  btn.disabled = true;
  
  // Masquer les résultats précédents
  document.getElementById('chores-display').innerHTML = '';
  
  // Afficher la roue carousel
  const carouselWheel = document.getElementById('carousel-wheel');
  const carouselItems = document.getElementById('carousel-items');
  carouselWheel.style.display = 'block';
  
  // Créer les items du carousel
  const isMobileWheel = window.innerWidth <= 768;
  const wheelItemSize = isMobileWheel ? 38 : 80;
  const wheelGap = isMobileWheel ? 4 : 20;
  carouselItems.style.gap = wheelGap + 'px';
  carouselItems.innerHTML = CHORES.map(chore => `
    <div style="min-width: ${wheelItemSize}px; padding: ${isMobileWheel ? 6 : 10}px; background: white; border-radius: 10px; box-shadow: 0 0 0 2px #e0e0e0; text-align: center; font-size: ${isMobileWheel ? 18 : 28}px; opacity: 0.4; transform: scale(0.8); transition: all 0.3s ease;">
      ${chore.emoji}
    </div>
  `).join('');
  
  // Lancer l'animation du carousel
  carouselItems.classList.add('carousel-spinning');
  
  // Attendre la fin de l'animation (3 secondes) avant d'afficher les résultats
  setTimeout(() => {
    carouselItems.classList.remove('carousel-spinning');
    carouselWheel.style.display = 'none';
    
    const available = PARTICIPANTS.filter(p => p.chores && !activitiesInscription.some(act => {
      if (act.dayIdx !== selectedDay) return false;
      const key = `${p.id}-${act.dayIdx}-${act.actIdx}`;
      return inscriptions[key] === true;
    }));

    if (available.length === 0) {
      document.getElementById('chores-display').innerHTML = '<div style="text-align: center; color: var(--primary-light); padding: 40px 20px;"><p style="margin: 0; font-size: 14px;">🎉 Tout le monde inscrit!</p></div>';
      btn.disabled = false;
      return;
    }

    const choreCount = Math.min(CHORES.length, available.length);
    const usedIndices = new Set();
    currentChoreAssignments = [];
    for (let i = 0; i < choreCount; i++) {
      let choreIdx;
      do {
        choreIdx = Math.floor(Math.random() * CHORES.length);
      } while (usedIndices.has(choreIdx));
      usedIndices.add(choreIdx);

      const chore = CHORES[choreIdx];
      const person = available[i];
      const xp = 15;
      // ✅ id généré côté client (uuid) pour pouvoir retrouver/mettre à jour cette
      // ligne précise dans Supabase quand la corvée est cochée comme faite.
      const id = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : `${Date.now()}-${i}`;

      currentChoreAssignments.push({ id, chore, person, xp, dayIdx: selectedDay, done: false });
    }

    renderChoresDisplay();

    // ✅ Envoie chaque assignation à Supabase pour que la roue soit visible sur
    // tous les téléphones du groupe, pas seulement celui qui a tourné la roue.
    currentChoreAssignments.forEach(a => {
      window.syncToSupabase('chore_assignments', {
        id: a.id,
        day_idx: a.dayIdx,
        person_id: a.person.id,
        chore_name: a.chore.name,
        emoji: a.chore.emoji,
        xp: a.xp,
        done: false
      });
    });

    btn.disabled = false;
  }, 3000);
}

let currentChoreAssignments = [];
// ✅ Miroir local des lignes Supabase de la table chore_assignments (assignations +
// complétions), rafraîchi au démarrage et toutes les 25s pour que la roue des
// corvées soit visible et à jour sur tous les téléphones du groupe.
let cloudChoreAssignments = [];

function renderChoresDisplay() {
  const container = document.getElementById('chores-display');
  if (!container) return;
  if (currentChoreAssignments.length === 0) {
    container.innerHTML = '';
    return;
  }
  let html = `
    <div style="background: linear-gradient(135deg, #1D5FA8 0%, #1690A3 100%); padding: 18px; border-radius: 14px; margin-bottom: 18px; color: white; text-align: center; box-shadow: 0 8px 20px rgba(29, 95, 168, 0.25);">
      <div style="font-size: 26px; margin-bottom: 4px;">⚡</div>
      <strong style="font-family: var(--font-display); font-weight: 500; font-size: 16px; letter-spacing: 0.3px;">Le tirage est fait !</strong>
      <div style="font-size: 11.5px; opacity: 0.9; margin-top: 2px;">Coche chaque corvée une fois faite pour gagner ton XP</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 12px;">
  `;
  currentChoreAssignments.forEach((a, i) => { html += renderChoreAssignmentCard(i); });
  html += '</div>';
  container.innerHTML = html;
}

// ✅ Charge les assignations de corvées depuis Supabase (partagées entre tous les
// téléphones) et met à jour l'affichage du jour actuellement sélectionné.
async function loadChoreAssignmentsCloud() {
  if (!window.supabaseReady) return;
  const rows = await window.loadFromSupabase('chore_assignments');
  if (!rows) return;
  cloudChoreAssignments = rows;

  const dayRows = cloudChoreAssignments.filter(r => r.day_idx === selectedDay);
  if (dayRows.length > 0) {
    currentChoreAssignments = dayRows
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map(r => ({
        id: r.id,
        chore: { name: r.chore_name, emoji: r.emoji },
        person: PARTICIPANTS.find(p => p.id === r.person_id) || { id: r.person_id, name: '?' },
        xp: r.xp,
        dayIdx: r.day_idx,
        done: r.done
      }));
    renderChoresDisplay();
  }
  renderChoreLogPanel();
  renderHomeGroupSpirit();
}

// ✅ Combine les corvées faites enregistrées localement (avant ce correctif) avec
// celles synchronisées via Supabase, pour ne perdre aucun historique.
function getAllChoreCompletions() {
  const cloudDone = cloudChoreAssignments
    .filter(r => r.done)
    .map(r => ({
      id: r.id,
      personId: r.person_id,
      personName: (PARTICIPANTS.find(p => p.id === r.person_id) || {}).name || '?',
      choreName: r.chore_name,
      emoji: r.emoji,
      xp: r.xp,
      dayIdx: r.day_idx,
      timestamp: r.created_at
    }));
  return [...choreLog, ...cloudDone];
}

function renderChoreAssignmentCard(i) {
  const a = currentChoreAssignments[i];
  if (!a) return '';
  return `
    <div class="card" id="chore-card-${i}" style="display: flex; align-items: center; gap: 12px; padding: 14px; background: ${a.done ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.03) 100%)' : 'linear-gradient(135deg, var(--bg-raised) 0%, var(--bg-sunken) 100%)'}; box-shadow: 0 4px 12px rgba(153, 51, 255, 0.1); opacity: 0; transform: translateY(20px); animation: fadeInUp 0.5s ease forwards; animation-delay: ${i * 0.1}s; border-radius: 12px; transition: background 0.3s ease;">
      <div style="font-size: 28px; flex-shrink: 0; opacity: ${a.done ? '0.5' : '1'};">${a.chore.emoji}</div>
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 700; color: var(--primary); font-size: 14px; margin-bottom: 2px; text-decoration: ${a.done ? 'line-through' : 'none'}; opacity: ${a.done ? '0.6' : '1'};">${escapeHtml(a.chore.name)}</div>
        <div style="font-size: 12px; color: var(--accent-cyan); font-weight: 600;">👤 ${escapeHtml(a.person.name)}</div>
      </div>
      <button class="btn btn-small" style="flex-shrink: 0; border: none; font-weight: 700; padding: 10px 14px; border-radius: 8px; transition: all 0.2s ease; background: ${a.done ? 'linear-gradient(135deg, var(--accent-gold) 0%, #ffb700 100%)' : 'var(--bg-sunken)'}; color: ${a.done ? 'white' : 'var(--primary)'};" onclick="completeChore(${i})" ${a.done ? 'disabled' : ''}>${a.done ? `✅ +${a.xp} XP` : `Fait ! (+${a.xp} XP)`}</button>
    </div>
  `;
}

function completeChore(i) {
  const a = currentChoreAssignments[i];
  if (!a || a.done) return;
  a.done = true;

  choreLog.push({
    id: Date.now(),
    personId: a.person.id,
    personName: a.person.name,
    choreName: a.chore.name,
    emoji: a.chore.emoji,
    xp: a.xp,
    dayIdx: a.dayIdx,
    timestamp: new Date()
  });

  const card = document.getElementById(`chore-card-${i}`);
  if (card) card.outerHTML = renderChoreAssignmentCard(i);

  addNotification(`⚡ ${a.person.name} a fait "${a.chore.name}" (+${a.xp} XP) !`, '⚡', 'corvees');
  addFeedEntry(`a fait la corvée "${a.chore.name}" (+${a.xp} XP) !`, '⚡');
  showNotification(`⚡ Tirage réussi ! +${a.xp} XP`, 'success');

  // ✅ Marque cette corvée comme faite côté Supabase (upsert sur l'id) pour que
  // tout le monde voie la complétion sans devoir rouvrir l'app.
  if (a.id) {
    window.syncToSupabase('chore_assignments', {
      id: a.id,
      day_idx: a.dayIdx,
      person_id: a.person.id,
      chore_name: a.chore.name,
      emoji: a.chore.emoji,
      xp: a.xp,
      done: true
    });
  }

  saveAllData();
  renderChoreLogPanel();
  celebrateWithConfetti();
}

function renderChoreLogPanel() {
  const panel = document.getElementById('chore-log-panel');
  if (!panel) return;

  const allCompletions = getAllChoreCompletions();
  if (allCompletions.length === 0) {
    panel.innerHTML = '';
    return;
  }

  // ✅ Total d'XP corvées par personne + les 5 dernières corvées faites
  // (fusion des complétions locales historiques et de celles synchronisées via Supabase)
  const totals = {};
  PARTICIPANTS.forEach(p => { totals[p.id] = 0; });
  allCompletions.forEach(entry => { if (totals[entry.personId] !== undefined) totals[entry.personId] += (entry.xp || 15); });
  const ranking = PARTICIPANTS.map(p => ({ p, xp: totals[p.id] || 0 })).filter(r => r.xp > 0).sort((a, b) => b.xp - a.xp);
  const recent = [...allCompletions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

  panel.innerHTML = `
    <div class="card" style="background: linear-gradient(135deg, rgba(153, 51, 255, 0.06) 0%, rgba(31, 182, 201, 0.04) 100%); padding: 16px; border-radius: 14px;">
      <div style="font-weight: 800; font-size: 13px; letter-spacing: 0.4px; margin-bottom: 10px; color: var(--primary);">⚡ CORVÉES ACCOMPLIES</div>
      ${ranking.length > 0 ? `
      <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
        ${ranking.map(r => `<span style="font-size: 11px; background: white; padding: 4px 10px; border-radius: 10px; box-shadow: 0 2px 6px rgba(12, 47, 58, 0.06); font-weight: 600;">${escapeHtml(r.p.name)} · ${r.xp} XP</span>`).join('')}
      </div>` : ''}
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${recent.map(entry => `
          <div style="font-size: 12px; color: var(--primary-light); display: flex; align-items: center; gap: 6px;">
            <span>${entry.emoji}</span>
            <span><strong style="color: var(--primary);">${escapeHtml(entry.personName)}</strong> — ${escapeHtml(entry.choreName)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

