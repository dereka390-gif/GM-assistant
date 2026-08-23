// Make Trend KPIs operationally meaningful: don't average MTD/snapshot metrics.
(() => {
  const SNAPSHOT_METRICS = new Set([
    'osat','accuracy','cleanliness','speed','taste','friendliness',
    'driveOverall','driveMorning','driveLunch','driveAfternoon','driveDinner','driveEvening',
    'foodVariance'
  ]);

  function kpiLabel(el, text) {
    const stat = el?.closest('.trend-stat');
    const label = stat?.querySelector('.klabel');
    if (label) label.textContent = text;
  }

  function goalFor(k) {
    if (k === 'foodVariance') return s?.settings?.foodGoal ?? null;
    if (k === 'osat') return s?.settings?.osatGoal ?? null;
    if (k === 'driveOverall') return s?.settings?.driveGoal ?? null;
    if (typeof isDrive === 'function' && isDrive(k)) return typeof daypartGoal === 'function' ? daypartGoal(k) : null;
    if (k === 'laborHoursSaved') return s?.settings?.laborGoal ?? null;
    return null;
  }

  function updateTrendKpi() {
    if (typeof metric === 'undefined' || typeof series !== 'function') return;
    const k = metric.value;
    const mode = trendMode.value;
    let a = series(k, mode);
    const r = trendRange.value;
    if (r !== 'all') a = a.slice(-Number(r));
    if (!a.length) return;

    const cur = Number(a.at(-1).value);
    const goal = goalFor(k);

    if (SNAPSHOT_METRICS.has(k)) {
      if (goal != null && Number.isFinite(Number(goal))) {
        const gap = cur - Number(goal);
        kpiLabel(trendAverage, 'Goal gap');
        trendAverage.textContent = deltaFmt(k, gap);
        const sub = trendAverage.closest('.trend-stat')?.querySelector('.muted');
        if (sub) sub.textContent = k === 'foodVariance' ? 'vs company goal' : 'vs goal';
      } else {
        kpiLabel(trendAverage, 'Current');
        trendAverage.textContent = fmt(k, cur);
        const sub = trendAverage.closest('.trend-stat')?.querySelector('.muted');
        if (sub) sub.textContent = 'Latest tracked value';
      }
    } else {
      kpiLabel(trendAverage, META[k]?.agg === 'sum' ? 'Total' : 'Average');
      const sub = trendAverage.closest('.trend-stat')?.querySelector('.muted');
      if (sub) sub.textContent = META[k]?.agg === 'sum' ? 'Selected periods' : 'Selected periods';
      if (META[k]?.agg === 'sum') trendAverage.textContent = fmt(k, a.reduce((sum,p)=>sum+Number(p.value),0));
    }
  }

  const originalDraw = draw;
  draw = function() {
    originalDraw();
    updateTrendKpi();
  };

  draw();
})();
