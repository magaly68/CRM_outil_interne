(() => {
  const key = 'claircrm-billing-v1';
  const euro = n => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
  let docs = JSON.parse(localStorage.getItem(key)) || [
    { id: 1, type: 'Devis', number: 'DEV-2026-001', client: 'Studio M.', title: 'Refonte site vitrine', amount: 4800, status: 'À envoyer' },
    { id: 2, type: 'Facture', number: 'FAC-2026-001', client: 'Atelier Nord', title: 'Accompagnement SEO', amount: 3200, status: 'En attente' }
  ];
  const save = () => localStorage.setItem(key, JSON.stringify(docs));
  const quoteActions = quote => `<div class="billing-actions"><button class="secondary bill-action" data-convert="${quote.id}">Facturer</button><button class="icon-button" title="Modifier ce devis" data-edit-quote="${quote.id}">✎</button><button class="icon-button danger" title="Supprimer ce devis" data-delete-quote="${quote.id}">×</button></div>`;
  const rows = (list, quote) => list.map(doc => `<div class="billing-row"><div><strong>${doc.number} · ${doc.client}</strong><small>${doc.title}</small></div><div><strong>${euro(doc.amount)}</strong><small class="invoice-status">${doc.status}</small></div>${quote ? quoteActions(doc) : `<button class="secondary bill-action" data-paid="${doc.id}">${doc.status === 'Réglée' ? 'Réglée' : 'Marquer réglée'}</button>`}</div>`).join('') || '<div class="empty">Aucun document.</div>';
  function render() {
    const quotes = docs.filter(doc => doc.type === 'Devis'), invoices = docs.filter(doc => doc.type === 'Facture'), due = invoices.filter(doc => doc.status === 'En attente').reduce((sum, doc) => sum + doc.amount, 0);
    billing.innerHTML = `<div class="section-head"><div><p class="label">GESTION FINANCIÈRE</p><h2>Devis & facturation</h2></div><button class="primary" id="newQuote">+ Nouveau devis</button></div><div class="billing-metrics"><div class="metric"><p>Devis en cours</p><strong>${quotes.length}</strong></div><div class="metric"><p>À encaisser</p><strong>${euro(due)}</strong></div><div class="metric"><p>Factures réglées</p><strong>${invoices.filter(doc => doc.status === 'Réglée').length}</strong></div></div><div class="billing-grid"><article class="panel"><div class="panel-head"><div><p class="label">DEVIS</p><h3>Propositions commerciales</h3></div></div>${rows(quotes, true)}</article><article class="panel"><div class="panel-head"><div><p class="label">FACTURES</p><h3>Suivi des règlements</h3></div></div>${rows(invoices, false)}</article></div>`;
  }
  function form(quote = null) {
    const dialog = document.createElement('dialog');
    dialog.innerHTML = `<form><div class="dialog-head"><h2>${quote ? 'Modifier le devis' : 'Nouveau devis'}</h2><button type="button" class="close">×</button></div><div class="form-fields"><label>Client<input name="client" value="${quote?.client || ''}" required></label><label>Objet<input name="title" value="${quote?.title || ''}" required></label><label>Montant HT (€)<input name="amount" type="number" min="0" step="0.01" value="${quote?.amount || ''}" required></label><label>Statut<select name="status"><option ${quote?.status === 'À envoyer' ? 'selected' : ''}>À envoyer</option><option ${quote?.status === 'Accepté' ? 'selected' : ''}>Accepté</option><option ${quote?.status === 'Refusé' ? 'selected' : ''}>Refusé</option></select></label></div><div class="form-actions"><button type="button" class="secondary">Annuler</button><button class="primary">${quote ? 'Enregistrer' : 'Créer'}</button></div></form>`;
    document.body.append(dialog); dialog.showModal();
    dialog.querySelectorAll('[type="button"]').forEach(button => button.onclick = () => dialog.close());
    dialog.addEventListener('close', () => dialog.remove());
    dialog.querySelector('form').onsubmit = event => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.target)); if (quote) Object.assign(quote, values, { amount: Number(values.amount) }); else docs.push({ ...values, id: Date.now(), type: 'Devis', number: `DEV-${new Date().getFullYear()}-${String(docs.filter(doc => doc.type === 'Devis').length + 1).padStart(3, '0')}`, amount: Number(values.amount) }); save(); dialog.close(); render(); };
  }
  document.addEventListener('click', event => {
    if (event.target.id === 'newQuote') form();
    const edit = event.target.closest('[data-edit-quote]'); if (edit) form(docs.find(doc => doc.id == edit.dataset.editQuote));
    const remove = event.target.closest('[data-delete-quote]'); if (remove) { const quote = docs.find(doc => doc.id == remove.dataset.deleteQuote); if (quote && confirm(`Supprimer définitivement le devis ${quote.number} ?`)) { docs = docs.filter(doc => doc.id != quote.id); save(); render(); } }
    const convert = event.target.closest('[data-convert]'); if (convert) { const quote = docs.find(doc => doc.id == convert.dataset.convert); docs.push({ ...quote, id: Date.now(), type: 'Facture', number: `FAC-${new Date().getFullYear()}-${String(docs.filter(doc => doc.type === 'Facture').length + 1).padStart(3, '0')}`, status: 'En attente' }); quote.status = 'Facturé'; save(); render(); }
    const paid = event.target.closest('[data-paid]'); if (paid) { docs.find(doc => doc.id == paid.dataset.paid).status = 'Réglée'; save(); render(); }
  });
  const billing = document.createElement('section'); billing.id = 'billing'; billing.className = 'view'; document.querySelector('main').insertBefore(billing, document.getElementById('tasks')); render();
})();
