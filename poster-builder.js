// GM Assistant drag-and-drop Communication Poster Builder
(() => {
  const comm = document.getElementById('comm');
  if (!comm) return;

  const css = `
  <style id="posterBuilderStyles">
    .pb-launch{margin:0 0 14px;padding:18px;border-radius:18px;background:linear-gradient(135deg,#171313,#3b2426);color:#fff;border:1px solid #4c3033;display:flex;justify-content:space-between;gap:16px;align-items:center;flex-wrap:wrap}
    .pb-launch h2{margin:0 0 5px}.pb-launch p{margin:0;color:#d9c9ca}.pb-launch button{background:#f0b323;color:#181515;border:0;border-radius:12px;padding:12px 16px;font-weight:900}
    .pb-wrap{display:none;grid-template-columns:280px minmax(0,1fr);gap:14px;margin-bottom:16px}.pb-wrap.open{display:grid}.pb-panel{background:#fff;border:1px solid var(--line);border-radius:16px;padding:14px;box-shadow:var(--shadow)}
    .pb-group{padding:12px 0;border-bottom:1px solid var(--line)}.pb-group:last-child{border-bottom:0}.pb-group h3{font-size:13px;text-transform:uppercase;letter-spacing:.07em;margin:0 0 9px;color:var(--red)}
    .pb-btns{display:flex;gap:7px;flex-wrap:wrap}.pb-btns button,.pb-upload{border:1px solid var(--line);background:#fff;border-radius:10px;padding:8px 10px;font-weight:800;font-size:12px}.pb-btns button:hover{border-color:var(--red)}
    .pb-stickers{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.pb-stickers button{font-size:25px;min-height:45px;border:1px solid var(--line);background:#fff;border-radius:10px}
    .pb-fields{display:grid;gap:8px}.pb-fields label{font-size:11px}.pb-fields input,.pb-fields select{padding:8px}.pb-inline{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .pb-stage-shell{background:#d9d0c8;border-radius:18px;padding:14px;overflow:auto}.pb-stage{position:relative;margin:auto;width:min(680px,100%);aspect-ratio:8.5/11;background:#fffdf8;overflow:hidden;box-shadow:0 18px 45px #0003;touch-action:none;background-size:cover;background-position:center}
    .pb-item{position:absolute;left:12%;top:12%;min-width:48px;min-height:34px;padding:6px;cursor:move;user-select:none;touch-action:none;transform-origin:center;box-sizing:border-box}.pb-item.selected{outline:2px dashed #1677ff;outline-offset:3px}.pb-text{font-weight:900;line-height:1.05;white-space:pre-wrap}.pb-sticker{font-size:64px;line-height:1}.pb-shape{width:140px;height:90px;background:#d92535}.pb-circle{border-radius:50%}.pb-star{width:130px;height:130px;clip-path:polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 94%,50% 72%,21% 94%,32% 57%,2% 35%,39% 35%)}.pb-burst{width:150px;height:115px;clip-path:polygon(50% 0,61% 20%,82% 8%,80% 31%,100% 38%,79% 49%,97% 67%,73% 67%,76% 93%,56% 78%,45% 100%,36% 76%,12% 91%,20% 65%,0 56%,24% 46%,4% 28%,29% 30%)}.pb-arrow{width:160px;height:75px;clip-path:polygon(0 25%,65% 25%,65% 0,100% 50%,65% 100%,65% 75%,0 75%)}
    .pb-resize{position:absolute;right:-8px;bottom:-8px;width:18px;height:18px;border-radius:50%;background:#1677ff;border:2px solid #fff;display:none}.pb-item.selected .pb-resize{display:block}
    .pb-topbar{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:10px}.pb-topbar .pb-btns{margin-left:auto}.pb-help{font-size:12px;color:var(--muted);margin-top:8px;line-height:1.4}
    @media(max-width:900px){.pb-wrap{grid-template-columns:1fr}.pb-panel{order:2}.pb-stage-shell{order:1}.pb-stickers{grid-template-columns:repeat(8,1fr)}}
    @media(max-width:560px){.pb-stickers{grid-template-columns:repeat(5,1fr)}.pb-stage{min-width:620px}.pb-stage-shell{overflow:auto}.pb-inline{grid-template-columns:1fr 1fr}}
    @media print{body.pb-print *{visibility:hidden!important}body.pb-print #pbStage,body.pb-print #pbStage *{visibility:visible!important}body.pb-print #pbStage{position:absolute!important;left:0;top:0;width:8.5in!important;height:11in!important;max-width:none!important;box-shadow:none!important}.pb-item.selected{outline:none!important}.pb-resize{display:none!important}@page{size:letter portrait;margin:0}}
  </style>`;
  document.head.insertAdjacentHTML('beforeend', css);

  const launch = document.createElement('div');
  launch.className = 'pb-launch';
  launch.innerHTML = `<div><div class="eyebrow" style="color:#f5b4b7">Full customization</div><h2>Poster Builder</h2><p>Drag, resize, rotate and layer text, shapes, characters and your own images.</p></div><button type="button" id="pbOpen">Open Custom Builder</button>`;
  comm.prepend(launch);

  const wrap = document.createElement('div');
  wrap.className = 'pb-wrap';
  wrap.id = 'pbWrap';
  wrap.innerHTML = `
    <aside class="pb-panel">
      <div class="pb-group"><h3>Add</h3><div class="pb-btns"><button id="pbAddTitle">Big Text</button><button id="pbAddText">Small Text</button><button id="pbAddCircle">Circle</button><button id="pbAddStar">Star</button><button id="pbAddBurst">Burst</button><button id="pbAddArrow">Arrow</button></div></div>
      <div class="pb-group"><h3>Fun Characters & Stickers</h3><div class="pb-stickers" id="pbStickers"></div></div>
      <div class="pb-group"><h3>Your Images</h3><label class="pb-upload">Upload Logo / Photo<input type="file" id="pbUpload" accept="image/*" hidden></label><div class="pb-help">Uploads stay on this device while you design and are not sent anywhere.</div></div>
      <div class="pb-group"><h3>Selected Item</h3><div class="pb-fields">
        <label>Text<input id="pbText" placeholder="Select text to edit"></label>
        <div class="pb-inline"><label>Text color<input type="color" id="pbColor" value="#111111"></label><label>Fill color<input type="color" id="pbFill" value="#d92535"></label></div>
        <label>Font<select id="pbFont"><option value="Arial Black,Arial,sans-serif">Bold</option><option value="Impact,Haettenschweiler,sans-serif">Impact</option><option value="Georgia,serif">Classic</option><option value="Trebuchet MS,sans-serif">Friendly</option><option value="Courier New,monospace">Poster Mono</option></select></label>
        <label>Font size <span id="pbFontOut">42</span>px<input type="range" id="pbFontSize" min="12" max="120" value="42"></label>
        <label>Rotation <span id="pbRotOut">0</span>°<input type="range" id="pbRotate" min="-180" max="180" value="0"></label>
        <label>Opacity <span id="pbOpacityOut">100</span>%<input type="range" id="pbOpacity" min="10" max="100" value="100"></label>
        <div class="pb-btns"><button id="pbFront">Bring Front</button><button id="pbBack">Send Back</button><button id="pbDuplicate">Duplicate</button><button id="pbDelete">Delete</button></div>
      </div></div>
      <div class="pb-group"><h3>Poster</h3><div class="pb-fields"><div class="pb-inline"><label>Background<input type="color" id="pbBg" value="#fffdf8"></label><label>Accent<input type="color" id="pbAccent" value="#d92535"></label></div><div class="pb-btns"><button id="pbClear">Clear Canvas</button><button id="pbFromWeek">Add Latest Metrics</button></div></div></div>
    </aside>
    <section class="pb-stage-shell"><div class="pb-topbar"><div><div class="eyebrow">Drag-and-drop canvas</div><b>8.5 × 11 Communication Poster</b></div><div class="pb-btns"><button id="pbStarter">Fun Starter</button><button id="pbPrint">Print Poster</button><button id="pbClose">Close</button></div></div><div class="pb-stage" id="pbStage"></div><div class="pb-help">Tap an item to select it. Drag anywhere to move it. Drag the blue handle to resize. Use the controls for exact color, rotation, font and layers.</div></section>`;
  launch.insertAdjacentElement('afterend', wrap);

  const stage = wrap.querySelector('#pbStage');
  let selected = null, zCounter = 10;
  const stickers = ['⭐','🏆','🎯','⏱️','🚗','🍟','🥪','🧹','🪣','🕵️','💡','🔥','💪','👏','🎉','😊','❤️','✅','📣','🚀','👑','⚡','🤖','😎','🥳'];
  wrap.querySelector('#pbStickers').innerHTML = stickers.map(s=>`<button type="button" data-sticker="${s}">${s}</button>`).join('');

  function selectItem(el){
    stage.querySelectorAll('.pb-item').forEach(x=>x.classList.remove('selected'));
    selected = el || null;
    if (!selected) return;
    selected.classList.add('selected');
    const textEl = selected.querySelector('.pb-text') || (selected.classList.contains('pb-text')?selected:null);
    wrap.querySelector('#pbText').value = textEl?.textContent || '';
    wrap.querySelector('#pbColor').value = rgbToHex(getComputedStyle(selected).color) || '#111111';
    wrap.querySelector('#pbFill').value = rgbToHex(getComputedStyle(selected).backgroundColor) || '#d92535';
    const fs = parseInt(getComputedStyle(selected).fontSize)||42; wrap.querySelector('#pbFontSize').value=fs; wrap.querySelector('#pbFontOut').textContent=fs;
    const r = Number(selected.dataset.rot||0); wrap.querySelector('#pbRotate').value=r; wrap.querySelector('#pbRotOut').textContent=r;
    const op = Math.round((parseFloat(getComputedStyle(selected).opacity)||1)*100); wrap.querySelector('#pbOpacity').value=op; wrap.querySelector('#pbOpacityOut').textContent=op;
  }
  function rgbToHex(rgb){const m=String(rgb).match(/\d+/g);if(!m||m.length<3)return null;return '#'+m.slice(0,3).map(x=>(+x).toString(16).padStart(2,'0')).join('')}
  function positionNew(el){el.style.left=(12+Math.random()*15)+'%';el.style.top=(12+Math.random()*20)+'%';el.style.zIndex=++zCounter;stage.appendChild(el);makeInteractive(el);selectItem(el);}
  function makeItem(type, content){
    const el=document.createElement('div'); el.className='pb-item '+type; el.dataset.rot='0';
    if(type.includes('pb-text')){el.textContent=content; el.style.fontSize=type.includes('title')?'58px':'28px'; el.style.color='#171313'; el.style.fontFamily='Arial Black,Arial,sans-serif'; el.style.maxWidth='78%';}
    else if(type==='pb-sticker'){el.textContent=content;}
    else if(type==='pb-image'){const img=document.createElement('img');img.src=content;img.style.cssText='display:block;width:180px;height:auto;pointer-events:none';el.appendChild(img);}
    el.insertAdjacentHTML('beforeend','<span class="pb-resize"></span>'); return el;
  }
  function addShape(cls){const el=makeItem('pb-shape '+cls,''); el.style.background=wrap.querySelector('#pbAccent').value;positionNew(el)}
  function makeInteractive(el){
    el.addEventListener('pointerdown',e=>{
      if(e.target.classList.contains('pb-resize')) return;
      selectItem(el); const rect=stage.getBoundingClientRect(), er=el.getBoundingClientRect(); const ox=e.clientX-er.left, oy=e.clientY-er.top; el.setPointerCapture(e.pointerId);
      const move=ev=>{let x=(ev.clientX-rect.left-ox)/rect.width*100,y=(ev.clientY-rect.top-oy)/rect.height*100;el.style.left=Math.max(0,Math.min(94,x))+'%';el.style.top=Math.max(0,Math.min(96,y))+'%'};
      const up=()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up)};el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);
    });
    el.querySelector('.pb-resize')?.addEventListener('pointerdown',e=>{e.stopPropagation();selectItem(el);const r=el.getBoundingClientRect(),startX=e.clientX,startY=e.clientY,startW=r.width,startH=r.height;e.target.setPointerCapture(e.pointerId);const move=ev=>{const w=Math.max(36,startW+ev.clientX-startX),h=Math.max(30,startH+ev.clientY-startY);if(el.classList.contains('pb-sticker')){el.style.fontSize=Math.max(20,w*.55)+'px'}else if(el.classList.contains('pb-image')){el.querySelector('img').style.width=w+'px'}else{el.style.width=w+'px';el.style.height=h+'px'}};const up=()=>{e.target.removeEventListener('pointermove',move);e.target.removeEventListener('pointerup',up)};e.target.addEventListener('pointermove',move);e.target.addEventListener('pointerup',up)});
    el.addEventListener('click',e=>{e.stopPropagation();selectItem(el)});
  }
  function rotate(){if(selected)selected.style.transform=`rotate(${selected.dataset.rot||0}deg)`}
  stage.addEventListener('click',()=>selectItem(null));
  wrap.querySelector('#pbAddTitle').onclick=()=>positionNew(makeItem('pb-text pb-title','YOUR BIG MESSAGE'));
  wrap.querySelector('#pbAddText').onclick=()=>positionNew(makeItem('pb-text','Add your message here'));
  wrap.querySelector('#pbAddCircle').onclick=()=>addShape('pb-circle'); wrap.querySelector('#pbAddStar').onclick=()=>addShape('pb-star'); wrap.querySelector('#pbAddBurst').onclick=()=>addShape('pb-burst'); wrap.querySelector('#pbAddArrow').onclick=()=>addShape('pb-arrow');
  wrap.querySelector('#pbStickers').onclick=e=>{const b=e.target.closest('[data-sticker]');if(b)positionNew(makeItem('pb-sticker',b.dataset.sticker))};
  wrap.querySelector('#pbUpload').onchange=e=>{const f=e.target.files?.[0];if(!f)return;const rd=new FileReader();rd.onload=()=>positionNew(makeItem('pb-image',rd.result));rd.readAsDataURL(f);e.target.value=''};
  wrap.querySelector('#pbText').oninput=e=>{if(!selected)return;if(selected.classList.contains('pb-text'))selected.childNodes[0].nodeValue=e.target.value};
  wrap.querySelector('#pbColor').oninput=e=>{if(selected)selected.style.color=e.target.value}; wrap.querySelector('#pbFill').oninput=e=>{if(selected)selected.style.background=e.target.value};
  wrap.querySelector('#pbFont').onchange=e=>{if(selected)selected.style.fontFamily=e.target.value};
  wrap.querySelector('#pbFontSize').oninput=e=>{if(selected)selected.style.fontSize=e.target.value+'px';wrap.querySelector('#pbFontOut').textContent=e.target.value};
  wrap.querySelector('#pbRotate').oninput=e=>{if(selected){selected.dataset.rot=e.target.value;rotate()}wrap.querySelector('#pbRotOut').textContent=e.target.value};
  wrap.querySelector('#pbOpacity').oninput=e=>{if(selected)selected.style.opacity=e.target.value/100;wrap.querySelector('#pbOpacityOut').textContent=e.target.value};
  wrap.querySelector('#pbFront').onclick=()=>{if(selected)selected.style.zIndex=++zCounter}; wrap.querySelector('#pbBack').onclick=()=>{if(selected)selected.style.zIndex=1};
  wrap.querySelector('#pbDuplicate').onclick=()=>{if(!selected)return;const c=selected.cloneNode(true);c.classList.remove('selected');c.style.left=(parseFloat(selected.style.left||10)+4)+'%';c.style.top=(parseFloat(selected.style.top||10)+4)+'%';stage.appendChild(c);makeInteractive(c);selectItem(c)};
  wrap.querySelector('#pbDelete').onclick=()=>{if(selected){selected.remove();selected=null}};
  wrap.querySelector('#pbBg').oninput=e=>stage.style.backgroundColor=e.target.value; wrap.querySelector('#pbAccent').oninput=e=>{};
  wrap.querySelector('#pbClear').onclick=()=>{if(confirm('Clear the custom poster?')){stage.innerHTML='';selected=null}};

  function latestWeek(){try{return typeof latest==='function'?latest():null}catch{return null}}
  function fmtSafe(k,v){try{return fmt(k,v)}catch{return v??'—'}}
  function addLatest(){const w=latestWeek();if(!w){alert('Save a weekly entry first.');return}const title=makeItem('pb-text pb-title','WEEKLY TEAM UPDATE');title.style.left='7%';title.style.top='5%';title.style.fontSize='48px';stage.appendChild(title);makeInteractive(title);const lines=[`OSAT ${fmtSafe('osat',w.osat)}`,`DRIVE-THRU ${fmtSafe('driveOverall',w.driveOverall)}`,`FOOD VARIANCE ${fmtSafe('foodVariance',w.foodVariance)}`,`LABOR SAVED ${fmtSafe('laborHoursSaved',w.laborHoursSaved)}`];lines.forEach((t,i)=>{const el=makeItem('pb-text',t);el.style.left='9%';el.style.top=(24+i*10)+'%';el.style.fontSize='30px';stage.appendChild(el);makeInteractive(el)});positionNew(makeItem('pb-sticker','🎯'))}
  wrap.querySelector('#pbFromWeek').onclick=addLatest;
  function starter(){stage.innerHTML='';stage.style.backgroundColor='#fff6dc';const burst=makeItem('pb-shape pb-burst','');burst.style.cssText+=';left:62%;top:10%;width:180px;height:145px;background:#f0b323';stage.appendChild(burst);makeInteractive(burst);const t=makeItem('pb-text pb-title','LET’S CRUSH\nOUR GOALS!');t.style.cssText+=';left:7%;top:8%;font-size:62px;color:#b61f2a;width:58%';stage.appendChild(t);makeInteractive(t);const s=makeItem('pb-sticker','😎');s.style.cssText+=';left:67%;top:12%;font-size:82px';stage.appendChild(s);makeInteractive(s);const sub=makeItem('pb-text','EVERY GUEST. EVERY TIME.');sub.style.cssText+=';left:8%;top:72%;font-size:34px;color:#171313';stage.appendChild(sub);makeInteractive(sub);addLatest();selectItem(t)}
  wrap.querySelector('#pbStarter').onclick=starter;
  wrap.querySelector('#pbPrint').onclick=()=>{document.body.classList.add('pb-print');window.print();setTimeout(()=>document.body.classList.remove('pb-print'),500)};
  document.getElementById('pbOpen').onclick=()=>{wrap.classList.add('open');launch.style.display='none';if(!stage.children.length)starter();wrap.scrollIntoView({behavior:'smooth',block:'start'})};
  wrap.querySelector('#pbClose').onclick=()=>{wrap.classList.remove('open');launch.style.display='flex';launch.scrollIntoView({behavior:'smooth',block:'start'})};
})();