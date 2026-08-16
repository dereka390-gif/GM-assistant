// Stable illustrated mascot overlay for Communication Studio
(() => {
  const MASCOTS={
    speed:`<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg"><g stroke="#171313" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path fill="#f4c52f" d="M73 19h34v19H73z"/><circle cx="90" cy="101" r="58" fill="#f7f3ee"/><circle cx="90" cy="101" r="43" fill="#fff"/><path d="M90 101 120 75" fill="none"/><circle cx="90" cy="101" r="6" fill="#d92535"/><circle cx="70" cy="91" r="5" fill="#171313" stroke="none"/><circle cx="110" cy="91" r="5" fill="#171313" stroke="none"/><path d="M67 116q23 24 46 0" fill="none"/></g><path d="M15 55h35M8 68h32M130 54h35M140 67h32" stroke="#d92535" stroke-width="8" stroke-linecap="round"/></svg>`,
    accuracy:`<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg"><g stroke="#171313" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M48 54q42-35 84 0l-13 20H61z" fill="#d92535"/><circle cx="90" cy="97" r="46" fill="#f7c97d"/><circle cx="73" cy="93" r="5" fill="#171313" stroke="none"/><circle cx="104" cy="93" r="5" fill="#171313" stroke="none"/><path d="M73 113q17 13 34 0" fill="none"/><path d="M112 118l34 34"/><circle cx="126" cy="132" r="23" fill="#b9e5ff" fill-opacity=".8"/><rect x="23" y="108" width="48" height="56" rx="8" fill="#fff"/><path d="M34 123h24M34 138h18M34 151h28"/></g><path d="m35 124 6 7 12-14" fill="none" stroke="#2c8b57" stroke-width="6"/></svg>`,
    clean:`<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg"><g stroke="#171313" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"><path d="M58 55h61l-7 100H65z" fill="#8fd3e8"/><path d="M53 54h72l-8-20H61z" fill="#d92535"/><circle cx="79" cy="91" r="5" fill="#171313" stroke="none"/><circle cx="101" cy="91" r="5" fill="#171313" stroke="none"/><path d="M78 111q13 13 26 0" fill="none"/><path d="M145 36v96"/><path d="M135 131h22l10 33h-42z" fill="#f4c52f"/></g></svg>`,
    mystery:`<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg"><g stroke="#171313" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M43 63q47-48 94 0l-18 8H60z" fill="#6d4b2e"/><circle cx="90" cy="98" r="39" fill="#e8b775"/><circle cx="75" cy="95" r="14" fill="#1c2329"/><circle cx="107" cy="95" r="14" fill="#1c2329"/><path d="M77 119q13 9 26 0" fill="none"/><path d="M50 124 29 161h122l-22-37" fill="#7b5233"/><path d="M123 118l30 26"/><circle cx="145" cy="135" r="23" fill="#b9e5ff" fill-opacity=".75"/></g></svg>`,
    food:`<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg"><g stroke="#171313" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M41 89h98q-6-31-49-31T41 89z" fill="#e5aa47"/><path d="M43 93h94l-9 14H52z" fill="#5bbd63"/><path d="M48 108h84l-7 15H55z" fill="#d92535"/><path d="M53 124h74q-7 25-37 25t-37-25z" fill="#e5aa47"/><circle cx="73" cy="82" r="5" fill="#171313" stroke="none"/><circle cx="106" cy="82" r="5" fill="#171313" stroke="none"/><path d="M76 99q14 11 28 0" fill="none"/><circle cx="142" cy="52" r="25" fill="#f4c52f"/></g></svg>`,
    champion:`<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg"><g stroke="#171313" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M61 33h58v42q0 34-29 45-29-11-29-45z" fill="#f4c52f"/><path d="M61 45H35q0 36 29 42M119 45h26q0 36-29 42" fill="none"/><circle cx="78" cy="78" r="5" fill="#171313" stroke="none"/><circle cx="102" cy="78" r="5" fill="#171313" stroke="none"/><path d="M76 95q14 13 28 0" fill="none"/><path d="M80 120v18h20v-18M64 140h52v17H64z" fill="#f4c52f"/></g></svg>`
  };
  const LABELS={speed:'Speed Stopwatch',accuracy:'Accuracy Detective',clean:'Cleaning Hero',mystery:'Mystery Shopper',food:'Food Cost Guardian',champion:'Team Champion'};
  let selected='', size=105, position='hero-right';
  const posMap={
    'top-left':{left:'18px',top:'18px',right:'auto',bottom:'auto'},
    'top-right':{right:'22px',top:'105px',left:'auto',bottom:'auto'},
    'hero-right':{right:'24px',top:'205px',left:'auto',bottom:'auto'},
    'bottom-left':{left:'24px',bottom:'55px',right:'auto',top:'auto'},
    'bottom-right':{right:'24px',bottom:'55px',left:'auto',top:'auto'}
  };

  function render(){
    const poster=document.getElementById('commPoster'); if(!poster)return;
    poster.querySelector('.poster-character')?.remove();
    let el=poster.querySelector('.poster-mascot-safe');
    if(!selected){el?.remove();return;}
    if(!el){el=document.createElement('div');el.className='poster-mascot-safe';poster.appendChild(el);}
    if(el.dataset.key!==selected){el.innerHTML=MASCOTS[selected];el.dataset.key=selected;}
    el.style.width=size+'px';el.style.height=size+'px';Object.assign(el.style,posMap[position]||posMap['hero-right']);
    document.querySelectorAll('.safe-mascot-btn').forEach(b=>b.classList.toggle('active',b.dataset.mascot===selected));
  }

  function init(){
    const panel=document.getElementById('templateCustomizer');
    const poster=document.getElementById('commPoster');
    if(!panel||!poster)return setTimeout(init,100);
    if(document.getElementById('safeMascotControls'))return;

    const oldCharacter=document.getElementById('tcCharacter');
    oldCharacter?.closest('label')?.style.setProperty('display','none','important');
    document.getElementById('tcCharacterPos')?.closest('label')?.style.setProperty('display','none','important');
    document.getElementById('tcCharSize')?.closest('label')?.style.setProperty('display','none','important');

    const style=document.createElement('style');
    style.textContent=`.safe-mascot-wrap{grid-column:1/-1}.safe-mascot-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}.safe-mascot-btn{border:1px solid var(--line);background:#fff;border-radius:12px;padding:7px;display:grid;place-items:center;gap:4px;font-size:11px;font-weight:800;text-align:center}.safe-mascot-btn.active{border-color:var(--red);outline:3px solid #8f171d22}.safe-mascot-btn svg{width:58px;height:58px}.poster-mascot-safe{position:absolute;z-index:10;filter:drop-shadow(0 5px 4px rgba(0,0,0,.18));pointer-events:none}.poster-mascot-safe svg{width:100%;height:100%;display:block}@media(max-width:540px){.safe-mascot-grid{grid-template-columns:repeat(2,1fr)}}`;
    document.head.appendChild(style);

    const grid=panel.querySelector('.customizer-grid');
    const wrap=document.createElement('div');wrap.id='safeMascotControls';wrap.className='safe-mascot-wrap';
    wrap.innerHTML=`<b style="font-size:13px">Illustrated character</b><div class="safe-mascot-grid"><button type="button" class="safe-mascot-btn active" data-mascot="">None</button>${Object.entries(LABELS).map(([k,v])=>`<button type="button" class="safe-mascot-btn" data-mascot="${k}">${MASCOTS[k]}<span>${v}</span></button>`).join('')}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px"><label>Position<select id="safeMascotPos"><option value="hero-right">Hero right</option><option value="top-left">Top left</option><option value="top-right">Top right</option><option value="bottom-left">Bottom left</option><option value="bottom-right">Bottom right</option></select></label><label>Size<input id="safeMascotSize" type="range" min="70" max="180" value="105"></label></div>`;
    grid?.appendChild(wrap);
    wrap.addEventListener('click',e=>{const b=e.target.closest('.safe-mascot-btn');if(!b)return;selected=b.dataset.mascot;render();});
    document.getElementById('safeMascotPos').addEventListener('input',e=>{position=e.target.value;render();});
    document.getElementById('safeMascotSize').addEventListener('input',e=>{size=Number(e.target.value);render();});

    const mo=new MutationObserver(()=>{if(selected&&!poster.querySelector('.poster-mascot-safe'))requestAnimationFrame(render);});
    mo.observe(poster,{childList:true,subtree:false});
    ['commGenerate','commShuffle','quickWeeklyPoster'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>setTimeout(render,50)));
    render();
  }
  init();
})();