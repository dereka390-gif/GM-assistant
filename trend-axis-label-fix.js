// Fix Trends chart Y-axis labels so small decimal/percentage values do not all render as 0.
(() => {
  const chartEl = document.getElementById('chart');
  if (!chartEl || typeof draw !== 'function') return;

  function axisDecimals(metricKey, min, max) {
    const span = Math.abs(max - min);
    if (metricKey === 'foodVariance') return span < 0.1 ? 3 : 2;
    if (['osat','accuracy','cleanliness','speed','taste','friendliness'].includes(metricKey)) return span < 2 ? 1 : 0;
    if (metricKey === 'laborHoursSaved') return span < 2 ? 1 : 0;
    return span < 1 ? 2 : span < 5 ? 1 : 0;
  }

  function formatAxisValue(metricKey, value, min, max) {
    if (metricKey === 'sales') return '$' + Math.round(value / 1000) + 'k';
    const decimals = axisDecimals(metricKey, min, max);
    let text = Number(value).toFixed(decimals);
    if (decimals) text = text.replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1');
    if (metricKey === 'foodVariance' || ['osat','accuracy','cleanliness','speed','taste','friendliness'].includes(metricKey)) text += '%';
    return text;
  }

  const originalGetContext = chartEl.getContext.bind(chartEl);
  chartEl.getContext = function(type, ...args) {
    const ctx = originalGetContext(type, ...args);
    if (type !== '2d' || ctx.__gmAxisFix) return ctx;
    ctx.__gmAxisFix = true;
    const originalFillText = ctx.fillText.bind(ctx);
    ctx.fillText = function(text, x, y, ...rest) {
      // draw() places Y-axis labels at x=12. Replace its rounded labels with
      // values calculated from the same chart scale, preserving decimals.
      if (x === 12 && typeof metric !== 'undefined') {
        const k = metric.value;
        let a = series(k, trendMode.value);
        if (trendRange.value !== 'all') a = a.slice(-Number(trendRange.value));
        if (a.length) {
          const vals = a.map(p => p.value);
          let min = Math.min(...vals), max = Math.max(...vals);
          if (min === max) { min--; max++; }
          const pad = (max - min) * .14;
          min -= pad; max += pad;
          const T = 30, B = 78;
          const ratio = Math.max(0, Math.min(1, (y - 5 - T) / (chartEl.height - T - B)));
          const value = max - (max - min) * ratio;
          text = formatAxisValue(k, value, min, max);
        }
      }
      return originalFillText(text, x, y, ...rest);
    };
    return ctx;
  };

  draw();
})();
