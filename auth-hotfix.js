// Touch-safe authentication launcher for GM Assistant
(() => {
  const SUPABASE_URL='https://baxvcyfvimegafnbgleo.supabase.co';
  const SUPABASE_KEY='sb_publishable_v95SXg4pHgcYcd7KtX1FbA_YLw_keRB';
  const SESSION_KEY='gmAssistantAuthV1';

  const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const loadSession=()=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}};
  const headers=()=>({apikey:SUPABASE_KEY,'Content-Type':'application/json'});

  async function currentUser(){
    const s=loadSession(); if(!s?.access_token)return null;
    try{
      const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{...headers(),Authorization:`Bearer ${s.access_token}`}});
      return r.ok?await r.json():null;
    }catch{return null;}
  }

  function ensureStyle(){
    if(document.getElementById('authHotfixStyle'))return;
    const st=document.createElement('style'); st.id='authHotfixStyle';
    st.textContent='.authhf-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:99999;display:flex;align-items:center;justify-content:center;padding:18px}.authhf-card{width:min(440px,100%);background:#fff;border-radius:20px;padding:20px;box-shadow:0 24px 70px rgba(0,0,0,.35)}.authhf-card label{display:block;margin-top:10px}.authhf-card input{margin-top:5px}.authhf-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.authhf-actions button{flex:1;min-width:120px}.authhf-msg{margin-top:10px;color:#756b6d;line-height:1.4}';
    document.head.appendChild(st);
  }

  async function showAuth(){
    ensureStyle(); document.getElementById('authHotfixModal')?.remove();
    const user=await currentUser();
    const wrap=document.createElement('div'); wrap.id='authHotfixModal'; wrap.className='authhf-backdrop';
    if(user){
      wrap.innerHTML=`<div class="authhf-card"><div class="eyebrow">Secure account</div><h2>Signed In</h2><p class="muted">${esc(user.email||'Authenticated user')}</p><p>Your GM Assistant account is connected.</p><div class="authhf-actions"><button class="secondary" id="authhfClose">Close</button><button class="secondary" id="authhfOut">Sign Out</button></div></div>`;
    }else{
      wrap.innerHTML=`<div class="authhf-card"><div class="eyebrow">GM Assistant account</div><h2>Sign In or Create Account</h2><p class="muted">Use your email and a password with at least 6 characters.</p><label>Email<input id="authhfEmail" type="email" autocomplete="email" inputmode="email"></label><label>Password<input id="authhfPass" type="password" autocomplete="current-password"></label><div id="authhfMsg" class="authhf-msg"></div><div class="authhf-actions"><button class="primary" id="authhfIn">Sign In</button><button class="secondary" id="authhfUp">Create Account</button></div><div class="authhf-actions"><button class="ghost" id="authhfClose">Cancel</button></div></div>`;
    }
    document.body.appendChild(wrap);
    wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.remove()});
    document.getElementById('authhfClose').onclick=()=>wrap.remove();
    if(user){
      document.getElementById('authhfOut').onclick=async()=>{const s=loadSession();try{if(s?.access_token)await fetch(`${SUPABASE_URL}/auth/v1/logout`,{method:'POST',headers:{...headers(),Authorization:`Bearer ${s.access_token}`}})}catch{}localStorage.removeItem(SESSION_KEY);wrap.remove();location.reload();};
      return;
    }
    async function submit(create){
      const email=document.getElementById('authhfEmail').value.trim();
      const password=document.getElementById('authhfPass').value;
      const msg=document.getElementById('authhfMsg');
      if(!email||password.length<6){msg.textContent='Enter a valid email and a password of at least 6 characters.';return;}
      msg.textContent=create?'Creating account…':'Signing in…';
      try{
        const path=create?'/auth/v1/signup':'/auth/v1/token?grant_type=password';
        const r=await fetch(SUPABASE_URL+path,{method:'POST',headers:headers(),body:JSON.stringify({email,password})});
        const data=await r.json();
        if(!r.ok)throw new Error(data.msg||data.message||data.error_description||'Authentication failed');
        if(data.access_token){localStorage.setItem(SESSION_KEY,JSON.stringify(data));msg.textContent='Signed in successfully.';setTimeout(()=>location.reload(),350);}
        else msg.textContent='Account created. Check your email for a confirmation link if Supabase requires confirmation, then return here and sign in.';
      }catch(e){msg.textContent=e.message||'Authentication failed.';}
    }
    document.getElementById('authhfIn').onclick=()=>submit(false);
    document.getElementById('authhfUp').onclick=()=>submit(true);
  }

  function wire(){
    const btn=document.getElementById('accountBtn'); if(!btn)return false;
    btn.onclick=null;
    btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();showAuth();},{capture:true});
    btn.addEventListener('touchend',e=>{e.preventDefault();e.stopPropagation();showAuth();},{capture:true});
    return true;
  }

  if(!wire()){
    const obs=new MutationObserver(()=>{if(wire())obs.disconnect();});
    obs.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>obs.disconnect(),10000);
  }
})();