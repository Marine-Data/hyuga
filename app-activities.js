// ============== INSCRIPTIONS ==============
function renderInscriptions() {
  const html = activitiesInscription.map(act => {
    const inscrits = PARTICIPANTS.filter(p => {
      const key = `${p.id}-${act.dayIdx}-${act.actIdx}`;
      return inscriptions[key] === true;
    });
    
    const html_participants = PARTICIPANTS.map(p => {
      const key = `${p.id}-${act.dayIdx}-${act.actIdx}`;
      const estInscrit = inscriptions[key] === true;
      const estMoi = p.id === currentUser.id;
      
      return `
        <div style="padding: 10px; background: var(--bg-sunken); border-radius: 6px; margin-bottom: 8px; display: flex; gap: 10px; align-items: center; justify-content: space-between;">
          <div style="display: flex; gap: 8px; align-items: center;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #1D5FA8 0%, #1690A3 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: 700;">${p.name[0]}</div>
            <div>
              <div style="font-weight: 600; font-size: 12px;">${p.name}</div>
              ${estMoi ? '<div style="font-size: 10px; color: var(--accent-gold);">C\'est toi</div>' : ''}
            </div>
          </div>
          <div>
            ${estInscrit ? `
              <div style="display: flex; gap: 6px;">
                <button class="btn btn-small" style="background: var(--accent-cyan); color: white; cursor: default; padding: 6px 10px;">✅ Inscrit(e)</button>
                ${estMoi ? `<button class="btn btn-small btn-danger" onclick="toggleInscriptionTab(${p.id}, ${act.dayIdx}, ${act.actIdx})">❌</button>` : ''}
              </div>
            ` : `
              ${estMoi ? `<button class="btn btn-small btn-primary" onclick="toggleInscriptionTab(${p.id}, ${act.dayIdx}, ${act.actIdx})">✍️ S'inscrire</button>` : '<span style="font-size: 11px; color: var(--primary-light);">Non inscrit</span>'}
            `}
          </div>
        </div>
      `;
    }).join('');
    
    return `
      <div class="card" style="box-shadow: 0 0 0 1px var(--accent-cyan), 0 2px 8px rgba(12, 47, 58, 0.1); margin-bottom: 16px;">
        <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 12px; padding-bottom: 12px; box-shadow: 0 2px 0 var(--border);">
          <div style="font-size: 32px;">${act.emoji}</div>
          <div>
            <div class="card-title" style="margin: 0;">${act.nom}</div>
            <div style="font-size: 11px; color: var(--primary-light);">${act.jour}</div>
          </div>
        </div>
        <div style="margin-bottom: 10px; padding: 8px; background: ${inscrits.length === 0 ? 'rgba(224, 122, 150, 0.15)' : 'rgba(111, 184, 176, 0.1)'}; border-radius: 6px; font-size: 11px; color: ${inscrits.length === 0 ? 'var(--accent-pink)' : 'var(--primary-soft)'}; font-weight: ${inscrits.length === 0 ? '700' : '400'};">
          ${inscrits.length === 0 ? '⚠️ Personne n\'est encore inscrit !' : `📊 ${inscrits.length} inscrit${inscrits.length > 1 ? 's' : ''}`}
        </div>
        <div>${html_participants}</div>
      </div>
    `;
  }).join('');
  
  document.getElementById('inscriptions-content').innerHTML = html;
}

