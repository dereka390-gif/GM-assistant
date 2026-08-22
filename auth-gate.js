// Full-app authentication gate for GM Assistant
(() => {
  const SUPABASE_URL='https://baxvcyfvimegafnbgleo.supabase.co';
  const SUPABASE_KEY='sb_publishable_v95SXg4pHgcYcd7KtX1FbA_YLw_keRB';
  const SESSION_KEY='gmAssistantAuthV1';

  const css=`
    html.gm-auth-locked body{overflow:hidden}
    html.gm-auth-locked body > header,html.gm-auth-locked body > main{visibility:hidden!important;pointer-events:none!important}
    #gmAuthGate{position:fixed;inset:0;z-index:99999;background:linear-gradient(160deg,#f8f4ef,#efe4de);display:grid;place-items:center;padding:18px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#211c1d}
    #gmAuthGate .gate-card{width:min(440px,100%);background:#fff;border:1px solid #e7ddd8;border-radius:24px;padding:24px;box-shadow:0 24px 70px rgba(67,31,33,.18)}
    #gmAuthGate .brand{font-size:11px;text-transform:uppercase;letter-spacing:.12em;font-weight:900;color:#8f171d;margin-bottom:6px}
    #gmAuthGate h1{font-size:28px;margin:0 0 8px}#gmAuthGate p{color:#756b6d;line-height:1.5;margin:0 0 18px}
    #gmAuthGate label{display:grid;gap:6px;font-size:13px;font-weight:800;margin-top:11px}
    #gmAuthGate input{width:100%;padding:13px;border:1px solid #e7ddd8;border-radius:12px;font:inherit;font-size:16px;background:#fff;color:#211c1d}
    #gmAuthGate .actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:16px}
    #gmAuthGate button{border-radius:12px;padding:12px 14px;font-weight:900;border:1px solid #e7ddd8;font:inherit;cursor:pointer}
    #gmAuthGate .primary{background:#8f171d;color:#fff;border-color:#8f171d}#gmAuthGate .secondary{background:#fff;color:#211c1d}
    #gmAuthGate .forgot{display:inline-block;border:0;background:transparent;color:#8f171d;padding:8px 0 0;text-decoration:underline;font-weight:800;cursor:pointer}
    #gmAuthGate .emergency{display:inline-block;border:0;background:transparent;color:#756b6d;padding:6px 0 0;text-decoration:underline;font-weight:800;cursor:pointer}
    #gmGateMsg{min-height:20px;margin-top:10px;font-size:13px;color:#756b6d}
    #gmGateStatus{text-align:center;font-weight:800;color:#756b6d}
    @media(max-width:480px){#gmAuthGate .actions{grid-template-columns:1fr}#gmAuthGate .gate-card{padding:20px}}
  `;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
  document.documentElement.classList.add('gm-auth-locked');

  function readSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
  function saveSession(v){if(v)localStorage.setItem(SESSION_KEY,JSON.stringify(v));else localStorage.removeItem(SESSION_KEY)}
  function headers(token){return {apikey:SUPABASE_KEY,'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})}}
  function removeGate(){document.documentElement.classList.remove('gm-auth-locked');document.getElementById('gmAuthGate')?.remove()}
  function recoverySessionFromUrl(){
    try{
      const p=new URLSearchParams(location.hash.replace(/^#/,''));
      if(p.get('type')!=='recovery'||!p.get('access_token'))return null;
      return {access_token:p.get('access_token'),refresh_token:p.get('refresh_token')||'',token_type:p.get('token_type')||'bearer',expires_in:Number(p.get('expires_in')||3600)};
    }catch{return null}
  }
  function recoveryTokenHashFromUrl(){
    try{
      const p=new URLSearchParams(location.search);
      if(p.get('type')!=='recovery'||!p.get('token_hash'))return null;
      return p.get('token_hash');
    }catch{return null}
  }

  function renderResetPassword(session){
    document.getElementById('gmAuthGate')?.remove();
    const gate=document.createElement('div');gate.id='gmAuthGate';
    gate.innerHTML=`<div class="gate-card"><div class="brand">Restaurant operations</div><h1>Create a new password</h1><p>Enter and confirm your new GM Assistant password.</p><label>New password<input id="gmNewPass" type="password" autocomplete="new-password"></label><label>Confirm password<input id="gmNewPass2" type="password" autocomplete="new-password"></label><div id="gmGateMsg"></div><div class="actions"><button type="button" class="primary" id="gmSavePass">Update Password</button></div></div>`;
    document.body.appendChild(gate);
    const msg=gate.querySelector('#gmGateMsg');
    gate.querySelector('#gmSavePass').onclick=async()=>{
      const p1=gate.querySelector('#gmNewPass').value,p2=gate.querySelector('#gmNewPass2').value;
      if(p1.length<6){msg.textContent='Use a password of at least 6 characters.';return;}
      if(p1!==p2){msg.textContent='The passwords do not match.';return;}
      msg.textContent='Updating password…';
      try{
        const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{method:'PUT',headers:headers(session.access_token),body:JSON.stringify({password:p1})});
        const data=await r.json().catch(()=>({}));
        if(!r.ok)throw new Error(data.msg||data.message||data.error_description||'Unable to update password');
        saveSession(session);
        try{history.replaceState(null,'',location.pathname)}catch{}
        msg.textContent='Password updated. Opening GM Assistant…';
        setTimeout(()=>location.reload(),600);
      }catch(err){msg.textContent=err.message||'Unable to update password.';}
    };
  }

  function renderRecoveryConfirm(tokenHash){
    document.getElementById('gmAuthGate')?.remove();
    const gate=document.createElement('div');gate.id='gmAuthGate';
    gate.innerHTML=`<div class="gate-card"><div class="brand">Restaurant operations</div><h1>Reset your password</h1><p>Your reset request is ready. For security, the one-time reset token is not used until you tap the button below.</p><div id="gmGateMsg"></div><div class="actions"><button type="button" class="primary" id="gmContinueReset">Continue Password Reset</button><button type="button" class="secondary" id="gmCancelReset">Cancel</button></div></div>`;
    document.body.appendChild(gate);
    const msg=gate.querySelector('#gmGateMsg');
    gate.querySelector('#gmCancelReset').onclick=()=>{try{history.replaceState(null,'',location.pathname)}catch{};renderGate();};
    gate.querySelector('#gmContinueReset').onclick=async()=>{
      msg.textContent='Verifying reset request…';
      gate.querySelectorAll('button').forEach(b=>b.disabled=true);
      try{
        const r=await fetch(`${SUPABASE_URL}/auth/v1/verify`,{method:'POST',headers:headers(),body:JSON.stringify({token_hash:tokenHash,type:'recovery'})});
        const data=await r.json().catch(()=>({}));
        if(!r.ok||!data.access_token)throw new Error(data.msg||data.message||data.error_description||'This reset request is invalid or expired. Request a new email and try again.');
        saveSession(data);
        try{history.replaceState(null,'',location.pathname)}catch{}
        renderResetPassword(data);
      }catch(err){msg.textContent=err.message||'Unable to verify reset request.';gate.querySelectorAll('button').forEach(b=>b.disabled=false);}
    };
  }

  function renderEmergencyReset(){
    document.getElementById('gmAuthGate')?.remove();
    const gate=document.createElement('div');gate.id='gmAuthGate';
    gate.innerHTML=`<div class="gate-card"><div class="brand">Restaurant operations</div><h1>Emergency account reset</h1><p>Use this one-time recovery option for the Derek account. Enter the recovery code provided in ChatGPT and choose a new password.</p><label>Email<input id="gmEmergencyEmail" type="email" autocomplete="email" value="derek.a390@gmail.com"></label><label>Recovery code<input id="gmEmergencyCode" type="text" autocomplete="one-time-code"></label><label>New password<input id="gmEmergencyPass" type="password" autocomplete="new-password"></label><label>Confirm password<input id="gmEmergencyPass2" type="password" autocomplete="new-password"></label><div id="gmGateMsg"></div><div class="actions"><button type="button" class="primary" id="gmEmergencyGo">Reset Password</button><button type="button" class="secondary" id="gmEmergencyCancel">Cancel</button></div></div>`;
    document.body.appendChild(gate);
    const msg=gate.querySelector('#gmGateMsg');
    gate.querySelector('#gmEmergencyCancel').onclick=()=>renderGate();
    gate.querySelector('#gmEmergencyGo').onclick=async()=>{
      const email=gate.querySelector('#gmEmergencyEmail').value.trim();
      const recoveryCode=gate.querySelector('#gmEmergencyCode').value.trim();
      const p1=gate.querySelector('#gmEmergencyPass').value;
      const p2=gate.querySelector('#gmEmergencyPass2').value;
      if(!email||!recoveryCode){msg.textContent='Enter the email and recovery code.';return;}
      if(p1.length<8){msg.textContent='Use a password of at least 8 characters.';return;}
      if(p1!==p2){msg.textContent='The passwords do not match.';return;}
      msg.textContent='Resetting password…';
      gate.querySelectorAll('button').forEach(b=>b.disabled=true);
      try{
        const r=await fetch(`${SUPABASE_URL}/functions/v1/gm-emergency-reset`,{method:'POST',headers:headers(),body:JSON.stringify({email,recoveryCode,newPassword:p1})});
        const data=await r.json().catch(()=>({}));
        if(!r.ok)throw new Error(data.error||'Unable to reset password.');
        saveSession(null);
        msg.textContent='Password reset successfully. Returning to sign in…';
        setTimeout(()=>renderGate('Password reset successfully. Sign in with your new password.'),800);
      }catch(err){msg.textContent=err.message||'Unable to reset password.';gate.querySelectorAll('button').forEach(b=>b.disabled=false);}
    };
  }

  function renderGate(message=''){
    document.getElementById('gmAuthGate')?.remove();
    const gate=document.createElement('div');gate.id='gmAuthGate';
    gate.innerHTML=`<div class="gate-card"><div class="brand">Restaurant operations</div><h1>GM Assistant</h1><p>This app is private. Sign in to access your dashboard, restaurant data, Communication Studio, AI tools, and OSM reference.</p><label>Email<input id="gmGateEmail" type="email" autocomplete="email" inputmode="email"></label><label>Password<input id="gmGatePass" type="password" autocomplete="current-password"></label><button type="button" class="forgot" id="gmGateForgot">Forgot password?</button><br><button type="button" class="emergency" id="gmGateEmergency">Emergency reset</button><div id="gmGateMsg">${message}</div><div class="actions"><button type="button" class="primary" id="gmGateIn">Sign In</button><button type="button" class="secondary" id="gmGateUp">Create Account</button></div></div>`;
    document.body.appendChild(gate);
    const email=gate.querySelector('#gmGateEmail'),pass=gate.querySelector('#gmGatePass'),msg=gate.querySelector('#gmGateMsg');
    async function auth(create){
      const e=email.value.trim(),p=pass.value;
      if(!e||p.length<6){msg.textContent='Enter your email and a password of at least 6 characters.';return;}
      msg.textContent=create?'Creating account…':'Signing in…';
      gate.querySelectorAll('button').forEach(b=>b.disabled=true);
      try{
        const path=create?'/auth/v1/signup':'/auth/v1/token?grant_type=password';
        const r=await fetch(SUPABASE_URL+path,{method:'POST',headers:headers(),body:JSON.stringify({email:e,password:p})});
        const data=await r.json();
        if(!r.ok)throw new Error(data.msg||data.message||data.error_description||'Authentication failed');
        if(!data.access_token){msg.textContent='Account created. Check your email to confirm it, then return here and sign in.';return;}
        saveSession(data);location.reload();
      }catch(err){msg.textContent=err.message||'Authentication failed.';}finally{gate.querySelectorAll('button').forEach(b=>b.disabled=false);}
    }
    gate.querySelector('#gmGateForgot').onclick=async()=>{
      const e=email.value.trim();
      if(!e||!e.includes('@')){msg.textContent='Enter your email address first.';return;}
      msg.textContent='Sending password reset email…';
      try{
        const redirectTo=location.origin+location.pathname;
        const r=await fetch(`${SUPABASE_URL}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`,{method:'POST',headers:headers(),body:JSON.stringify({email:e})});
        const data=await r.json().catch(()=>({}));
        if(!r.ok)throw new Error(data.msg||data.message||data.error_description||'Unable to send reset email');
        msg.textContent='Reset email sent. Use the newest email only.';
      }catch(err){msg.textContent=err.message||'Unable to send reset email.';}
    };
    gate.querySelector('#gmGateEmergency').onclick=()=>renderEmergencyReset();
    gate.querySelector('#gmGateIn').onclick=()=>auth(false);
    gate.querySelector('#gmGateUp').onclick=()=>auth(true);
    pass.addEventListener('keydown',e=>{if(e.key==='Enter')auth(false)});
  }

  async function validate(){
    const tokenHash=recoveryTokenHashFromUrl();
    if(tokenHash){renderRecoveryConfirm(tokenHash);return;}
    const recovered=recoverySessionFromUrl();
    if(recovered){saveSession(recovered);renderResetPassword(recovered);return;}
    let session=readSession();
    if(!session?.access_token){renderGate();return;}
    try{
      let r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:headers(session.access_token)});
      if(r.status===401&&session.refresh_token){
        const rr=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,{method:'POST',headers:headers(),body:JSON.stringify({refresh_token:session.refresh_token})});
        if(rr.ok){session=await rr.json();saveSession(session);r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:headers(session.access_token)});}
      }
      if(!r.ok){saveSession(null);renderGate('Your session expired. Please sign in again.');return;}
      removeGate();
    }catch{renderGate('Unable to verify your account. Check your internet connection and try again.');}
  }

  if(document.body)validate();else document.addEventListener('DOMContentLoaded',validate,{once:true});
})();