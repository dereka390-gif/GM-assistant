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
  const lower=question.toLowerCase(),actions=[];
  if(/speed|window|time|seconds|drive.?thru/.test(lower))actions.push('Set a clear speed target for each daypart, position your strongest people at the bottleneck, and coach delays in real time.');
  if(/accuracy|wrong|missing|order/.test(lower))actions.push('Use repeat-back and bag verification at handoff, with one person owning final accuracy during rushes.');
  if(/osat|survey|guest|friend/.test(lower))actions.push('Coach one visible hospitality behavior per shift and ask satisfied guests for survey feedback naturally.');
  if(/food|taste|quality|hold|waste|roast|fries/.test(lower))actions.push('Check pars, hold times, freshness, and waste together so product availability does not come at the expense of quality.');
  if(/labor|schedule|staff|crew|team/.test(lower))actions.push('Match deployment to the busiest 30-minute windows and give each team member one specific role and expectation.');
  if(!actions.length)actions.push('Identify the single biggest controllable gap, assign one owner, set a measurable target, and review the result at the end of the shift.');
  actions.push('Recognize what is already working so the team knows what to repeat.');actions.push('Track the result daily and change only one or two variables at a time so you know what actually improved performance.');
  return {answer:`GM Coach fallback\n\nBased on your request — “${question}” — focus on the largest controllable opportunity first.\n\n${actions.slice(0,5).map((a,i)=>`${i+1}. ${a}`).join('\n')}\n\nThe live language model is temporarily unavailable, so this response is generated by GM Assistant’s built-in operations logic.`,provider:'GM Assistant Local',model:'Operations fallback'};
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
  }else if(mode==='coach')instructions+=' Use the supplied restaurant performance data to coach the GM. Prioritize the largest controllable opportunity, acknowledge strong results, and give no more than five concrete actions.';
  else if(mode==='communication')instructions+=' Create energetic but professional team communication copy. Keep it easy to read on a printed one-page restaurant communication poster. Avoid generic corporate filler.';
  let result=null;const providerErrors=[];
  if(process.env.OPENROUTER_API_KEY)try{result=await callOpenRouter(instructions,input);}catch(e){providerErrors.push(`OpenRouter: ${e.message}`);}
  if(!result&&process.env.OPENAI_API_KEY)try{result=await callOpenAI(instructions,input);}catch(e){providerErrors.push(`OpenAI: ${e.message}`);}
  if(!result)result=localFallback(mode,question,context);
  return res.status(200).json({answer:result.answer,provider:result.provider,model:result.model,user:user.id,mode,degraded:result.provider==='GM Assistant Local',providerErrors,matches:context.map(x=>({page_number:x.page_number,rank:x.rank}))});
}
