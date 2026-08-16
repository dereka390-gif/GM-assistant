// Communication poster: background design presets + tap/hold drag boxes
(() => {
  const HOLD_MS = 180;
  const movableSelector = '.poster-big,.poster-callout,.poster-box,.poster-focus,.poster-footer';
  const positions = new Map();

  function boot(){
    const poster = document.getElementById('commPoster');
    const panel = document.getElementById('templateCustomizer');
    if(!poster || !panel) return setTimeout(boot,100);
    if(document.getElementById('dragLayoutControls')) return;

    const style=document.createElement('style');
    style.textContent=`
      .drag-layout-controls{grid-column:1/-1;border-top:1px solid var(--line);padding-top:10px;margin-top:4px}
      .drag-layout-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:end;margin-top:8px}
      .team-poster.bg-comic .poster-body{background-color:#fff8ee!important;background-image:radial-gradient(circle at 7% 8%,#f4c52f55 0 5px,transparent 6px),radial-gradient(circle at 91% 12%,#d9253540 0 6px,transparent 7px),linear-gradient(115deg,transparent 0 47%,#d9253518 48% 50%,transparent 51% 100%),linear-gradient(25deg,transparent 0 62%,#f4c52f22 63% 65%,transparent 66% 100%)!important;background-size:110px 110px,135px 135px,230px 230px,260px 260px!important}
      .team-poster.bg-notebook .poster-body{background-color:#fffdf5!important;background-image:linear-gradient(#6ca0c822 1px,transparent 1px),linear-gradient(90deg,#d9253522 1px,transparent 1px)!important;background-size:100% 28px,52px 100%!important;background-position:0 6px,34px 0!important}
      .team-poster.bg-bold .poster-body{background:linear-gradient(135deg,#1a1515 0 33%,#2b2020 33% 66%,#151212 66% 100%)!important}.team-poster.bg-bold .poster-box,.team-poster.bg-bold .poster-callout{box-shadow:0 8px 18px #0005}.team-poster.bg-bold .poster-focus{outline:2px solid #f4c52f55}
      .team-poster.bg-celebrate .poster-body{background-color:#fff7e6!important;background-image:radial-gradient(circle at 20% 20%,#f4c52f 0 3px,transparent 4px),radial-gradient(circle at 75% 25%,#d92535 0 3px,transparent 4px),radial-gradient(circle at 30% 70%,#2c8b57 0 3px,transparent 4px),radial-gradient(circle at 85% 75%,#315f9b 0 3px,transparent 4px)!important;background-size:70px 70px,90px 90px,80px 80px,95px 95px!important}
      .team-poster.bg-clean .poster-body{background:linear-gradient(180deg,#ffffff,#f5f1ec)!important}
      .drag-ready{cursor:grab;touch-action:none;user-select:none;position:relative;z-index:3;transition:box-shadow .12s ease}
      .drag-ready.drag-armed{box-shadow:0 0 0 3px #315f9b55,0 12px 28px #0002!important;z-index:25!important;cursor:grabbing}
      .drag-layout-tip{font-size:11px;line-height:1.4;color:var(--muted);margin-top:7px}
      @media print{.drag-ready,.drag-ready.drag-armed{box-shadow:inherit!important}}
    `;
    document.head.appendChild(style);

    const grid=panel.querySelector('.customizer-grid');
    const controls=document.createElement('div');
    controls.id='dragLayoutControls'; controls.className='drag-layout-controls';
    controls.innerHTML=`
      <b style="font-size:13px">Background & movable boxes</b>
      <div class="drag-layout-row">
        <label>Background design<select id="dragBg"><option value="clean">Clean</option><option value="comic">Comic splash</option><option value="notebook">Notebook</option><option value="celebrate">Celebration</option><option value="bold">Bold black/red</option></select></label>
        <button type="button" class="secondary" id="resetDragLayout">Reset Layout</button>
      </div>
      <div class="drag-layout-tip">Tap and hold a box for a moment, then drag it with your finger. The position stays while you customize the current poster.</div>`;
    grid?.appendChild(controls);

    function setBackground(name){
      poster.classList.remove('bg-clean','bg-comic','bg-notebook','bg-celebrate','bg-bold');
      poster.classList.add('bg-'+name);
    }
    document.getElementById('dragBg').addEventListener('input',e=>setBackground(e.target.value));
    setBackground('clean');

    function keyFor(el,index){
      if(el.classList.contains('poster-big')) return 'hero';
      if(el.classList.contains('poster-callout')) return 'callout';
      if(el.classList.contains('poster-focus')) return 'focus';
      if(el.classList.contains('poster-footer')) return 'footer';
      if(el.classList.contains('poster-box')) return 'box-'+index;
      return 'item-'+index;
    }

    function wire(){
      const els=[...poster.querySelectorAll(movableSelector)];
      let boxIndex=0;
      els.forEach((el,i)=>{
        const key=el.classList.contains('poster-box') ? keyFor(el,boxIndex++) : keyFor(el,i);
        el.dataset.dragKey=key;
        el.classList.add('drag-ready');
        const saved=positions.get(key);
        if(saved){ el.dataset.dragX=saved.x; el.dataset.dragY=saved.y; el.style.transform=`translate(${saved.x}px,${saved.y}px)`; }
        if(el.dataset.dragWired==='1') return;
        el.dataset.dragWired='1';
        let timer=null, active=false, pointerId=null, startX=0,startY=0,baseX=0,baseY=0;
        const cancel=()=>{ if(timer){clearTimeout(timer);timer=null;} if(!active) el.classList.remove('drag-armed'); };
        el.addEventListener('pointerdown',e=>{
          if(e.pointerType==='mouse' && e.button!==0) return;
          pointerId=e.pointerId; startX=e.clientX; startY=e.clientY; baseX=Number(el.dataset.dragX||0); baseY=Number(el.dataset.dragY||0);
          timer=setTimeout(()=>{
            active=true; timer=null; el.classList.add('drag-armed');
            try{el.setPointerCapture(pointerId)}catch{}
            if(navigator.vibrate) navigator.vibrate(12);
          },HOLD_MS);
        });
        el.addEventListener('pointermove',e=>{
          if(pointerId!==e.pointerId) return;
          if(!active){ if(Math.hypot(e.clientX-startX,e.clientY-startY)>10) cancel(); return; }
          e.preventDefault();
          const rect=poster.getBoundingClientRect();
          const scale=poster.offsetWidth ? rect.width/poster.offsetWidth : 1;
          const x=baseX+(e.clientX-startX)/scale, y=baseY+(e.clientY-startY)/scale;
          el.dataset.dragX=x; el.dataset.dragY=y; el.style.transform=`translate(${x}px,${y}px)`;
        },{passive:false});
        const finish=e=>{
          if(pointerId!==e.pointerId) return;
          cancel();
          if(active){
            active=false; el.classList.remove('drag-armed');
            const x=Number(el.dataset.dragX||0), y=Number(el.dataset.dragY||0); positions.set(el.dataset.dragKey,{x,y});
            try{el.releasePointerCapture(pointerId)}catch{}
          }
          pointerId=null;
        };
        el.addEventListener('pointerup',finish); el.addEventListener('pointercancel',finish); el.addEventListener('lostpointercapture',()=>{active=false;el.classList.remove('drag-armed');});
      });
    }

    document.getElementById('resetDragLayout').addEventListener('click',()=>{
      positions.clear();
      poster.querySelectorAll(movableSelector).forEach(el=>{delete el.dataset.dragX;delete el.dataset.dragY;el.style.transform='';});
    });

    const mo=new MutationObserver(()=>requestAnimationFrame(wire));
    mo.observe(poster,{childList:true,subtree:true});
    ['commGenerate','commShuffle','quickWeeklyPoster'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>setTimeout(wire,80)));
    wire();
  }
  boot();
})();