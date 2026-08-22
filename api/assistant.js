const SUPABASE_URL='https://baxvcyfvimegafnbgleo.supabase.co';
const SUPABASE_KEY='sb_publishable_v95SXg4pHgcYcd7KtX1FbA_YLw_keRB';

function extractOpenAIText(data){
  if(typeof data?.output_text==='string')return data.output_text;
  const parts=[];
  for(const item of data?.output||[])for(const c of item?.content||[])if(typeof c?.text==='string')parts.push(c.text);
  return parts.join('\n').trim();
}
function extractOpenRouterText(data){
  const c=data?.choices?.[0]?.message?.content;
  if(typeof c==='string')return c.trim();
  if(Array.isArray(c))return c.map(x=>typeof x==='string'?x:(x?.text||'')).filter(Boolean).join('\n').trim();
  return '';
}
async function osmContext(auth,question){
  const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/search_osm_pages`,{method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:auth,'Content-Type':'application/json'},body:JSON.stringify({query_text:question,match_count:12})});
  if(!r.ok)return [];
  return r.json();
}
async function callOpenRouter(systemPrompt,userPrompt){
  const apiKey=process.env.OPENROUTER_API_KEY;if(!apiKey)return null;
  const r=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','HTTP-Referer':'https://gm-assistant-three.vercel.app','X-Title':'GM Assistant'},body:JSON.stringify({model:process.env.OPENROUTER_MODEL||'openrouter/free',messages:[{role:'system',content:systemPrompt},{role:'user',content:userPrompt}],temperature:0.15})});
  const data=await r.json();if(!r.ok)throw new Error(data?.error?.message||'OpenRouter request failed');
  const answer=extractOpenRouterText(data);if(!answer)throw new Error('OpenRouter returned an empty answer');return {answer,provider:'OpenRouter Free',model:data?.model||'openrouter/free'};
}
async function callOpenAI(systemPrompt,userPrompt){
  const apiKey=process.env.OPENAI_API_KEY;if(!apiKey)return null;
  const payload={model:process.env.OPENAI_MODEL||'gpt-5',instructions:systemPrompt,input:userPrompt,store:false};
  const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const data=await r.json();if(!r.ok)throw new Error(data?.error?.message||'OpenAI request failed');const answer=extractOpenAIText(data);if(!answer)throw new Error('OpenAI returned an empty answer');return {answer,provider:'OpenAI',model:payload.model};
}
function cleanText(x){return String(x||'').replace(/\s+/g,' ').trim();}
function safeJsonFromLabel(text,label,nextLabel){
  try{
    const start=text.indexOf(label);if(start<0)return null;
    const from=start+label.length;const end=nextLabel?text.indexOf(nextLabel,from):-1;
    const raw=text.slice(from,end>=0?end:text.length).trim();
    const first=raw.indexOf('{');if(first<0)return null;
    let depth=0,inStr=false,esc=false;
    for(let i=first;i<raw.length;i++){
      const ch=raw[i];
      if(inStr){if(esc)esc=false;else if(ch==='\\')esc=true;else if(ch==='"')inStr=false;continue;}
      if(ch==='"'){inStr=true;continue;}
      if(ch==='{')depth++;else if(ch==='}'){depth--;if(depth===0)return JSON.parse(raw.slice(first,i+1));}
    }
  }catch{}
  return null;
}
function num(v){const n=Number(v);return Number.isFinite(n)?n:null;}
function sec(v){const n=num(v);return n==null?'—':`${Math.round(n)} sec`;}
function pct(v){const n=num(v);return n==null?'—':`${Math.round(n)}%`;}
function coachFromMetrics(question){
  const settings=safeJsonFromLabel(question,'Restaurant settings/goals:','Current performance:')||{};
  const cur=safeJsonFromLabel(question,'Current performance:','Restaurant health score:')||{};
  const period=(question.match(/Period:\s*([^\n]+)/)||[])[1]?.trim()||'Current period';
  const health=Number((question.match(/Restaurant health score:\s*([\d.]+)/)||[])[1]);
  const osat=num(cur.osat),osatGoal=num(settings.osatGoal),drive=num(cur.driveOverall),driveGoal=num(settings.driveGoal);
  const driveGap=drive!=null&&driveGoal!=null?drive-driveGoal:null;
  const dayparts=[['Lunch',num(cur.driveLunch)],['Afternoon',num(cur.driveAfternoon)],['Dinner',num(cur.driveDinner)]].filter(x=>x[1]!=null).sort((a,b)=>b[1]-a[1]);
  const guestMetrics=[['Accuracy',num(cur.accuracy)],['Cleanliness',num(cur.cleanliness)],['Speed',num(cur.speed)],['Taste',num(cur.taste)],['Friendliness',num(cur.friendliness)]].filter(x=>x[1]!=null).sort((a,b)=>a[1]-b[1]);
  const weakest=guestMetrics[0];
  const strongest=guestMetrics[guestMetrics.length-1];
  const wins=[];
  if(osat!=null&&osatGoal!=null)wins.push(`OSAT is ${pct(osat)} against a ${pct(osatGoal)} goal${osat>=osatGoal?' — goal achieved.':'.'}`);
  if(strongest)wins.push(`${strongest[0]} is your strongest guest metric at ${pct(strongest[1])}.`);
  if(Number.isFinite(health))wins.push(`Restaurant health score is ${Math.round(health)}.`);
  const priorities=[];
  if(driveGap!=null&&driveGap>0){
    const worst=dayparts[0];
    priorities.push(`Drive-thru is the biggest controllable gap: ${sec(drive)} vs ${sec(driveGoal)} goal (${Math.round(driveGap)} sec over).${worst?` ${worst[0]} is the slowest daypart at ${sec(worst[1])}.`:''}`);
  }
  if(weakest)priorities.push(`${weakest[0]} is the lowest guest metric at ${pct(weakest[1])}; make this the second coaching focus.`);
  const foodHealth=(question.match(/\["Food Cost",\s*([\d.]+)/)||[])[1];
  if(foodHealth!=null&&Number(foodHealth)<=20)priorities.push('Food Cost health is critically low; review waste, portions, transfers and top-loss items before the next count.');
  const actions=[];
  if(driveGap!=null&&driveGap>0){
    const worst=dayparts[0]?.[0]?.toLowerCase()||'peak';
    actions.push(`Run a 30-minute ${worst} speed observation. Write down the delay point for each slow car: order taking, product readiness, assembly, bagging or window handoff.`);
    actions.push(`Set the next-shift target at or below ${sec(driveGoal)} and put your strongest person at the bottleneck you actually observed.`);
  }
  if(weakest?.[0]==='Cleanliness')actions.push('Do one manager cleanliness walk before the rush and one during it; assign each miss to a specific person and re-check it before the shift ends.');
  else if(weakest)actions.push(`Coach ${weakest[0].toLowerCase()} with one observable behavior per shift and verify it during the next rush.`);
  if(foodHealth!=null&&Number(foodHealth)<=20)actions.push('Before the next inventory count, review waste, portioning, transfers and the top three food-cost loss items; assign one corrective action to each loss source.');
  actions.push('Keep the strong guest metric from slipping while fixing the main gap; do not change every process at once.');
  return {answer:`EXECUTIVE READ — ${period}\n${wins.slice(0,3).join('\n')}\n\nTOP PRIORITIES\n${priorities.slice(0,3).map((x,i)=>`${i+1}. ${x}`).join('\n')}\n\nNEXT SHIFT ACTIONS\n${actions.slice(0,4).map((x,i)=>`${i+1}. ${x}`).join('\n')}\n\nWHAT TO WATCH NEXT\nRecheck drive-thru by daypart, the lowest guest metric, and food-cost health after the next completed week. The goal is to show whether the specific actions moved the numbers — not just to generate another summary.`,provider:'GM Assistant Local',model:'Metric-aware operations coach'};
}
function localOsmCoach(question,context){
  const best=context.slice(0,5);
  const standards=best.map(x=>`• Page ${x.page_number}: ${cleanText(x.content).slice(0,650)}${cleanText(x.content).length>650?'…':''}`).join('\n');
  const q=question.toLowerCase();const actions=[];
  if(/roast|beef|cook|hold|slicer|temper/.test(q))actions.push('Compare current roast-beef tempering, cooking, dwell, holding and slicer practices against the retrieved OSM pages; correct any time/temperature or scheduling gap first.');
  if(/speed|window|drive.?thru|rush|service/.test(q))actions.push('Walk the service path during the affected daypart, identify the actual bottleneck, then adjust deployment and readiness while protecting the OSM guest-service expectations.');
  if(/accuracy|missing|wrong|order/.test(q))actions.push('Observe order taking, assembly, bagging and handoff as one process; coach the point where accuracy is being lost and verify the correction during the next rush.');
  if(/clean|sanit|equipment|maintenance/.test(q))actions.push('Turn the relevant OSM procedure into a shift checklist with a named owner and verification time rather than relying on a general reminder.');
  if(/food|quality|fries|fryer|temperature|temp|shelf|hold/.test(q))actions.push('Verify the exact OSM time, temperature, shelf-life and holding requirement shown in the retrieved pages before changing the restaurant process.');
  if(/guest|osat|survey|friend|complaint/.test(q))actions.push('Coach the observable guest behavior tied to the issue, then follow up during the same shift to confirm the standard is being executed consistently.');
  if(!actions.length)actions.push('Use the retrieved OSM pages as the standard, observe the current restaurant process, identify the gap, assign an owner and verify the correction during the same shift.');
  actions.push('Document the specific standard and page number when coaching so managers and team members can verify the source.');
  return {answer:`OSM STANDARD\n${standards}\n\nOPERATIONAL READ\nThese are the closest standards found for “${question}”. Treat the OSM wording above as the source of truth.\n\nRECOMMENDED ACTION\n${actions.slice(0,3).map((a,i)=>`${i+1}. ${a}`).join('\n')}\n\nVERIFY\nRe-check the cited OSM page(s) before making any food-safety, time/temperature, equipment or compliance decision.`,provider:'GM Assistant Local',model:'OSM operations coach'};
}
function localFallback(mode,question,context=[]){
  if(mode==='osm')return localOsmCoach(question,context);
  if(mode==='communication')return {answer:`TEAM UPDATE\n\n${question}\n\nFOCUS TODAY\n• Keep the shift organized and communicate early.\n• Protect speed without sacrificing accuracy or hospitality.\n• Make it right for every guest.\n• Recognize wins and coach opportunities in the moment.\n\nLet’s finish strong and take care of each other and our guests.`,provider:'GM Assistant Local',model:'Communication fallback'};
  if(mode==='coach')return coachFromMetrics(question);
  return {answer:'No analysis is available for this request.',provider:'GM Assistant Local',model:'Fallback'};
}
export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const auth=req.headers.authorization||'';if(!auth.startsWith('Bearer '))return res.status(401).json({error:'Sign in required'});
  const userResp=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:SUPABASE_KEY,Authorization:auth}});if(!userResp.ok)return res.status(401).json({error:'Session expired. Please sign in again.'});const user=await userResp.json();
  let body={};try{body=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});}catch{return res.status(400).json({error:'Invalid request'});}
  const mode=body.mode||'coach',question=String(body.question||'').trim();if(!question)return res.status(400).json({error:'Enter a question or request.'});
  let context=[];if(mode==='osm'){context=await osmContext(auth,question);if(!context.length)return res.status(404).json({error:'No matching OSM pages were found. Try the key operational terms, such as “roast beef hold temperature”.',matches:[]});}
  let instructions='You are the secure AI assistant inside a restaurant GM operations app. Be concise, practical, operationally focused, and never invent policies or standards.';let input=question;
  if(mode==='osm'){
    instructions+=' The July 2026 Arby’s OSM excerpts supplied below are the operational source of truth. Answer only what those excerpts support. Structure every answer as: OSM STANDARD, OPERATIONAL READ, RECOMMENDED ACTION, VERIFY. Clearly separate mandatory OSM requirements from coaching suggestions. Give 2-5 practical actions a restaurant GM can execute on shift. Cite the OSM page number beside every standard. Never invent a temperature, hold time, shelf life, recipe, cleaning frequency, audit rule, or policy. If retrieval is insufficient, explicitly say which part is not supported and recommend a narrower OSM lookup.';
    input=`Operational question/problem: ${question}\n\nRetrieved July 2026 OSM excerpts:\n${context.map(x=>`[OSM page ${x.page_number}]\n${x.content}`).join('\n\n')}`;
  }else if(mode==='coach')instructions+=' Interpret the restaurant metrics instead of repeating them. Never echo raw JSON or the prompt. Structure the response as EXECUTIVE READ, TOP PRIORITIES, NEXT SHIFT ACTIONS, and WHAT TO WATCH NEXT. Quantify gaps versus goals, identify the worst daypart and lowest guest metric, acknowledge wins, and give no more than four specific actions.';
  else if(mode==='communication')instructions+=' Create energetic but professional team communication copy. Keep it easy to read on a printed one-page restaurant communication poster. Avoid generic corporate filler.';
  let result=null;const providerErrors=[];
  if(process.env.OPENROUTER_API_KEY)try{result=await callOpenRouter(instructions,input);}catch(e){providerErrors.push(`OpenRouter: ${e.message}`);}
  if(!result&&process.env.OPENAI_API_KEY)try{result=await callOpenAI(instructions,input);}catch(e){providerErrors.push(`OpenAI: ${e.message}`);}
  if(!result)result=localFallback(mode,question,context);
  return res.status(200).json({answer:result.answer,provider:result.provider,model:result.model,user:user.id,mode,degraded:result.provider==='GM Assistant Local',providerErrors,matches:context.map(x=>({page_number:x.page_number,rank:x.rank}))});
}
