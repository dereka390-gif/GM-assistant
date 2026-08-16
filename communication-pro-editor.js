// Pro touch editor for GM Assistant Communication posters
(() => {
  const STORAGE_KEY='gmCommProLayoutV1';
  const SELECTOR='.poster-big,.poster-callout,.poster-box,.poster-focus,.poster-footer,.poster-mascot-safe,.poster-mascot-touch';
  const MIN_SCALE=.45, MAX_SCALE=2.5, HOLD_MS=120, SNAP=10;
  const layout={}; let selected=null, locked=new Set(), zCounter=50, saveTimer=null;
  let guideX=null,guideY=null;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const dist=(a,b)=>Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);
  function load(){try{Object.assign(layout,JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}'))}catch{}}
  function save(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(layout))}catch{}},120)}
  function keyFor(el,i){
    if(el.dataset.proKey)return el.dataset.proKey;
    let k='item-'+i;
    if(el.classList.contains('poster-big'))k='hero';
    else if(el.classList.contains('poster-callout'))k='callout';
    else if(el.classList.contains('poster-focus'))k='focus';
    else if(el.classList.contains('poster-footer'))k='footer';
    else if(el.classList.contains('poster-mascot-safe')||el.classList.contains('poster-mascot-touch'))k='mascot';
    else if(el.classList.contains('poster-box')){const label=(el.querySelector('.label')?.textContent||'box').trim().replace(/\s+/g,'-').toLowerCase();k='box-'+label;}
    el.dataset.proKey=k;return k;
  }
  function stateFor(el){const k=el.dataset.proKey;return layout[k]||(layout[k]={x:0,y:0,scale:1,rot:0,z:3,locked:false})}
  function apply(el){const s=stateFor(el);el.style.transform=`translate(${s.x}px,${s.y}px) scale(${s.scale}) rotate(${s.rot}deg)`;el.style.zIndex=String(s.z||3);el.classList.toggle('pro-locked',!!s.locked)}
  function applyAll(poster){[...poster.querySelectorAll(SELECTOR)].forEach((el,i)=>{keyFor(el,i);apply(el)})}
  function select(el){
    if(selected===el)return;
    selected?.classList.remove('pro-selected'); selected=el;
    document.querySelectorAll('.pro-editor-toolbar').forEach(x=>x.remove());
    if(!el)return;
    el.classList.add('pro-selected');
    const tb=document.createElement('div');tb.className='pro-editor-toolbar';
    tb.innerHTML=`<button data-act="back">↓</button><button data-act="forward">↑</button><button data-act="duplicate">⧉</button><button data-act="lock">${stateFor(el).locked?'Unlock':'Lock'}</button><button data-act="delete">Delete</button>`;
    const shell=document.querySelector('.poster-shell')||el.parentElement; shell.appendChild(tb);
    tb.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;action(b.dataset.act,tb)});
  }
  function action(act,tb){if(!selected)return;const s=stateFor(selected),poster=document.getElementById('commPoster');
    if(act==='forward'){s.z=++zCounter;apply(selected)}
    if(act==='back'){s.z=Math.max(1,(s.z||3)-1);apply(selected)}
    if(act==='lock'){s.locked=!s.locked;apply(selected);tb.querySelector('[data-act="lock"]').textContent=s.locked?'Unlock':'Lock'}
    if(act==='delete'){selected.style.display='none';s.hidden=true;select(null)}
    if(act==='duplicate'){
      const clone=selected.cloneNode(true);clone.removeAttribute('data-pro-wired');clone.removeAttribute('data-pro-key');clone.classList.remove('pro-selected');selected.parentElement.appendChild(clone);const k='custom-'+Date.now();clone.dataset.proKey=k;layout[k]={...s,x:s.x+18,y:s.y+18,z:++zCounter};wireOne(clone);apply(clone);select(clone)
    }
    save();
  }
  function showGuides(poster,rect){
    const pr=poster.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,pcx=pr.left+pr.width/2,pcy=pr.top+pr.height/2;
    guideX.style.display=Math.abs(cx-pcx)<SNAP?'block':'none';guideY.style.display=Math.abs(cy-pcy)<SNAP?'block':'none';
    return {snapX:Math.abs(cx-pcx)<SNAP?pcx-cx:0,snapY:Math.abs(cy-pcy)<SNAP?pcy-cy:0};
  }
  function wireOne(el){if(el.dataset.proWired==='1')return;el.dataset.proWired='1';el.classList.add('pro-editable');
    const poster=document.getElementById('commPoster'); const pointers=new Map();let timer=null,drag=false,start=null,pinch=null;
    el.addEventListener('pointerdown',e=>{
      if(e.pointerType==='mouse'&&e.button!==0)return; if(stateFor(el).locked){select(el);return;}
      pointers.set(e.pointerId,{clientX:e.clientX,clientY:e.clientY});try{el.setPointerCapture(e.pointerId)}catch{}
      if(pointers.size===1){select(el);const s=stateFor(el);start={px:e.clientX,py:e.clientY,x:s.x,y:s.y};timer=setTimeout(()=>{drag=true;el.classList.add('pro-moving')},HOLD_MS)}
      if(pointers.size===2){clearTimeout(timer);drag=false;const pts=[...pointers.values()],s=stateFor(el);pinch={d:dist(pts[0],pts[1]),scale:s.scale,angle:Math.atan2(pts[1].clientY-pts[0].clientY,pts[1].clientX-pts[0].clientX),rot:s.rot};el.classList.add('pro-moving')}
    });
    el.addEventListener('pointermove',e=>{
      if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{clientX:e.clientX,clientY:e.clientY});const s=stateFor(el),pts=[...pointers.values()];
      if(pts.length>=2&&pinch){e.preventDefault();const d=dist(pts[0],pts[1]);s.scale=clamp(pinch.scale*(d/pinch.d),MIN_SCALE,MAX_SCALE);const a=Math.atan2(pts[1].clientY-pts[0].clientY,pts[1].clientX-pts[0].clientX);s.rot=pinch.rot+(a-pinch.angle)*180/Math.PI;apply(el);save();return;}
      if(!drag||!start)return;e.preventDefault();const pr=poster.getBoundingClientRect(),ratio=poster.offsetWidth?pr.width/poster.offsetWidth:1;s.x=start.x+(e.clientX-start.px)/ratio;s.y=start.y+(e.clientY-start.py)/ratio;apply(el);const snap=showGuides(poster,el.getBoundingClientRect());if(snap.snapX||snap.snapY){s.x+=snap.snapX/ratio;s.y+=snap.snapY/ratio;apply(el)}save();
    },{passive:false});
    const end=e=>{clearTimeout(timer);pointers.delete(e.pointerId);if(pointers.size<2)pinch=null;if(!pointers.size){drag=false;el.classList.remove('pro-moving');guideX.style.display=guideY.style.display='none'}save()};
    el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
  }
  function boot(){
    const poster=document.getElementById('commPoster'),panel=document.getElementById('templateCustomizer');if(!poster||!panel)return setTimeout(boot,100);if(document.getElementById('proEditorStyles'))return;
    load();
    const st=document.createElement('style');st.id='proEditorStyles';st.textContent=`
      .poster-shell{position:relative}.pro-editable{touch-action:none;user-select:none;transform-origin:center center;will-change:transform}.pro-editable.pro-selected{outline:3px solid #2b7fff!important;outline-offset:3px}.pro-editable.pro-moving{outline:3px solid #f0b323!important;box-shadow:0 16px 34px #0003!important}.pro-editable.pro-locked{outline-style:dashed!important}
      .pro-editor-toolbar{position:sticky;bottom:10px;z-index:1000;margin:10px auto 0;display:flex;gap:6px;justify-content:center;flex-wrap:wrap;background:#171313ee;padding:8px;border-radius:14px;max-width:max-content;box-shadow:0 8px 24px #0004}.pro-editor-toolbar button{border:0;border-radius:9px;padding:8px 10px;background:#fff;color:#171313;font-weight:800}
      .pro-guide-x,.pro-guide-y{position:absolute;z-index:999;pointer-events:none;display:none;background:#2b7fffaa}.pro-guide-x{top:0;bottom:0;width:1px;left:50%}.pro-guide-y{left:0;right:0;height:1px;top:50%}
      .pro-panel{grid-column:1/-1;border-top:1px solid var(--line);padding-top:10px;margin-top:6px}.pro-panel .row{display:flex;gap:8px;flex-wrap:wrap}.pro-tip{font-size:11px;color:var(--muted);line-height:1.4;margin-top:7px}
      @media print{.pro-editor-toolbar,.pro-guide-x,.pro-guide-y{display:none!important}.pro-editable.pro-selected,.pro-editable.pro-moving{outline:none!important}}
    `;document.head.appendChild(st);
    guideX=document.createElement('div');guideY=document.createElement('div');guideX.className='pro-guide-x';guideY.className='pro-guide-y';poster.append(guideX,guideY);
    const wrap=document.createElement('div');wrap.className='pro-panel';wrap.innerHTML=`<b style="font-size:13px">Pro Layout Editor</b><div class="row" style="margin-top:8px"><button type="button" class="secondary" id="proReset">Reset all</button><button type="button" class="secondary" id="proSave">Save layout</button><button type="button" class="secondary" id="proRestore">Restore hidden</button></div><div class="pro-tip">Tap a box to select it. Hold and drag with one finger. Use two fingers to pinch and rotate. Blue guide lines snap items to center. Selected items can be layered, duplicated, locked, or deleted.</div>`;
    panel.querySelector('.customizer-grid')?.appendChild(wrap);
    document.getElementById('proReset').onclick=()=>{Object.keys(layout).forEach(k=>delete layout[k]);localStorage.removeItem(STORAGE_KEY);poster.querySelectorAll(SELECTOR).forEach(el=>{el.style.transform='';el.style.zIndex='';el.style.display='';el.classList.remove('pro-locked')});select(null)};
    document.getElementById('proSave').onclick=()=>{save();const b=document.getElementById('proSave');b.textContent='Saved ✓';setTimeout(()=>b.textContent='Save layout',900)};
    document.getElementById('proRestore').onclick=()=>{poster.querySelectorAll(SELECTOR).forEach(el=>{const s=stateFor(el);s.hidden=false;el.style.display=''});save()};
    function wire(){[...poster.querySelectorAll(SELECTOR)].forEach((el,i)=>{keyFor(el,i);const s=stateFor(el);if(s.hidden)el.style.display='none';wireOne(el);apply(el)})}
    const mo=new MutationObserver(()=>requestAnimationFrame(wire));mo.observe(poster,{childList:true,subtree:true});['commGenerate','commShuffle','quickWeeklyPoster'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>setTimeout(wire,80)));wire();
    document.addEventListener('pointerdown',e=>{if(!e.target.closest('#commPoster')&&!e.target.closest('.pro-editor-toolbar'))select(null)},true);
  }
  boot();
})();