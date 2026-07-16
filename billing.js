(() => {
  const storageKey = "claircrm-billing-v1";
  const maxFileSize = 2 * 1024 * 1024;
  let documents = JSON.parse(localStorage.getItem(storageKey)) || [];

  const money = (amount) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  const save = () =>
    localStorage.setItem(storageKey, JSON.stringify(documents));
  const nextNumber = (type) =>
    `${type === "Devis" ? "DEV" : "FAC"}-${new Date().getFullYear()}-${String(documents.filter((document) => document.type === type).length + 1).padStart(3, "0")}`;

  function actions(document) {
    const primaryAction =
      document.type === "Devis"
        ? `<button class="secondary bill-action" data-convert="${document.id}">Facturer</button>`
        : document.status !== "Réglée"
          ? `<button class="secondary bill-action" data-paid="${document.id}">Marquer réglée</button>`
          : "";
    return `<div class="billing-actions">${primaryAction}<button class="icon-button" title="Modifier" data-edit-document="${document.id}">✎</button><button class="icon-button danger" title="Supprimer" data-delete-document="${document.id}">×</button></div>`;
  }

  function rows(items) {
    return (
      items
        .map(
          (document) =>
            `<div class="billing-row"><div><strong>${document.number} · ${document.client}</strong><small>${document.title}</small>${document.attachment ? `<a class="document-link" href="${document.attachment.data}" download="${document.attachment.name}">📎 ${document.attachment.name}</a>` : ""}</div><div><strong>${money(document.amount)}</strong><small class="invoice-status">${document.status}</small></div>${actions(document)}</div>`,
        )
        .join("") || '<div class="empty">Aucun document.</div>'
    );
  }

  function render() {
    const quotes = documents.filter((document) => document.type === "Devis");
    const invoices = documents.filter(
      (document) => document.type === "Facture",
    );
    const due = invoices
      .filter((document) => document.status === "En attente")
      .reduce((sum, document) => sum + Number(document.amount), 0);
    billing.innerHTML = `<div class="section-head"><div><p class="label">GESTION FINANCIÈRE</p><h2>Facturation</h2></div><div class="billing-create-actions"><button class="secondary" data-new-document="Facture">+ Nouvelle facture</button><button class="primary" data-new-document="Devis">+ Nouveau devis</button></div></div><section class="document-import panel"><div><p class="label">IMPORTER UN DOCUMENT</p><h3>Ajoutez une facture ou un devis existant</h3><p>PDF, image ou CSV — fichier conservé dans ce navigateur.</p></div><button class="primary" data-import-file>Importer un document</button></section><div class="billing-metrics"><div class="metric"><p>Devis en cours</p><strong>${quotes.length}</strong></div><div class="metric"><p>À encaisser</p><strong>${money(due)}</strong></div><div class="metric"><p>Factures réglées</p><strong>${invoices.filter((document) => document.status === "Réglée").length}</strong></div></div><div class="billing-grid"><article class="panel"><div class="panel-head"><div><p class="label">DEVIS</p><h3>Propositions commerciales</h3></div></div>${rows(quotes)}</article><article class="panel"><div class="panel-head"><div><p class="label">FACTURES</p><h3>Suivi des règlements</h3></div></div>${rows(invoices)}</article></div>`;
  }

  function openForm(
    document = null,
    importedFile = null,
    documentType = "Devis",
  ) {
    const type = document?.type || documentType;
    const dialog = window.document.createElement("dialog");
    dialog.innerHTML = `<form><div class="dialog-head"><h2>${document ? "Modifier" : importedFile ? "Importer un document" : "Nouveau document"}</h2><button type="button" class="close">×</button></div><div class="form-fields"><label>Type<select name="type"><option ${type === "Devis" ? "selected" : ""}>Devis</option><option ${type === "Facture" ? "selected" : ""}>Facture</option></select></label>${importedFile ? `<label>Fichier<input name="file" type="file" accept="application/pdf,image/*,.csv,text/csv" required></label>` : ""}<label>Client<input name="client" value="${document?.client || ""}" required></label><label>Objet<input name="title" value="${document?.title || importedFile?.name.replace(/\.[^.]+$/, "") || ""}" required></label><label>Montant HT (€)<input name="amount" type="number" min="0" step="0.01" value="${document?.amount ?? ""}" required></label><label>Statut<select name="status"><option ${document?.status === "À envoyer" ? "selected" : ""}>À envoyer</option><option ${document?.status === "Accepté" ? "selected" : ""}>Accepté</option><option ${document?.status === "En attente" ? "selected" : ""}>En attente</option><option ${document?.status === "Réglée" ? "selected" : ""}>Réglée</option></select></label></div>${importedFile ? '<p class="import-notice">Taille maximale : 2 Mo. Le fichier est stocké uniquement dans ce navigateur.</p>' : ""}<div class="form-actions"><button type="button" class="secondary">Annuler</button><button class="primary">${document ? "Enregistrer" : importedFile ? "Importer" : "Créer"}</button></div></form>`;
    window.document.body.append(dialog);
    dialog.showModal();
    dialog
      .querySelectorAll('[type="button"]')
      .forEach((button) => (button.onclick = () => dialog.close()));
    dialog.addEventListener("close", () => dialog.remove());
    dialog.querySelector("form").onsubmit = async (event) => {
      event.preventDefault();
      const values = Object.fromEntries(new FormData(event.target));
      let attachment = document?.attachment;
      if (importedFile) {
        const file = event.target.elements.file.files[0];
        if (file.size > maxFileSize)
          return alert("Le fichier dépasse la limite de 2 Mo.");
        attachment = {
          name: file.name,
          type: file.type,
          data: await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          }),
        };
      }
      const payload = {
        type: values.type,
        client: values.client,
        title: values.title,
        amount: Number(values.amount),
        status: values.status,
        attachment,
      };
      if (document) Object.assign(document, payload);
      else
        documents.push({
          id: Date.now(),
          number: nextNumber(payload.type),
          ...payload,
        });
      save();
      dialog.close();
      render();
    };
  }

  window.document.addEventListener("click", (event) => {
    const create = event.target.closest("[data-new-document]");
    if (create) openForm(null, null, create.dataset.newDocument);
    if (event.target.closest("[data-import-file]")) openImportPicker();
    const edit = event.target.closest("[data-edit-document]");
    if (edit)
      openForm(
        documents.find((document) => document.id == edit.dataset.editDocument),
      );
    const remove = event.target.closest("[data-delete-document]");
    if (remove) {
      const document = documents.find(
        (item) => item.id == remove.dataset.deleteDocument,
      );
      if (
        document &&
        confirm(`Supprimer définitivement ${document.number} ?`)
      ) {
        documents = documents.filter((item) => item.id !== document.id);
        save();
        render();
      }
    }
    const convert = event.target.closest("[data-convert]");
    if (convert) {
      const quote = documents.find(
        (document) => document.id == convert.dataset.convert,
      );
      if (quote) {
        documents.push({
          ...quote,
          id: Date.now(),
          type: "Facture",
          number: nextNumber("Facture"),
          status: "En attente",
        });
        quote.status = "Facturé";
        save();
        render();
      }
    }
    const paid = event.target.closest("[data-paid]");
    if (paid) {
      const invoice = documents.find(
        (document) => document.id == paid.dataset.paid,
      );
      if (invoice) {
        invoice.status = "Réglée";
        save();
        render();
      }
    }
  });

  function openImportPicker() {
    const input = window.document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf,image/*,.csv,text/csv";
    input.onchange = () => input.files[0] && openForm(null, input.files[0]);
    input.click();
  }

  const billing = window.document.createElement("section");
  billing.id = "billing";
  billing.className = "view";
  window.document
    .querySelector("main")
    .insertBefore(billing, window.document.getElementById("tasks"));
  render();
})();
