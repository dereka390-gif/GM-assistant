const SUPABASE_URL='https://baxvcyfvimegafnbgleo.supabase.co';
const SUPABASE_KEY='sb_publishable_v95SXg4pHgcYcd7KtX1FbA_YLw_keRB';

function extractOpenAIText(data){
  if(typeof data?.output_text==='string')return data.output_text;
  const parts=[];
  for(const item of data?.output||[]){
    for(const c of item?.content||[]){if(typeof c?.text==='string')parts.push(c.text);}
  }
  return parts.join('\n').trim();
}

function extractOpenRouterText(data){
  const c=data?.choices?.[0]?.message?.content;
  if(typeof c==='string')return c.trim();
  if(Array.isArray(c))return c.map(x=>typeof x==='string'?x:(x?.text||'')).filter(Boolean).join('\n').trim();
  return '';
}

async function osmContext(auth,question){
  const r=await fetch(`${SUPABASE_URL}/rest/v1/rpc/search_osm_pages`,{
    method:'POST',
    headers:{apikey:SUPABASE_KEY,Authorization:auth,'Content-Type':'application/json'},
    body:JSON.stringify({query_text:question,match_count:8})
  });
  if(!r.ok)return [];
  return r.json();
}

async function callOpenRouter(systemPrompt,userPrompt){
  const apiKey=process.env.OPENROUTER_API_KEY;
  if(!apiKey)return null;
  const r=await fetch('https://openrouter.ai/api/v1/chat/completions',{
    method:'POST',
    headers:{
      Authorization:`Bearer ${apiKey}`,
      'Content-Type':'application/json',
      'HTTP-Referer':'https://gm-assistant-three.vercel.app',
      'X-Title':'GM Assistant'
    },
    body:JSON.stringify({
      model:process.env.OPENROUTER_MODEL||'openrouter/free',
      messages:[
        {role:'system',content:systemPrompt},
        {role:'user',content:userPrompt}
      ],
      temperature:0.2
    })
  });
  const data=await r.json();
  if(!r.ok)throw new Error(data?.error?.message||'OpenRouter request failed');
  return {answer:extractOpenRouterText(data),provider:'OpenRouter Free',model:data?.model||'openrouter/free'};
}

async function callOpenAI(systemPrompt,userPrompt){
  const apiKey=process.env.OPENAI_API_KEY;
  if(!apiKey)return null;
  const payload={
    model:process.env.OPENAI_MODEL||'gpt-5',
    instructions:systemPrompt,
    input:userPrompt,
    store:false
  };
  const r=await fetch('https://api.openai.com/v1/responses',{
    method:'POST',
    headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  });
  const data=await r.json();
  if(!r.ok)throw new Error(data?.error?.message||'OpenAI request failed');
  return {answer:extractOpenAIText(data),provider:'OpenAI',model:payload.model};
}

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const auth=req.headers.authorization||'';
  if(!auth.startsWith('Bearer '))return res.status(401).json({error:'Sign in required'});

  const userResp=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:SUPABASE_KEY,Authorization:auth}});
  if(!userResp.ok)return res.status(401).json({error:'Session expired. Please sign in again.'});
  const user=await userResp.json();

  const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
  const mode=body.mode||'coach';
  const question=String(body.question||'').trim();
  if(!question)return res.status(400).json({error:'Enter a question or request.'});

  let context=[];
  if(mode==='osm'){
    context=await osmContext(auth,question);
    if(!context.length)return res.status(404).json({error:'No matching OSM pages were found. Import the full OSM PDF in Ask OSM first.',matches:[]});
  }

  let instructions='You are the secure AI assistant inside a restaurant GM operations app. Be concise, practical, operationally focused, and never invent policies or standards.';
  let input=question;

  if(mode==='osm'){
    instructions+=' Answer only from the supplied OSM excerpts. If they do not support the answer, say so. Distinguish OSM requirements from your own operational suggestions. Cite OSM page numbers in the answer.';
    input=`Question: ${question}\n\nRetrieved OSM excerpts:\n${context.map(x=>`[OSM page ${x.page_number}]\n${x.content}`).join('\n\n')}`;
  }else if(mode==='coach'){
    instructions+=' Use the supplied restaurant performance data to coach the GM. Prioritize the largest controllable opportunity, acknowledge strong results, and give no more than five concrete actions.';
  }else if(mode==='communication'){
    instructions+=' Create energetic but professional team communication copy. Keep it easy to read on a printed one-page restaurant communication poster. Avoid generic corporate filler.';
  }

  if(!process.env.OPENROUTER_API_KEY&&!process.env.OPENAI_API_KEY){
    return res.status(503).json({
      error:'Free AI is installed but an OpenRouter API key has not been added to the server yet.',
      setup:'Add OPENROUTER_API_KEY in Vercel Environment Variables.',
      matches:context
    });
  }

  try{
    let result=null;
    if(process.env.OPENROUTER_API_KEY){
      try{result=await callOpenRouter(instructions,input);}catch(e){
        if(!process.env.OPENAI_API_KEY)throw e;
      }
    }
    if(!result&&process.env.OPENAI_API_KEY)result=await callOpenAI(instructions,input);
    if(!result)throw new Error('No AI provider is configured.');

    return res.status(200).json({
      answer:result.answer,
      provider:result.provider,
      model:result.model,
      user:user.id,
      mode,
      matches:context.map(x=>({page_number:x.page_number,rank:x.rank}))
    });
  }catch(e){
    return res.status(500).json({error:e.message||'AI request failed',matches:context});
  }
}
