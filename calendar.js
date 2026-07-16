(() => {
  let month = new Date();
  month.setDate(1);
  const section = document.createElement("section"),
    nav = document.createElement("a"),
    fmt = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }),
    days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    iso = (d) => d.toISOString().slice(0, 10);
  section.id = "calendar";
  section.className = "view";
  document
    .querySelector("main")
    .insertBefore(section, document.getElementById("tasks"));
  nav.className = "nav-link";
  nav.dataset.view = "calendar";
  nav.innerHTML = "▣ <span>Calendrier</span>";
  document.querySelector(".sidebar nav").append(nav);
  function draw() {
    const start = new Date(month);
    start.setDate(1 - ((start.getDay() + 6) % 7));
    section.innerHTML = `<div class="section-head"><div><p class="label">PLANIFICATION</p><h2>Calendrier</h2></div><div class="calendar-actions"><button class="secondary" data-cal-nav="-1">←</button><strong>${fmt.format(month)}</strong><button class="secondary" data-cal-nav="1">→</button><button class="primary" data-cal-add="appointment">+ Rendez-vous</button><button class="secondary" data-cal-add="task">+ Tâche</button></div></div><div class="calendar-weekdays">${days.map((x) => `<span>${x}</span>`).join("")}</div><div class="month-grid">${Array.from(
      { length: 42 },
      (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const value = iso(d),
          events = db.tasks
            .filter((t) => t.date === value)
            .sort((a, b) => (a.time || "").localeCompare(b.time || ""));
        return `<div class="calendar-day ${d.getMonth() !== month.getMonth() ? "outside" : ""}"><button class="calendar-date" data-cal-date="${value}">${d.getDate()}</button>${events.map((t) => `<button class="calendar-event ${t.kind === "appointment" || t.type === "Rendez-vous" ? "appointment" : ""}" data-cal-edit="${t.id}"><span>${t.time || "—"}</span>${t.title}</button>`).join("")}</div>`;
      },
    ).join("")}</div>`;
  }
  document.addEventListener("click", (e) => {
    const move = e.target.closest("[data-cal-nav]");
    if (move) {
      month.setMonth(month.getMonth() + Number(move.dataset.calNav));
      draw();
    }
    const add = e.target.closest("[data-cal-add]");
    if (add) dialog(add.dataset.calAdd);
    const d = e.target.closest("[data-cal-date]");
    if (d) dialog("task", null, d.dataset.calDate);
    const edit = e.target.closest("[data-cal-edit]");
    if (edit)
      dialog(
        "task",
        db.tasks.find((t) => t.id == edit.dataset.calEdit),
      );
  });
  document.addEventListener("claircrm:updated", draw);
  draw();
})();
