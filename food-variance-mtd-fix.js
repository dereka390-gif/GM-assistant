(() => {
  const originalRollupWeeks = rollupWeeks;
  const originalSeries = series;
  const originalRenderDashboard = renderDashboard;

  function latestFoodVariance(ws) {
    return [...ws]
      .filter(w => w && w.weekStart && w.foodVariance != null && Number.isFinite(Number(w.foodVariance)))
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
      .map(w => Number(w.foodVariance))
      .at(-1) ?? null;
  }

  rollupWeeks = function(ws) {
    const out = originalRollupWeeks(ws);
    out.foodVariance = latestFoodVariance(ws);
    return out;
  };

  series = function(k, mode) {
    if (k !== 'foodVariance' || mode !== 'monthly') {
      return originalSeries(k, mode);
    }

    const groups = {};
    sorted().forEach(w => {
      if (w.foodVariance != null && Number.isFinite(Number(w.foodVariance))) {
        (groups[monthKey(w.weekStart)] ??= []).push(w);
      }
    });

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mk, ws]) => ({
        label: monthLabel(mk).replace(' ', ' ’'),
        value: latestFoodVariance(ws)
      }))
      .filter(p => p.value != null);
  };

  function updateFoodVarianceLabel() {
    const input = weekForm?.elements?.foodVariance;
    const label = input?.closest('label');
    if (label?.firstChild) label.firstChild.textContent = 'Food variance MTD (%)';
  }

  renderDashboard = function() {
    originalRenderDashboard();
    updateFoodVarianceLabel();
  };

  updateFoodVarianceLabel();
  renderDashboard();
})();
