// Two-finger pinch resizing for movable Communication poster boxes
(() => {
  const movableSelector = '.poster-big,.poster-callout,.poster-box,.poster-focus,.poster-footer';
  const scales = new Map();
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 2.0;

  function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
  function distance(a,b){ return Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY); }

  function keyFor(el,index){
    if(el.dataset.dragKey) return el.dataset.dragKey;
    if(el.classList.contains('poster-big')) return 'hero';
    if(el.classList.contains('poster-callout')) return 'callout';
    if(el.classList.contains('poster-focus')) return 'focus';
    if(el.classList.contains('poster-footer')) return 'footer';
    return 'pinch-'+index;
  }

  function boot(){
    const poster=document.getElementById('commPoster');
    if(!poster) return setTimeout(boot,100);
    if(document.getElementById('pinchScaleStyles')) return;

    const style=document.createElement('style');
    style.id='pinchScaleStyles';
    style.textContent=`
      .pinch-resize{touch-action:none;transform-origin:center center;will-change:scale}
      .pinch-resize.pinch-active{outline:3px solid #f0b32388;outline-offset:3px;z-index:30!important}
      @media print{.pinch-resize.pinch-active{outline:none!important}}
    `;
    document.head.appendChild(style);

    function wire(){
      const els=[...poster.querySelectorAll(movableSelector)];
      els.forEach((el,index)=>{
        const key=keyFor(el,index);
        el.dataset.pinchKey=key;
        el.classList.add('pinch-resize');
        const saved=scales.get(key);
        if(saved!=null) el.style.scale=String(saved);
        if(el.dataset.pinchWired==='1') return;
        el.dataset.pinchWired='1';

        let pinching=false;
        let startDistance=0;
        let startScale=Number(el.style.scale||1);

        el.addEventListener('touchstart',e=>{
          if(e.touches.length!==2) return;
          pinching=true;
          startDistance=distance(e.touches[0],e.touches[1]);
          startScale=Number(el.style.scale||scales.get(key)||1);
          el.classList.add('pinch-active');
          e.preventDefault();
        },{passive:false});

        el.addEventListener('touchmove',e=>{
          if(!pinching || e.touches.length!==2) return;
          const d=distance(e.touches[0],e.touches[1]);
          if(!startDistance) return;
          const next=clamp(startScale*(d/startDistance),MIN_SCALE,MAX_SCALE);
          el.style.scale=String(next);
          scales.set(el.dataset.pinchKey||key,next);
          e.preventDefault();
        },{passive:false});

        const finish=e=>{
          if(!pinching) return;
          if(e.touches && e.touches.length>=2) return;
          pinching=false;
          el.classList.remove('pinch-active');
          const finalScale=Number(el.style.scale||1);
          scales.set(el.dataset.pinchKey||key,finalScale);
        };
        el.addEventListener('touchend',finish,{passive:true});
        el.addEventListener('touchcancel',finish,{passive:true});
      });
    }

    const reset=document.getElementById('resetDragLayout');
    reset?.addEventListener('click',()=>{
      scales.clear();
      poster.querySelectorAll(movableSelector).forEach(el=>{el.style.scale='';});
    });

    const observer=new MutationObserver(()=>requestAnimationFrame(wire));
    observer.observe(poster,{childList:true,subtree:true});
    ['commGenerate','commShuffle','quickWeeklyPoster'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>setTimeout(wire,100)));
    wire();
  }
  boot();
})();
