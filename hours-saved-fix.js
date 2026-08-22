(() => {
  const originalStatusFor = statusFor;
  const originalHealthScore = healthScore;
  const originalSubscores = subscores;
  const originalPriorities = priorities;
  const originalRenderDashboard = renderDashboard;

  function monthlyLaborGoal() {
    const goal = Number(s.settings.laborGoal);
    return Number.isFinite(goal) && goal > 0 ? goal : 40;
  }

  function weeklyLaborGoal() {
    return monthlyLaborGoal() / 4;
  }

  function activeLaborGoal() {
    return dashMode === 'monthly' ? monthlyLaborGoal() : weeklyLaborGoal();
  }

  function withActiveLaborGoal(fn, args) {
    const savedGoal = s.settings.laborGoal;
    s.settings.laborGoal = activeLaborGoal();
    try {
      return fn(...args);
    } finally {
      s.settings.laborGoal = savedGoal;
    }
  }

  statusFor = function(k, v) {
    if (k !== 'laborHoursSaved') return originalStatusFor(k, v);
    return withActiveLaborGoal(originalStatusFor, [k, v]);
  };

  healthScore = function(w) {
    return withActiveLaborGoal(originalHealthScore, [w]);
  };

  subscores = function(w) {
    return withActiveLaborGoal(originalSubscores, [w]);
  };

  priorities = function(w, p) {
    return withActiveLaborGoal(originalPriorities, [w, p]);
  };

  function updateLaborLabels() {
    const weeklyInput = weekForm?.elements?.laborHoursSaved;
    const weeklyLabel = weeklyInput?.closest('label');
    if (weeklyLabel?.firstChild) weeklyLabel.firstChild.textContent = 'Labor hours saved this week';

    const goalInput = settingsForm?.elements?.laborGoal;
    const goalLabel = goalInput?.closest('label');
    if (goalLabel?.firstChild) goalLabel.firstChild.textContent = 'Labor monthly goal (hrs)';
  }

  function decorateLaborCard() {
    const laborCard = [...document.querySelectorAll('#cards .metric')]
      .find(card => card.querySelector('.eyebrow')?.textContent.trim() === 'Labor Saved');
    if (!laborCard) return;

    laborCard.querySelector('.labor-goal-note')?.remove();
    const note = document.createElement('div');
    note.className = 'muted labor-goal-note';
    note.style.cssText = 'font-size:12px;margin-top:8px;line-height:1.4';
    const weekly = fmt('laborHoursSaved', weeklyLaborGoal());
    const monthly = fmt('laborHoursSaved', monthlyLaborGoal());
    note.textContent = dashMode === 'monthly'
      ? `Monthly goal ${monthly} · Weekly pace ${weekly}`
      : `Weekly target ${weekly} · Monthly goal ${monthly}`;
    laborCard.appendChild(note);
  }

  renderDashboard = function() {
    originalRenderDashboard();
    updateLaborLabels();
    decorateLaborCard();
  };

  updateLaborLabels();
  renderDashboard();
})();
