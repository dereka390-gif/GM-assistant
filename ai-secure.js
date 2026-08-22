// Secure AI UI for GM Assistant
(() => {
  const SUPABASE_URL='https://baxvcyfvimegafnbgleo.supabase.co';
  const SUPABASE_KEY='sb_publishable_v95SXg4pHgcYcd7KtX1FbA_YLw_keRB';
  async function callAI(mode,question){
    const sess=window.gmAuth?.getSession?.();if(!sess?.access_token)throw new Error('Sign in to use secure AI.');
    const r=await fetch('/api/assistant',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${sess.access_token}`},body:JSON.stringify({mode,question})});
    const data=await r.json();if(!r.ok){const e=new Error(data.error||'AI request failed');e.data=data;e.status=r.status;throw e;}return data.answer||'';
  }
  async function searchOsmDirect(question){
    const sess=window.gmAuth?.getSession?.();if(!sess?.access_token)return [];
    const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/search_osm_pages`,{method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${sess.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({query_text:question,match_count:12})});
    if(!r.ok)return [];return r.json();
  }
  function escText(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function textToHtml(x){return escText(x).replace(/\n/g,'<br>')}
  const STOP=new Set(['the','and','for','with','that','this','what','when','where','which','who','how','why','can','could','would','should','does','did','are','was','were','have','has','had','from','into','about','your','our','their','there','then','than','also','just','need','want','tell','show','find','look','looking','osm','page','pages','manual']);
  function queryTerms(q){return [...new Set(String(q||'').toLowerCase().match(/[a-z0-9]+/g)||[])].filter(x=>x.length>=3&&!STOP.has(x));}
  function bestSnippet(content,q){
    const text=String(content||'').replace(/\s+/g,' ').trim();if(text.length<=1500)return text;
    const lower=text.toLowerCase(),terms=queryTerms(q);let pos=-1;
    for(const t of terms){const i=lower.indexOf(t);if(i>=0&&(pos<0||i<pos))pos=i;}
    if(pos<0)return text.slice(0,1500)+'…';
    const start=Math.max(0,pos-350),end=Math.min(text.length,start+1500);
    return (start>0?'…':'')+text.slice(start,end)+(end<text.length?'…':'');
  }
  function renderMatches(matches,q){return matches.map((x,i)=>`<div class="result"><div class="eyebrow">OSM · Page ${x.page_number} · Match ${i+1}</div><p style="line-height:1.5">${escText(bestSnippet(x.content,q))}</p></div>`).join('')}

  function wireCoach(){
    const card=document.getElementById('aiSummary')?.closest('.card');if(!card||document.getElementById('secureCoachBtn'))return;
    const btn=document.createElement('button');btn.id='secureCoachBtn';btn.className='secondary';btn.style.marginTop='12px';btn.textContent='Generate AI Coach';
    btn.onclick=async()=>{const out=document.getElementById('aiSummary');btn.disabled=true;btn.textContent='Thinking…';try{const data=typeof dashData==='function'?dashData():{},cur=data.cur||null;if(!cur)throw new Error('Save a completed week first.');const prompt=`Review this restaurant performance and coach the GM.\nPeriod: ${data.title||''}\nRestaurant settings/goals: ${JSON.stringify(s?.settings||{})}\nCurrent performance: ${JSON.stringify(cur)}\nRestaurant health score: ${typeof healthScore==='function'?healthScore(cur):'n/a'}\nHealth components: ${typeof subscores==='function'?JSON.stringify(subscores(cur)):'n/a'}\nGive a short executive read, the biggest opportunity, what to protect, and specific next actions.`;out.innerHTML=textToHtml(await callAI('coach',prompt));}catch(e){out.textContent=e.message||'AI unavailable.';}finally{btn.disabled=false;btn.textContent='Generate AI Coach';}};
    card.appendChild(btn);
  }

  function wireOSM(){
    const section=document.getElementById('osm');if(!section||document.getElementById('osmAiBadge'))return;
    const p=section.querySelector('.search')?.nextElementSibling;if(p){p.id='osmAiBadge';p.innerHTML='<b>Secure OSM:</b> Search the full private manual using normal questions. Results now use precise matching first, then broader keyword matching if needed.';}
    const local=window.searchOSM;
    window.searchOSM=async function(){
      const q=document.getElementById('q')?.value?.trim(),results=document.getElementById('results');if(!q)return;const sess=window.gmAuth?.getSession?.();
      if(!sess?.access_token){if(typeof local==='function')local();if(results)results.insertAdjacentHTML('afterbegin','<div class="alert"><b>Sign in for the full OSM</b><div class="muted">You are seeing the small local starter reference.</div></div>');return;}
      if(results)results.innerHTML='<div class="result"><b>Searching the full OSM…</b><div class="muted">Checking exact wording and related keywords.</div></div>';
      try{const answer=await callAI('osm',q);if(results)results.innerHTML=`<div class="result"><span class="pill">AI + Full OSM</span><h3 style="margin:9px 0 6px">Answer</h3><div style="line-height:1.55">${textToHtml(answer)}</div><p class="muted" style="margin-top:10px">Answer grounded in your privately indexed OSM. Verify critical operational decisions against the current official manual.</p></div>`;}
      catch(e){const matches=e.data?.matches?.length?e.data.matches:await searchOsmDirect(q);if(matches.length){if(results)results.innerHTML=`<div class="alert"><b>Found ${matches.length} relevant OSM page${matches.length===1?'':'s'}</b><div class="muted">Best matches are shown first, with the excerpt centered near your search terms.</div></div>${renderMatches(matches,q)}`;}else if(results)results.innerHTML=`<div class="alert"><b>No full OSM results</b><div class="muted">Try a shorter phrase with the important words only, such as “roast beef hold temperature” or “drive thru timer”.</div></div>`;}
    };
  }

  function addHealthStyles(){
    if(document.getElementById('gmHealthDrillStyles'))return;
    const style=document.createElement('style');style.id='gmHealthDrillStyles';style.textContent=`
      #subscores .subscore{cursor:pointer;position:relative;padding-right:32px;transition:border-color .15s ease,background .15s ease,transform .15s ease;min-height:66px}
      #subscores .subscore:after{content:'›';position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:22px;font-weight:900;color:var(--red);transition:transform .15s ease}
      #subscores .subscore.gm-open{border-color:var(--red);background:#fff7f5}
      #subscores .subscore.gm-open:after{transform:translateY(-50%) rotate(90deg)}
      #subscores .subscore:focus-visible{outline:3px solid #8f171d33;outline-offset:2px}
      .gm-health-drill{grid-column:1/-1;border:1px solid var(--line);border-radius:14px;background:#fff;padding:14px;margin-top:1px;line-height:1.45;animation:gmDrop .16s ease-out}
      .gm-health-drill h3{margin:0 0 5px;font-size:16px}.gm-health-drill p{margin:0 0 10px}.gm-health-drill ul{margin:7px 0 0;padding-left:20px}.gm-health-drill li{margin:6px 0}.gm-health-note{font-size:12px;color:var(--muted);margin-top:10px!important}
      @keyframes gmDrop{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
      @media(prefers-reduced-motion:reduce){.gm-health-drill{animation:none}#subscores .subscore{transition:none}}
    `;document.head.appendChild(style);
  }

  function num(v){return v==null||v===''||Number.isNaN(Number(v))?null:Number(v)}
  function healthAdvice(label,w){
    const settings=(typeof s!=='undefined'&&s?.settings)||{};
    if(label==='Guest Experience'){
      const cats=['accuracy','cleanliness','speed','taste','friendliness'].filter(k=>num(w?.[k])!=null).sort((a,b)=>w[a]-w[b]);
      const low=cats[0],high=cats[cats.length-1];
      const osat=num(w?.osat),goal=num(settings.osatGoal);
      return {
        title:'Guest Experience suggestions',
        read:osat!=null&&goal!=null?`OSAT is ${osat.toFixed(0)}% against a ${goal.toFixed(0)}% goal.${low?` ${low[0].toUpperCase()+low.slice(1)} is the lowest guest category at ${Number(w[low]).toFixed(0)}%.`:''}`:'Use the guest categories below to find the weakest part of the experience.',
        items:[
          low?`Coach one observable ${low} behavior on every shift this week, then recheck it during peak.`:'Review Accuracy, Cleanliness, Speed, Taste and Friendliness to identify the lowest category.',
          low==='cleanliness'?'Assign timed dining room, restroom and front-counter manager walks before and during each rush.':'Observe the guest journey from order taking through handoff and identify the point creating the weakest score.',
          high?`Protect ${high} — currently your strongest guest category — while working on the lower score.`:'Recognize the strongest behavior so the team knows what to repeat.'
        ]
      };
    }
    if(label==='Operations'){
      const overall=num(w?.driveOverall),goal=num(settings.driveGoal);
      const dayparts=[['Lunch',w?.driveLunch],['Afternoon',w?.driveAfternoon],['Dinner',w?.driveDinner],['Evening',w?.driveEvening]].filter(x=>num(x[1])!=null).sort((a,b)=>Number(b[1])-Number(a[1]));
      const slow=dayparts[0];
      return {
        title:'Operations suggestions',
        read:overall!=null&&goal!=null?`Drive-thru is ${overall.toFixed(0)} sec against a ${goal.toFixed(0)} sec goal.${slow?` ${slow[0]} is the slowest tracked daypart at ${Number(slow[1]).toFixed(0)} sec.`:''}`:'Use daypart drive-thru times to locate the operational bottleneck.',
        items:[
          slow?`Spend 20–30 minutes observing ${slow[0].toLowerCase()} and identify whether the delay is order taking, product readiness, assembly, bagging or handoff.`:'Compare lunch, afternoon, dinner and evening times to find the slowest period.',
          'Put the strongest available person at the actual bottleneck during the next peak instead of changing the whole deployment.',
          'Check product readiness and pull-ahead opportunities before the rush, then compare the next daypart result.'
        ]
      };
    }
    if(label==='Food Cost'){
      const fv=num(w?.foodVariance),goal=num(settings.foodGoal),district=num(settings.districtFoodGoal);
      let read='Enter food variance to get a targeted food-cost read.';
      if(fv!=null){read=`Food variance is ${fv.toFixed(2)}%.`;if(goal!=null)read+=fv>goal?` That is above the ${goal.toFixed(2)}% goal.`:` That is within the ${goal.toFixed(2)}% goal.`;if(district!=null&&fv>district)read+=` District target is ${district.toFixed(2)}%.`;}
      return {
        title:'Food Cost suggestions',read,
        items:[
          'Review the top-loss items first: waste, over-portioning, incorrect ringing, transfers and unexplained inventory movement.',
          'Pick the top 2–3 food items driving variance and verify portions and waste on the next two shifts.',
          'Compare actual usage to sales before the next inventory count instead of waiting for the next weekly result.'
        ]
      };
    }
    if(label==='Labor'){
      const saved=num(w?.laborHoursSaved),goal=num(settings.laborGoal);
      return {
        title:'Labor suggestions',
        read:saved!=null&&goal!=null?`Labor saved is ${saved.toFixed(1)} hours against a ${goal.toFixed(1)} hour goal.`:'Enter labor hours saved to get a targeted labor read.',
        items:[
          'Match deployment to the busiest 30-minute periods instead of making broad cuts across the whole day.',
          'Protect the positions that directly affect speed and guest experience during peak, then trim or redirect labor outside peak.',
          'Review labor and service together — a labor win that creates slower service or lower accuracy is not a clean win.'
        ]
      };
    }
    return {title:`${label} suggestions`,read:'Use this score to identify the biggest controllable gap.',items:['Observe the current process.','Assign one owner and one measurable action.','Verify the result on the next shift.']};
  }

  function decorateHealthBubbles(){
    const box=document.getElementById('subscores');if(!box)return;
    [...box.querySelectorAll('.subscore')].forEach(el=>{
      if(el.dataset.gmDrill==='1')return;
      el.dataset.gmDrill='1';el.setAttribute('role','button');el.setAttribute('tabindex','0');el.setAttribute('aria-expanded','false');el.title='Tap for suggestions';
      const activate=()=>toggleHealthBubble(el);
      el.addEventListener('click',activate);
      el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}});
    });
  }

  function toggleHealthBubble(el){
    const box=document.getElementById('subscores');if(!box)return;
    const label=el.querySelector('span')?.textContent?.trim()||'Health';
    const wasOpen=el.classList.contains('gm-open');
    box.querySelectorAll('.subscore').forEach(x=>{x.classList.remove('gm-open');x.setAttribute('aria-expanded','false')});
    box.querySelector('.gm-health-drill')?.remove();
    if(wasOpen)return;
    const data=typeof dashData==='function'?dashData():{},w=data.cur||null;
    const a=healthAdvice(label,w);
    el.classList.add('gm-open');el.setAttribute('aria-expanded','true');
    const panel=document.createElement('div');panel.className='gm-health-drill';panel.setAttribute('role','region');panel.setAttribute('aria-live','polite');
    panel.innerHTML=`<h3>${escText(a.title)}</h3><p>${escText(a.read)}</p><b>What to work on</b><ul>${a.items.map(x=>`<li>${escText(x)}</li>`).join('')}</ul><p class="gm-health-note">Suggestions are based on the saved dashboard numbers. Use Ask OSM when you need the exact Arby’s operating standard or procedure.</p>`;
    el.insertAdjacentElement('afterend',panel);
  }

  function wireHealthDrilldowns(){
    addHealthStyles();decorateHealthBubbles();
    const box=document.getElementById('subscores');if(!box||box.dataset.gmObserved==='1')return;
    box.dataset.gmObserved='1';
    const obs=new MutationObserver(()=>decorateHealthBubbles());obs.observe(box,{childList:true,subtree:false});
  }

  function boot(){wireCoach();wireOSM();wireHealthDrilldowns();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();