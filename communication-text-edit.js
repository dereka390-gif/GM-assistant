// Tap-to-edit text controls for Communication poster objects
(() => {
  const EDITABLE = '.poster-big,.poster-callout,.poster-box,.poster-focus,.poster-footer,[data-custom-type="text"],[data-custom-type="box"]';
  let active=null;

  function boot(){
    const poster=document.getElementById('commPoster');
    const panel=document.getElementById('templateCustomizer');
    if(!poster||!panel) return setTimeout(boot,120);
    if(document.getElementById('textEditPanel')) return;

    const style=document.createElement('style');
    style.textContent=`
      .tap-edit-panel{grid-column:1/-1;border-top:1px solid var(--line);padding-top:10px;margin-top:8px;display:none}.tap-edit-panel.show{display:block}
      .tap-edit-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.tap-edit-grid .full{grid-column:1/-1}
      .tap-edit-note{font-size:11px;color:var(--muted);line-height:1.35;margin-top:6px}
      @media(max-width:540px){.tap-edit-grid{grid-template-columns:1fr}.tap-edit-grid .full{grid-column:auto}}
      @media print{.tap-edit-panel{display:none!important}}
    `;
    document.head.appendChild(style);

    const host=panel.querySelector('.customizer-grid')||panel;
    const editor=document.createElement('div');
    editor.id='textEditPanel';editor.className='tap-edit-panel';
    editor.innerHTML=`
      <b style="font-size:13px">Edit Selected Box Text</b>
      <div class="tap-edit-grid">
        <label class="full" id="editPrimaryWrap">Main text<textarea id="editPrimary" rows="3"></textarea></label>
        <label id="editLabelWrap">Label<input id="editLabel"></label>
        <label id="editValueWrap">Value<input id="editValue"></label>
        <label>Text color<input id="editTextColor" type="color" value="#171313"></label>
        <label>Font size<input id="editFontSize" type="range" min="10" max="80" value="22"></label>
      </div>
      <div class="tap-edit-note">Tap a box once to edit its text. Hold and drag to move it. Metric cards keep their label/value structure.</div>`;
    host.appendChild(editor);

    const primary=document.getElementById('editPrimary'), label=document.getElementById('editLabel'), value=document.getElementById('editValue');
    const primaryWrap=document.getElementById('editPrimaryWrap'), labelWrap=document.getElementById('editLabelWrap'), valueWrap=document.getElementById('editValueWrap');
    const color=document.getElementById('editTextColor'), font=document.getElementById('editFontSize');

    function hex(rgb){const m=String(rgb).match(/\d+/g);if(!m||m.length<3)return'#171313';return '#'+m.slice(0,3).map(x=>(+x).toString(16).padStart(2,'0')).join('')}
    function parts(el){
      const l=el.querySelector('.label');
      const v=el.querySelector('.value,.big-num,.poster-big .big-num');
      return {label:l,value:v};
    }
    function open(el){
      active=el;editor.classList.add('show');
      const p=parts(el), structured=!!(p.label||p.value);
      labelWrap.style.display=structured?'':'none';valueWrap.style.display=structured?'':'none';primaryWrap.style.display=structured?'none':'';
      if(structured){label.value=p.label?.textContent?.trim()||'';value.value=p.value?.textContent?.trim()||'';}
      else primary.value=el.textContent?.trim()||'';
      const cs=getComputedStyle(el);color.value=hex(cs.color);font.value=parseInt(cs.fontSize)||22;
      editor.scrollIntoView({block:'nearest',behavior:'smooth'});
    }
    poster.addEventListener('click',e=>{
      const el=e.target.closest(EDITABLE); if(!el||!poster.contains(el)) return;
      if(el.classList.contains('pro-moving')) return;
      open(el);
    });
    primary.addEventListener('input',()=>{if(active)active.textContent=primary.value});
    label.addEventListener('input',()=>{if(active){const p=parts(active);if(p.label)p.label.textContent=label.value}});
    value.addEventListener('input',()=>{if(active){const p=parts(active);if(p.value)p.value.textContent=value.value}});
    color.addEventListener('input',()=>{if(active)active.style.color=color.value});
    font.addEventListener('input',()=>{if(active)active.style.fontSize=font.value+'px'});
  }
  boot();
})();