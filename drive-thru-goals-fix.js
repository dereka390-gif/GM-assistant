// Drive-thru goal rules: Lunch = 60 sec; every other daypart = 75 sec.
(function(){
  const LUNCH_GOAL = 60;
  const OTHER_DAYPART_GOAL = 75;

  function formatTime(v){
    if (v == null || !Number.isFinite(Number(v))) return '—';
    const sec = Math.round(Number(v));
    return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
  }

  function ensureMorningDashboard(){
    const grid = document.getElementById('daypartGrid');
    if (!grid) return;

    // The normal renderer will show Morning whenever data exists. If Morning
    // is missing (for example older saved data), still show its dashboard card
    // so the full daypart set is visible and the user knows what needs entry.
    const existing = [...grid.querySelectorAll('.daypart-card')].find(card => /\bmorning\b/i.test(card.textContent || ''));
    if (existing) return;

    const w = typeof dashData === 'function' ? dashData().cur : (typeof latest === 'function' ? latest() : null);
    const value = w?.driveMorning;
    const p = typeof dashData === 'function' ? dashData().pre : (typeof prev === 'function' ? prev() : null);
    const previous = p?.driveMorning;
    const goal = OTHER_DAYPART_GOAL;

    let label = 'No data', cls = 'neutral', tone = '#315f9b';
    if (value != null && Number.isFinite(Number(value))) {
      if (Number(value) <= goal) { label = 'Goal met'; cls = 'good'; tone = '#217a45'; }
      else if (Number(value) <= goal * 1.12) { label = 'Close to goal'; cls = 'warn'; tone = '#a56800'; }
      else { label = 'Needs focus'; cls = 'bad'; tone = '#b02d35'; }
    }

    const delta = value != null && previous != null
      ? `${Number(value) - Number(previous) >= 0 ? '+' : ''}${Math.round(Number(value) - Number(previous))} sec vs previous`
      : 'No prior period';
    const gap = value == null
      ? 'Enter Morning time in Weekly Entry'
      : Number(value) <= goal
        ? `${Math.abs(Math.round(Number(value) - goal))} sec under goal`
        : `${Math.round(Number(value) - goal)} sec over goal`;

    const card = document.createElement('div');
    card.className = 'daypart-card';
    card.style.setProperty('--tone', tone);
    card.innerHTML = `<div class="daypart-rank">Tracked daypart</div><b>Morning</b><div class="time">${formatTime(value)}</div><div class="daypart-meta">Goal ${formatTime(goal)}<br>${delta}<br>${gap}</div><span class="status ${cls}" style="margin-top:9px">${label}</span>`;
    grid.prepend(card);
  }

  function applyDriveGoals(){
    if (typeof s === 'undefined' || !s.settings) return;

    s.settings.driveGoal = OTHER_DAYPART_GOAL;
    s.settings.driveMorningGoal = OTHER_DAYPART_GOAL;
    s.settings.driveLunchGoal = LUNCH_GOAL;
    s.settings.driveAfternoonGoal = OTHER_DAYPART_GOAL;
    s.settings.driveDinnerGoal = OTHER_DAYPART_GOAL;
    s.settings.driveEveningGoal = OTHER_DAYPART_GOAL;

    if (typeof save === 'function') save();

    if (typeof daypartGoal === 'function') {
      daypartGoal = function(k){
        return k === 'driveLunch' ? LUNCH_GOAL : OTHER_DAYPART_GOAL;
      };
    }

    const form = document.getElementById('settingsForm');
    if (form) {
      const values = {
        driveGoal: OTHER_DAYPART_GOAL,
        driveMorningGoal: OTHER_DAYPART_GOAL,
        driveLunchGoal: LUNCH_GOAL,
        driveAfternoonGoal: OTHER_DAYPART_GOAL,
        driveDinnerGoal: OTHER_DAYPART_GOAL,
        driveEveningGoal: OTHER_DAYPART_GOAL
      };
      Object.entries(values).forEach(([name,value])=>{
        const input = form.elements[name];
        if (input) {
          input.value = value;
          input.readOnly = true;
          input.title = name === 'driveLunchGoal' ? 'Lunch goal is fixed at 60 seconds' : 'Non-lunch daypart goal is fixed at 75 seconds';
        }
      });

      const note = form.querySelector('.muted[style*="margin-top:10px"]');
      if (note) note.textContent = 'Drive-thru goals: Lunch = 60 seconds. Morning, Afternoon, Dinner, and Evening = 75 seconds.';
    }

    const grid = document.getElementById('daypartGrid');
    if (grid) grid.style.gridTemplateColumns = '';

    if (typeof render === 'function') render();
    ensureMorningDashboard();
  }

  applyDriveGoals();
  setTimeout(applyDriveGoals, 0);
  setTimeout(ensureMorningDashboard, 50);

  // Dashboard content is rebuilt after saves and mode changes; keep Morning visible.
  const observer = new MutationObserver(()=>ensureMorningDashboard());
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
