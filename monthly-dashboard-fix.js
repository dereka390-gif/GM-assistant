// Simplify the dashboard to one monthly performance view and improve dashboard layout.
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

  function ensureDashboardStyles(){
    if (document.getElementById('dashboard-layout-v2-styles')) return;
    const style = document.createElement('style');
    style.id = 'dashboard-layout-v2-styles';
    style.textContent = `
      #dash .dash-top{grid-template-columns:1fr!important}
      #dash .dash-top>.card:not(.coach){margin-bottom:0}
      #dash .executive-bottom{margin-top:14px;background:linear-gradient(135deg,#201b1c,#342326);border-color:#3c2a2c}
      #dash .executive-bottom .exec-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:14px}
      #dash .executive-bottom .exec-head h2{margin-bottom:4px}
      #dash .executive-bottom .exec-copy{max-width:760px}
      #dash .mini-trends{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:16px 0}
      #dash .mini-trend{background:#ffffff0d;border:1px solid #ffffff1f;border-radius:14px;padding:11px;min-width:0}
      #dash .mini-trend-top{display:flex;justify-content:space-between;gap:8px;align-items:baseline;margin-bottom:7px}
      #dash .mini-trend-label{font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.07em;color:#d7c7c8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      #dash .mini-trend-value{font-size:15px;font-weight:900;color:#fff;white-space:nowrap}
      #dash .mini-trend canvas{display:block;width:100%;height:58px;border-radius:8px}
      #dash .mini-trend-foot{font-size:10px;color:#cdbfc0;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #dash .dashboard-section-label{margin:4px 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:.1em;font-weight:900;color:var(--muted)}
      @media(max-width:900px){#dash .mini-trends{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:620px){#dash .mini-trends{grid-template-columns:1fr 1fr}#dash .executive-bottom .exec-head{display:block}}
    `;
    document.head.appendChild(style);
  }

  function moveExecutiveSummary(){
    const dash = document.getElementById('dash');
    const coach = dash?.querySelector('.coach');
    if (!dash || !coach) return;

    coach.classList.add('executive-bottom');

    if (!coach.querySelector('.exec-head')) {
      const eyebrow = coach.querySelector('.eyebrow');
      const title = coach.querySelector('h2');
      const summary = coach.querySelector('#aiSummary');
      if (eyebrow && title && summary) {
        const head = document.createElement('div');
        head.className = 'exec-head';
        const copy = document.createElement('div');
        copy.className = 'exec-copy';
        eyebrow.before(head);
        head.appendChild(copy);
        copy.append(eyebrow,title,summary);
      }
    }

    if (!document.getElementById('dashboardMiniTrends')) {
      const mini = document.createElement('div');
      mini.id = 'dashboardMiniTrends';
      mini.className = 'mini-trends';
      const priorities = coach.querySelector('#priorityList');
      if (priorities) priorities.before(mini); else coach.appendChild(mini);
    }

    // Executive Summary should be the final dashboard section.
    if (dash.lastElementChild !== coach) dash.appendChild(coach);
  }

  const MINI_METRICS = [
    {key:'osat', label:'OSAT'},
    {key:'driveOverall', label:'Drive-thru'},
    {key:'foodVariance', label:'Food variance'},
    {key:'laborHoursSaved', label:'Hours saved'}
  ];

  function miniFmt(key, value){
    if (!Number.isFinite(value)) return '—';
    if (typeof fmt === 'function') {
      try { return fmt(key,value); } catch(e) {}
    }
    if (key === 'driveOverall') {
      const sec = Math.round(value);
      return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
    }
    if (key === 'foodVariance' || key === 'osat') return `${Number(value).toFixed(key==='foodVariance'?2:0)}%`;
    if (key === 'laborHoursSaved') return `${Number(value).toFixed(2).replace(/0+$/,'').replace(/\.$/,'')}h`;
    return String(value);
  }

  function getMiniSeries(key){
    if (typeof series !== 'function') return [];
    try {
      const weekly = series(key,'weekly') || [];
      return weekly.filter(p=>Number.isFinite(Number(p.value))).slice(-6).map(p=>({label:p.label,value:Number(p.value)}));
    } catch(e) { return []; }
  }

  function drawSparkline(canvas, points){
    const dpr = window.devicePixelRatio || 1;
    const cssW = Math.max(120, canvas.clientWidth || 180);
    const cssH = 58;
    canvas.width = Math.round(cssW*dpr);
    canvas.height = Math.round(cssH*dpr);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr,dpr);
    ctx.clearRect(0,0,cssW,cssH);

    if (!points.length) {
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      ctx.font = '11px system-ui';
      ctx.fillText('No history yet',8,31);
      return;
    }

    const vals = points.map(p=>p.value);
    let min = Math.min(...vals), max = Math.max(...vals);
    if (max === min) { min -= 1; max += 1; }
    const pad = 7;
    const x = i => pad + (cssW-pad*2)*(points.length===1?.5:i/(points.length-1));
    const y = v => pad + (cssH-pad*2)*(max-v)/(max-min);

    ctx.strokeStyle = 'rgba(255,255,255,.14)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad,cssH-pad); ctx.lineTo(cssW-pad,cssH-pad); ctx.stroke();

    ctx.strokeStyle = '#f3b2b6';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    points.forEach((p,i)=> i ? ctx.lineTo(x(i),y(p.value)) : ctx.moveTo(x(i),y(p.value)));
    ctx.stroke();

    ctx.fillStyle = '#fff';
    points.forEach((p,i)=>{ctx.beginPath();ctx.arc(x(i),y(p.value),2.6,0,Math.PI*2);ctx.fill();});
  }

  function renderMiniTrends(){
    const wrap = document.getElementById('dashboardMiniTrends');
    if (!wrap) return;
    wrap.innerHTML = '';

    MINI_METRICS.forEach(item=>{
      const pts = getMiniSeries(item.key);
      const latest = pts.length ? pts[pts.length-1] : null;
      const previous = pts.length > 1 ? pts[pts.length-2] : null;
      const card = document.createElement('div');
      card.className = 'mini-trend';
      const delta = latest && previous ? latest.value-previous.value : null;
      let foot = pts.length ? `${pts.length} saved week${pts.length===1?'':'s'}` : 'Waiting for saved data';
      if (delta != null && Number.isFinite(delta)) {
        const arrow = delta > 0 ? '↑' : delta < 0 ? '↓' : '→';
        foot = `${arrow} ${miniFmt(item.key,Math.abs(delta))} vs prior week`;
      }
      card.innerHTML = `<div class="mini-trend-top"><span class="mini-trend-label">${item.label}</span><span class="mini-trend-value">${latest?miniFmt(item.key,latest.value):'—'}</span></div><canvas></canvas><div class="mini-trend-foot">${foot}</div>`;
      wrap.appendChild(card);
      drawSparkline(card.querySelector('canvas'),pts);
    });
  }

  function applyLayout(){
    ensureDashboardStyles();
    moveExecutiveSummary();
    renderMiniTrends();
  }

  applyMonthlyOnly();
  applyLayout();
  setTimeout(()=>{ applyMonthlyOnly(); applyLayout(); },0);
  setTimeout(applyLayout,250);

  // Keep the mini graphs current whenever dashboard data is re-rendered.
  if (typeof renderDashboard === 'function' && !renderDashboard.__layoutV2Wrapped) {
    const originalRenderDashboard = renderDashboard;
    renderDashboard = function(){
      const result = originalRenderDashboard.apply(this,arguments);
      setTimeout(applyLayout,0);
      return result;
    };
    renderDashboard.__layoutV2Wrapped = true;
  }

  window.addEventListener('resize',()=>{
    clearTimeout(window.__miniDashResizeTimer);
    window.__miniDashResizeTimer = setTimeout(renderMiniTrends,120);
  });
})();
