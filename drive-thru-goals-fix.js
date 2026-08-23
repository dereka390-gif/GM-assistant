// Drive-thru goal rules: Lunch = 60 sec; every other daypart = 75 sec.
(function(){
  const LUNCH_GOAL = 60;
  const OTHER_DAYPART_GOAL = 75;

  function applyDriveGoals(){
    if (typeof s === 'undefined' || !s.settings) return;

    // Keep all five dayparts, including Morning, so the daypart average is complete.
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
  }

  applyDriveGoals();
  setTimeout(applyDriveGoals, 0);
})();
