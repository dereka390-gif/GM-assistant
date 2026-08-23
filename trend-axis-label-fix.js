// Trends graph audit/fix: preserve decimals, units and sensible scales for every metric.
(() => {
  if (typeof draw !== 'function') return;

  const PERCENT_KEYS = new Set(['osat','accuracy','cleanliness','speed','taste','friendliness','foodVariance']);

  function trimFixed(value, decimals) {
    return Number(value).toFixed(decimals).replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1');
  }

  function axisText(k, value, span) {
    if (!Number.isFinite(value)) return '—';
    if (k === 'sales') {
      const abs = Math.abs(value);
      if (abs >= 1000000) return '$' + trimFixed(value / 1000000, abs < 10000000 ? 1 : 0) + 'm';
      if (abs >= 1000) return '$' + trimFixed(value / 1000, abs < 10000 ? 1 : 0) + 'k';
      return '$' + Math.round(value);
    }
    if (isDrive(k)) {
      const sec = Math.max(0, Math.round(value));
      return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2,'0')}`;
    }
    if (k === 'foodVariance') {
      const decimals = span < .1 ? 3 : 2;
      return trimFixed(value, decimals) + '%';
    }
    if (['osat','accuracy','cleanliness','speed','taste','friendliness'].includes(k)) {
      return trimFixed(value, span < 2 ? 1 : 0) + '%';
    }
    if (k === 'laborHoursSaved') return trimFixed(value, span < 4 ? 1 : 0) + 'h';
    if (k === 'surveyCount') return Math.round(value).toLocaleString();
    return trimFixed(value, span < 2 ? 1 : 0);
  }

  function scaleBounds(k, vals) {
    let min = Math.min(...vals), max = Math.max(...vals);
    const same = Math.abs(max - min) < 1e-12;

    if (same) {
      let half;
      if (k === 'foodVariance') half = Math.max(.05, Math.abs(min) * .2);
      else if (PERCENT_KEYS.has(k)) half = 2;
      else if (isDrive(k)) half = 10;
      else if (k === 'laborHoursSaved') half = 1;
      else if (k === 'sales') half = Math.max(100, Math.abs(min) * .05);
      else half = 1;
      min -= half; max += half;
    } else {
      const pad = (max - min) * .14;
      min -= pad; max += pad;
    }

    // Keep naturally non-negative metrics from displaying impossible negative scales.
    if (k !== 'foodVariance' && min < 0 && Math.min(...vals) >= 0) min = 0;
    return {min,max};
  }

  draw = function() {
    const k = metric.value;
    const mode = trendMode.value;
    let a = series(k, mode);
    const r = trendRange.value;
    if (r !== 'all') a = a.slice(-Number(r));

    const c = chart;
    const x = c.getContext('2d');
    x.clearRect(0,0,c.width,c.height);
    x.fillStyle = '#fff';
    x.fillRect(0,0,c.width,c.height);
    trendChartTitle.textContent = `${META[k].name} ${mode} trend`;

    if (!a.length) {
      x.fillStyle = '#756b6d'; x.font = '24px system-ui';
      x.fillText('No data for this metric.',40,70);
      trendCurrent.textContent = trendChange.textContent = trendAverage.textContent = trendBest.textContent = '—';
      trendBestSub.textContent = '—'; trendTable.innerHTML = '';
      trendInsights.innerHTML = '<p class="muted">Save at least one week to see insights.</p>';
      return;
    }

    const vals = a.map(p=>Number(p.value)).filter(Number.isFinite);
    const cur = vals.at(-1), pre = vals.length > 1 ? vals.at(-2) : null;
    const d = pre == null ? null : cur - pre;
    const avg = vals.reduce((q,z)=>q+z,0)/vals.length;
    const best = META[k].higher === false ? Math.min(...vals) : Math.max(...vals);
    const bi = vals.indexOf(best);

    trendCurrent.textContent = fmt(k,cur);
    trendChange.textContent = deltaFmt(k,d);
    trendAverage.textContent = fmt(k,avg);
    trendBest.textContent = fmt(k,best);
    trendBestSub.textContent = a[bi].label;
    trendChangeSub.textContent = `vs previous ${mode==='monthly'?'month':'week'}`;

    const bounds = scaleBounds(k, vals);
    const min = bounds.min, max = bounds.max, span = max - min;
    const L = 86, R = 30, T = 30, B = 78;
    const xf = i => L + (c.width-L-R) * (a.length===1 ? .5 : i/(a.length-1));
    const yf = v => T + (max-v)/(max-min) * (c.height-T-B);

    x.strokeStyle = '#e7ddd8'; x.fillStyle = '#756b6d'; x.font = '14px system-ui';
    for (let i=0;i<=4;i++) {
      const y = T + (c.height-T-B)*i/4;
      x.beginPath(); x.moveTo(L,y); x.lineTo(c.width-R,y); x.stroke();
      const v = max - span*i/4;
      x.fillText(axisText(k,v,span),8,y+5);
    }

    x.strokeStyle = '#8f171d'; x.lineWidth = 5; x.beginPath();
    a.forEach((p,i)=>i ? x.lineTo(xf(i),yf(p.value)) : x.moveTo(xf(i),yf(p.value)));
    x.stroke();
    x.fillStyle = '#8f171d';
    a.forEach((p,i)=>{x.beginPath();x.arc(xf(i),yf(p.value),7,0,Math.PI*2);x.fill()});

    x.fillStyle = '#756b6d'; x.font = '12px system-ui'; x.textAlign = 'center';
    a.forEach((p,i)=>{if(a.length<=8 || i%2===0 || i===a.length-1) x.fillText(p.label,xf(i),c.height-35)});
    x.textAlign = 'left';

    const overall = cur - vals[0];
    const good = META[k].higher === false ? overall < 0 : overall > 0;
    trendText.textContent = a.length>1 ? `${META[k].name} is ${overall===0?'unchanged':good?'better':'worse'} versus the first displayed period.` : 'One period is available.';

    trendTable.innerHTML = a.slice().reverse().map((p,ri)=>{
      const i = a.length-1-ri, dd = i>0 ? p.value-a[i-1].value : null;
      return `<tr><td>${esc(p.label)}</td><td><b>${fmt(k,p.value)}</b></td><td>${deltaFmt(k,dd)}</td></tr>`;
    }).join('');

    const dir = d==null ? 'No previous period yet.' : d===0 ? 'Latest period is unchanged.' : ((META[k].higher===false?d<0:d>0) ? 'The latest period improved.' : 'The latest period moved the wrong way.');
    const action = isDrive(k) ? 'Compare daypart deployment, product readiness, staffing, peak volume and pull-ahead use.' : k==='foodVariance' ? 'Compare waste, portions, transfers and top-loss items.' : k==='osat' ? 'Use guest-category trends to identify what is pulling OSAT up or down.' : 'Compare the strongest and weakest periods for execution differences.';
    trendInsights.innerHTML = `<div class="trend-insight"><b>Direction</b><br>${dir}</div><div class="trend-insight"><b>Best period</b><br>${esc(a[bi].label)} at ${fmt(k,best)}</div><div class="trend-insight"><b>Manager check</b><br>${action}</div>`;
  };

  metric.onchange = draw;
  trendMode.onchange = draw;
  trendRange.onchange = draw;
  draw();
})();
