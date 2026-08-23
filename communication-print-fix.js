// Print the poster exactly as it currently appears in the Pro Editor.
// Do not regenerate it before printing, because regeneration wipes manual edits/objects.
(() => {
  function boot(){
    const poster=document.getElementById('commPoster');
    const button=document.getElementById('commPrint');
    if(!poster||!button)return setTimeout(boot,120);
    if(button.dataset.proPrintFixed==='1')return;
    button.dataset.proPrintFixed='1';

    function cleanClone(){
      const clone=poster.cloneNode(true);
      clone.querySelectorAll('.pro-guide-x,.pro-guide-y,.pro-editor-toolbar').forEach(x=>x.remove());
      clone.querySelectorAll('.pro-selected,.pro-moving').forEach(x=>x.classList.remove('pro-selected','pro-moving'));
      return clone;
    }

    function styleText(){
      return [...document.querySelectorAll('style')]
        .map(s=>s.textContent||'')
        .filter(Boolean)
        .join('\n');
    }

    function printableHtml(){
      const store=(typeof s!=='undefined'&&s?.settings?.storeNumber)||'8571';
      return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Store ${String(store).replace(/[<>]/g,'')} Communication</title><style>${styleText()}\nhtml,body{margin:0!important;padding:0!important;background:#fff!important;width:100%!important;height:auto!important}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.team-poster{width:8.5in!important;height:11in!important;max-width:none!important;box-shadow:none!important;border:0!important;margin:0!important}.pro-editor-toolbar,.pro-guide-x,.pro-guide-y{display:none!important}@page{size:letter portrait;margin:0}@media print{html,body{width:8.5in!important;height:11in!important;overflow:hidden!important}.team-poster{break-inside:avoid!important;page-break-inside:avoid!important}}</style></head><body>${cleanClone().outerHTML}<script>window.onload=function(){setTimeout(function(){window.focus();window.print();},350)}<\/script></body></html>`;
    }

    button.onclick=()=>{
      const html=printableHtml();
      const win=window.open('','_blank');
      if(win){win.document.open();win.document.write(html);win.document.close();return;}
      const frame=document.createElement('iframe');
      frame.style.cssText='position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0';
      document.body.appendChild(frame);
      frame.onload=()=>setTimeout(()=>{try{frame.contentWindow.focus();frame.contentWindow.print()}finally{setTimeout(()=>frame.remove(),1500)}},400);
      frame.srcdoc=html.replace(/<script>window\.onload[\s\S]*?<\\\/script>/,'');
    };
  }
  boot();
})();