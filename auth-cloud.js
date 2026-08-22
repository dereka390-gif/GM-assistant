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

  function recoverySessionFromUrl(){
    try{
      const p=new URLSearchParams(location.hash.replace(/^#/,''));
      if(p.get('type')!=='recovery'||!p.get('access_token'))return null;
      return {
        access_token:p.get('access_token'),
        refresh_token:p.get('refresh_token')||'',
        token_type:p.get('token_type')||'bearer',
        expires_in:Number(p.get('expires_in')||3600)
      };
    }catch{return null}
  }

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
    const style=document.createElement('style');style.textContent=`.auth-backdrop{position:fixed;inset:0;background:#0008;z-index:5000;display:grid;place-items:center;padding:18px}.auth-card{width:min(440px,100%);background:#fff;border-radius:20px;padding:20px;box-shadow:0 24px 70px #0006}.auth-card h2{margin-bottom:7px}.auth-card .row button{flex:1}.auth-user{font-size:12px;max-width:180px;overflow:hidden;text-overflow:ellipsis}.cloud-pill{display:inline-block;padding:4px 7px;border-radius:999px;background:#eaf0f8;color:#315f9b;font-size:10px;font-weight:900;margin-left:5px}.auth-link{border:0;background:transparent;color:#8f171d;font-weight:800;padding:7px 0;text-decoration:underline;cursor:pointer}`;document.head.appendChild(style);
  }
  function openModal(){
    document.getElementById('authModal')?.remove();const wrap=document.createElement('div');wrap.id='authModal';wrap.className='auth-backdrop';
    wrap.innerHTML=user?`<div class="auth-card"><div class="eyebrow">Secure account</div><h2>Signed in</h2><p class="muted">${escapeHtml(user.email||'Authenticated user')}</p><p>Your weekly data and settings sync to your private cloud record.</p><div class="row"><button class="primary" id="authSync">Sync Now</button><button class="secondary" id="authOut">Sign Out</button></div><div class="row"><button class="ghost" id="authClose">Close</button></div></div>`:`<div class="auth-card"><div class="eyebrow">GM Assistant account</div><h2>Secure Sign In</h2><p class="muted">Sign in to sync your GM data across devices and unlock protected AI features.</p><label>Email<input id="authEmail" type="email" autocomplete="email"></label><label style="margin-top:10px">Password<input id="authPass" type="password" autocomplete="current-password"></label><button class="auth-link" id="authForgot" type="button">Forgot password?</button><div id="authMsg" class="muted" style="margin-top:9px"></div><div class="row"><button class="primary" id="authIn">Sign In</button><button class="secondary" id="authUp">Create Account</button></div><div class="row"><button class="ghost" id="authClose">Cancel</button></div></div>`;
    document.body.appendChild(wrap);wrap.addEventListener('click',e=>{if(e.target===wrap)wrap.remove()});document.getElementById('authClose').onclick=()=>wrap.remove();
    if(user){document.getElementById('authSync').onclick=()=>pullCloud();document.getElementById('authOut').onclick=signOut;return;}
    document.getElementById('authIn').onclick=()=>signIn(false);document.getElementById('authUp').onclick=()=>signIn(true);document.getElementById('authForgot').onclick=requestPasswordReset;
  }
  async function requestPasswordReset(){
    const email=document.getElementById('authEmail')?.value.trim(),msg=document.getElementById('authMsg');
    if(!email||!email.includes('@')){msg.textContent='Enter your email address first.';return;}
    msg.textContent='Sending reset email…';
    const redirectTo=location.origin+location.pathname;
    try{
      let r=await fetch(`${SUPABASE_URL}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`,{method:'POST',headers:headers(null),body:JSON.stringify({email})});
      if(!r.ok&&r.status===400)r=await fetch(`${SUPABASE_URL}/auth/v1/recover`,{method:'POST',headers:headers(null),body:JSON.stringify({email})});
      if(!r.ok){const data=await r.json().catch(()=>({}));throw new Error(data.msg||data.message||data.error_description||'Unable to send reset email');}
      msg.textContent='If that email has an account, a password reset link has been sent. Check your inbox.';
    }catch(e){msg.textContent=e.message||'Unable to send reset email.';}
  }
  function openPasswordResetModal(){
    document.getElementById('authModal')?.remove();const wrap=document.createElement('div');wrap.id='authModal';wrap.className='auth-backdrop';
    wrap.innerHTML=`<div class="auth-card"><div class="eyebrow">GM Assistant account</div><h2>Create a new password</h2><p class="muted">Enter a new password for your account.</p><label>New password<input id="authNewPass" type="password" autocomplete="new-password"></label><label style="margin-top:10px">Confirm password<input id="authNewPass2" type="password" autocomplete="new-password"></label><div id="authMsg" class="muted" style="margin-top:9px"></div><div class="row"><button class="primary" id="authSavePass">Update Password</button></div></div>`;
    document.body.appendChild(wrap);document.getElementById('authSavePass').onclick=updateRecoveredPassword;
  }
  async function updateRecoveredPassword(){
    const p1=document.getElementById('authNewPass')?.value||'',p2=document.getElementById('authNewPass2')?.value||'',msg=document.getElementById('authMsg');
    if(p1.length<6){msg.textContent='Use a password of at least 6 characters.';return;}
    if(p1!==p2){msg.textContent='The passwords do not match.';return;}
    msg.textContent='Updating password…';
    try{
      let r=await api('/auth/v1/user',{method:'PUT',body:JSON.stringify({password:p1})});
      if(r.status===401&&await refreshSession())r=await api('/auth/v1/user',{method:'PUT',body:JSON.stringify({password:p1})});
      if(!r.ok){const data=await r.json().catch(()=>({}));throw new Error(data.msg||data.message||data.error_description||'Unable to update password');}
      try{history.replaceState(null,'',location.pathname+location.search)}catch{}
      msg.textContent='Password updated successfully.';
      setTimeout(()=>{document.getElementById('authModal')?.remove();updateAccountUI();if(user)pullCloud();},900);
    }catch(e){msg.textContent=e.message||'Unable to update password.';}
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
    buildUI();
    const recovered=recoverySessionFromUrl();
    session=recovered||loadSession();if(recovered)storeSession(recovered);
    if(session){user=await getUser();if(!user){storeSession(null);session=null;}}
    updateAccountUI();
    // Preserve current local save behavior, then mirror authenticated changes to the cloud.
    save=function(){localStorage.setItem(LOCAL_KEY,JSON.stringify(s));pushCloud(false)};
    if(recovered&&user){openPasswordResetModal();return;}
    if(user)await pullCloud();
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&user)pullCloud()});
    window.gmAuth={getSession:()=>session,getUser:()=>user,sync:pullCloud};
  }
  boot();
})();