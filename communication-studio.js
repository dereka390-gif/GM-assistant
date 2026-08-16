// GM Assistant Communication Studio
(() => {
  const comm = document.getElementById('comm');
  if (!comm) return;

  const styles = `
  <style id="commStudioStyles">
    .comm-studio{display:grid;grid-template-columns:minmax(280px,.8fr) minmax(0,1.25fr);gap:16px;align-items:start}
    .comm-tools{position:sticky;top:78px}.comm-tools .card{margin-bottom:12px}
    .comm-style-row{display:flex;gap:8px;flex-wrap:wrap}.comm-style-row button{border:1px solid var(--line);background:#fff;border-radius:999px;padding:8px 11px;font-weight:800}.comm-style-row button.active{background:var(--red);color:#fff;border-color:var(--red)}
    .poster-shell{background:#ddd3ca;border-radius:18px;padding:14px;overflow:auto}.team-poster{--accent:#c51f2d;--accent2:#f0b323;position:relative;aspect-ratio:8.5/11;background:#fffdf8;border:1px solid #cfc3b8;box-shadow:0 18px 50px #0002;overflow:hidden;margin:auto;max-width:760px;display:flex;flex-direction:column;color:#181515}
    .team-poster .poster-top{padding:26px 28px 18px;background:linear-gradient(135deg,#171313,#342224);color:#fff;border-bottom:8px solid var(--accent2);position:relative}
    .team-poster .poster-kicker{font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:900;color:#ffd86f}.team-poster .poster-title{font-size:clamp(34px,6vw,64px);line-height:.92;font-weight:1000;letter-spacing:-.045em;text-transform:uppercase;margin:7px 0 9px}.team-poster .poster-sub{font-size:16px;font-weight:750;max-width:90%}
    .team-poster .poster-store{position:absolute;right:24px;top:24px;text-align:right;font-size:12px;font-weight:900}.team-poster .poster-store strong{display:block;font-size:20px;color:#fff}
    .team-poster .poster-body{padding:22px 24px 20px;display:flex;flex-direction:column;gap:15px;flex:1;background:linear-gradient(180deg,#fffdf8,#f7efe5)}
    .poster-hero{display:grid;grid-template-columns:1.05fr .95fr;gap:14px}.poster-big{background:var(--accent);color:#fff;border-radius:18px;padding:20px;min-height:180px;display:flex;flex-direction:column;justify-content:center}.poster-big .big-num{font-size:70px;font-weight:1000;line-height:.9}.poster-big .big-label{font-size:14px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;margin-bottom:8px}.poster-big .big-note{font-size:16px;font-weight:800;margin-top:10px}
    .poster-callout{border:3px solid #171313;border-radius:18px;padding:18px;background:#fff}.poster-callout h3{font-size:24px;margin:0 0 10px;text-transform:uppercase}.poster-callout p{font-size:17px;line-height:1.35;margin:0;font-weight:700}
    .poster-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.poster-box{border:1px solid #dbcfc4;border-radius:15px;padding:14px;background:#fff}.poster-box .label{font-size:11px;text-transform:uppercase;letter-spacing:.09em;font-weight:900;color:#756b6d}.poster-box .value{font-size:28px;font-weight:1000;margin-top:3px}.poster-box .small{font-size:13px;color:#756b6d;font-weight:700;margin-top:4px}
    .poster-focus{background:#171313;color:#fff;border-radius:16px;padding:16px 18px}.poster-focus h3{margin:0 0 9px;color:#ffd86f;text-transform:uppercase}.poster-focus ol{margin:0;padding-left:20px;display:grid;gap:7px;font-weight:800;line-height:1.3}
    .poster-footer{margin-top:auto;padding:15px 24px;background:var(--accent2);font-weight:1000;text-align:center;text-transform:uppercase;letter-spacing:.03em}
    .team-poster.style-fun{--accent:#d92535;--accent2:#f4c52f}.team-poster.style-fun .poster-body{background:linear-gradient(180deg,#fff9df,#fff)}
    .team-poster.style-bold{--accent:#aa111b;--accent2:#111}.team-poster.style-bold .poster-top{background:#080808}.team-poster.style-bold .poster-footer{color:#fff}
    .team-poster.style-clean{--accent:#2c6b55;--accent2:#e7d7bb}.team-poster.style-clean .poster-top{background:#f7f3ee;color:#171313;border-bottom-color:var(--accent)}.team-poster.style-clean .poster-store strong{color:#171313}.team-poster.style-clean .poster-kicker{color:var(--accent)}
    .team-poster.style-motivational{--accent:#b3232c;--accent2:#f0b323}.team-poster.style-motivational .poster-title{font-style:italic}.team-poster.style-motivational .poster-big{background:linear-gradient(135deg,#b3232c,#e45b32)}
    .comm-note{font-size:12px;line-height:1.45;color:var(--muted);margin-top:8px}.comm-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
    @media(max-width:850px){.comm-studio{grid-template-columns:1fr}.comm-tools{position:static}.team-poster{min-width:0}.poster-hero{grid-template-columns:1fr}.poster-grid{grid-template-columns:1fr 1fr}}
    @media(max-width:540px){.poster-grid{grid-template-columns:1fr}.team-poster .poster-top{padding:22px 18px 16px}.team-poster .poster-body{padding:16px}.team-poster .poster-store{position:static;text-align:left;margin-top:8px}.team-poster .poster-title{font-size:42px}}
    @media print{
      body.poster-print *{visibility:hidden!important}
      body.poster-print #commPoster,body.poster-print #commPoster *{visibility:visible!important}
      body.poster-print #commPoster{position:absolute!important;left:0;top:0;width:8.5in!important;height:11in!important;max-width:none!important;box-shadow:none!important;border:0!important}
      body.poster-print .poster-shell{padding:0!important;background:#fff!important;overflow:visible!important}
      @page{size:letter portrait;margin:0}
    }
  </style>`;
  document.head.insertAdjacentHTML('beforeend', styles);

  const topicDefs = {
    weekly:{label:'Weekly Team Update',title:'THIS WEEK, WE WIN',kicker:'Weekly Team Communication',sub:'Know the numbers. Own the opportunities. Celebrate the wins.'},
    speed:{label:'Speed of Service',title:'SPEED WINS!',kicker:'Every second counts',sub:'Stay ready, stay in position, and keep the line moving.'},
    guest:{label:'Guest Experience',title:'EVERY GUEST. EVERY TIME.',kicker:'Guest Experience',sub:'Great service is built one interaction at a time.'},
    accuracy:{label:'Accuracy',title:'MAKE IT RIGHT',kicker:'Accuracy Focus',sub:'Repeat it. Check it. Hand it out right.'},
    clean:{label:'Cleanliness',title:'KEEP IT CLEAN!',kicker:'Clean store, strong experience',sub:'Clean as you go and protect every guest touchpoint.'},
    mystery:{label:'Mystery Shopper',title:'MYSTERY SHOPPER ALERT!',kicker:'Be ready anytime',sub:'Be friendly. Be accurate. Be proud of the restaurant.'},
    food:{label:'Food Variance',title:'CONTROL THE COST',kicker:'Food Cost Focus',sub:'Portion right, log waste, and protect every count.'},
    labor:{label:'Labor',title:'SMART DEPLOYMENT WINS',kicker:'Labor Focus',sub:'Use the right people in the right positions at the right time.'},
    recognition:{label:'Recognition',title:'SHOUT OUT!',kicker:'Team Recognition',sub:'Great work deserves to be seen and celebrated.'},
    custom:{label:'Custom Topic',title:'TEAM UPDATE',kicker:'Communication Center',sub:'Clear message. Strong team. Better execution.'}
  };

  function dateRange(w){
    if(!w?.weekStart) return 'LATEST WEEK';
    try{return `${fd(w.weekStart)} – ${end(w.weekStart)}`;}catch{return 'LATEST WEEK';}
  }
  function latestWeek(){try{return typeof latest==='function'?latest():null}catch{return null}}
  function val(k,v){try{return fmt(k,v)}catch{return v??'—'}}
  function esc2(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function lowestGuest(w){
    const keys=['accuracy','cleanliness','speed','taste','friendliness'].filter(k=>w?.[k]!=null);
    return keys.length?keys.reduce((a,b)=>Number(w[a])<=Number(w[b])?a:b):null;
  }
  function strongestGuest(w){
    const keys=['accuracy','cleanliness','speed','taste','friendliness'].filter(k=>w?.[k]!=null);
    return keys.length?keys.reduce((a,b)=>Number(w[a])>=Number(w[b])?a:b):null;
  }
  function cap2(s){return s?s.charAt(0).toUpperCase()+s.slice(1):''}
  function focusItems(topic,w){
    const low=lowestGuest(w);
    const base={
      weekly:[low?`Coach ${cap2(low)} — currently ${val(low,w[low])}.`:'Pick one guest-experience behavior to coach.',w?.driveOverall!=null?`Protect drive-thru execution at ${val('driveOverall',w.driveOverall)}.`:'Stay positioned and peak-ready.',w?.foodVariance!=null?`Review food variance at ${val('foodVariance',w.foodVariance)}.`:'Protect portions and waste routines.'],
      speed:['Stay in position during peak.','Keep product ready before the rush.','Use pull-ahead when appropriate.'],
      guest:[low?`Focus first on ${cap2(low)}.`:'Coach one guest-experience behavior.','Repeat orders and verify accuracy.','Thank every guest and finish strong.'],
      accuracy:['Repeat the order back.','Verify sauces and modifiers.','Final bag check before handoff.'],
      clean:['Clean as you go.','Use timed lobby and restroom checks.','Manager verifies each daypart.'],
      mystery:['Be friendly and engaged.','Repeat the order for accuracy.','Suggest, upsell, and thank every guest.'],
      food:['Review top-loss items.','Log waste accurately.','Protect portions, transfers, and counts.'],
      labor:['Schedule to the business.','Protect peak deployment.','Save hours without sacrificing service.'],
      recognition:['Call out a specific win.','Thank the team publicly.','Connect the win to guest experience.'],
      custom:['Keep the message simple.','Give the team one clear action.','Recognize progress next week.']
    };
    return base[topic]||base.custom;
  }
  function heroFor(topic,w){
    if(topic==='speed') return {label:'DRIVE-THRU',num:w?.driveOverall!=null?val('driveOverall',w.driveOverall):'—',note:`Goal ${val('driveOverall',s?.settings?.driveGoal)}`};
    if(topic==='guest') return {label:'OSAT',num:w?.osat!=null?val('osat',w.osat):'—',note:`Goal ${s?.settings?.osatGoal??'—'}%`};
    if(topic==='accuracy') return {label:'ACCURACY',num:w?.accuracy!=null?val('accuracy',w.accuracy):'—',note:'Make it right every time'};
    if(topic==='clean') return {label:'CLEANLINESS',num:w?.cleanliness!=null?val('cleanliness',w.cleanliness):'—',note:'Clean store. Strong experience.'};
    if(topic==='food') return {label:'FOOD VARIANCE',num:w?.foodVariance!=null?val('foodVariance',w.foodVariance):'—',note:`Goal ${s?.settings?.foodGoal??'—'}%`};
    if(topic==='labor') return {label:'LABOR SAVED',num:w?.laborHoursSaved!=null?val('laborHoursSaved',w.laborHoursSaved):'—',note:`Goal ${s?.settings?.laborGoal??'—'} hrs`};
    if(topic==='recognition') {const hi=strongestGuest(w); return {label:'STRONGEST AREA',num:hi?cap2(hi):'TEAM',note:hi?`${val(hi,w[hi])} — great work!`:'Celebrate a win this week'};}
    if(topic==='mystery') return {label:'BE READY',num:'ANYTIME',note:'Every guest could be the shopper'};
    return {label:'OSAT',num:w?.osat!=null?val('osat',w.osat):'—',note:`Goal ${s?.settings?.osatGoal??'—'}%`};
  }

  comm.innerHTML=`
    <div class="card hero" style="margin-bottom:14px"><div><div class="eyebrow">Communication Center</div><h2>Smart Poster Studio</h2><p class="muted">Turn your weekly numbers or a custom topic into a fun, print-ready team communication.</p></div><div class="hero-actions"><button class="primary" id="quickWeeklyPoster">Create Weekly Poster</button></div></div>
    <div class="comm-studio">
      <div class="comm-tools">
        <div class="card">
          <div class="eyebrow">Create a communication</div>
          <h2 style="margin-bottom:14px">Poster Builder</h2>
          <label>Topic<select id="commTopic">${Object.entries(topicDefs).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('')}</select></label>
          <label style="margin-top:12px">Custom headline<input id="commHeadline" placeholder="Leave blank to auto-generate"></label>
          <label style="margin-top:12px">Custom message<textarea id="commMessage" rows="3" placeholder="Optional message for your team"></textarea></label>
          <label style="margin-top:12px">Style</label>
          <div class="comm-style-row" id="commStyles"><button type="button" data-style="fun" class="active">Fun</button><button type="button" data-style="bold">Bold</button><button type="button" data-style="motivational">Motivational</button><button type="button" data-style="clean">Clean</button></div>
          <label style="display:flex;grid-template-columns:auto 1fr;align-items:center;gap:9px;margin-top:14px"><input id="commUseData" type="checkbox" checked style="width:auto">Use latest weekly data automatically</label>
          <div class="comm-actions"><button class="primary" type="button" id="commGenerate">Generate Poster ✨</button><button class="secondary" type="button" id="commShuffle">Shuffle Design</button><button class="secondary" type="button" id="commPrint">Print Poster</button></div>
          <div class="comm-note">This version generates the design on-device from your store data and selected topic, so no AI key is exposed in the browser.</div>
        </div>
      </div>
      <div class="poster-shell"><div id="commPoster" class="team-poster style-fun"></div></div>
    </div>`;

  let selectedStyle='fun';
  let variation=0;
  const topicEl=document.getElementById('commTopic'), headlineEl=document.getElementById('commHeadline'), msgEl=document.getElementById('commMessage'), useDataEl=document.getElementById('commUseData'), poster=document.getElementById('commPoster');

  function renderPoster(){
    const topic=topicEl.value;
    const def=topicDefs[topic]||topicDefs.custom;
    const w=useDataEl.checked?latestWeek():null;
    const hero=heroFor(topic,w);
    const customHeadline=headlineEl.value.trim();
    const customMsg=msgEl.value.trim();
    const low=lowestGuest(w), hi=strongestGuest(w);
    const metricBoxes=[
      ['OSAT',w?.osat!=null?val('osat',w.osat):'—',`Goal ${s?.settings?.osatGoal??'—'}%`],
      ['Drive-Thru',w?.driveOverall!=null?val('driveOverall',w.driveOverall):'—',`Goal ${val('driveOverall',s?.settings?.driveGoal)}`],
      ['Food Variance',w?.foodVariance!=null?val('foodVariance',w.foodVariance):'—',`Goal ${s?.settings?.foodGoal??'—'}%`],
      ['Labor Saved',w?.laborHoursSaved!=null?val('laborHoursSaved',w.laborHoursSaved):'—',`Goal ${s?.settings?.laborGoal??'—'} hrs`]
    ];
    const callout = customMsg || (topic==='weekly' && low ? `${cap2(hi)} is leading the guest experience. ${cap2(low)} is the clearest opportunity. One focused week can move the score.` : def.sub);
    const footers=['ONE TEAM. ONE GOAL. ONE WIN.','EVERY GUEST. EVERY TIME.','COMMUNICATE. EXECUTE. CELEBRATE.','STRONGER TEAM. BETTER RESULTS.'];
    const footer=footers[variation%footers.length];
    poster.className=`team-poster style-${selectedStyle}`;
    poster.innerHTML=`
      <div class="poster-top">
        <div class="poster-kicker">${esc2(def.kicker)}</div>
        <div class="poster-title">${esc2(customHeadline||def.title)}</div>
        <div class="poster-sub">${esc2(dateRange(w))}</div>
        <div class="poster-store">STORE<strong>${esc2(s?.settings?.storeNumber||'—')}</strong>${esc2(s?.settings?.storeLocation||'')}</div>
      </div>
      <div class="poster-body">
        <div class="poster-hero">
          <div class="poster-big"><div class="big-label">${esc2(hero.label)}</div><div class="big-num">${esc2(hero.num)}</div><div class="big-note">${esc2(hero.note)}</div></div>
          <div class="poster-callout"><h3>TEAM MESSAGE</h3><p>${esc2(callout)}</p></div>
        </div>
        <div class="poster-grid">${metricBoxes.map(([l,v,n])=>`<div class="poster-box"><div class="label">${esc2(l)}</div><div class="value">${esc2(v)}</div><div class="small">${esc2(n)}</div></div>`).join('')}</div>
        <div class="poster-focus"><h3>THIS WEEK'S FOCUS</h3><ol>${focusItems(topic,w).map(x=>`<li>${esc2(x)}</li>`).join('')}</ol></div>
      </div>
      <div class="poster-footer">${esc2(footer)}</div>`;
  }

  document.getElementById('commStyles').addEventListener('click',e=>{const b=e.target.closest('button[data-style]');if(!b)return;selectedStyle=b.dataset.style;document.querySelectorAll('#commStyles button').forEach(x=>x.classList.toggle('active',x===b));renderPoster()});
  document.getElementById('commGenerate').onclick=renderPoster;
  document.getElementById('commShuffle').onclick=()=>{variation++;const all=['fun','bold','motivational','clean'];selectedStyle=all[(all.indexOf(selectedStyle)+1)%all.length];document.querySelectorAll('#commStyles button').forEach(x=>x.classList.toggle('active',x.dataset.style===selectedStyle));renderPoster()};
  document.getElementById('quickWeeklyPoster').onclick=()=>{topicEl.value='weekly';headlineEl.value='';msgEl.value='';useDataEl.checked=true;renderPoster();document.querySelector('.poster-shell')?.scrollIntoView({behavior:'smooth',block:'start'})};
  document.getElementById('commPrint').onclick=()=>{document.body.classList.add('poster-print');window.print();setTimeout(()=>document.body.classList.remove('poster-print'),500)};
  [topicEl,headlineEl,msgEl,useDataEl].forEach(el=>el.addEventListener(el.tagName==='SELECT'||el.type==='checkbox'?'change':'input',renderPoster));

  renderPoster();
})();