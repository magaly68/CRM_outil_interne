const key = "claircrm-data-v2",
  today = new Date().toISOString().slice(0, 10),
  stages = ["Prospection", "Qualification", "Proposition", "Gagnée"];
const seed = {
  contacts: [
    {
      id: 1,
      name: "Sophie Martin",
      company: "Studio M.",
      email: "sophie@studiom.fr",
      phone: "06 12 34 56 78",
    },
    {
      id: 2,
      name: "Thomas Bernard",
      company: "Atelier Nord",
      email: "thomas@ateliernord.fr",
      phone: "06 83 21 45 90",
    },
  ],
  opportunities: [
    {
      id: 1,
      title: "Refonte site vitrine",
      contact: "",
      company: "",
      amount: 4800,
      stage: "Qualification",
    },
    {
      id: 2,
      title: "Accompagnement SEO",
      contact: "",
      company: "",
      amount: 3200,
      stage: "Proposition",
    },
  ],
  tasks: [
    {
      id: 1,
      title: "Préparer la proposition",
      date: today,
      time: "09:00",
      type: "Opportunité",
      done: false,
    },
    {
      id: 2,
      title: "Appeler",
      date: today,
      time: "14:00",
      type: "Relance",
      done: false,
    },
  ],
  projects: [],
};
let db = JSON.parse(localStorage.getItem(key)) || seed,
  selectedProject = db.projects[0]?.id,
  taskFilter = "all",
  formType = "",
  editing = null;
const save = () => {
    localStorage.setItem(key, JSON.stringify(db));
    document.dispatchEvent(new CustomEvent("claircrm:updated"));
  },
  money = (n) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n),
  date = (d) =>
    new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(
      new Date(d + "T12:00"),
    );

currentDate.textContent = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
})
  .format(new Date())
  .toUpperCase();