function toggleInscriptionTab(personId, dayIdx, actIdx) {
  const key = `${personId}-${dayIdx}-${actIdx}`;
  const activity = planningData[dayIdx].activities[actIdx];
  const person = PARTICIPANTS.find(p => p.id === personId);
  
  if (inscriptions[key] === true) {
    // Désinscrire
    delete inscriptions[key];
    // 🐛 CORRECTIF (22/07) : la désinscription n'était QUE locale. saveAllData()
    // ne pousse vers Supabase que les clés à true et ne supprime jamais rien — la ligne
    // restait donc en base, et le prochain téléphone qui rechargeait la réinscrivait
    // partout. C'est arrivé pour de vrai : Inès s'est désinscrite de la plongée le
    // 18/07, et son inscription est réapparue. On supprime maintenant la ligne en base.
    if (window.supabaseReady && window.supabase) {
      window.supabase.from('inscriptions')
        .delete()
        .match({ person_id: personId, day_idx: dayIdx, act_idx: actIdx })
        .then(({ error }) => { if (error) console.error('Suppression inscription échouée:', error); });
    }
    addNotification(`❌ ${person.name} désinscrite de ${activity.nom}`, '❌', 'inscriptions');
    addFeedEntry(`s'est désinscrite de ${activity.nom}`, '❌', 'planning', `${dayIdx}:${actIdx}`);
  } else {
    // Inscrire
    inscriptions[key] = true;
    addNotification(`✍️ ${person.name} inscrite à ${activity.nom}`, '✍️', 'inscriptions');
    addFeedEntry(`s'est inscrite à ${activity.nom}`, '✍️', 'planning', `${dayIdx}:${actIdx}`);
    if (typeof MedAnim !== 'undefined') MedAnim.dolphin(); // 🐬 saut de célébration
    // ✅ Private joke : réaction spéciale quand Inès s'inscrit à une activité
    if (person.name === 'Inès') {
      showNotification('✨ Parf !', 'success');
      if (typeof celebrateWithConfetti === 'function') celebrateWithConfetti();
    }
  }
  
  saveAllData();
  renderInscriptions();
  renderPlanning();
}

// ============== SHOPPING ==============
function renderShopping() {
  const categories = ['🍎', '🥕', '🥩', '🥤', '📌'];
  let html = '';
  
  const items = shoppingList.filter(i => !i.done);
  if (items.length > 0) {
    html += '<div style="margin-bottom: 20px;"><div style="font-size: 14px; color: var(--primary); font-weight: 700; margin-bottom: 12px;">À faire</div>';
    items.forEach(item => {
      const assignee = item.assignedTo ? PARTICIPANTS.find(p => p.id === item.assignedTo) : null;
      const mineAssign = assignee && currentUser && assignee.id === currentUser.id;
      // ✅ "Je m'en occupe" : un tap pour se l'attribuer (évite les achats en double),
      // re-tap pour se désister si c'est le sien ; tap sur le chip de quelqu'un d'autre = reprise.
      const assignChip = assignee
        ? `<button onclick="toggleShopAssign(${item.id})" title="${mineAssign ? 'Me désister' : 'Reprendre'}" style="border: none; cursor: pointer; padding: 4px 9px; border-radius: 12px; font-size: 11px; font-weight: 700; background: ${mineAssign ? 'linear-gradient(135deg, var(--accent-pink) 0%, #d946a6 100%)' : 'var(--bg-raised)'}; color: ${mineAssign ? 'white' : 'var(--primary)'}; flex-shrink: 0;">🙋 ${escapeHtml(assignee.name)}</button>`
        : `<button onclick="toggleShopAssign(${item.id})" style="border: none; cursor: pointer; padding: 4px 9px; border-radius: 12px; font-size: 11px; font-weight: 600; background: var(--bg-raised); color: var(--primary-light); flex-shrink: 0;">🙋 Je m'en occupe</button>`;
      html += `
        <div class="card" style="display: flex; gap: 12px; align-items: center; margin-bottom: 10px; padding: 12px; background: var(--bg-sunken); box-shadow: 0 2px 6px rgba(12, 47, 58, 0.08);">
          <input type="checkbox" ${item.done ? 'checked' : ''} onchange="toggleShop(${item.id})" style="cursor: pointer; width: 18px; height: 18px; accent-color: var(--accent-cyan);">
          <span style="flex: 1; font-size: 13px; font-weight: 500; color: var(--primary);">${escapeHtml(item.item)}</span>
          ${assignChip}
          <button class="btn btn-small btn-danger" style="border: none; background: rgba(239, 68, 68, 0.1); color: var(--danger); padding: 6px 10px; border-radius: 6px; cursor: pointer;" onclick="confirmRemoveShop(${item.id})">🗑️</button>
        </div>
      `;
    });
    html += '</div>';
  }
  
  const done = shoppingList.filter(i => i.done);
  if (done.length > 0) {
    html += '<div style="padding-top: 16px; box-shadow: inset 0 1px 3px rgba(12, 47, 58, 0.05);"><div style="font-size: 14px; color: var(--primary-light); margin-bottom: 12px; font-weight: 700;">✅ Complétés</div>';
    done.forEach(item => {
      html += `
        <div class="card" style="display: flex; gap: 12px; align-items: center; margin-bottom: 10px; padding: 12px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.04) 100%); opacity: 0.7; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.08);">
          <input type="checkbox" checked onchange="toggleShop(${item.id})" style="cursor: pointer; width: 18px; height: 18px; accent-color: var(--accent-cyan);">
          <span style="flex: 1; font-size: 13px; text-decoration: line-through; color: var(--primary-light);">${escapeHtml(item.item)}</span>
          <button class="btn btn-small btn-danger" style="border: none; background: rgba(239, 68, 68, 0.1); color: var(--danger); padding: 6px 10px; border-radius: 6px; cursor: pointer;" onclick="confirmRemoveShop(${item.id})">🗑️</button>
        </div>
      `;
    });
    html += '</div>';
  }
  
  document.getElementById('shopping-list').innerHTML = html || '<p style="text-align: center; color: var(--primary-light); padding: 40px 20px;">📝 Liste vide - Ajoute tes courses!</p>';
}

