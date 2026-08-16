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

  function renderGate(message=''){
    document.getElementById('gmAuthGate')?.remove();
    const gate=document.createElement('div');gate.id='gmAuthGate';
    gate.innerHTML=`<div class="gate-card"><div class="brand">Restaurant operations</div><h1>GM Assistant</h1><p>This app is private. Sign in to access your dashboard, restaurant data, Communication Studio, AI tools, and OSM reference.</p><label>Email<input id="gmGateEmail" type="email" autocomplete="email" inputmode="email"></label><label>Password<input id="gmGatePass" type="password" autocomplete="current-password"></label><div id="gmGateMsg">${message}</div><div class="actions"><button type="button" class="primary" id="gmGateIn">Sign In</button><button type="button" class="secondary" id="gmGateUp">Create Account</button></div></div>`;
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
    gate.querySelector('#gmGateIn').onclick=()=>auth(false);
    gate.querySelector('#gmGateUp').onclick=()=>auth(true);
    pass.addEventListener('keydown',e=>{if(e.key==='Enter')auth(false)});
  }

  async function validate(){
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