function dashboard() {
  const open = db.opportunities.filter((o) => o.stage !== "Gagnée"),
    total = open.reduce((a, o) => a + Number(o.amount), 0);
  metrics.innerHTML = [
    ["Contacts", db.contacts.length],
    ["Opportunités", open.length],
    ["Pipeline", money(total)],
    ["Tâches ouvertes", db.tasks.filter((t) => !t.done).length],
  ]
    .map(
      (x) => `<div class="metric"><p>${x[0]}</p><strong>${x[1]}</strong></div>`,
    )
    .join("");
  dashboardOpportunities.innerHTML = open
    .map(
      (o) =>
        `<div class="opportunity-row"><div><strong>${o.title}</strong><small>${o.company}</small></div><div class="amount">${money(o.amount)}</div></div>`,
    )
    .join("");
  dashboardTasks.innerHTML = db.tasks
    .filter((t) => !t.done)
    .slice(0, 5)
    .map(
      (t) =>
        `<div class="task-mini"><div class="due"><span>${date(t.date).split(" ")[0]}</span>${date(t.date).split(" ")[1]}</div><div class="task-content"><strong>${t.title}</strong><small>${t.type}${t.time ? ` · ${t.time}` : ""}</small></div></div>`,
    )
    .join("");
}
function contacts() {
  const q = contactSearch.value.toLowerCase(),
    rows = db.contacts.filter((c) =>
      Object.values(c).join(" ").toLowerCase().includes(q),
    );
  contactCount.textContent = `${rows.length} contact(s)`;
  contactsTable.innerHTML = rows
    .map(
      (c) =>
        `<tr><td><div class="contact-cell"><div class="avatar">${c.name
          .split(" ")
          .map((x) => x[0])
          .join(
            "",
          )}</div><strong>${c.name}</strong></div></td><td>${c.company}</td><td>${c.email}</td><td>${c.phone}</td><td><button class="icon-button" title="Modifier" data-edit="contact" data-id="${c.id}">✎</button><button class="icon-button" title="Supprimer" data-del="contacts" data-id="${c.id}">×</button></td></tr>`,
    )
    .join("");
}
function opportunities() {
  pipeline.innerHTML = stages
    .map((s) => {
      const items = db.opportunities.filter((o) => o.stage === s);
      return `<div class="stage-column"><div class="stage-title">${s}<span>${items.length}</span></div>${items.map((o) => `<article class="deal-card"><strong>${o.title}</strong><p>${o.company}</p><div class="deal-footer"><span>${money(o.amount)}</span><button class="icon-button" data-del="opportunities" data-id="${o.id}">×</button></div></article>`).join("") || '<div class="empty">Aucune opportunité</div>'}</div>`;
    })
    .join("");
}
function tasks() {
  const list = db.tasks.filter(
    (t) =>
      taskFilter === "all" ||
      (taskFilter === "today" && t.date === today) ||
      (taskFilter === "late" && t.date < today && !t.done),
  );
  taskList.innerHTML =
    list
      .map(
        (t) =>
          `<div class="task-item ${t.done ? "done" : ""}"><input class="check" type="checkbox" data-task="${t.id}" ${t.done ? "checked" : ""}><div class="task-content"><strong>${t.title}</strong><small>${t.type}${t.time ? ` · ${t.time}` : ""}</small></div><span class="task-date">${date(t.date)}</span><button class="icon-button" title="Modifier" data-edit="task" data-id="${t.id}">✎</button></div>`,
      )
      .join("") || '<div class="empty">Aucune tâche.</div>';
  taskBadge.textContent = db.tasks.filter((t) => !t.done).length;
}
function projects() {
  const p = db.projects.find((x) => x.id === selectedProject);
  projectList.innerHTML = db.projects
    .map(
      (x) =>
        `<button class="project-card ${x.id === selectedProject ? "selected" : ""}" data-project="${x.id}"><strong>${x.name}</strong><small>${x.status}</small></button>`,
    )
    .join("");
  projectDetail.innerHTML = p
    ? `<p class="label">${p.status}</p><h3>${p.name}</h3><p>${p.description || ""}</p>`
    : '<div class="empty">Créez un projet pour commencer.</div>';
}
function render() {
  dashboard();
  contacts();
  opportunities();
  tasks();
  projects();
}
function fields(type) {
  return (
    {
      contact: [
        ["name", "Nom complet", "text", 1],
        ["company", "Entreprise", "text"],
        ["email", "E-mail", "email"],
        ["phone", "Téléphone", "tel"],
      ],
      opportunity: [
        ["title", "Intitulé", "text", 1],
        ["company", "Entreprise", "text"],
        ["amount", "Montant (€)", "number", 1],
        ["stage", "Étape", "select"],
      ],
      task: [
        ["title", "Tâche", "text", 1],
        ["type", "Type", "text"],
        ["date", "Échéance", "date", 1],
        ["time", "Heure", "time"],
      ],
      appointment: [
        ["title", "Rendez-vous", "text", 1],
        ["type", "Type", "text"],
        ["date", "Date", "date", 1],
        ["time", "Heure", "time", 1],
      ],
      project: [
        ["name", "Nom du projet", "text", 1],
        ["description", "Description", "text"],
      ],
    }[type] || []
  );
}
function dialog(type, record = null, presetDate = "") {
  formType = type;
  editing = record;
  const names = {
    contact: "contact",
    opportunity: "opportunité",
    task: "tâche",
    appointment: "rendez-vous",
    project: "projet",
  };
  dialogTitle.textContent = `${record ? "Modifier" : "Nouveau"} ${names[type]}`;
  formFields.innerHTML = fields(type)
    .map(([name, label, input, required]) => {
      const value =
        record?.[name] ??
        (name === "date"
          ? presetDate || today
          : name === "time"
            ? "09:00"
            : type === "appointment" && name === "type"
              ? "Rendez-vous"
              : "");
      return `<label>${label}${input === "select" ? `<select name="${name}">${(name === "stage" ? stages : []).map((v) => `<option ${v === value ? "selected" : ""}>${v}</option>`).join("")}</select>` : `<input name="${name}" type="${input}" value="${value}" ${required ? "required" : ""}>`}</label>`;
    })
    .join("");
  formDialog.showModal();
}
document.addEventListener("click", (e) => {
  const nav = e.target.closest("[data-view]");
  if (nav) {
    document
      .querySelectorAll(".view,.nav-link")
      .forEach((x) => x.classList.remove("active"));
    nav.classList.add("active");
    document.getElementById(nav.dataset.view)?.classList.add("active");
    pageTitle.textContent =
      {
        dashboard: "Bonjour, Magaly",
        contacts: "Contacts",
        opportunities: "Opportunités",
        projects: "Projets",
        tasks: "Tâches",
        calendar: "Calendrier",
      }[nav.dataset.view] || "ClairCRM";
  }
  const add = e.target.closest("[data-add]");
  if (add) dialog(add.dataset.add);
  if (e.target.id === "quickAdd") dialog("contact");
  const p = e.target.closest("[data-project]");
  if (p) {
    selectedProject = Number(p.dataset.project);
    projects();
  }
  const del = e.target.closest("[data-del]");
  if (del) {
    db[del.dataset.del] = db[del.dataset.del].filter(
      (x) => x.id != del.dataset.id,
    );
    save();
    render();
  }
  const edit = e.target.closest("[data-edit]");
  if (edit) {
    const items = edit.dataset.edit === "contact" ? db.contacts : db.tasks;
    dialog(
      edit.dataset.edit,
      items.find((x) => x.id == edit.dataset.id),
    );
  }
  const filter = e.target.closest("[data-filter]");
  if (filter) {
    taskFilter = filter.dataset.filter;
    document
      .querySelectorAll(".filter")
      .forEach((x) => x.classList.toggle("active", x === filter));
    tasks();
  }
});
document.addEventListener("change", (e) => {
  if (e.target.dataset.task) {
    db.tasks.find((t) => t.id == e.target.dataset.task).done = e.target.checked;
    save();
    render();
  }
});
contactSearch.addEventListener("input", contacts);
entityForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const values = Object.fromEntries(new FormData(entityForm));
  if (editing) Object.assign(editing, values);
  else if (formType === "contact")
    db.contacts.push({ ...values, id: Date.now() });
  else if (formType === "opportunity")
    db.opportunities.push({
      ...values,
      id: Date.now(),
      amount: Number(values.amount),
      contact: "",
    });
  else if (formType === "task" || formType === "appointment")
    db.tasks.push({ ...values, id: Date.now(), done: false, kind: formType });
  else if (formType === "project") {
    db.projects.push({ ...values, id: Date.now(), status: "En cours" });
    selectedProject = db.projects.at(-1).id;
  }
  editing = null;
  save();
  formDialog.close();
  render();
});
render();
