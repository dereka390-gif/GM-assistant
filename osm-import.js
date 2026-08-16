// Private OSM PDF importer: extracts text in the browser and stores pages under the signed-in user only.
(() => {
  const SUPABASE_URL='https://baxvcyfvimegafnbgleo.supabase.co';
  const SUPABASE_KEY='sb_publishable_v95SXg4pHgcYcd7KtX1FbA_YLw_keRB';
  const PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs';
  const PDFWORKER='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
  let pdfjs=null;

  function sess(){return window.gmAuth?.getSession?.()}
  function usr(){return window.gmAuth?.getUser?.()}
  function apiHeaders(){const s=sess();return {apikey:SUPABASE_KEY,Authorization:`Bearer ${s?.access_token||''}`,'Content-Type':'application/json'};}
  async function loadPdfJs(){if(pdfjs)return pdfjs;pdfjs=await import(PDFJS);pdfjs.GlobalWorkerOptions.workerSrc=PDFWORKER;return pdfjs;}
  async function uploadBatch(rows){
    const r=await fetch(`${SUPABASE_URL}/rest/v1/osm_pages?on_conflict=user_id,page_number`,{method:'POST',headers:{...apiHeaders(),Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(rows)});
    if(!r.ok)throw new Error(`OSM upload failed (${r.status})`);
  }
  async function clearOld(){const u=usr();if(!u)return;const r=await fetch(`${SUPABASE_URL}/rest/v1/osm_pages?user_id=eq.${encodeURIComponent(u.id)}`,{method:'DELETE',headers:apiHeaders()});if(!r.ok)throw new Error('Could not replace the previous OSM index.');}
  async function countPages(){const u=usr();if(!u)return 0;const r=await fetch(`${SUPABASE_URL}/rest/v1/osm_pages?select=page_number&user_id=eq.${encodeURIComponent(u.id)}`,{headers:{...apiHeaders(),Prefer:'count=exact'}});if(!r.ok)return 0;return (await r.json()).length;}

  function boot(){
    const section=document.getElementById('osm'),card=section?.querySelector('.card');if(!card||document.getElementById('osmImportPanel'))return setTimeout(boot,100);
    const panel=document.createElement('div');panel.id='osmImportPanel';panel.style.cssText='margin:14px 0;padding:13px;border:1px solid var(--line);border-radius:14px;background:#fcfaf8';
    panel.innerHTML=`<div class="eyebrow">Private full manual</div><b>Import Full OSM PDF</b><p class="muted" style="margin:6px 0 10px">The PDF is read on this device. Extracted page text is stored privately under your signed-in account so Ask OSM can search the complete manual across devices.</p><label class="secondary" style="display:inline-block;cursor:pointer">Choose OSM PDF<input id="osmPdfFile" type="file" accept="application/pdf" hidden></label><button type="button" class="secondary" id="osmIndexStatus" style="margin-left:6px">Check Index</button><div id="osmImportStatus" class="muted" style="margin-top:9px"></div>`;
    const results=document.getElementById('results');card.insertBefore(panel,results);
    const input=document.getElementById('osmPdfFile'),status=document.getElementById('osmImportStatus');
    document.getElementById('osmIndexStatus').onclick=async()=>{if(!sess()?.access_token){status.textContent='Sign in first.';return;}const n=await countPages();status.textContent=n?`${n} OSM pages are indexed for your account.`:'No full OSM is indexed yet.';};
    input.onchange=async()=>{
      const file=input.files?.[0];if(!file)return;if(!sess()?.access_token||!usr()){status.textContent='Sign in before importing the OSM.';input.value='';return;}
      if(file.size>150*1024*1024){status.textContent='That PDF is too large for mobile import.';return;}
      try{
        status.textContent='Opening OSM PDF…';const lib=await loadPdfJs();const data=new Uint8Array(await file.arrayBuffer());const pdf=await lib.getDocument({data}).promise;
        if(!confirm(`Import ${pdf.numPages} OSM pages? This replaces the current OSM index for your account.`)){input.value='';return;}
        await clearOld();let batch=[];const u=usr();
        for(let i=1;i<=pdf.numPages;i++){
          status.textContent=`Indexing OSM page ${i} of ${pdf.numPages}…`;
          const page=await pdf.getPage(i),tc=await page.getTextContent();const content=tc.items.map(x=>x.str||'').join(' ').replace(/\s+/g,' ').trim();
          if(content)batch.push({user_id:u.id,page_number:i,content});
          if(batch.length>=12||i===pdf.numPages){if(batch.length){await uploadBatch(batch);batch=[];}await new Promise(r=>setTimeout(r,0));}
        }
        status.innerHTML=`<b>OSM ready.</b> ${await countPages()} pages are now privately searchable.`;input.value='';
      }catch(e){status.textContent=e.message||'OSM import failed.';}
    };
  }
  boot();
})();