// Freeform object tools for the Communication Pro Editor
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
  let current=null, counter=0;
  const uid=t=>`${t}-${Date.now()}-${++counter}`;

  function boot(){
    const poster=document.getElementById('commPoster');
    const panel=document.getElementById('templateCustomizer');
    const proPanel=panel?.querySelector('.pro-panel');
    if(!poster||!panel||!proPanel) return setTimeout(boot,120);
    if(document.getElementById('objectToolPanel')) return;

    // Hide the older single-character controls. Characters are now regular objects.
    ['tcCharacter','tcCharacterPos','tcCharSize'].forEach(id=>document.getElementById(id)?.closest('label')?.style.setProperty('display','none','important'));
    document.querySelectorAll('#safeMascotControls,#mascotTouchFix').forEach(x=>x.style.display='none');

    const style=document.createElement('style');
    style.id='objectToolStyles';
    style.textContent=`
      .object-tools{grid-column:1/-1;border-top:1px solid var(--line);padding-top:12px;margin-top:8px}.object-tools-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.object-tools button{font-weight:850}.character-library{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:9px}.char-add{border:1px solid var(--line);background:#fff;border-radius:12px;padding:7px;display:grid;place-items:center;gap:4px;font-size:11px;font-weight:800;text-align:center}.char-add svg{width:56px;height:56px}.custom-char{position:absolute!important;width:115px;height:115px;background:transparent!important;border:0!important;padding:0!important;box-shadow:none!important}.custom-char svg{width:100%;height:100%;display:block}.custom-text-object{position:absolute!important;min-width:160px;max-width:320px;padding:9px 12px!important;background:transparent!important;border:0!important;box-shadow:none!important;font-size:28px;font-weight:950;line-height:1.05;text-align:center;color:#171313}.custom-box-object{position:absolute!important;min-width:180px;min-height:90px;padding:16px!important;background:#fff;border:3px solid #171313;border-radius:16px;box-shadow:0 8px 18px #0002;font-weight:800}.object-inspector{display:none;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;padding:10px;background:#f7f3ee;border-radius:12px}.object-inspector.show{display:grid}.object-inspector .full{grid-column:1/-1}.object-inspector input[type=color]{height:40px;padding:2px}.object-help{font-size:11px;color:var(--muted);line-height:1.4;margin-top:7px}@media(max-width:540px){.character-library{grid-template-columns:repeat(2,1fr)}.object-inspector{grid-template-columns:1fr}.object-inspector .full{grid-column:auto}}
      @media print{.object-tools{display:none!important}}
    `;
    document.head.appendChild(style);

    const tools=document.createElement('div');
    tools.id='objectToolPanel';tools.className='object-tools';
    tools.innerHTML=`
      <b style="font-size:13px">Add Objects</b>
      <div class="object-tools-row"><button type="button" class="secondary" id="addTextObject">＋ Text</button><button type="button" class="secondary" id="addBoxObject">＋ Box</button></div>
      <div class="object-help">Add as many objects as you want. Every character, text block, and box can be dragged anywhere, pinched to resize, rotated, duplicated, layered, locked, or deleted.</div>
      <details style="margin-top:9px"><summary style="font-weight:850;cursor:pointer">＋ Add illustrated character</summary><div class="character-library">${Object.entries(LABELS).map(([k,v])=>`<button type="button" class="char-add" data-char="${k}">${MASCOTS[k]}<span>${v}</span></button>`).join('')}</div></details>
      <div class="object-inspector" id="objectInspector">
        <label class="full">Text / label<input id="objText" placeholder="Edit selected text or box"></label>
        <label>Text color<input id="objTextColor" type="color" value="#171313"></label>
        <label>Fill color<input id="objFill" type="color" value="#ffffff"></label>
        <label>Font size<input id="objFont" type="range" min="12" max="72" value="28"></label>
        <label>Opacity<input id="objOpacity" type="range" min="20" max="100" value="100"></label>
        <label>Corner radius<input id="objRadius" type="range" min="0" max="40" value="16"></label>
        <label>Border width<input id="objBorder" type="range" min="0" max="8" value="3"></label>
      </div>`;
    proPanel.insertAdjacentElement('afterend',tools);

    function place(el){
      poster.appendChild(el);
      el.style.left='50%';el.style.top='48%';el.style.transform='translate(-50%,-50%)';
      setTimeout(()=>{el.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:999,clientX:0,clientY:0,pointerType:'mouse'}));el.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:999,clientX:0,clientY:0,pointerType:'mouse'}));},80);
      selectCustom(el);
    }
    function addText(){
      const el=document.createElement('div');el.className='poster-box custom-text-object';el.dataset.proKey=uid('text');el.dataset.customType='text';el.textContent='YOUR TEXT';place(el);
    }
    function addBox(){
      const el=document.createElement('div');el.className='poster-box custom-box-object';el.dataset.proKey=uid('box');el.dataset.customType='box';el.textContent='New message box';place(el);
    }
    function addChar(key){
      const el=document.createElement('div');el.className='poster-mascot-touch custom-char';el.dataset.proKey=uid('character');el.dataset.customType='character';el.dataset.charKey=key;el.innerHTML=MASCOTS[key];place(el);
    }
    document.getElementById('addTextObject').onclick=addText;
    document.getElementById('addBoxObject').onclick=addBox;
    tools.querySelector('.character-library').addEventListener('click',e=>{const b=e.target.closest('.char-add');if(b)addChar(b.dataset.char)});

    const inspector=document.getElementById('objectInspector');
    const fields={text:document.getElementById('objText'),textColor:document.getElementById('objTextColor'),fill:document.getElementById('objFill'),font:document.getElementById('objFont'),opacity:document.getElementById('objOpacity'),radius:document.getElementById('objRadius'),border:document.getElementById('objBorder')};
    function selectCustom(el){
      current=el?.dataset?.customType?el:null;
      inspector.classList.toggle('show',!!current && current.dataset.customType!=='character');
      if(!current||current.dataset.customType==='character')return;
      const cs=getComputedStyle(current);fields.text.value=current.textContent||'';fields.textColor.value=rgbToHex(cs.color)||'#171313';fields.fill.value=rgbToHex(cs.backgroundColor)||'#ffffff';fields.font.value=parseInt(cs.fontSize)||28;fields.opacity.value=Math.round((parseFloat(cs.opacity)||1)*100);fields.radius.value=parseInt(cs.borderRadius)||0;fields.border.value=parseInt(cs.borderWidth)||0;
    }
    function rgbToHex(rgb){const m=String(rgb).match(/\d+/g);if(!m||m.length<3)return null;return '#'+m.slice(0,3).map(x=>(+x).toString(16).padStart(2,'0')).join('')}
    poster.addEventListener('pointerdown',e=>{const el=e.target.closest('[data-custom-type]');if(el)selectCustom(el)},true);
    fields.text.addEventListener('input',()=>{if(current)current.textContent=fields.text.value});
    fields.textColor.addEventListener('input',()=>{if(current)current.style.color=fields.textColor.value});
    fields.fill.addEventListener('input',()=>{if(current&&current.dataset.customType==='box')current.style.background=fields.fill.value});
    fields.font.addEventListener('input',()=>{if(current)current.style.fontSize=fields.font.value+'px'});
    fields.opacity.addEventListener('input',()=>{if(current)current.style.opacity=String(fields.opacity.value/100)});
    fields.radius.addEventListener('input',()=>{if(current)current.style.borderRadius=fields.radius.value+'px'});
    fields.border.addEventListener('input',()=>{if(current&&current.dataset.customType==='box')current.style.borderWidth=fields.border.value+'px'});
  }
  boot();
})();