function addShoppingItem() {
  const input = document.getElementById('new-item');
  if (!input) return;
  const value = input.value.trim();
  if (!value) return;
  shoppingList.push({ id: Date.now(), item: value.toUpperCase(), done: false });
  saveAllData();
  renderShopping();
  input.value = '';
  input.focus();
}

function toggleShop(id) {
  const item = shoppingList.find(i => i.id === id);
  if (item) item.done = !item.done;
  saveAllData();
  renderShopping();
}

function toggleShopAssign(id) {
  const item = shoppingList.find(i => i.id === id);
  if (!item || !currentUser) return;
  // Se désister si c'est déjà le sien, sinon se l'attribuer (reprise autorisée)
  item.assignedTo = (item.assignedTo === currentUser.id) ? null : currentUser.id;
  saveAllData();
  renderShopping();
}

function confirmRemoveShop(id) {
  const item = shoppingList.find(i => i.id === id);
  if (!item) return;
  showConfirmation(`Supprimer "${item.item}" de la liste?`, () => removeShop(id));
}

function removeShop(id) {
  shoppingList = shoppingList.filter(i => i.id !== id);
  // 🐛 CORRECTIF (22/07) : même bug que les désinscriptions — l'article était retiré
  // de l'écran mais jamais de Supabase. saveAllData() ne fait que pousser les articles
  // présents, il ne supprime rien. L'article revenait donc à la prochaine synchro (25s)
  // ou sur le téléphone de quelqu'un d'autre : on rachetait du lait déjà barré.
  if (window.supabaseReady && window.supabase) {
    window.supabase.from('shopping_list').delete().eq('id', id)
      .then(({ error }) => { if (error) console.error('Suppression article échouée:', error); });
  }
  saveAllData();
  renderShopping();
}

// ============== SONDAGES ==============
// ✅ Sondage clos si son échéance est passée
function isPollClosed(poll) {
  return !!(poll.closesAt && new Date(poll.closesAt) <= new Date());
}

function pollWinnerText(poll) {
  const max = Math.max(...poll.options.map(o => o.votes.length));
  if (max === 0) return 'aucun vote';
  const winners = poll.options.filter(o => o.votes.length === max).map(o => o.text);
  return winners.length > 1 ? `égalité : ${winners.join(' / ')}` : `"${winners[0]}" gagne`;
}

// ✅ Appelée par la boucle de synchro (25s) : dès qu'un sondage à échéance est passé,
// UN SEUL appareil "réclame" l'annonce (update conditionnel côté base : premier arrivé,
// premier servi) et publie la notification du résultat — pas de doublons.
async function checkClosedPolls() {
  if (!window.supabaseReady || !window.supabase) return;
  for (const poll of polls) {
    if (isPollClosed(poll) && !poll.resultNotified) {
      poll.resultNotified = true; // local d'abord, pour ne pas retenter à chaque cycle
      try {
        const { data } = await window.supabase
          .from('polls')
          .update({ result_notified: true })
          .eq('id', poll.id)
          .eq('result_notified', false)
          .select();
        if (data && data.length > 0) {
          // Cet appareil a gagné la réclamation → il annonce pour tout le monde
          addNotification(`🗳️ Sondage terminé : ${pollWinnerText(poll)} — "${poll.question}"`, '🏁', 'general');
          addFeedEntry(`Sondage terminé : ${pollWinnerText(poll)} ("${poll.question}")`, '🏁', 'polls');
          renderPolls();
        }
      } catch (e) { /* réseau : on retentera au prochain cycle via le rechargement cloud */ }
    }
  }
}

