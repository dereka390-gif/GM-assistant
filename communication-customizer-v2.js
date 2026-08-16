// Unified Communication template customizer + illustrated mascots
(() => {
  const MASCOTS={
    speed:`<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg"><g stroke="#171313" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path fill="#f4c52f" d="M73 19h34v19H73z"/><circle cx="90" cy="101" r="58" fill="#f7f3ee"/><circle cx="90" cy="101" r="43" fill="#fff"/><path d="M90 101 120 75" fill="none"/><circle cx="90" cy="101" r="6" fill="#d92535"/><circle cx="70" cy="91" r="5" fill="#171313" stroke="none"/><circle cx="110" cy="91" r="5" fill="#171313" stroke="none"/><path d="M67 116q23 24 46 0" fill="none"/></g><path d="M15 55h35M8 68h32M130 54h35M140 67h32" stroke="#d92535" stroke-width="8" stroke-linecap="round"/></svg>`,
    accuracy:`<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg"><g stroke="#171313" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M48 54q42-35 84 0l-13 20H61z" fill="#d92535"/><circle cx="90" cy="97" r="46" fill="#f7c97d"/><circle cx="73" cy="93" r="5" fill="#171313" stroke="none"/><circle cx="104" cy="93" r="5" fill="#171313" stroke="none"/><path d="M73 113q17 13 34 0" fill="none"/><path d="M112 118l34 34"/><circle cx="126" cy="132" r="23" fill="#b9e5ff" fill-opacity=".8"/><rect x="23" y="108" width="48" height="56" rx="8" fill="#fff"/><path d="M34 123h24M34 138h18M34 151h28"/></g><path d="m35 124 6 7 12-14" fill="none" stroke="#2c8b57" stroke-width="6"/></svg>`,
    clean:`<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg"><g stroke="#171313" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"><path d="M58 55h61l-7 100H65z" fill="#8fd3e8"/><path d="M53 54h72l-8-20H61z" fill="#d92535"/><circle cx="79" cy="91" r="5" fill="#171313" stroke="none"/><circle cx="101" cy="91" r="5" fill="#171313" stroke="none"/><path d="M78 111q13 13 26 0" fill="none"/><path d="M145 36v96"/><path d="M135 131h22l10 33h-42z" fill="#f4c52f"/><path d="M23 55q10-14 20 0-10 14-20 0z" fill="#fff"/></g></svg>`,
    mystery:`<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg"><g stroke="#171313" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M43 63q47-48 94 0l-18 8H60z" fill="#6d4b2e"/><circle cx="90" cy="98" r="39" fill="#e8b775"/><circle cx="75" cy="95" r="14" fill="#1c2329"/><circle cx="107" cy="95" r="14" fill="#1c2329"/><path d="M77 119q13 9 26 0" fill="none"/><path d="M50 124 29 161h122l-22-37" fill="#7b5233"/><path d="M123 118l30 26"/><circle cx="145" cy="135" r="23" fill="#b9e5ff" fill-opacity=".75"/></g></svg>`,
    food:`<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg"><g stroke="#171313" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M41 89h98q-6-31-49-31T41 89z" fill="#e5aa47"/><path d="M43 93h94l-9 14H52z" fill="#5bbd63"/><path d="M48 108h84l-7 15H55z" fill="#d92535"/><path d="M53 124h74q-7 25-37 25t-37-25z" fill="#e5aa47"/><circle cx="73" cy="82" r="5" fill="#171313" stroke="none"/><circle cx="106" cy="82" r="5" fill="#171313" stroke="none"/><path d="M76 99q14 11 28 0" fill="none"/><circle cx="142" cy="52" r="25" fill="#f4c52f"/><path d="M142 36v32"/></g></svg>`,
    champion:`<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg"><g stroke="#171313" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M61 33h58v42q0 34-29 45-29-11-29-45z" fill="#f4c52f"/><path d="M61 45H35q0 36 29 42M119 45h26q0 36-29 42" fill="none"/><circle cx="78" cy="78" r="5" fill="#171313" stroke="none"/><circle cx="102" cy="78" r="5" fill="#171313" stroke="none"/><path d="M76 95q14 13 28 0" fill="none"/><path d="M80 120v18h20v-18M64 140h52v17H64z" fill="#f4c52f"/></g></svg>`
  };
  const LABELS={speed:'Speed Stopwatch',accuracy:'Accuracy Detective',clean:'Cleaning Hero',mystery:'Mystery Shopper',food:'Food Cost Guardian',champion:'Team Champion'};
  const defaults={primary:'#d92535',highlight:'#f4c52f',header:'#171313',body:'#fff9df',pattern:'none',layout:'balanced',mascot:'',pos:'hero-right',size:96,title:64,footer:'',focus:['','','']};
  let state={...defaults,focus:[...defaults.focus]};

  function boot(){
    const poster=document.getElementById('commPoster');
    const tools=document.querySelector('.comm-tools .card');
    if(!poster||!tools) return setTimeout(boot,100);
    if(document.getElementById('templateCustomizerV2')) return;

    const style=document.createElement('style');
    style.textContent=`
      .tcv2{margin-top:16px;padding-top:14px;border-top:1px solid var(--line)}.tcv2 summary{font-weight:900;color:var(--red);cursor:pointer}.tcv2-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.tcv2 .full{grid-column:1/-1}
      .tcv2-mascots{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}.tcv2-mascot{border:1px solid var(--line);background:#fff;border-radius:12px;padding:7px;font-size:11px;font-weight:800;display:grid;gap:4px;place-items:center;text-align:center}.tcv2-mascot.active{border-color:var(--red);outline:3px solid #8f171d22}.tcv2-mascot svg{width:58px;height:58px}
      .poster-character-v2{position:absolute;z-index:10;width:var(--mascot-size,96px);height:var(--mascot-size,96px);filter:drop-shadow(0 5px 4px rgba(0,0,0,.18));pointer-events:none}.poster-character-v2 svg{width:100%;height:100%;display:block}
      .team-poster.v2-dots .poster-body{background-color:var(--v2-body,#fff9df)!important;background-image:radial-gradient(rgba(0,0,0,.08) 1.5px,transparent 1.5px)!important;background-size:18px 18px!important}.team-poster.v2-stripes .poster-body{background:repeating-linear-gradient(-45deg,var(--v2-body,#fff9df),var(--v2-body,#fff9df) 18px,rgba(0,0,0,.04) 18px,rgba(0,0,0,.04) 36px)!important}.team-poster.v2-confetti .poster-body{background-color:var(--v2-body,#fff9df)!important;background-image:radial-gradient(circle at 10% 20%,#f4c52f66 0 4px,transparent 5px),radial-gradient(circle at 80% 15%,#d925354d 0 5px,transparent 6px),radial-gradient(circle at 30% 75%,#2c6b5540 0 4px,transparent 5px)!important;background-size:95px 95px,120px 120px,110px 110px!important}
      .team-poster.v2-hero .poster-hero{grid-template-columns:1.35fr .65fr}.team-poster.v2-message .poster-hero{grid-template-columns:.7fr 1.3fr}.team-poster.v2-compact .poster-body{gap:9px}.team-poster.v2-compact .poster-big{min-height:135px}
      @media(max-width:540px){.tcv2-grid{grid-template-columns:1fr}.tcv2 .full{grid-column:auto}.tcv2-mascots{grid-template-columns:repeat(2,1fr)}}
    `;
    document.head.appendChild(style);

    const panel=document.createElement('details'); panel.id='templateCustomizerV2'; panel.className='tcv2';
    panel.innerHTML=`<summary>Customize This Template</summary><div class="tcv2-grid">
      <label>Primary color<input id="v2Primary" type="color" value="${state.primary}"></label><label>Highlight color<input id="v2Highlight" type="color" value="${state.highlight}"></label>
      <label>Header color<input id="v2Header" type="color" value="${state.header}"></label><label>Page color<input id="v2Body" type="color" value="${state.body}"></label>
      <label>Background<select id="v2Pattern"><option value="none">Plain</option><option value="dots">Dots</option><option value="stripes">Stripes</option><option value="confetti">Confetti</option></select></label>
      <label>Layout<select id="v2Layout"><option value="balanced">Balanced</option><option value="hero">Big metric</option><option value="message">Big message</option><option value="compact">Compact</option></select></label>
      <div class="full"><b>Illustrated character</b><div class="tcv2-mascots"><button type="button" class="tcv2-mascot active" data-mascot="">None</button>${Object.entries(LABELS).map(([k,v])=>`<button type="button" class="tcv2-mascot" data-mascot="${k}">${MASCOTS[k]}<span>${v}</span></button>`).join('')}</div></div>
      <label>Character position<select id="v2Pos"><option value="hero-right">Hero right</option><option value="top-left">Top left</option><option value="top-right">Top right</option><option value="bottom-left">Bottom left</option><option value="bottom-right">Bottom right</option></select></label>
      <label>Character size<input id="v2Size" type="range" min="70" max="180" value="96"></label>
      <label class="full">Headline size<input id="v2Title" type="range" min="36" max="82" value="64"></label>
      <label class="full">Focus point 1<input id="v2Focus1" placeholder="Leave blank for generated text"></label><label class="full">Focus point 2<input id="v2Focus2" placeholder="Leave blank for generated text"></label><label class="full">Focus point 3<input id="v2Focus3" placeholder="Leave blank for generated text"></label>
      <label class="full">Footer message<input id="v2Footer" placeholder="Leave blank for generated footer"></label><div class="full"><button type="button" class="secondary" id="v2Reset">Reset Customization</button></div>
    </div>`;
    const actions=tools.querySelector('.comm-actions'); (actions||tools).insertAdjacentElement(actions?'beforebegin':'beforeend',panel);

    function pos(el){
      const p={
        'top-left':{left:'18px',top:'18px',right:'auto',bottom:'auto'},'top-right':{right:'22px',top:'105px',left:'auto',bottom:'auto'},'hero-right':{right:'24px',top:'205px',left:'auto',bottom:'auto'},'bottom-right':{right:'24px',bottom:'55px',left:'auto',top:'auto'},'bottom-left':{left:'24px',bottom:'55px',right:'auto',top:'auto'}
      }; Object.assign(el.style,p[state.pos]);
    }
    function apply(){
      poster.style.setProperty('--accent',state.primary); poster.style.setProperty('--accent2',state.highlight); poster.style.setProperty('--v2-body',state.body);
      const top=poster.querySelector('.poster-top'); if(top) top.style.background=state.header;
      poster.classList.remove('v2-dots','v2-stripes','v2-confetti','v2-hero','v2-message','v2-compact');
      if(state.pattern!=='none') poster.classList.add('v2-'+state.pattern); if(state.layout!=='balanced') poster.classList.add('v2-'+state.layout);
      const body=poster.querySelector('.poster-body'); if(body&&state.pattern==='none') body.style.background=`linear-gradient(180deg,${state.body},#fff)`;
      const title=poster.querySelector('.poster-title'); if(title) title.style.fontSize=state.title+'px';
      let m=poster.querySelector('.poster-character-v2'); if(state.mascot){ if(!m){m=document.createElement('div');m.className='poster-character-v2';poster.appendChild(m)} m.innerHTML=MASCOTS[state.mascot];m.style.setProperty('--mascot-size',state.size+'px');pos(m);} else m?.remove();
      const lis=poster.querySelectorAll('.poster-focus li'); state.focus.forEach((t,i)=>{if(t&&lis[i])lis[i].textContent=t}); const footer=poster.querySelector('.poster-footer'); if(footer&&state.footer)footer.textContent=state.footer;
      panel.querySelectorAll('.tcv2-mascot').forEach(b=>b.classList.toggle('active',b.dataset.mascot===state.mascot));
    }
    const bind=(id,key)=>document.getElementById(id).addEventListener('input',e=>{state[key]=e.target.value;apply()});
    bind('v2Primary','primary');bind('v2Highlight','highlight');bind('v2Header','header');bind('v2Body','body');bind('v2Pattern','pattern');bind('v2Layout','layout');bind('v2Pos','pos');
    document.getElementById('v2Size').addEventListener('input',e=>{state.size=Number(e.target.value);apply()});document.getElementById('v2Title').addEventListener('input',e=>{state.title=Number(e.target.value);apply()});
    [1,2,3].forEach((n,i)=>document.getElementById('v2Focus'+n).addEventListener('input',e=>{state.focus[i]=e.target.value;apply()}));bind('v2Footer','footer');
    panel.querySelector('.tcv2-mascots').addEventListener('click',e=>{const b=e.target.closest('.tcv2-mascot');if(!b)return;state.mascot=b.dataset.mascot;apply()});
    document.getElementById('v2Reset').addEventListener('click',()=>{state={...defaults,focus:[...defaults.focus]};document.getElementById('v2Primary').value=state.primary;document.getElementById('v2Highlight').value=state.highlight;document.getElementById('v2Header').value=state.header;document.getElementById('v2Body').value=state.body;document.getElementById('v2Pattern').value='none';document.getElementById('v2Layout').value='balanced';document.getElementById('v2Pos').value='hero-right';document.getElementById('v2Size').value='96';document.getElementById('v2Title').value='64';[1,2,3].forEach(n=>document.getElementById('v2Focus'+n).value='');document.getElementById('v2Footer').value='';apply()});
    const observer=new MutationObserver(()=>requestAnimationFrame(apply)); observer.observe(poster,{childList:true,subtree:true}); apply();
  }
  boot();
})();