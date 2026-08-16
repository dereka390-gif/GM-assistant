// Illustrated mascot pack for Communication Studio customization
(() => {
  const svg = {
    speed:`<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" aria-label="Speed stopwatch mascot"><g stroke="#171313" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path fill="#f4c52f" d="M73 19h34v19H73z"/><path fill="#fff" d="M122 42l13-13 15 15-13 13z"/><circle cx="90" cy="101" r="58" fill="#f7f3ee"/><circle cx="90" cy="101" r="43" fill="#fff"/><path d="M90 101 120 75" fill="none"/><circle cx="90" cy="101" r="6" fill="#d92535"/><circle cx="70" cy="91" r="5" fill="#171313" stroke="none"/><circle cx="110" cy="91" r="5" fill="#171313" stroke="none"/><path d="M67 116q23 24 46 0" fill="none"/><path d="M38 83 20 74M142 83l18-9M44 128l-18 12M136 128l18 12" fill="none"/></g><path d="M15 55h35M8 68h32" stroke="#d92535" stroke-width="8" stroke-linecap="round"/><path d="M130 54h35M140 67h32" stroke="#d92535" stroke-width="8" stroke-linecap="round"/></svg>`,
    accuracy:`<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" aria-label="Accuracy detective mascot"><g stroke="#171313" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M48 54q42-35 84 0l-13 20H61z" fill="#d92535"/><circle cx="90" cy="97" r="46" fill="#f7c97d"/><path d="M57 82q33-18 66 0" fill="none"/><circle cx="73" cy="93" r="5" fill="#171313" stroke="none"/><circle cx="104" cy="93" r="5" fill="#171313" stroke="none"/><path d="M73 113q17 13 34 0" fill="none"/><path d="M112 118l34 34" fill="none"/><circle cx="126" cy="132" r="23" fill="#b9e5ff" fill-opacity=".8"/><rect x="23" y="108" width="48" height="56" rx="8" fill="#fff"/><path d="M34 123h24M34 138h18M34 151h28" fill="none"/><path d="M26 96q15 8 26 5" fill="none"/></g><path d="m35 124 6 7 12-14" fill="none" stroke="#2c8b57" stroke-width="6" stroke-linecap="round"/></svg>`,
    clean:`<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" aria-label="Cleaning hero mascot"><g stroke="#171313" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"><path d="M58 55h61l-7 100H65z" fill="#8fd3e8"/><path d="M53 54h72l-8-20H61z" fill="#d92535"/><circle cx="79" cy="91" r="5" fill="#171313" stroke="none"/><circle cx="101" cy="91" r="5" fill="#171313" stroke="none"/><path d="M78 111q13 13 26 0" fill="none"/><path d="M59 86 33 73M119 86l25-13" fill="none"/><path d="M145 36v96" fill="none"/><path d="M135 131h22l10 33h-42z" fill="#f4c52f"/><path d="M23 55q10-14 20 0-10 14-20 0zm111-29q8-12 16 0-8 12-16 0z" fill="#fff"/></g><path d="M18 43h24M24 32h13M123 19h18" stroke="#48aee0" stroke-width="5" stroke-linecap="round"/></svg>`,
    mystery:`<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" aria-label="Mystery shopper mascot"><g stroke="#171313" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M43 63q47-48 94 0l-18 8H60z" fill="#6d4b2e"/><circle cx="90" cy="98" r="39" fill="#e8b775"/><path d="M65 91h20M97 91h20"/><path d="M82 91h16"/><circle cx="75" cy="95" r="14" fill="#1c2329"/><circle cx="107" cy="95" r="14" fill="#1c2329"/><path d="M77 119q13 9 26 0" fill="none"/><path d="M50 124 29 161h122l-22-37" fill="#7b5233"/><path d="M51 124l39 30 39-30" fill="#9a6944"/><path d="M123 118l30 26"/><circle cx="145" cy="135" r="23" fill="#b9e5ff" fill-opacity=".75"/></g><path d="M33 53q56-31 114 0" stroke="#171313" stroke-width="7" fill="none"/></svg>`,
    food:`<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" aria-label="Food cost guardian mascot"><g stroke="#171313" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M41 89h98q-6-31-49-31T41 89z" fill="#e5aa47"/><path d="M43 93h94l-9 14H52z" fill="#5bbd63"/><path d="M48 108h84l-7 15H55z" fill="#d92535"/><path d="M53 124h74q-7 25-37 25t-37-25z" fill="#e5aa47"/><circle cx="73" cy="82" r="5" fill="#171313" stroke="none"/><circle cx="106" cy="82" r="5" fill="#171313" stroke="none"/><path d="M76 99q14 11 28 0" fill="none"/><circle cx="142" cy="52" r="25" fill="#f4c52f"/><path d="M142 36v32M134 43q8-8 17 0-4 8-17 8 17 0 17 9-9 10-18 0" fill="none"/><path d="M43 116 20 132M137 116l22 16"/></g></svg>`,
    champion:`<svg viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg" aria-label="Team champion mascot"><g stroke="#171313" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M61 33h58v42q0 34-29 45-29-11-29-45z" fill="#f4c52f"/><path d="M61 45H35q0 36 29 42M119 45h26q0 36-29 42" fill="none"/><path d="M78 60h24l-19 14 7 22-19-14-19 14 7-22-19-14h24l7-22z" fill="#fff" transform="translate(19 8) scale(.72)"/><circle cx="78" cy="78" r="5" fill="#171313" stroke="none"/><circle cx="102" cy="78" r="5" fill="#171313" stroke="none"/><path d="M76 95q14 13 28 0" fill="none"/><path d="M80 120v18h20v-18M64 140h52v17H64z" fill="#f4c52f"/><path d="M49 105 24 92M131 105l25-13" fill="none"/></g><path d="M17 39l8 8m-8 0 8-8m132 5 9 9m-9 0 9-9" stroke="#d92535" stroke-width="6" stroke-linecap="round"/></svg>`
  };

  const labels={speed:'Speed Stopwatch',accuracy:'Accuracy Detective',clean:'Cleaning Hero',mystery:'Mystery Shopper',food:'Food Cost Guardian',champion:'Team Champion'};

  function init(){
    const select=document.getElementById('tcCharacter');
    const panel=document.getElementById('templateCustomizer');
    const poster=document.getElementById('commPoster');
    if(!select||!panel||!poster) return setTimeout(init,100);
    if(document.getElementById('mascotPicker')) return;

    select.innerHTML='<option value="">None</option>'+Object.entries(labels).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');

    const style=document.createElement('style');
    style.textContent=`
      .mascot-picker{grid-column:1/-1}.mascot-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}
      .mascot-btn{border:1px solid var(--line);border-radius:12px;background:#fff;padding:8px;display:grid;gap:4px;place-items:center;min-height:94px;font-weight:800;font-size:11px;text-align:center}
      .mascot-btn.active{outline:3px solid #8f171d33;border-color:var(--red)}.mascot-thumb{width:62px;height:62px}.mascot-thumb svg{width:100%;height:100%;display:block}
      .poster-character{width:var(--mascot-size,90px);height:var(--mascot-size,90px);font-size:0!important}.poster-character svg{width:100%;height:100%;display:block}
      @media(max-width:540px){.mascot-grid{grid-template-columns:repeat(2,1fr)}}
    `;
    document.head.appendChild(style);

    const wrap=document.createElement('div');
    wrap.id='mascotPicker';wrap.className='mascot-picker';
    wrap.innerHTML=`<b style="font-size:13px">Illustrated character</b><div class="mascot-grid">${Object.entries(labels).map(([k,v])=>`<button type="button" class="mascot-btn" data-mascot="${k}"><span class="mascot-thumb">${svg[k]}</span><span>${v}</span></button>`).join('')}</div>`;
    select.closest('label')?.insertAdjacentElement('afterend',wrap);

    function renderMascot(){
      const el=poster.querySelector('.poster-character');
      if(!el) return;
      const key=select.value;
      if(svg[key]){
        if(el.dataset.mascot!==key){el.innerHTML=svg[key];el.dataset.mascot=key;}
        const size=document.getElementById('tcCharSize')?.value||72;
        el.style.setProperty('--mascot-size',Math.max(70,Number(size))+'px');
      }
      wrap.querySelectorAll('.mascot-btn').forEach(b=>b.classList.toggle('active',b.dataset.mascot===key));
    }

    wrap.addEventListener('click',e=>{
      const b=e.target.closest('.mascot-btn');if(!b)return;
      select.value=b.dataset.mascot;
      select.dispatchEvent(new Event('input',{bubbles:true}));
      setTimeout(renderMascot,0);
    });
    select.addEventListener('input',()=>setTimeout(renderMascot,0));
    document.getElementById('tcCharSize')?.addEventListener('input',()=>setTimeout(renderMascot,0));

    const mo=new MutationObserver(()=>requestAnimationFrame(renderMascot));
    mo.observe(poster,{childList:true,subtree:true,characterData:true});
    renderMascot();
  }
  init();
})();