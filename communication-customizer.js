// Customization controls for the existing Communication Studio template
(() => {
  const comm = document.getElementById('comm');
  if (!comm) return;

  const waitForStudio = () => {
    const poster = document.getElementById('commPoster');
    const toolsCard = document.querySelector('.comm-tools .card');
    if (!poster || !toolsCard) return setTimeout(waitForStudio, 80);
    if (document.getElementById('templateCustomizer')) return;

    const css = document.createElement('style');
    css.id = 'templateCustomizerStyles';
    css.textContent = `
      .customizer-panel{margin-top:16px;padding-top:15px;border-top:1px solid var(--line)}
      .customizer-panel summary{cursor:pointer;font-weight:900;color:var(--red);font-size:15px;list-style:none;display:flex;justify-content:space-between;align-items:center}
      .customizer-panel summary::-webkit-details-marker{display:none}.customizer-panel summary:after{content:'＋';font-size:20px}.customizer-panel[open] summary:after{content:'−'}
      .customizer-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.customizer-grid .full{grid-column:1/-1}
      .customizer-checks{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}.customizer-checks label{display:flex;grid-template-columns:auto 1fr;align-items:center;gap:7px;font-weight:700}.customizer-checks input{width:auto}
      .color-control{display:grid;grid-template-columns:1fr 44px;gap:7px;align-items:end}.color-control input[type=color]{height:42px;padding:3px}
      .poster-character{position:absolute;z-index:8;line-height:1;filter:drop-shadow(0 5px 4px rgba(0,0,0,.18));pointer-events:none;transform-origin:center;user-select:none}
      .team-poster.pattern-dots .poster-body{background-color:var(--customBody,#fff8ec)!important;background-image:radial-gradient(rgba(0,0,0,.08) 1.5px,transparent 1.5px)!important;background-size:18px 18px!important}
      .team-poster.pattern-stripes .poster-body{background:repeating-linear-gradient(-45deg,var(--customBody,#fff8ec),var(--customBody,#fff8ec) 18px,rgba(0,0,0,.04) 18px,rgba(0,0,0,.04) 36px)!important}
      .team-poster.pattern-confetti .poster-body{background-color:var(--customBody,#fff8ec)!important;background-image:radial-gradient(circle at 10% 20%,rgba(240,179,35,.25) 0 4px,transparent 5px),radial-gradient(circle at 80% 15%,rgba(197,31,45,.18) 0 5px,transparent 6px),radial-gradient(circle at 30% 75%,rgba(44,107,85,.16) 0 4px,transparent 5px),radial-gradient(circle at 75% 70%,rgba(0,0,0,.10) 0 3px,transparent 4px)!important;background-size:95px 95px,120px 120px,110px 110px,85px 85px!important}
      .team-poster.layout-hero .poster-hero{grid-template-columns:1.35fr .65fr}.team-poster.layout-hero .poster-big{min-height:220px}.team-poster.layout-hero .poster-big .big-num{font-size:82px}
      .team-poster.layout-message .poster-hero{grid-template-columns:.7fr 1.3fr}.team-poster.layout-message .poster-callout{display:flex;flex-direction:column;justify-content:center}.team-poster.layout-compact .poster-body{gap:9px}.team-poster.layout-compact .poster-big{min-height:135px}.team-poster.layout-compact .poster-grid{gap:8px}.team-poster.layout-compact .poster-box{padding:10px}
      @media(max-width:540px){.customizer-grid,.customizer-checks{grid-template-columns:1fr}.customizer-grid .full{grid-column:auto}}
      @media print{.poster-character{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
    `;
    document.head.appendChild(css);

    const panel = document.createElement('details');
    panel.id = 'templateCustomizer';
    panel.className = 'customizer-panel';
    panel.open = false;
    panel.innerHTML = `
      <summary>Customize This Template</summary>
      <div class="customizer-grid">
        <label class="color-control">Primary color<input id="tcPrimary" type="color" value="#d92535"></label>
        <label class="color-control">Highlight color<input id="tcHighlight" type="color" value="#f4c52f"></label>
        <label class="color-control">Header color<input id="tcHeader" type="color" value="#171313"></label>
        <label class="color-control">Page color<input id="tcBody" type="color" value="#fff9df"></label>
        <label>Background pattern<select id="tcPattern"><option value="none">None</option><option value="dots">Dots</option><option value="stripes">Stripes</option><option value="confetti">Confetti</option></select></label>
        <label>Layout<select id="tcLayout"><option value="balanced">Balanced</option><option value="hero">Big number / metric</option><option value="message">Big message</option><option value="compact">Compact</option></select></label>
        <label>Fun character<select id="tcCharacter"><option value="">None</option><option value="🤖">Robot</option><option value="😎">Cool teammate</option><option value="🕵️">Mystery shopper</option><option value="🏆">Champion trophy</option><option value="🎯">Target</option><option value="⏱️">Speed timer</option><option value="🚗">Drive-thru car</option><option value="🍟">Fries</option><option value="🧹">Clean-up hero</option><option value="⭐">Star</option><option value="🥳">Celebration</option><option value="💪">Strong team</option></select></label>
        <label>Character position<select id="tcCharacterPos"><option value="hero-right">Hero right</option><option value="top-left">Top left</option><option value="top-right">Top right</option><option value="bottom-right">Bottom right</option><option value="bottom-left">Bottom left</option></select></label>
        <label class="full">Character size <span id="tcCharSizeLabel">72</span>px<input id="tcCharSize" type="range" min="42" max="150" value="72"></label>
        <label class="full">Headline size <span id="tcTitleSizeLabel">64</span>px<input id="tcTitleSize" type="range" min="36" max="82" value="64"></label>
        <div class="full"><b style="font-size:13px">Metric cards to show</b><div class="customizer-checks" id="tcMetrics">
          <label><input type="checkbox" value="OSAT" checked>OSAT</label>
          <label><input type="checkbox" value="Drive-Thru" checked>Drive-Thru</label>
          <label><input type="checkbox" value="Food Variance" checked>Food Variance</label>
          <label><input type="checkbox" value="Labor Saved" checked>Labor Saved</label>
          <label><input type="checkbox" value="Accuracy" checked>Accuracy</label>
          <label><input type="checkbox" value="Cleanliness" checked>Cleanliness</label>
          <label><input type="checkbox" value="Speed" checked>Speed</label>
          <label><input type="checkbox" value="Taste" checked>Taste</label>
          <label><input type="checkbox" value="Friendliness" checked>Friendliness</label>
        </div></div>
        <label class="full">Focus point 1<input id="tcFocus1" placeholder="Leave blank to keep generated text"></label>
        <label class="full">Focus point 2<input id="tcFocus2" placeholder="Leave blank to keep generated text"></label>
        <label class="full">Focus point 3<input id="tcFocus3" placeholder="Leave blank to keep generated text"></label>
        <label class="full">Footer message<input id="tcFooter" placeholder="Example: GREAT TEAMS WIN TOGETHER!"></label>
        <div class="full row" style="margin-top:2px"><button type="button" class="secondary" id="tcReset">Reset Customization</button></div>
      </div>`;

    const actions = toolsCard.querySelector('.comm-actions');
    if (actions) actions.insertAdjacentElement('beforebegin', panel);
    else toolsCard.appendChild(panel);

    const $ = id => document.getElementById(id);
    const state = {
      primary:'#d92535', highlight:'#f4c52f', header:'#171313', body:'#fff9df', pattern:'none', layout:'balanced', character:'', characterPos:'hero-right', charSize:72, titleSize:64,
      metrics:new Set(['OSAT','Drive-Thru','Food Variance','Labor Saved','Accuracy','Cleanliness','Speed','Taste','Friendliness']), focus:['','',''], footer:''
    };

    function placeCharacter(el){
      const positions={
        'top-left':{left:'18px',top:'18px',right:'auto',bottom:'auto'},
        'top-right':{right:'22px',top:'105px',left:'auto',bottom:'auto'},
        'hero-right':{right:'24px',top:'205px',left:'auto',bottom:'auto'},
        'bottom-right':{right:'24px',bottom:'55px',left:'auto',top:'auto'},
        'bottom-left':{left:'24px',bottom:'55px',right:'auto',top:'auto'}
      };
      Object.assign(el.style,positions[state.characterPos]||positions['hero-right']);
    }

    let applying=false;
    function apply(){
      if(applying) return; applying=true;
      poster.style.setProperty('--accent',state.primary);
      poster.style.setProperty('--accent2',state.highlight);
      poster.style.setProperty('--customBody',state.body);
      const top=poster.querySelector('.poster-top');
      if(top) top.style.background=state.header;
      const body=poster.querySelector('.poster-body');
      if(body && state.pattern==='none') body.style.background=`linear-gradient(180deg,${state.body},#fff)`;
      poster.classList.remove('pattern-dots','pattern-stripes','pattern-confetti','layout-hero','layout-message','layout-compact');
      if(state.pattern!=='none') poster.classList.add('pattern-'+state.pattern);
      if(state.layout!=='balanced') poster.classList.add('layout-'+state.layout);
      const title=poster.querySelector('.poster-title'); if(title) title.style.fontSize=state.titleSize+'px';

      let character=poster.querySelector('.poster-character');
      if(state.character){
        if(!character){character=document.createElement('div');character.className='poster-character';poster.appendChild(character)}
        character.textContent=state.character; character.style.fontSize=state.charSize+'px'; placeCharacter(character);
      } else if(character) character.remove();

      poster.querySelectorAll('.poster-box').forEach(box=>{
        const label=(box.querySelector('.label')?.textContent||'').trim();
        box.style.display=state.metrics.has(label)?'':'none';
      });
      const grid=poster.querySelector('.poster-grid');
      if(grid){const visible=[...grid.querySelectorAll('.poster-box')].filter(x=>x.style.display!=='none').length;grid.style.display=visible?'grid':'none'}

      const lis=poster.querySelectorAll('.poster-focus li');
      state.focus.forEach((txt,i)=>{if(txt && lis[i]) lis[i].textContent=txt});
      const footer=poster.querySelector('.poster-footer'); if(footer && state.footer) footer.textContent=state.footer;
      applying=false;
    }

    const observer=new MutationObserver(()=>{if(!applying) requestAnimationFrame(apply)});
    observer.observe(poster,{childList:true,subtree:true});

    [['tcPrimary','primary'],['tcHighlight','highlight'],['tcHeader','header'],['tcBody','body'],['tcPattern','pattern'],['tcLayout','layout'],['tcCharacter','character'],['tcCharacterPos','characterPos']].forEach(([id,key])=>{
      $(id).addEventListener('input',e=>{state[key]=e.target.value;apply()});
    });
    $('tcCharSize').addEventListener('input',e=>{state.charSize=Number(e.target.value);$('tcCharSizeLabel').textContent=e.target.value;apply()});
    $('tcTitleSize').addEventListener('input',e=>{state.titleSize=Number(e.target.value);$('tcTitleSizeLabel').textContent=e.target.value;apply()});
    $('tcMetrics').addEventListener('change',e=>{if(e.target.type==='checkbox'){e.target.checked?state.metrics.add(e.target.value):state.metrics.delete(e.target.value);apply()}});
    [1,2,3].forEach((n,i)=>$('tcFocus'+n).addEventListener('input',e=>{state.focus[i]=e.target.value;apply()}));
    $('tcFooter').addEventListener('input',e=>{state.footer=e.target.value;apply()});
    $('tcReset').addEventListener('click',()=>{
      state.primary='#d92535';state.highlight='#f4c52f';state.header='#171313';state.body='#fff9df';state.pattern='none';state.layout='balanced';state.character='';state.characterPos='hero-right';state.charSize=72;state.titleSize=64;state.metrics=new Set(['OSAT','Drive-Thru','Food Variance','Labor Saved','Accuracy','Cleanliness','Speed','Taste','Friendliness']);state.focus=['','',''];state.footer='';
      $('tcPrimary').value=state.primary;$('tcHighlight').value=state.highlight;$('tcHeader').value=state.header;$('tcBody').value=state.body;$('tcPattern').value='none';$('tcLayout').value='balanced';$('tcCharacter').value='';$('tcCharacterPos').value='hero-right';$('tcCharSize').value='72';$('tcCharSizeLabel').textContent='72';$('tcTitleSize').value='64';$('tcTitleSizeLabel').textContent='64';$('tcFocus1').value=$('tcFocus2').value=$('tcFocus3').value=$('tcFooter').value='';
      $('tcMetrics').querySelectorAll('input[type=checkbox]').forEach(x=>x.checked=true);
      const top=poster.querySelector('.poster-top');if(top)top.style.background='';const body=poster.querySelector('.poster-body');if(body)body.style.background='';apply();
    });

    apply();
  };
  waitForStudio();
})();