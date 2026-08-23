// Drive-thru goal rules: Lunch = 60 sec; tracked non-lunch dayparts = 75 sec.
// Morning is intentionally not tracked.
(function(){
  const LUNCH_GOAL = 60;
  const OTHER_DAYPART_GOAL = 75;

  function removeMorningTracking(){
    // Weekly Entry / Settings: remove any field that stores a morning drive-thru value or goal.
    document.querySelectorAll('input[name="driveMorning"], input[name="driveMorningGoal"]').forEach(input=>{
      const wrapper = input.closest('label') || input.parentElement;
      if (wrapper) wrapper.remove();
    });

    // Dashboard / dynamically rendered daypart cards: remove Morning cards only.
    document.querySelectorAll('.daypart-card,.daypart-stat').forEach(card=>{
      const text = (card.textContent || '').trim();
      if (/\bmorning\b/i.test(text)) card.remove();
    });

    // Keep the daypart layout sized to the remaining tracked periods.
    const grid = document.getElementById('daypartGrid');
    if (grid) grid.style.gridTemplateColumns = 'repeat(4,1fr)';

    // Remove the obsolete saved setting/value from the current in-memory state.
    if (typeof s !== 'undefined') {
      if (s.settings && Object.prototype.hasOwnProperty.call(s.settings,'driveMorningGoal')) delete s.settings.driveMorningGoal;
      if (Array.isArray(s.weeks)) s.weeks.forEach(w=>{ if (w && Object.prototype.hasOwnProperty.call(w,'driveMorning')) delete w.driveMorning; });
    }
  }

  function applyDriveGoals(){
    if (typeof s === 'undefined' || !s.settings) {
      removeMorningTracking();
      return;
    }

    s.settings.driveGoal = OTHER_DAYPART_GOAL;
    s.settings.driveLunchGoal = LUNCH_GOAL;
    s.settings.driveAfternoonGoal = OTHER_DAYPART_GOAL;
    s.settings.driveDinnerGoal = OTHER_DAYPART_GOAL;
    s.settings.driveEveningGoal = OTHER_DAYPART_GOAL;
    delete s.settings.driveMorningGoal;

    if (Array.isArray(s.weeks)) s.weeks.forEach(w=>{ if (w) delete w.driveMorning; });
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
      if (note) note.textContent = 'Drive-thru goals: Lunch = 60 seconds. Afternoon, Dinner, and Evening = 75 seconds.';
    }

    if (typeof render === 'function') render();
    removeMorningTracking();
  }

  applyDriveGoals();
  setTimeout(applyDriveGoals, 0);

  // Some dashboard sections are rebuilt after saves/mode changes. Keep Morning out when that happens.
  const observer = new MutationObserver(removeMorningTracking);
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
