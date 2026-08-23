// GM Assistant Communication Studio — dark communication-board template
(() => {
  const comm = document.getElementById('comm');
  if (!comm) return;

  const styles = `
  <style id="commStudioStyles">
    .comm-studio{display:grid;grid-template-columns:minmax(280px,.75fr) minmax(0,1.35fr);gap:16px;align-items:start}
    .comm-tools{position:sticky;top:78px}.comm-tools .card{margin-bottom:12px}
    .comm-style-row{display:flex;gap:8px;flex-wrap:wrap}.comm-style-row button{border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 11px;font-weight:800}.comm-style-row button.active{background:var(--red);color:#fff;border-color:var(--red)}
    .poster-shell{background:#d8d0ca;border-radius:18px;padding:14px;overflow:auto}
    .team-poster{--red2:#d21f2b;--gold:#f2c230;--ink:#111;position:relative;aspect-ratio:8.5/11;background:#121212;color:#fff;border:1px solid #000;box-shadow:0 18px 50px #0003;overflow:hidden;margin:auto;max-width:760px;display:flex;flex-direction:column;font-family:Inter,Arial,sans-serif}
    .team-poster:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.14;background-image:radial-gradient(#fff 0.7px,transparent .7px);background-size:6px 6px}
    .poster-top{position:relative;z-index:1;padding:22px 24px 15px;border-bottom:6px solid var(--red2);background:linear-gradient(135deg,#080808,#1d1d1d)}
    .poster-brand-row{display:flex;justify-content:space-between;align-items:flex-start;gap:14px}.poster-brand{font-size:12px;font-weight:1000;letter-spacing:.08em;text-transform:uppercase}.poster-brand .arbys{font-size:21px;color:#fff}.poster-brand .ambrosia{font-size:15px;color:#f5c72d;text-align:right}
    .poster-title{font-size:clamp(32px,5.5vw,56px);line-height:.94;font-weight:1000;letter-spacing:-.04em;text-transform:uppercase;margin:12px 0 4px}.poster-title span{color:#e02731}.poster-date{font-size:16px;font-weight:900}.poster-storeline{font-size:12px;font-weight:900;letter-spacing:.08em;color:#e7e7e7;margin-top:3px}
    .poster-body{position:relative;z-index:1;padding:16px;display:flex;flex-direction:column;gap:12px;flex:1;min-height:0}
    .poster-hero{display:grid;grid-template-columns:.9fr 1.15fr;gap:12px}.goal-card,.hero-card,.panel-dark,.sticky-note{border-radius:14px;padding:15px}
    .goal-card{background:#f7f0e5;color:#111;transform:rotate(-1deg);border:1px solid #dbcbb8}.goal-card .goal-label{font-size:19px;font-weight:1000;text-transform:uppercase}.goal-card .goal-num{font-size:54px;color:#c71c28;font-weight:1000;line-height:.95;margin:5px 0}.goal-card .goal-note{font-size:14px;font-weight:900}
    .hero-card{background:#0a0a0a;border:2px solid #b41923;text-align:center}.hero-card .hero-label{font-size:18px;font-weight:1000;text-transform:uppercase}.hero-card .hero-num{font-size:66px;font-weight:1000;line-height:.95;margin:6px 0}.hero-card .hero-num.red{color:#fff}.hero-card .hero-note{font-size:15px;font-weight:900;color:#f2c230}
    .poster-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}.panel-dark{background:#0c0c0c;border:2px solid #8f171d;min-height:142px}.panel-head{font-size:17px;font-weight:1000;text-transform:uppercase;border-bottom:2px solid #7c151b;padding-bottom:7px;margin-bottom:8px}.metric-row{display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-bottom:1px solid #ffffff1f;font-size:12px;font-weight:850}.metric-row:last-child{border-bottom:0}.metric-row b{color:#f2c230;font-size:15px}.panel-big{font-size:35px;font-weight:1000;color:#fff;margin:4px 0}.panel-small{font-size:12px;line-height:1.35;font-weight:750;color:#ddd}
    .poster-lower{display:grid;grid-template-columns:1.1fr .9fr;gap:12px;min-height:0}.focus-card{background:#090909;border:2px solid #97171f;border-radius:14px;padding:14px}.focus-card h3,.mystery-card h3{margin:0 0 9px;font-size:19px;text-transform:uppercase;color:#fff}.focus-item{display:grid;grid-template-columns:26px 1fr;gap:8px;margin:8px 0;font-size:12px;line-height:1.3;font-weight:800}.focus-num{width:24px;height:24px;border-radius:50%;background:#c91e29;display:grid;place-items:center;font-weight:1000}.mystery-card{background:#f3c62e;color:#111;border-radius:14px;padding:14px;transform:rotate(.6deg);box-shadow:0 5px 0 #8e6610}.mystery-card h3{color:#111}.mystery-card .ready{font-size:23px;color:#c21722;font-weight:1000;margin-bottom:6px}.check{font-size:12px;font-weight:850;margin:5px 0}.check:before{content:"✓";color:#a9151e;margin-right:7px;font-weight:1000}
    .poster-footer{position:relative;z-index:1;background:linear-gradient(90deg,#111 0 62%,#b51620 62%);padding:12px 18px;display:flex;justify-content:space-between;align-items:center;gap:12px;font-weight:1000;text-transform:uppercase}.poster-footer .traits{font-size:15px;letter-spacing:.02em}.poster-footer .rally{font-size:17px;color:#ffd43b;text-align:right}
    .comm-note{font-size:12px;line-height:1.45;color:var(--muted);margin-top:8px}.comm-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
    @media(max-width:850px){.comm-studio{grid-template-columns:1fr}.comm-tools{position:static}.team-poster{min-width:0}}
    @media(max-width:600px){.poster-grid3{grid-template-columns:1fr 1fr}.poster-grid3 .panel-dark:last-child{grid-column:1/-1}.poster-lower{grid-template-columns:1fr}.poster-title{font-size:38px}.poster-body{padding:11px;gap:9px}}
  </style>`;
  document.head.insertAdjacentHTML('beforeend', styles);

  const topicDefs={
    weekly:{label:'Weekly Team Update',title:'WEEKLY TEAM UPDATE'},
    speed:{label:'Speed of Service',title:'SPEED WINS'},
    guest:{label:'Guest Experience',title:'EVERY GUEST. EVERY TIME.'},
    accuracy:{label:'Accuracy',title:'MAKE IT RIGHT'},
    clean:{label:'Cleanliness',title:'KEEP IT CLEAN'},
    mystery:{label:'Mystery Shopper',title:'MYSTERY SHOPPER ALERT'},
    food:{label:'Food Variance',title:'CONTROL THE COST'},
    labor:{label:'Labor',title:'SMART DEPLOYMENT'},
    recognition:{label:'Recognition',title:'TEAM SHOUT OUT'},
    custom:{label:'Custom Topic',title:'TEAM UPDATE'}
  };

  function latestWeek(){try{return typeof latest==='function'?latest():null}catch{return null}}
  function val(k,v){try{return fmt(k,v)}catch{return v??'—'}}
  function esc(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function cap(s){return s?s.charAt(0).toUpperCase()+s.slice(1):''}
  function lowestGuest(w){const ks=['accuracy','cleanliness','speed','taste','friendliness'].filter(k=>w?.[k]!=null);return ks.length?ks.reduce((a,b)=>Number(w[a])<=Number(w[b])?a:b):null}
  function strongestGuest(w){const ks=['accuracy','cleanliness','speed','taste','friendliness'].filter(k=>w?.[k]!=null);return ks.length?ks.reduce((a,b)=>Number(w[a])>=Number(w[b])?a:b):null}
  function dateRange(w){if(!w?.weekStart)return 'LATEST WEEK';try{return `${fd(w.weekStart)} – ${end(w.weekStart)}`}catch{return 'LATEST WEEK'}}
  function goal(name,fallback){return s?.settings?.[name]??fallback}
  function driveText(seconds){if(seconds==null||seconds==='')return '—';const n=Number(seconds);if(!Number.isFinite(n))return String(seconds);return `${Math.floor(n/60)}:${String(Math.round(n%60)).padStart(2,'0')}`}

  comm.innerHTML=`
    <div class="card hero" style="margin-bottom:14px"><div><div class="eyebrow">Communication Center</div><h2>Communication Creator</h2><p class="muted">Create a bold, print-ready communication board from your latest weekly numbers.</p></div><div class="hero-actions"><button class="primary" id="quickWeeklyPoster">Create Weekly Poster</button></div></div>
    <div class="comm-studio">
      <div class="comm-tools"><div class="card">
        <div class="eyebrow">Build your poster</div><h2>Poster Creator</h2>
        <label>Topic<select id="commTopic">${Object.entries(topicDefs).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('')}</select></label>
        <label style="margin-top:12px">Custom headline<input id="commHeadline" placeholder="Leave blank to auto-generate"></label>
        <label style="margin-top:12px">Custom team message<textarea id="commMessage" rows="3" placeholder="Optional message for the team"></textarea></label>
        <label style="display:flex;grid-template-columns:auto 1fr;align-items:center;gap:9px;margin-top:14px"><input id="commUseData" type="checkbox" checked style="width:auto">Use latest weekly data automatically</label>
        <div class="comm-actions"><button class="primary" type="button" id="commGenerate">Generate Poster ✨</button><button class="secondary" type="button" id="commPrint">Print Poster</button></div>
        <div class="comm-note">Print opens the poster by itself in a clean print page so Safari/iPad does not print blank app pages.</div>
      </div></div>
      <div class="poster-shell"><div id="commPoster" class="team-poster"></div></div>
    </div>`;

  const topicEl=document.getElementById('commTopic');
  const headlineEl=document.getElementById('commHeadline');
  const msgEl=document.getElementById('commMessage');
  const useDataEl=document.getElementById('commUseData');
  const poster=document.getElementById('commPoster');

  function focusItems(topic,w){
    const low=lowestGuest(w); const drive=w?.driveOverall; const food=w?.foodVariance;
    if(topic==='mystery') return ['Be friendly and engaged','Offer a meal and suggest an upsell','Repeat the order for accuracy','Offer sauce and thank every guest'];
    if(topic==='speed') return ['Stay in position during peak','Keep product ready before the rush','Communicate and use pull-ahead correctly','Coach the slowest daypart'];
    if(topic==='clean') return ['Clean as you go','Stay ahead of dining room checks','Keep restrooms guest-ready','Manager verifies each daypart'];
    if(topic==='accuracy') return ['Repeat every order','Verify sauces and modifiers','Final bag check before handoff','Give the total and thank the guest'];
    return [low?`Improve ${cap(low)} — currently ${val(low,w[low])}`:'Choose one guest-experience behavior to coach',drive!=null?`Drive-thru is ${driveText(drive)} — keep pushing toward goal`:'Stay positioned and peak-ready',food!=null?`Food variance: ${val('foodVariance',food)} — protect portions and waste`:'Protect portions and waste routines',w?.laborHoursSaved!=null?`Labor saved: ${val('laborHoursSaved',w.laborHoursSaved)} — protect service while saving hours`:'Protect service while managing labor'];
  }

  function renderPoster(){
    const w=useDataEl.checked?latestWeek():null;
    const topic=topicEl.value;
    const def=topicDefs[topic]||topicDefs.custom;
    const low=lowestGuest(w), hi=strongestGuest(w);
    const osatGoal=Number(goal('osatGoal',55));
    const osat=Number(w?.osat);
    const osatDisplay=w?.osat!=null?`${w.osat}%`:'—';
    const driveGoal=Number(goal('driveGoal',60));
    const drive=Number(w?.driveOverall);
    const osatNote=Number.isFinite(osat)?(osat>=osatGoal?'GOAL MET — KEEP IT UP!':`ONLY ${Math.max(0,+(osatGoal-osat).toFixed(1))} POINT${Math.abs(osatGoal-osat)===1?'':'S'} FROM GOAL!`):`GOAL: ${osatGoal}%`;
    const teamMessage=msgEl.value.trim() || (hi&&low?`${cap(hi)} is our strongest guest category. ${cap(low)} is our biggest opportunity this week.`:'Fast. Accurate. Clean. Friendly. Every guest. Every time.');
    const title=headlineEl.value.trim()||def.title;
    const metrics=[['Accuracy',w?.accuracy!=null?`${w.accuracy}%`:'—'],['Cleanliness',w?.cleanliness!=null?`${w.cleanliness}%`:'—'],['Speed',w?.speed!=null?`${w.speed}%`:'—'],['Taste',w?.taste!=null?`${w.taste}%`:'—'],['Friendliness',w?.friendliness!=null?`${w.friendliness}%`:'—']];
    const focuses=focusItems(topic,w);
    poster.innerHTML=`
      <div class="poster-top">
        <div class="poster-brand-row"><div class="poster-brand"><div class="arbys">Arby’s</div>Restaurant Operations</div><div class="poster-brand"><div class="ambrosia">☀ AMBROSIA QSR</div></div></div>
        <div class="poster-title">STORE <span>${esc(s?.settings?.storeNumber||'8571')}</span><br>${esc(title)}</div>
        <div class="poster-date">${esc(dateRange(w))}</div><div class="poster-storeline">COMMUNICATION BOARD</div>
      </div>
      <div class="poster-body">
        <div class="poster-hero">
          <div class="goal-card"><div class="goal-label">Our Goal</div><div class="goal-num">${esc(osatGoal)}%+</div><div class="goal-note">OSAT • Every guest matters</div></div>
          <div class="hero-card"><div class="hero-label">OSAT</div><div class="hero-num red">${esc(osatDisplay)}</div><div class="hero-note">${esc(osatNote)}</div></div>
        </div>
        <div class="poster-grid3">
          <div class="panel-dark"><div class="panel-head">Guest Experience</div>${metrics.map(([a,b])=>`<div class="metric-row"><span>${esc(a)}</span><b>${esc(b)}</b></div>`).join('')}</div>
          <div class="panel-dark"><div class="panel-head">Operations</div><div class="metric-row"><span>Drive-Thru</span><b>${esc(w?.driveOverall!=null?driveText(w.driveOverall):'—')}</b></div><div class="metric-row"><span>Goal</span><b>${esc(driveText(driveGoal))}</b></div><div class="metric-row"><span>Food Variance</span><b>${esc(w?.foodVariance!=null?`${w.foodVariance}%`:'—')}</b></div><div class="metric-row"><span>Labor Saved</span><b>${esc(w?.laborHoursSaved!=null?`${w.laborHoursSaved} hrs`:'—')}</b></div><div class="metric-row"><span>Weekly Sales</span><b>${esc(w?.sales!=null?`$${Number(w.sales).toLocaleString(undefined,{maximumFractionDigits:2})}`:'—')}</b></div></div>
          <div class="panel-dark"><div class="panel-head">Recognition</div><div class="panel-big">${esc(hi?cap(hi):'TEAM')}</div><div class="panel-small">${esc(hi?`${val(hi,w[hi])} — our strongest guest category. Great work!`:teamMessage)}</div><div class="panel-head" style="margin-top:12px">Opportunity</div><div class="panel-small">${esc(low?`${cap(low)} at ${val(low,w[low])}. Let’s move it this week.`:'Keep pushing every category.')}</div></div>
        </div>
        <div class="poster-lower">
          <div class="focus-card"><h3>This Week’s Focus</h3>${focuses.map((x,i)=>`<div class="focus-item"><div class="focus-num">${i+1}</div><div>${esc(x)}</div></div>`).join('')}<div class="panel-small" style="margin-top:10px;color:#f2c230">${esc(teamMessage)}</div></div>
          <div class="mystery-card"><h3>Mystery Shopper</h3><div class="ready">BE READY!</div><div class="check">Be friendly</div><div class="check">Offer a meal</div><div class="check">Ask about LG/XL upsizing</div><div class="check">Suggest a turnover</div><div class="check">Offer sauce</div><div class="check">Repeat the order</div><div class="check">Give the total and thanks</div></div>
        </div>
      </div>
      <div class="poster-footer"><div class="traits">FAST • ACCURATE • CLEAN • FRIENDLY</div><div class="rally">TOGETHER WE WIN</div></div>`;
  }

  function getPrintableDocument(){
    const posterHtml=poster.outerHTML;
    const css=document.getElementById('commStudioStyles')?.textContent||'';
    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Store ${esc(s?.settings?.storeNumber||'8571')} Communication</title><style>${css}\nhtml,body{margin:0!important;padding:0!important;background:#fff!important;width:100%!important;height:auto!important}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.team-poster{width:8.5in!important;height:11in!important;max-width:none!important;box-shadow:none!important;border:0!important;margin:0!important}@page{size:letter portrait;margin:0}@media print{html,body{width:8.5in!important;height:11in!important;overflow:hidden!important}.team-poster{break-inside:avoid!important;page-break-inside:avoid!important}}</style></head><body>${posterHtml}<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350)}<\/script></body></html>`;
  }

  function printPoster(){
    renderPoster();
    const html=getPrintableDocument();
    const win=window.open('','_blank');
    if(win){
      win.document.open();win.document.write(html);win.document.close();
      return;
    }
    const frame=document.createElement('iframe');
    frame.style.position='fixed';frame.style.right='0';frame.style.bottom='0';frame.style.width='1px';frame.style.height='1px';frame.style.border='0';frame.style.opacity='0';
    document.body.appendChild(frame);
    frame.onload=()=>{setTimeout(()=>{try{frame.contentWindow.focus();frame.contentWindow.print()}finally{setTimeout(()=>frame.remove(),1500)}},400)};
    frame.srcdoc=html.replace('<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350)}<\/script>','');
  }

  document.getElementById('commGenerate').onclick=renderPoster;
  document.getElementById('quickWeeklyPoster').onclick=()=>{topicEl.value='weekly';headlineEl.value='';msgEl.value='';useDataEl.checked=true;renderPoster();document.querySelector('.poster-shell')?.scrollIntoView({behavior:'smooth',block:'start'})};
  document.getElementById('commPrint').onclick=printPoster;
  [topicEl,headlineEl,msgEl,useDataEl].forEach(el=>el.addEventListener(el.tagName==='SELECT'||el.type==='checkbox'?'change':'input',renderPoster));
  renderPoster();
})();