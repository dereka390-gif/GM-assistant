const SUPABASE_URL='https://baxvcyfvimegafnbgleo.supabase.co';
const SUPABASE_KEY='sb_publishable_v95SXg4pHgcYcd7KtX1FbA_YLw_keRB';

function extractText(data){
  if(typeof data?.output_text==='string')return data.output_text;
  const parts=[];
  for(const item of data?.output||[]){for(const c of item?.content||[]){if(typeof c?.text==='string')parts.push(c.text);}}
  return parts.join('\n').trim();
}

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  const auth=req.headers.authorization||'';
  if(!auth.startsWith('Bearer '))return res.status(401).json({error:'Sign in required'});

  // Validate the Supabase session before allowing any AI request.
  const userResp=await fetch(`${SUPABASE_URL}/auth/v1/user`,{headers:{apikey:SUPABASE_KEY,Authorization:auth}});
  if(!userResp.ok)return res.status(401).json({error:'Session expired. Please sign in again.'});
  const user=await userResp.json();

  const apiKey=process.env.OPENAI_API_KEY;
  if(!apiKey)return res.status(503).json({error:'AI is installed but the server API key has not been configured yet.'});

  const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
  const mode=body.mode||'coach';
  const question=String(body.question||'').trim();
  if(!question)return res.status(400).json({error:'Enter a question or request.'});

  let instructions='You are the secure AI assistant inside a restaurant GM operations app. Be concise, practical, operationally focused, and never invent policies or standards.';
  const tools=[];
  if(mode==='osm'){
    const vectorStoreId=process.env.OSM_VECTOR_STORE_ID;
    if(!vectorStoreId)return res.status(503).json({error:'The secure OSM knowledge base has not been connected yet.'});
    instructions+=' Answer using the provided OSM file-search results. If the OSM does not support an answer, say that clearly. Distinguish OSM standards from suggestions. Cite the retrieved document/section in your answer when the tool output provides that context.';
    tools.push({type:'file_search',vector_store_ids:[vectorStoreId],max_num_results:8});
  }else if(mode==='coach'){
    instructions+=' Use the supplied restaurant performance data to coach the GM. Prioritize the largest controllable opportunity, acknowledge strong results, and give no more than five concrete actions.';
  }else if(mode==='communication'){
    instructions+=' Create energetic but professional team communication copy. Keep it easy to read on a printed one-page restaurant communication poster. Avoid generic corporate filler.';
  }

  const payload={
    model:process.env.OPENAI_MODEL||'gpt-5',
    instructions,
    input:question,
    store:false,
    ...(tools.length?{tools}:{})
  };

  try{
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data=await r.json();
    if(!r.ok)return res.status(r.status).json({error:data?.error?.message||'AI request failed'});
    return res.status(200).json({answer:extractText(data),user:user.id,mode});
  }catch(e){return res.status(500).json({error:e.message||'AI request failed'});}
}