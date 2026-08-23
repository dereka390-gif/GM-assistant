// Drive-thru goal rules: Lunch = 60 sec; every other daypart = 75 sec.
(function(){
  const LUNCH_GOAL = 60;
  const OTHER_DAYPART_GOAL = 75;

  function applyDriveGoals(){
    if (typeof s === 'undefined' || !s.settings) return;

    // Keep saved settings aligned with the operating standard so older
    // localStorage values cannot fall back to the previous 120-sec goal.
    s.settings.driveGoal = OTHER_DAYPART_GOAL;
    s.settings.driveMorningGoal = OTHER_DAYPART_GOAL;
    s.settings.driveLunchGoal = LUNCH_GOAL;
    s.settings.driveAfternoonGoal = OTHER_DAYPART_GOAL;
    s.settings.driveDinnerGoal = OTHER_DAYPART_GOAL;
    s.settings.driveEveningGoal = OTHER_DAYPART_GOAL;

    if (typeof save === 'function') save();

    // Make the daypart rule authoritative everywhere in the dashboard.
    if (typeof daypartGoal === 'function') {
      daypartGoal = function(k){
        return k === 'driveLunch' ? LUNCH_GOAL : OTHER_DAYPART_GOAL;
      };
    }

    // Reflect the fixed standards in Settings and prevent accidental edits.
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

    // Re-render so goal status, goals hit, alerts, and daypart cards all update.
    if (typeof render === 'function') render();
  }

  // Run after the main app initializes, then once more on the next tick in
  // case another injected fix script renders after this one.
  applyDriveGoals();
  setTimeout(applyDriveGoals, 0);
})();
