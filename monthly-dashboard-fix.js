// Simplify the dashboard to one monthly performance view.
(function(){
  function applyMonthlyOnly(){
    if (typeof dashMode !== 'undefined') dashMode = 'monthly';

    // Remove the Weekly / Monthly toggle from the dashboard.
    const modebar = document.querySelector('#dash .modebar');
    if (modebar) modebar.style.display = 'none';

    // Keep any internal calls locked to the monthly rollup.
    if (typeof setDashMode === 'function') {
      setDashMode = function(){
        dashMode = 'monthly';
        if (typeof renderDashboard === 'function') renderDashboard();
      };
    }

    // Update copy that still refers to a weekly dashboard summary.
    const gradeLabel = document.querySelector('#weeklyGrade')?.previousElementSibling;
    if (gradeLabel && gradeLabel.classList.contains('muted')) gradeLabel.textContent = 'Monthly grade';

    const winsHeading = document.querySelector('#wins')?.closest('.card')?.querySelector('h2');
    const winsEyebrow = document.querySelector('#wins')?.closest('.card')?.querySelector('.eyebrow');
    if (winsEyebrow) winsEyebrow.textContent = 'Monthly wins';
    if (winsHeading) winsHeading.textContent = 'What Went Well';

    // Re-render using the current month's saved weekly entries.
    if (typeof renderDashboard === 'function') renderDashboard();
  }

  applyMonthlyOnly();
  setTimeout(applyMonthlyOnly, 0);
})();
