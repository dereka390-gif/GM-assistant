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
    const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/search_osm_pages`,{method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${sess.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({query_text:question,match_count:8})});
    if(!r.ok)return [];return r.json();
  }
  function escText(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function textToHtml(x){return escText(x).replace(/\n/g,'<br>')}
  function renderMatches(matches){return matches.map(x=>`<div class="result"><div class="eyebrow">OSM · Page ${x.page_number}</div><p style="line-height:1.5">${escText((x.content||'').slice(0,1400))}${(x.content||'').length>1400?'…':''}</p></div>`).join('')}

  function wireCoach(){
    const card=document.getElementById('aiSummary')?.closest('.card');if(!card||document.getElementById('secureCoachBtn'))return;
    const btn=document.createElement('button');btn.id='secureCoachBtn';btn.className='secondary';btn.style.marginTop='12px';btn.textContent='Generate AI Coach';
    btn.onclick=async()=>{const out=document.getElementById('aiSummary');btn.disabled=true;btn.textContent='Thinking…';try{const data=typeof dashData==='function'?dashData():{},cur=data.cur||null;if(!cur)throw new Error('Save a completed week first.');const prompt=`Review this restaurant performance and coach the GM.\nPeriod: ${data.title||''}\nRestaurant settings/goals: ${JSON.stringify(s?.settings||{})}\nCurrent performance: ${JSON.stringify(cur)}\nRestaurant health score: ${typeof healthScore==='function'?healthScore(cur):'n/a'}\nHealth components: ${typeof subscores==='function'?JSON.stringify(subscores(cur)):'n/a'}\nGive a short executive read, the biggest opportunity, what to protect, and specific next actions.`;out.innerHTML=textToHtml(await callAI('coach',prompt));}catch(e){out.textContent=e.message||'AI unavailable.';}finally{btn.disabled=false;btn.textContent='Generate AI Coach';}};
    card.appendChild(btn);
  }
  function wireOSM(){
    const section=document.getElementById('osm');if(!section||document.getElementById('osmAiBadge'))return;
    const p=section.querySelector('.search')?.nextElementSibling;if(p){p.id='osmAiBadge';p.innerHTML='<b>Secure OSM:</b> Sign in and import the full OSM PDF once. Ask OSM will then search your private full-manual index; AI answers activate when the server AI key is configured.';}
    const local=window.searchOSM;
    window.searchOSM=async function(){
      const q=document.getElementById('q')?.value?.trim(),results=document.getElementById('results');if(!q)return;const sess=window.gmAuth?.getSession?.();
      if(!sess?.access_token){if(typeof local==='function')local();if(results)results.insertAdjacentHTML('afterbegin','<div class="alert"><b>Sign in for the full OSM</b><div class="muted">You are seeing the small local starter reference.</div></div>');return;}
      if(results)results.innerHTML='<div class="result"><b>Searching private OSM…</b></div>';
      try{const answer=await callAI('osm',q);if(results)results.innerHTML=`<div class="result"><span class="pill">AI + Full OSM</span><h3 style="margin:9px 0 6px">Answer</h3><div style="line-height:1.55">${textToHtml(answer)}</div><p class="muted" style="margin-top:10px">Answer grounded in your privately indexed OSM. Verify critical operational decisions against the current official manual.</p></div>`;}
      catch(e){const matches=e.data?.matches?.length?e.data.matches:await searchOsmDirect(q);if(matches.length){if(results)results.innerHTML=`<div class="alert"><b>${e.status===503?'Full OSM search is working; AI is not enabled yet.':'OSM reference matches'}</b><div class="muted">Showing the most relevant pages from your private OSM index.</div></div>${renderMatches(matches)}`;}else if(results)results.innerHTML=`<div class="alert"><b>No full OSM results</b><div class="muted">${escText(e.message||'Import the OSM PDF first.')}</div></div>`;}
    };
  }
  function boot(){wireCoach();wireOSM();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();