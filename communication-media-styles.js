// Style library + image uploads for Communication Pro Editor
(() => {
  const MEDIA_KEY='gmCommUploadedMediaV1';
  let imageCounter=0, selectedImage=null;
  const uid=()=>`image-${Date.now()}-${++imageCounter}`;

  const PRESETS={
    comic:{name:'Comic Pop',accent:'#d92535',accent2:'#f4c52f',header:'#171313',body:'#fff8e7',cls:'media-comic'},
    diner:{name:'Retro Diner',accent:'#d53b36',accent2:'#76c8c5',header:'#18384a',body:'#fff7e9',cls:'media-diner'},
    blueprint:{name:'Blueprint',accent:'#f4c52f',accent2:'#ffffff',header:'#123b67',body:'#18548b',cls:'media-blueprint'},
    chalk:{name:'Chalkboard',accent:'#f4c52f',accent2:'#f7efe5',header:'#1e2a26',body:'#243630',cls:'media-chalk'},
    neon:{name:'Neon Night',accent:'#ff3d81',accent2:'#49f5d1',header:'#111020',body:'#17152a',cls:'media-neon'},
    kraft:{name:'Kraft Paper',accent:'#a72c2c',accent2:'#e0b86b',header:'#4a3025',body:'#d9b77d',cls:'media-kraft'},
    pastel:{name:'Pastel Fun',accent:'#d95076',accent2:'#87cde1',header:'#58475b',body:'#fff2f4',cls:'media-pastel'},
    contrast:{name:'High Contrast',accent:'#e31d2b',accent2:'#ffffff',header:'#000000',body:'#ffffff',cls:'media-contrast'},
    minimal:{name:'Modern Minimal',accent:'#9f1f2c',accent2:'#ded8cf',header:'#252323',body:'#f7f5f1',cls:'media-minimal'},
    celebrate:{name:'Celebration',accent:'#d92535',accent2:'#f4c52f',header:'#29213e',body:'#fff5dc',cls:'media-celebrate'}
  };

  function compressImage(file){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onerror=reject;
      reader.onload=()=>{
        const img=new Image();
        img.onerror=reject;
        img.onload=()=>{
          const max=1400, ratio=Math.min(1,max/Math.max(img.width,img.height));
          const w=Math.max(1,Math.round(img.width*ratio)),h=Math.max(1,Math.round(img.height*ratio));
          const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
          const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,w,h);
          let type=file.type==='image/png'?'image/png':'image/jpeg';
          let data;
          try{data=canvas.toDataURL(type,type==='image/jpeg'?.84:undefined)}catch{data=String(reader.result)}
          resolve({data,w,h,name:file.name||'Uploaded image'});
        };
        img.src=String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  function readSaved(){try{return JSON.parse(localStorage.getItem(MEDIA_KEY)||'[]')}catch{return []}}
  function writeSaved(items){try{localStorage.setItem(MEDIA_KEY,JSON.stringify(items));return true}catch{return false}}
  function saveImageRecord(rec){const arr=readSaved().filter(x=>x.id!==rec.id);arr.push(rec);if(arr.length>8)arr.splice(0,arr.length-8);return writeSaved(arr)}
  function removeImageRecord(id){writeSaved(readSaved().filter(x=>x.id!==id))}

  function boot(){
    const poster=document.getElementById('commPoster');
    const panel=document.getElementById('templateCustomizer');
    const objectTools=document.getElementById('objectToolPanel');
    if(!poster||!panel||!objectTools)return setTimeout(boot,120);
    if(document.getElementById('mediaStyleTools'))return;

    const style=document.createElement('style');style.id='mediaStyleStyles';style.textContent=`
      .media-style-tools{grid-column:1/-1;border-top:1px solid var(--line);padding-top:12px;margin-top:10px}.style-preset-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:9px}.style-preset-btn{border:1px solid var(--line);background:#fff;border-radius:12px;padding:10px;text-align:left;font-weight:850;min-height:58px}.style-preset-btn.active{outline:3px solid #8f171d22;border-color:var(--red)}.style-swatch{display:flex;height:12px;border-radius:999px;overflow:hidden;margin-top:6px}.style-swatch i{flex:1}.media-upload-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.upload-image-label{display:inline-flex;align-items:center;justify-content:center;border:1px solid var(--line);background:#fff;border-radius:10px;padding:9px 12px;font-weight:850;cursor:pointer}.upload-image-label input{display:none}.image-inspector{display:none;grid-template-columns:1fr 1fr;gap:8px;background:#f7f3ee;border-radius:12px;padding:10px;margin-top:10px}.image-inspector.show{display:grid}.image-inspector .full{grid-column:1/-1}.custom-image-object{position:absolute!important;width:220px;height:160px;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;overflow:hidden;border-radius:14px}.custom-image-object img{width:100%;height:100%;display:block;object-fit:cover;pointer-events:none}.custom-image-object.fit-contain img{object-fit:contain}.custom-image-object.fit-fill img{object-fit:fill}
      .team-poster.media-comic .poster-body{background-color:#fff8e7!important;background-image:radial-gradient(#d9253528 1.5px,transparent 1.5px),linear-gradient(125deg,transparent 48%,#f4c52f30 49% 51%,transparent 52%)!important;background-size:18px 18px,220px 220px!important}
      .team-poster.media-diner .poster-body{background-color:#fff7e9!important;background-image:repeating-linear-gradient(0deg,#76c8c516 0 2px,transparent 2px 24px)!important}.team-poster.media-diner .poster-box{border-radius:22px}
      .team-poster.media-blueprint .poster-body{background-color:#18548b!important;background-image:linear-gradient(#ffffff20 1px,transparent 1px),linear-gradient(90deg,#ffffff20 1px,transparent 1px)!important;background-size:26px 26px!important}.team-poster.media-blueprint .poster-box,.team-poster.media-blueprint .poster-callout{background:#ffffffee}
      .team-poster.media-chalk .poster-body{background:#243630!important}.team-poster.media-chalk .poster-box,.team-poster.media-chalk .poster-callout{background:#f7efe5;border-style:dashed}.team-poster.media-chalk .poster-focus{background:#16201d}
      .team-poster.media-neon .poster-body{background:radial-gradient(circle at 20% 10%,#ff3d8125,transparent 30%),radial-gradient(circle at 80% 70%,#49f5d125,transparent 34%),#17152a!important}.team-poster.media-neon .poster-box,.team-poster.media-neon .poster-callout{box-shadow:0 0 0 1px #49f5d155,0 0 18px #49f5d133}
      .team-poster.media-kraft .poster-body{background-color:#d9b77d!important;background-image:repeating-linear-gradient(8deg,#ffffff10 0 1px,transparent 1px 5px)!important}.team-poster.media-kraft .poster-box,.team-poster.media-kraft .poster-callout{background:#fffaf0e8}
      .team-poster.media-pastel .poster-body{background:linear-gradient(145deg,#fff2f4,#eef9fc)!important}.team-poster.media-pastel .poster-box{border-color:#d9b4c0}
      .team-poster.media-contrast .poster-body{background:#fff!important}.team-poster.media-contrast .poster-box,.team-poster.media-contrast .poster-callout{border:3px solid #000}
      .team-poster.media-minimal .poster-body{background:#f7f5f1!important}.team-poster.media-minimal .poster-box,.team-poster.media-minimal .poster-callout{box-shadow:none;border-color:#d7d1ca}.team-poster.media-minimal .poster-grid{gap:16px}
      .team-poster.media-celebrate .poster-body{background-color:#fff5dc!important;background-image:radial-gradient(circle at 10% 20%,#d92535 0 3px,transparent 4px),radial-gradient(circle at 80% 10%,#f4c52f 0 4px,transparent 5px),radial-gradient(circle at 30% 80%,#4aa6a0 0 3px,transparent 4px)!important;background-size:80px 80px,110px 110px,95px 95px!important}
      @media(max-width:540px){.style-preset-grid,.image-inspector{grid-template-columns:1fr}.image-inspector .full{grid-column:auto}}@media print{.media-style-tools{display:none!important}}
    `;document.head.appendChild(style);

    const wrap=document.createElement('div');wrap.id='mediaStyleTools';wrap.className='media-style-tools';
    wrap.innerHTML=`<b style="font-size:13px">Styles & Images</b><div class="style-preset-grid">${Object.entries(PRESETS).map(([k,p])=>`<button type="button" class="style-preset-btn" data-preset="${k}">${p.name}<span class="style-swatch"><i style="background:${p.header}"></i><i style="background:${p.accent}"></i><i style="background:${p.accent2}"></i><i style="background:${p.body}"></i></span></button>`).join('')}</div><div class="media-upload-row"><label class="upload-image-label">＋ Upload Image<input id="commImageUpload" type="file" accept="image/*"></label><button type="button" class="secondary" id="restoreUploadedImages">Restore Images</button></div><div class="object-help">Upload a photo, logo, screenshot, or graphic. It becomes a normal design object that you can drag, pinch-resize, rotate, duplicate, layer, lock, or delete.</div><div class="image-inspector" id="imageInspector"><label class="full">Image fit<select id="imgFit"><option value="cover">Crop to fill</option><option value="contain">Show whole image</option><option value="fill">Stretch</option></select></label><label>Corner radius<input id="imgRadius" type="range" min="0" max="60" value="14"></label><label>Opacity<input id="imgOpacity" type="range" min="20" max="100" value="100"></label><label>Border width<input id="imgBorder" type="range" min="0" max="10" value="0"></label><label>Border color<input id="imgBorderColor" type="color" value="#171313"></label><button type="button" class="secondary full" id="removeImageObject">Delete Image</button></div>`;
    objectTools.insertAdjacentElement('afterend',wrap);

    const presetClasses=Object.values(PRESETS).map(p=>p.cls);
    function applyPreset(key){const p=PRESETS[key];if(!p)return;poster.classList.remove(...presetClasses);poster.classList.add(p.cls);poster.style.setProperty('--accent',p.accent);poster.style.setProperty('--accent2',p.accent2);const top=poster.querySelector('.poster-top');if(top)top.style.background=p.header;wrap.querySelectorAll('.style-preset-btn').forEach(b=>b.classList.toggle('active',b.dataset.preset===key));try{localStorage.setItem('gmCommStylePreset',key)}catch{}}
    wrap.querySelector('.style-preset-grid').addEventListener('click',e=>{const b=e.target.closest('.style-preset-btn');if(b)applyPreset(b.dataset.preset)});
    try{const p=localStorage.getItem('gmCommStylePreset');if(PRESETS[p])applyPreset(p)}catch{}

    function makeImageObject(rec,saveIt=true){
      if(poster.querySelector(`[data-media-id="${rec.id}"]`))return;
      const el=document.createElement('div');el.className='poster-box custom-image-object';el.dataset.proKey=rec.id;el.dataset.customType='image';el.dataset.mediaId=rec.id;el.innerHTML=`<img alt="${String(rec.name||'Uploaded image').replace(/"/g,'&quot;')}">`;el.querySelector('img').src=rec.data;poster.appendChild(el);el.style.left='50%';el.style.top='48%';el.style.transform='translate(-50%,-50%)';if(rec.fit==='contain')el.classList.add('fit-contain');if(rec.fit==='fill')el.classList.add('fit-fill');if(rec.radius!=null)el.style.borderRadius=rec.radius+'px';if(rec.opacity!=null)el.style.opacity=rec.opacity;if(rec.border!=null){el.style.borderStyle='solid';el.style.borderWidth=rec.border+'px';el.style.borderColor=rec.borderColor||'#171313'};if(saveIt)saveImageRecord(rec);selectImage(el);return el;
    }

    document.getElementById('commImageUpload').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const info=await compressImage(file);const rec={id:uid(),...info,fit:'cover',radius:14,opacity:1,border:0,borderColor:'#171313'};makeImageObject(rec,true)}catch(err){alert('Could not load that image. Try a JPG or PNG.')}finally{e.target.value=''}});
    document.getElementById('restoreUploadedImages').onclick=()=>readSaved().forEach(r=>makeImageObject(r,false));

    const inspector=document.getElementById('imageInspector'),fit=document.getElementById('imgFit'),radius=document.getElementById('imgRadius'),opacity=document.getElementById('imgOpacity'),border=document.getElementById('imgBorder'),borderColor=document.getElementById('imgBorderColor');
    function getRec(el){return readSaved().find(x=>x.id===el?.dataset?.mediaId)}
    function updateRec(el,patch){const arr=readSaved(),i=arr.findIndex(x=>x.id===el.dataset.mediaId);if(i>=0){Object.assign(arr[i],patch);writeSaved(arr)}}
    function selectImage(el){selectedImage=el?.dataset?.customType==='image'?el:null;inspector.classList.toggle('show',!!selectedImage);if(!selectedImage)return;const rec=getRec(selectedImage)||{};fit.value=rec.fit||'cover';radius.value=rec.radius??parseInt(getComputedStyle(selectedImage).borderRadius)||14;opacity.value=Math.round((rec.opacity??parseFloat(getComputedStyle(selectedImage).opacity)||1)*100);border.value=rec.border??parseInt(getComputedStyle(selectedImage).borderWidth)||0;borderColor.value=rec.borderColor||'#171313'}
    poster.addEventListener('pointerdown',e=>{const el=e.target.closest('[data-custom-type="image"]');if(el)selectImage(el)},true);
    fit.oninput=()=>{if(!selectedImage)return;selectedImage.classList.remove('fit-contain','fit-fill');if(fit.value==='contain')selectedImage.classList.add('fit-contain');if(fit.value==='fill')selectedImage.classList.add('fit-fill');updateRec(selectedImage,{fit:fit.value})};
    radius.oninput=()=>{if(selectedImage){selectedImage.style.borderRadius=radius.value+'px';updateRec(selectedImage,{radius:Number(radius.value)})}};
    opacity.oninput=()=>{if(selectedImage){selectedImage.style.opacity=String(opacity.value/100);updateRec(selectedImage,{opacity:Number(opacity.value)/100})}};
    border.oninput=()=>{if(selectedImage){selectedImage.style.borderStyle='solid';selectedImage.style.borderWidth=border.value+'px';updateRec(selectedImage,{border:Number(border.value)})}};
    borderColor.oninput=()=>{if(selectedImage){selectedImage.style.borderColor=borderColor.value;updateRec(selectedImage,{borderColor:borderColor.value})}};
    document.getElementById('removeImageObject').onclick=()=>{if(!selectedImage)return;const id=selectedImage.dataset.mediaId;selectedImage.remove();removeImageRecord(id);selectedImage=null;inspector.classList.remove('show')};

    // Restore saved uploaded images after the poster is ready.
    setTimeout(()=>readSaved().forEach(r=>makeImageObject(r,false)),180);
  }
  boot();
})();