function renderPolls() {
  const container = document.getElementById('polls-content');
  if (!container) return;

  if (polls.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--primary-light); padding: 40px 20px;">Aucun sondage pour le moment — lance-en un !</p>';
    return;
  }

  const html = polls.slice().reverse().map(poll => {
    const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
    const myVoteIdx = poll.options.findIndex(o => o.votes.includes(currentUser.id));
    const closed = isPollClosed(poll);
    const maxVotes = Math.max(...poll.options.map(o => o.votes.length));

    const optionsHtml = poll.options.map((opt, idx) => {
      const pct = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
      const isMyVote = idx === myVoteIdx;
      const isWinner = closed && opt.votes.length === maxVotes && maxVotes > 0;
      return `
        <div ${closed ? '' : `onclick="voteOnPoll(${poll.id}, ${idx})"`} style="cursor: ${closed ? 'default' : 'pointer'}; position: relative; margin-bottom: 8px; border-radius: 8px; overflow: hidden; background: var(--bg-sunken); ${closed ? `opacity: ${isWinner ? '1' : '0.55'};` : ''} box-shadow: ${isWinner ? 'inset 0 0 0 2px #10b981' : (isMyVote ? 'inset 0 0 0 2px #e35b2e' : 'inset 0 1px 3px rgba(12, 47, 58, 0.05)')};">
          <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${pct}%; background: linear-gradient(135deg, ${isWinner ? 'rgba(16, 185, 129, 0.35) 0%, rgba(16, 185, 129, 0.15)' : 'rgba(255, 157, 92, 0.35) 0%, rgba(227, 91, 46, 0.2)'} 100%); transition: width 0.4s ease;"></div>
          <div style="position: relative; display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; font-size: 13px;">
            <span style="font-weight: ${isMyVote || isWinner ? '700' : '400'};">${isWinner ? '🏆 ' : ''}${isMyVote ? '✅ ' : ''}${escapeHtml(opt.text)}</span>
            <span style="font-weight: 700; color: ${isWinner ? '#10b981' : '#e35b2e'}; font-size: 12px;">${pct}% (${opt.votes.length})</span>
          </div>
        </div>
      `;
    }).join('');

    const footer = closed
      ? `🏁 Sondage terminé · ${totalVotes} vote${totalVotes > 1 ? 's' : ''}`
      : `${totalVotes} vote${totalVotes > 1 ? 's' : ''} · touche une option pour voter${poll.closesAt ? ` · ⏰ clôture le ${new Date(poll.closesAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}` : ''}`;

    return `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <div class="card-title" style="margin: 0;">🗳️ ${escapeHtml(poll.question)}</div>
          <button class="btn-icon-small" onclick="confirmDeletePoll(${poll.id})" title="Supprimer" style="background: var(--bg-sunken); border: none; border-radius: 6px; width: 30px; height: 30px; cursor: pointer; font-size: 13px; flex-shrink: 0;">🗑️</button>
        </div>
        ${optionsHtml}
        <div style="font-size: 11px; color: var(--primary-light); margin-top: 8px;">${footer}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

function showCreatePoll() {
  document.getElementById('poll-question').value = '';
  for (let i = 0; i < 5; i++) document.getElementById(`poll-option-${i}`).value = '';
  openModal('createPollModal');
}

function createPoll() {
  const question = document.getElementById('poll-question').value.trim();
  const optionInputs = [0, 1, 2, 3, 4].map(i => document.getElementById(`poll-option-${i}`).value.trim()).filter(Boolean);

  if (!question || optionInputs.length < 2) {
    showNotification('Une question + au moins 2 options !', 'error');
    return;
  }

  const closesAtRaw = document.getElementById('poll-closes-at')?.value || '';
  const closesAt = closesAtRaw ? new Date(closesAtRaw).toISOString() : null;

  polls.push({
    id: Date.now(),
    question,
    options: optionInputs.map(text => ({ text, votes: [] })),
    creator: currentUser.name,
    timestamp: new Date(),
    closesAt,          // ✅ Clôture automatique optionnelle
    resultNotified: false
  });

  saveAllData();
  renderPolls();
  closeModal('createPollModal');
  addNotification(`🗳️ ${currentUser.name} a lancé un sondage : "${question}"`, '🗳️', 'general');
  addFeedEntry(`a lancé un sondage : "${question}"`, '🗳️', 'polls');
  showNotification('🗳️ Sondage lancé !', 'success');
}

function voteOnPoll(pollId, optionIdx) {
  const poll = polls.find(p => p.id === pollId);
  if (!poll) return;
  if (isPollClosed(poll)) { showNotification('🏁 Ce sondage est terminé', 'error'); return; }

  // Retirer le vote précédent (un seul vote par personne, changement autorisé)
  poll.options.forEach(o => {
    const i = o.votes.indexOf(currentUser.id);
    if (i > -1) o.votes.splice(i, 1);
  });
  poll.options[optionIdx].votes.push(currentUser.id);

  saveAllData();
  renderPolls();
}

function confirmDeletePoll(pollId) {
  showConfirmation('Supprimer ce sondage ?', () => {
    polls = polls.filter(p => p.id !== pollId);
    saveAllData();
    renderPolls();
    if (window.supabaseReady && window.supabase) {
      window.supabase.from('polls').delete().eq('id', pollId).then(() => {}).catch(() => {});
    }
  });
}

// ============== DÉPENSES ==============
function computeExpenseBalances() {
  const balances = {};
  PARTICIPANTS.forEach(p => { balances[p.id] = 0; });

  expenses.forEach(exp => {
    const splitAmong = exp.splitAmong && exp.splitAmong.length > 0 ? exp.splitAmong : PARTICIPANTS.map(p => p.id);
    const share = exp.amount / splitAmong.length;
    if (balances[exp.payer] !== undefined) balances[exp.payer] += exp.amount;
    splitAmong.forEach(pid => {
      if (balances[pid] !== undefined) balances[pid] -= share;
    });
  });

  return balances;
}

// Suggestions de remboursement simplifiées (appariement glouton créditeurs/débiteurs)
function computeSettlements(balances) {
  const creditors = [];
  const debtors = [];
  Object.entries(balances).forEach(([id, bal]) => {
    if (bal > 0.01) creditors.push({ id: parseInt(id, 10), amount: bal });
    else if (bal < -0.01) debtors.push({ id: parseInt(id, 10), amount: -bal });
  });
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let ci = 0, di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const amount = Math.min(creditors[ci].amount, debtors[di].amount);
    settlements.push({ from: debtors[di].id, to: creditors[ci].id, amount });
    creditors[ci].amount -= amount;
    debtors[di].amount -= amount;
    if (creditors[ci].amount < 0.01) ci++;
    if (debtors[di].amount < 0.01) di++;
  }
  return settlements;
}

function renderExpenses() {
  const balanceContainer = document.getElementById('expenses-balance');
  const listContainer = document.getElementById('expenses-list');
  if (!balanceContainer || !listContainer) return;

  const balances = computeExpenseBalances();
  const settlements = computeSettlements(balances);

  const balanceRows = PARTICIPANTS.map(p => {
    const bal = balances[p.id] || 0;
    const color = bal > 0.01 ? 'var(--accent-cyan)' : (bal < -0.01 ? 'var(--accent-pink)' : 'var(--primary-light)');
    const sign = bal > 0.01 ? '+' : '';
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; box-shadow: 0 1px 0 var(--border);">
        <span style="font-size: 13px; ${p.id === currentUser.id ? 'font-weight: 700;' : ''}">${p.name}${p.id === currentUser.id ? ' (toi)' : ''}</span>
        <span style="font-weight: 800; font-size: 13px; color: ${color};">${sign}${bal.toFixed(2)} €</span>
      </div>
    `;
  }).join('');

  const settlementsHtml = settlements.length > 0 ? `
    <div style="margin-top: 14px; padding-top: 14px; box-shadow: 0 -1px 0 var(--border);">
      <div style="font-weight: 700; font-size: 12px; margin-bottom: 8px; color: var(--primary-light);">💸 QUI DOIT À QUI</div>
      ${settlements.map(s => {
        const from = PARTICIPANTS.find(p => p.id === s.from);
        const to = PARTICIPANTS.find(p => p.id === s.to);
        return `<div style="font-size: 12.5px; padding: 6px 0;">${from ? from.name : '?'} doit <strong>${s.amount.toFixed(2)} €</strong> à ${to ? to.name : '?'}</div>`;
      }).join('')}
    </div>
  ` : '<div style="margin-top: 10px; font-size: 12px; color: var(--primary-light); text-align: center;">✅ Tout le monde est à égalité !</div>';

  balanceContainer.innerHTML = `
    <div class="card" style="background: linear-gradient(135deg, rgba(111, 184, 176, 0.12) 0%, rgba(111, 184, 176, 0.03) 100%); padding: 18px; margin-bottom: 16px;">
      <div style="font-weight: 800; font-size: 14px; margin-bottom: 12px;">💰 SOLDES</div>
      ${balanceRows}
      ${settlementsHtml}
    </div>
  `;

  if (expenses.length === 0) {
    listContainer.innerHTML = '<p style="text-align: center; color: var(--primary-light); padding: 20px;">Aucune dépense enregistrée</p>';
    return;
  }

  listContainer.innerHTML = expenses.slice().reverse().map(exp => {
    const payer = PARTICIPANTS.find(p => p.id === exp.payer);
    const splitCount = (exp.splitAmong && exp.splitAmong.length) || PARTICIPANTS.length;
    return `
      <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-weight: 700; font-size: 13.5px;">${escapeHtml(exp.description) || 'Dépense'}</div>
          <div style="font-size: 11px; color: var(--primary-light);">${payer ? payer.name : '?'} a payé · réparti entre ${splitCount} personne${splitCount > 1 ? 's' : ''}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="font-weight: 800; font-size: 15px; color: var(--accent-cyan);">${exp.amount.toFixed(2)} €</div>
          <button class="btn-icon-small" onclick="confirmDeleteExpense(${exp.id})" style="background: var(--bg-sunken); border: none; border-radius: 6px; width: 30px; height: 30px; cursor: pointer; font-size: 13px;">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function showAddExpense() {
  const payerSelect = document.getElementById('expense-payer');
  payerSelect.innerHTML = PARTICIPANTS.map(p => `<option value="${p.id}" ${p.id === currentUser.id ? 'selected' : ''}>${p.name}</option>`).join('');

  const splitContainer = document.getElementById('expense-split-checkboxes');
  splitContainer.innerHTML = PARTICIPANTS.map(p => `
    <label style="display: flex; align-items: center; gap: 6px; font-size: 12px;">
      <input type="checkbox" id="split-${p.id}" checked> ${p.name}
    </label>
  `).join('');

  document.getElementById('expense-amount').value = '';
  document.getElementById('expense-desc').value = '';
  openModal('createExpenseModal');
}

function createExpense() {
  const payer = parseInt(document.getElementById('expense-payer').value, 10);
  const amount = parseFloat(document.getElementById('expense-amount').value);
  const desc = document.getElementById('expense-desc').value.trim();
  const splitAmong = PARTICIPANTS.filter(p => document.getElementById(`split-${p.id}`)?.checked).map(p => p.id);

  if (!amount || amount <= 0 || splitAmong.length === 0) {
    showNotification('Montant invalide ou personne à répartir !', 'error');
    return;
  }

  expenses.push({
    id: Date.now(),
    payer,
    amount,
    description: desc,
    splitAmong,
    timestamp: new Date()
  });

  saveAllData();
  renderExpenses();
  closeModal('createExpenseModal');
  const payerName = PARTICIPANTS.find(p => p.id === payer)?.name || '?';
  addNotification(`💰 ${payerName} a ajouté une dépense : ${desc || ''} (${amount.toFixed(2)} €)`, '💰', 'general');
  addFeedEntry(`a ajouté une dépense : "${desc || 'dépense'}" (${amount.toFixed(2)} €)`, '💰', 'expenses');
  showNotification('💰 Dépense ajoutée !', 'success');
}

function confirmDeleteExpense(id) {
  showConfirmation('Supprimer cette dépense ?', () => {
    expenses = expenses.filter(e => e.id !== id);
    saveAllData();
    renderExpenses();
    if (window.supabaseReady && window.supabase) {
      window.supabase.from('expenses').delete().eq('id', id).then(() => {}).catch(() => {});
    }
  });
}
