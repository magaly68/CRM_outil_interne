(() => {
  const enhancementToday = new Date().toISOString().slice(0, 10);
  const root = document.querySelector("main");
  const nav = document.querySelector(".sidebar nav");
  const makeView = (id, label, icon) => {
    const link = document.createElement("a");
    link.className = "nav-link";
    link.dataset.view = id;
    link.innerHTML = `${icon} <span>${label}</span>`;
    nav.append(link);
    const section = document.createElement("section");
    section.id = id;
    section.className = "view";
    root.insertBefore(section, document.getElementById("tasks"));
    return section;
  };
  const clients = makeView("clients", "Clients", "●");
  const kanban = makeView("kanban", "Kanban", "▦");
  const insights = makeView("insights", "Indicateurs", "◌");
  const esc = (value) =>
    String(value || "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const currency = (value) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  let activities = JSON.parse(
    localStorage.getItem("claircrm-activities-v1"),
  ) || [
    {
      id: 1,
      contact: 1,
      type: "Appel",
      text: "Premier échange sur les besoins du projet.",
      date: enhancementToday,
    },
  ];
  const saveActivities = () =>
    localStorage.setItem("claircrm-activities-v1", JSON.stringify(activities));

  function drawClients() {
    clients.innerHTML = `<div class="section-head"><div><p class="label">RELATION CLIENT</p><h2>Fiches clients</h2></div></div><div class="client-grid">${db.contacts
      .map((c) => {
        const related = db.opportunities.filter((o) => o.company === c.company);
        const history = activities.filter((a) => a.contact == c.id);
        return `<article class="client-card"><div class="client-title"><div class="avatar">${c.name
          .split(" ")
          .map((x) => x[0])
          .join(
            "",
          )}</div><div><h3>${esc(c.name)}</h3><small>${esc(c.company)}</small></div></div><p>${esc(c.email)} · ${esc(c.phone)}</p><div class="client-summary"><span>${related.length} opportunité(s)</span><span>${history.length} activité(s)</span></div><div class="activity-list">${history.map((a) => `<div><strong>${a.type}</strong><small>${a.text} · ${a.date}</small></div>`).join("") || "<small>Aucune activité enregistrée.</small>"}</div><button class="secondary add-activity" data-contact="${c.id}">+ Ajouter une note</button></article>`;
      })
      .join("")}</div>`;
  }
  function drawKanban() {
    kanban.innerHTML = `<div class="section-head"><div><p class="label">VISUALISATION</p><h2>Pipeline Kanban</h2></div></div><p class="help">Utilisez les boutons pour faire avancer une opportunité dans votre pipeline.</p><div class="pipeline">${stages
      .map(
        (stage, index) =>
          `<div class="stage-column"><div class="stage-title">${stage}<span>${db.opportunities.filter((o) => o.stage === stage).length}</span></div>${
            db.opportunities
              .filter((o) => o.stage === stage)
              .map(
                (o) =>
                  `<article class="deal-card"><strong>${esc(o.title)}</strong><p>${esc(o.company)}</p><div class="deal-footer"><span>${currency(o.amount)}</span>${index < stages.length - 1 ? `<button class="secondary move-deal" data-id="${o.id}" data-stage="${stages[index + 1]}">Avancer →</button>` : ""}</div></article>`,
              )
              .join("") || '<div class="empty">Aucune opportunité</div>'
          }</div>`,
      )
      .join("")}</div>`;
  }
  function drawInsights() {
    const total = db.opportunities.reduce((s, o) => s + Number(o.amount), 0),
      won = db.opportunities.filter((o) => o.stage === "Gagnée"),
      rate = db.opportunities.length
        ? Math.round((won.length / db.opportunities.length) * 100)
        : 0;
    const openTasks = db.tasks.filter((t) => !t.done),
      late = openTasks.filter((t) => t.date < enhancementToday).length;
    insights.innerHTML = `<div class="section-head"><div><p class="label">PILOTAGE</p><h2>Indicateurs clés</h2></div><button class="secondary" id="exportData">Exporter les données CSV</button></div><div class="insight-grid"><div class="metric"><p>Pipeline total</p><strong>${currency(total)}</strong></div><div class="metric"><p>Taux de conversion</p><strong>${rate}%</strong></div><div class="metric"><p>Tâches en retard</p><strong>${late}</strong></div><div class="metric"><p>Projets actifs</p><strong>${db.projects.filter((p) => p.status === "En cours").length}</strong></div></div><article class="panel"><p class="label">LECTURE RAPIDE</p><h3>Priorités d’action</h3><ul class="insight-list"><li>${late ? `${late} tâche(s) en retard à traiter.` : "Aucune tâche en retard."}</li><li>${db.opportunities.filter((o) => o.stage === "Proposition").length} proposition(s) à relancer.</li><li>${won.length} opportunité(s) gagnée(s) dans le pipeline.</li></ul></article>`;
  }
  function reminder() {
    const late = db.tasks.filter(
      (t) => !t.done && t.date < enhancementToday,
    ).length;
    const existing = document.getElementById("reminderBar");
    if (existing) existing.remove();
    if (!late) return;
    const bar = document.createElement("div");
    bar.id = "reminderBar";
    bar.className = "reminder-bar";
    bar.innerHTML = `<strong>Relance nécessaire :</strong> ${late} tâche(s) en retard. <button data-view="tasks">Voir les tâches</button>`;
    document.querySelector(".topbar").after(bar);
  }
  function exportCsv() {
    const rows = [
      ["Type", "Nom", "Entreprise", "Montant", "Statut"],
      ...db.contacts.map((c) => ["Contact", c.name, c.company, "", ""]),
      ...db.opportunities.map((o) => [
        "Opportunité",
        o.title,
        o.company,
        o.amount,
        o.stage,
      ]),
      ...db.projects.map((p) => ["Projet", p.name, "", "", p.status]),
    ];
    const blob = new Blob(
      [
        rows
          .map((r) =>
            r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(";"),
          )
          .join("\n"),
      ],
      { type: "text/csv;charset=utf-8" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "claircrm-export.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function pdf() {
    const w = window.open("", "_blank");
    w.document.write(
      `<!doctype html><html><head><title>Document commercial</title><style>body{font:16px Arial;padding:45px;color:#172539}h1{color:#157a67}table{width:100%;border-collapse:collapse;margin-top:25px}td,th{border-bottom:1px solid #ddd;padding:12px;text-align:left}.total{font-size:22px;font-weight:bold;text-align:right;margin-top:25px}</style></head><body><h1>ClairCRM - Document commercial</h1><p>Date : ${enhancementToday}</p><table><tr><th>Objet</th><th>Client</th><th>Montant HT</th></tr>${db.opportunities.map((o) => `<tr><td>${esc(o.title)}</td><td>${esc(o.company)}</td><td>${currency(o.amount)}</td></tr>`).join("")}</table><p class="total">Total : ${currency(db.opportunities.reduce((s, o) => s + Number(o.amount), 0))}</p><p>Document généré depuis ClairCRM.</p></body></html>`,
    );
    w.document.close();
    w.print();
  }
  function note(contact) {
    const text = prompt("Note ou compte-rendu à ajouter :");
    if (!text) return;
    activities.push({
      id: Date.now(),
      contact: Number(contact),
      type: "Note",
      text,
      date: enhancementToday,
    });
    saveActivities();
    drawClients();
  }
  document.addEventListener("click", (e) => {
    const move = e.target.closest(".move-deal");
    if (move) {
      db.opportunities.find((o) => o.id == move.dataset.id).stage =
        move.dataset.stage;
      save();
      drawKanban();
      drawInsights();
    }
    const noteButton = e.target.closest(".add-activity");
    if (noteButton) note(noteButton.dataset.contact);
    if (e.target.id === "exportData") exportCsv();
    if (e.target.closest("#createPdf")) pdf();
  });
  const search = document.createElement("input");
  search.id = "globalSearch";
  search.type = "search";
  search.placeholder = "Rechercher partout…";
  document.querySelector(".topbar").prepend(search);
  search.addEventListener("input", () => {
    const q = search.value.toLowerCase();
    document
      .querySelectorAll(".client-card,.deal-card,.task-item,.billing-row")
      .forEach((el) =>
        el.classList.toggle(
          "search-hidden",
          q && !el.textContent.toLowerCase().includes(q),
        ),
      );
  });
  const observer = new MutationObserver(() => {
    const bill = document.getElementById("billing");
    if (bill && !document.getElementById("createPdf")) {
      const b = document.createElement("button");
      b.id = "createPdf";
      b.className = "secondary";
      b.textContent = "Générer PDF";
      bill.querySelector(".section-head")?.append(b);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  const originalRender = window.render;
  if (typeof originalRender === "function")
    window.render = () => {
      originalRender();
      drawClients();
      drawKanban();
      drawInsights();
      reminder();
    };
  drawClients();
  drawKanban();
  drawInsights();
  reminder();
})();
