(() => {
  const key = 'claircrm-billing-v1';
  const euro = amount => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
  let docs = JSON.parse(localStorage.getItem(key)) || [
    { id: 1, type: 'Devis', number: 'DEV-2026-001', client: 'Studio M.', title: 'Refonte site vitrine', amount: 4800, status: 'À envoyer' },
    { id: 2, type: 'Facture', number: 'FAC-2026-001', client: 'Atelier Nord', title: 'Accompagnement SEO', amount: 3200, status: 'En attente' }
  ];
  const save = () => localStorage.setItem(key, JSON.stringify(docs));
  const nextNumber = type => `${type === 'Devis' ? 'DEV' : 'FAC'}-${new Date().getFullYear()}-${String(docs.filter(doc => doc.type === type).length + 1).padStart(3, '0')}`;
  const actions = document => `<div class="billing-actions">${document.type === 'Devis' ? `<button class="secondary bill-action" data-convert="${document.id}">Facturer</button>` : document.status !== 'Réglée' ? `<button class="secondary bill-action" data-paid="${document.id}">Marquer réglée</button>` : ''}<button class="icon-button" title="Modifier" data-edit-document="${document.id}">✎</button><button class="icon-button danger" title="Supprimer" data-delete-document="${document.id}">×</button></div>`;
  const rows = list => list.map(document => `<div class="billing-row"><div><strong>${document.number} · ${document.client}</strong><small>${document.title}</small></div><div><strong>${euro(document.amount)}</strong><small class="invoice-status">${document.status}</small></div>${actions(document)}</div>`).join('') || '<div class="empty">Aucun document.</div>';
  function render() {
    const quotes = docs.filter(doc => doc.type === 'Devis'), invoices = docs.filter(doc => doc.type === 'Facture'), due = invoices.filter(doc => doc.status === 'En attente').reduce((sum, doc) => sum + Number(doc.amount), 0);
    billing.innerHTML = `<div class="section-head"><div><p class="label">GESTION FINANCIÈRE</p><h2>Facturation</h2></div><div class="billing-create-actions"><button class="secondary" data-new-document="Facture">+ Nouvelle facture</button><button class="primary" data-new-document="Devis">+ Nouveau devis</button></div></div><div class="billing-metrics"><div class="metric"><p>Devis en cours</p><strong>${quotes.length}</strong></div><div class="metric"><p>À encaisser</p><strong>${euro(due)}</strong></div><div class="metric"><p>Factures réglées</p><strong>${invoices.filter(doc => doc.status === 'Réglée').length}</strong></div></div><div class="billing-grid"><article class="panel"><div class="panel-head"><div><p class="label">DEVIS</p><h3>Propositions commerciales</h3></div></div>${rows(quotes)}</article><article class="panel"><div class="panel-head"><div><p class="label">FACTURES</p><h3>Suivi des règlements</h3></div></div>${rows(invoices)}</article></div>`;
  }
  function form(document = null, type = 'Devis') {
    const documentType = document?.type || type;
    const statusOptions = documentType === 'Devis' ? ['À envoyer', 'Accepté', 'Refusé', 'Facturé'] : ['En attente', 'Réglée', 'En retard'];
    const dialog = window.document.createElement('dialog');
    dialog.innerHTML = `<form><div class="dialog-head"><h2>${document ? `Modifier ${documentType.toLowerCase()}` : `Nouvelle ${documentType.toLowerCase()}`}</h2><button type="button" class="close">×</button></div><div class="form-fields"><label>Client<input name="client" value="${document?.client || ''}" required></label><label>Objet<input name="title" value="${document?.title || ''}" required></label><label>Montant HT (€)<input name="amount" type="number" min="0" step="0.01" value="${document?.amount ?? ''}" required></label><label>Statut<select name="status">${statusOptions.map(status => `<option ${document?.status === status ? 'selected' : ''}>${status}</option>`).join('')}</select></label></div><div class="form-actions"><button type="button" class="secondary">Annuler</button><button class="primary">${document ? 'Enregistrer' : 'Créer'}</button></div></form>`;
    window.document.body.append(dialog); dialog.showModal();
    dialog.querySelectorAll('[type="button"]').forEach(button => button.onclick = () => dialog.close());
    dialog.addEventListener('close', () => dialog.remove());
    dialog.querySelector('form').onsubmit = event => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.target)); if (document) Object.assign(document, values, { amount: Number(values.amount) }); else docs.push({ ...values, id: Date.now(), type: documentType, number: nextNumber(documentType), amount: Number(values.amount) }); save(); dialog.close(); render(); };
  }
  window.document.addEventListener('click', event => {
    const create = event.target.closest('[data-new-document]'); if (create) form(null, create.dataset.newDocument);
    const edit = event.target.closest('[data-edit-document]'); if (edit) form(docs.find(document => document.id == edit.dataset.editDocument));
    const remove = event.target.closest('[data-delete-document]'); if (remove) { const document = docs.find(item => item.id == remove.dataset.deleteDocument); if (document && confirm(`Supprimer définitivement ${document.number} ?`)) { docs = docs.filter(item => item.id != document.id); save(); render(); } }
    const convert = event.target.closest('[data-convert]'); if (convert) { const quote = docs.find(document => document.id == convert.dataset.convert); if (quote) { docs.push({ ...quote, id: Date.now(), type: 'Facture', number: nextNumber('Facture'), status: 'En attente' }); quote.status = 'Facturé'; save(); render(); } }
    const paid = event.target.closest('[data-paid]'); if (paid) { const invoice = docs.find(document => document.id == paid.dataset.paid); if (invoice) { invoice.status = 'Réglée'; save(); render(); } }
  });
  const billing = window.document.createElement('section'); billing.id = 'billing'; billing.className = 'view'; window.document.querySelector('main').insertBefore(billing, window.document.getElementById('tasks')); render();
})();
