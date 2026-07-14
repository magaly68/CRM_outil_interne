(() => {
  const calendarId = 'dailyCalendar';
  const timeValue = task => task.time || '09:00';
  const formatTime = task => timeValue(task).replace(':', ' h ');

  function renderDailyCalendar() {
    const list = typeof db !== 'undefined' && db.tasks ? db.tasks.filter(task => task.date === '2026-07-14').sort((a, b) => timeValue(a).localeCompare(timeValue(b))) : [];
    let calendar = document.getElementById(calendarId);
    if (!calendar) {
      calendar = document.createElement('section');
      calendar.id = calendarId;
      calendar.className = 'daily-calendar panel';
      taskList.parentElement.insertBefore(calendar, taskList);
    }
    calendar.innerHTML = `<div class="panel-head"><div><p class="label">AGENDA DU JOUR</p><h3>Mardi 14 juillet</h3></div><span class="calendar-note">Heure et échéance</span></div>${list.length ? list.map(task => `<div class="calendar-entry"><time>${formatTime(task)}</time><div><strong>${task.title}</strong><small>${task.type} · ${task.done ? 'Terminée' : 'À faire'}</small></div></div>`).join('') : '<div class="empty">Aucune tâche planifiée aujourd’hui.</div>'}`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof db !== 'undefined') {
      db.tasks.forEach((task, index) => { if (!task.time) task.time = ['09:00', '14:00', '16:30'][index % 3]; });
      renderDailyCalendar();
    }
  });

  const refresh = window.render;
  if (typeof refresh === 'function') {
    window.render = () => { refresh(); renderDailyCalendar(); };
  }
})();
