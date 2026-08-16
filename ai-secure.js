// Secure AI UI for GM Assistant
(() => {
  async function callAI(mode,question){
    const sess=window.gmAuth?.getSession?.();
    if(!sess?.access_token)throw new Error('Sign in to use secure AI.');
    const r=await fetch('/api/assistant',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${sess.access_token}`},body:JSON.stringify({mode,question})});
    const data=await r.json();if(!r.ok)throw new Error(data.error||'AI request failed');return data.answer||'';
  }
  function escText(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function textToHtml(x){return escText(x).replace(/\n/g,'<br>')}

  function wireCoach(){
    const card=document.getElementById('aiSummary')?.closest('.card');if(!card||document.getElementById('secureCoachBtn'))return;
    const btn=document.createElement('button');btn.id='secureCoachBtn';btn.className='secondary';btn.style.marginTop='12px';btn.textContent='Generate AI Coach';
    btn.onclick=async()=>{
      const out=document.getElementById('aiSummary');btn.disabled=true;btn.textContent='Thinking…';
      try{
        const data=typeof dashData==='function'?dashData():{};const cur=data.cur||null;
        if(!cur)throw new Error('Save a completed week first.');
        const prompt=`Review this restaurant performance and coach the GM.\nPeriod: ${data.title||''}\nRestaurant settings/goals: ${JSON.stringify(s?.settings||{})}\nCurrent performance: ${JSON.stringify(cur)}\nRestaurant health score: ${typeof healthScore==='function'?healthScore(cur):'n/a'}\nHealth components: ${typeof subscores==='function'?JSON.stringify(subscores(cur)):'n/a'}\nGive a short executive read, the biggest opportunity, what to protect, and specific next actions.`;
        out.innerHTML=textToHtml(await callAI('coach',prompt));
      }catch(e){out.textContent=e.message||'AI unavailable.';}finally{btn.disabled=false;btn.textContent='Generate AI Coach';}
    };
    card.appendChild(btn);
  }

  function wireOSM(){
    const section=document.getElementById('osm');if(!section||document.getElementById('osmAiBadge'))return;
    const p=section.querySelector('.search')?.nextElementSibling;
    if(p){p.id='osmAiBadge';p.innerHTML='<b>Secure OSM AI:</b> Sign in to search the connected full OSM knowledge base. The local starter reference remains available when signed out.';}
    const local=window.searchOSM;
    window.searchOSM=async function(){
      const q=document.getElementById('q')?.value?.trim();const results=document.getElementById('results');if(!q)return;
      const sess=window.gmAuth?.getSession?.();
      if(!sess?.access_token){if(typeof local==='function')local();if(results)results.insertAdjacentHTML('afterbegin','<div class="alert"><b>Full OSM AI requires sign-in</b><div class="muted">You are seeing the local starter reference. Sign in for the protected OSM knowledge base.</div></div>');return;}
      if(results)results.innerHTML='<div class="result"><b>Searching secure OSM…</b><div class="muted">Using the protected reference library.</div></div>';
      try{const answer=await callAI('osm',q);if(results)results.innerHTML=`<div class="result"><span class="pill">AI + OSM</span><h3 style="margin:9px 0 6px">Answer</h3><div style="line-height:1.55">${textToHtml(answer)}</div><p class="muted" style="margin-top:10px">Verify critical operational decisions against the current official OSM.</p></div>`;}
      catch(e){if(results)results.innerHTML=`<div class="alert"><b>OSM AI unavailable</b><div class="muted">${escText(e.message||'Unable to search the OSM.')}</div></div>`;}
    };
  }
  function boot(){wireCoach();wireOSM();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();