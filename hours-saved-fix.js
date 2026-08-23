(() => {
  const originalStatusFor = statusFor;
  const originalHealthScore = healthScore;
  const originalSubscores = subscores;
  const originalPriorities = priorities;
  const originalRenderDashboard = renderDashboard;
  const originalRollupWeeks = rollupWeeks;
  const originalSeries = series;

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

  // One labor value per week should count toward the month. If the same
  // week was saved more than once, keep only the latest saved record so a
  // duplicate entry cannot inflate the monthly total (for example 40 -> 72).
  function uniqueWeeks(ws) {
    const byWeek = new Map();
    (ws || []).forEach(w => {
      if (w && w.weekStart) byWeek.set(w.weekStart, w);
    });
    return [...byWeek.values()];
  }

  function laborTotal(ws) {
    return uniqueWeeks(ws)
      .map(w => Number(w.laborHoursSaved))
      .filter(Number.isFinite)
      .reduce((sum, v) => sum + v, 0);
  }

  rollupWeeks = function(ws) {
    const out = originalRollupWeeks(ws);
    const vals = uniqueWeeks(ws)
      .map(w => Number(w.laborHoursSaved))
      .filter(Number.isFinite);
    out.laborHoursSaved = vals.length ? vals.reduce((a,b)=>a+b,0) : null;
    return out;
  };

  series = function(k, mode) {
    if (k !== 'laborHoursSaved' || mode !== 'monthly') {
      return originalSeries(k, mode);
    }

    const groups = {};
    sorted().forEach(w => {
      if (w?.weekStart) (groups[monthKey(w.weekStart)] ??= []).push(w);
    });

    return Object.entries(groups)
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([mk, ws]) => ({
        label: monthLabel(mk).replace(' ', ' ’'),
        value: laborTotal(ws)
      }));
  };

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
