(() => {
  const originalRollupWeeks = rollupWeeks;
  const originalSeries = series;
  const originalRenderDashboard = renderDashboard;

  // These are tracking/snapshot metrics. Each new weekly entry replaces the
  // prior displayed value for the month instead of being averaged with it.
  const TRACKED_LATEST = new Set([
    'osat',
    'accuracy',
    'cleanliness',
    'speed',
    'taste',
    'friendliness',
    'driveOverall',
    'driveMorning',
    'driveLunch',
    'driveAfternoon',
    'driveDinner',
    'driveEvening',
    'foodVariance'
  ]);

  function latestValue(ws, key) {
    return [...ws]
      .filter(w => w && w.weekStart && w[key] != null && Number.isFinite(Number(w[key])))
      .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
      .map(w => Number(w[key]))
      .at(-1) ?? null;
  }

  rollupWeeks = function(ws) {
    const out = originalRollupWeeks(ws);

    TRACKED_LATEST.forEach(key => {
      out[key] = latestValue(ws, key);
    });

    // True weekly totals still accumulate for the selected month:
    // sales, surveyCount, and laborHoursSaved.
    return out;
  };

  series = function(k, mode) {
    if (mode !== 'monthly' || !TRACKED_LATEST.has(k)) {
      return originalSeries(k, mode);
    }

    const groups = {};
    sorted().forEach(w => {
      if (w[k] != null && Number.isFinite(Number(w[k]))) {
        (groups[monthKey(w.weekStart)] ??= []).push(w);
      }
    });

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mk, ws]) => ({
        label: monthLabel(mk).replace(' ', ' ’'),
        value: latestValue(ws, k)
      }))
      .filter(p => p.value != null);
  };

  function updateTrackingLabels() {
    const foodInput = weekForm?.elements?.foodVariance;
    const foodLabel = foodInput?.closest('label');
    if (foodLabel?.firstChild) foodLabel.firstChild.textContent = 'Food variance MTD (%)';
  }

  renderDashboard = function() {
    originalRenderDashboard();
    updateTrackingLabels();
  };

  updateTrackingLabels();
  renderDashboard();
})();
