// Secure sign-in + cloud sync for GM Assistant
(() => {
  const SUPABASE_URL='https://baxvcyfvimegafnbgleo.supabase.co';
  const SUPABASE_KEY='sb_publishable_v95SXg4pHgcYcd7KtX1FbA_YLw_keRB';
  const SESSION_KEY='gmAssistantAuthV1';
  const LOCAL_KEY=typeof K==='string'?K:'gmAssistantV1';
  let session=null,user=null,syncTimer=null,syncing=false;

  const headers=(token=session?.access_token)=>({apikey:SUPABASE_KEY,'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})});
  function loadSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
  function storeSession(x){session=x||null;if(x)localStorage.setItem(SESSION_KEY,JSON.stringify(x));else localStorage.removeItem(SESSION_KEY)}
  async function api(path,opts={}){return fetch(SUPABASE_URL+path,{...opts,headers:{...headers(),...(opts.headers||{})}})}

  async function refreshSession(){
    if(!session?.refresh_token)return false;
    try{
      const r=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:headers(null),body:JSON.stringify({refresh_token:session.refresh_token})});
      if(!r.ok)throw new Error('Session expired');
      storeSession(await r.json());return true;
    }catch{storeSession(null);session=null;user=null;return false}
  }
  async function getUser(){
    if(!session?.access_token)return null;
    let r=await api('/auth/v1/user');
    if(r.status===401&&await refreshSession())r=await api('/auth/v1/user');
    if(!r.ok)return null;return r.json();
  }
  function mergeStates(remote,local){
    remote=remote&&typeof remote==='object'?remote:{};local=local&&typeof local==='object'?local:{};
    const weeks=new Map();
    [...(remote.weeks||[]),...(local.weeks||[])].forEach(w=>{if(w)weeks.set(w.id||w.weekStart||JSON.stringify(w),w)});
    return {settings:{...(remote.settings||{}),...(local.settings||{})},weeks:[...weeks.values()]};
  }
  async function pullCloud(){
    if(!user||syncing)return;syncing=true;
    try{
      let r=await api(`/rest/v1/gm_app_state?select=state,updated_at&user_id=eq.${encodeURIComponent(user.id)}`);
      if(r.status===401&&await refreshSession())r=await api(`/rest/v1/gm_app_state?select=state,updated_at&user_id=eq.${encodeURIComponent(user.id)}`);
      if(!r.ok)return;
      const rows=await r.json(); const remote=rows?.[0]?.state;
      if(remote){
        const merged=mergeStates(remote,s);
        s=merged;localStorage.setItem(LOCAL_KEY,JSON.stringify(s));
        try{renderDashboard();renderHistory();renderSettings();renderBoard();}catch{}
        await pushCloud(true);
      }else await pushCloud(true);
    }finally{syncing=false;updateAccountUI();}
  }
  async function pushCloud(immediate=false){
    if(!user)return;
    const run=async()=>{
      try{
        let r=await api('/rest/v1/gm_app_state?on_conflict=user_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:user.id,state:s,updated_at:new Date().toISOString()})});
        if(r.status===401&&await refreshSession())r=await api('/rest/v1/gm_app_state?on_conflict=user_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:user.id,state:s,updated_at:new Date().toISOString()})});
        updateAccountUI(r.ok?'synced':'error');
      }catch{updateAccountUI('error')}
    };
    if(immediate)return run();clearTimeout(syncTimer);syncTimer=setTimeout(run,500);
  }

  function buildUI(){
    if(document.getElementById('accountBtn'))return;
    const install=document.getElementById('install');
    const btn=document.createElement('button');btn.id='accountBtn';btn.className='secondary';btn.textContent='Sign In';btn.onclick=openModal;
    install?.parentElement?.insertBefore(btn,install);
    const style=document.createElement('style');style.textContent=`.auth-backdrop{position:fixed;inset:0;background:#0008;z-index:5000;display:grid;place-items:center;padding:18px}.auth-card{width:min(440px,100%);background:#fff;border-radius:20px;padding:20px;box-shadow:0 24px 70px #0006}.auth-card h2{margin-bottom:7px}.auth-card .row button{flex:1}.auth-user{font-size:12px;max-width:180px;overflow:hidden;text-overflow:ellipsis}.cloud-pill{display:inline-block;padding:4px 7px;border-radius:999px;background:#eaf0f8;color:#315f9b;font-size:10px;font-weight:900;margin-left:5px}`;document.head.appendChild(style);
  }
  function openModal(){
    document.getElementById('authModal')?.remove();const wrap=document.createElement('div');wrap.id='authModal';wrap.className='auth-backdrop';
    wrap.innerHTML=user?`<div class="auth-card"><div class="eyebrow">Secure account</div><h2>Signed in</h2><p class="muted">${escapeHtml(user.email||'Authenticated user')}</p><p>Your weekly data and settings sync to your private cloud record.</p><div class="row"><button class="primary" id="authSync">Sync Now</button><button class="secondary" id="authOut">Sign Out</button></div><div class="row"><button class="ghost" id="authClose">Close</button></div></div>`:`<div class="auth-card"><div class="eyebrow">GM Assistant account</div><h2>Secure Sign In</h2><p class="muted">Sign in to sync your GM data across devices and unlock protected AI features.</p><label>Email<input id="authEmail" type="email" autocomplete="email"></label><label style="margin-top:10px">Password<input id="authPass" type="password" autocomplete="current-password"></label><div id="authMsg" class="muted" style="margin-top:9px"></div><div class="row"><button class="primary" id="authIn">Sign In</button><button class="secondary" id="authUp">Create Account</button></div><div class="row"><button class="ghost" id="authClose">Cancel</button></div></div>`;
    document.body.appendChild(wrap);wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.remove()});document.getElementById('authClose').onclick=()=>wrap.remove();
    if(user){document.getElementById('authSync').onclick=()=>pullCloud();document.getElementById('authOut').onclick=signOut;return;}
    document.getElementById('authIn').onclick=()=>signIn(false);document.getElementById('authUp').onclick=()=>signIn(true);
  }
  async function signIn(create){
    const email=document.getElementById('authEmail').value.trim(),password=document.getElementById('authPass').value,msg=document.getElementById('authMsg');
    if(!email||password.length<6){msg.textContent='Enter an email and a password of at least 6 characters.';return;}
    msg.textContent=create?'Creating account…':'Signing in…';
    try{
      const path=create?'/auth/v1/signup':'/auth/v1/token?grant_type=password';
      const r=await fetch(SUPABASE_URL+path,{method:'POST',headers:headers(null),body:JSON.stringify({email,password})});const data=await r.json();
      if(!r.ok)throw new Error(data.msg||data.message||data.error_description||'Unable to sign in');
      if(!data.access_token){msg.textContent='Account created. Check your email if confirmation is required, then sign in.';return;}
      storeSession(data);session=data;user=await getUser();document.getElementById('authModal')?.remove();updateAccountUI();await pullCloud();
    }catch(e){msg.textContent=e.message||'Sign-in failed.';}
  }
  async function signOut(){try{if(session?.access_token)await api('/auth/v1/logout',{method:'POST'});}catch{}storeSession(null);session=null;user=null;document.getElementById('authModal')?.remove();updateAccountUI();}
  function escapeHtml(x){return String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function updateAccountUI(syncState){const b=document.getElementById('accountBtn');if(!b)return;b.innerHTML=user?`<span class="auth-user">${escapeHtml(user.email||'Account')}</span><span class="cloud-pill">${syncState==='error'?'Sync issue':'Cloud'}</span>`:'Sign In';}

  async function boot(){
    buildUI();session=loadSession();if(session){user=await getUser();if(!user){storeSession(null);session=null;}}
    updateAccountUI();
    // Preserve current local save behavior, then mirror authenticated changes to the cloud.
    save=function(){localStorage.setItem(LOCAL_KEY,JSON.stringify(s));pushCloud(false)};
    if(user)await pullCloud();
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&user)pullCloud()});
    window.gmAuth={getSession:()=>session,getUser:()=>user,sync:pullCloud};
  }
  boot();
})();