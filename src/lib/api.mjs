import {emailStart,emailVerify} from './sign-in.mjs';
import { HttpError,text,slug,validateEnquiry,validateContent,validateSettings,imageType,RECORD_STATES,BUSINESS_STAGES,QUALITY } from './validation.mjs';
import { actor,csrfToken,verifyCSRF,localLogin,sameOrigin,cookie,localMode } from './auth.mjs';
import { published,siteSettings,contentItem,syncMedia,rateLimit,fingerprint,whatsapp } from './db.mjs';
export const json=(value,status=200,headers={})=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
async function limitedBody(request,max=24000){const reader=request.body?.getReader();if(!reader)return new Uint8Array();let parts=[],size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw new HttpError(413,'The request is too large.');}parts.push(value);}const out=new Uint8Array(size);let offset=0;for(const p of parts){out.set(p,offset);offset+=p.length;}return out;}
async function readJSON(request,max=24000){if(!request.headers.get('content-type')?.startsWith('application/json'))throw new HttpError(415,'Use JSON for this request.');try{return JSON.parse(new TextDecoder().decode(await limitedBody(request,max)));}catch(e){if(e instanceof HttpError)throw e;throw new HttpError(400,'Invalid JSON.');}}
function summary(details,reference,products){return `Hi, I'd like a quote for a custom sign.\nStyle: ${products.find(p=>p.slug===details.style)?.title||'Not sure yet'}\nUse: ${details.use}\nDelivery country: ${details.country}\nProject stage: ${details.stage}\n${details.project?'Reference project: '+details.project+'\n':''}Enquiry ID: ${reference}`;}
async function verifyBot(env,request,token){
 if(env.APP_ENV==='development'&&['localhost','127.0.0.1','[::1]'].includes(new URL(request.url).hostname))return;
 if(!env.TURNSTILE_SECRET||!env.TURNSTILE_SITE_KEY)throw new HttpError(503,'Enquiries are temporarily unavailable. Please use the contact details shown on this page.');
 if(typeof token!=='string'||!token||token.length>2048)throw new HttpError(422,'Please complete the security check.',{turnstile:'Complete the security check.'});
 let result;try{const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token}),signal:AbortSignal.timeout(10000)});result=await r.json();}catch{throw new HttpError(503,'Security verification is unavailable. Please try again.');}
 if(!result.success||result.action!=='quote'||result.hostname!==new URL(request.url).hostname)throw new HttpError(422,'The security check expired. Please try again.',{turnstile:'Please repeat the security check.'});
}
async function createEnquiry(request,env){
 sameOrigin(request);const raw=await readJSON(request);const products=await published(env,'product');const details=validateEnquiry(raw,products.map(p=>p.slug));
 if(details.project&&!(await published(env,'project')).some(p=>p.slug===details.project))throw new HttpError(422,'This project reference is no longer available.');
 const hash=await fingerprint(details);let row=await env.DB.prepare('SELECT reference,payload_hash FROM enquiries WHERE idempotency_key=?').bind(details.idempotencyKey).first();
 const replay=!!row;if(row&&row.payload_hash!==hash)throw new HttpError(409,'These details changed. Start a new enquiry before submitting again.');
 if(!row){await rateLimit(env,request,'enquiry');await verifyBot(env,request,raw.turnstileToken);const bytes=crypto.getRandomValues(new Uint8Array(10));const reference='CSF-'+[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
  await env.DB.prepare('INSERT INTO enquiries(id,reference,idempotency_key,payload_hash,details_json) VALUES(?,?,?,?,?) ON CONFLICT(idempotency_key) DO NOTHING').bind(crypto.randomUUID(),reference,details.idempotencyKey,hash,JSON.stringify(details)).run();
  row=await env.DB.prepare('SELECT reference,payload_hash FROM enquiries WHERE idempotency_key=?').bind(details.idempotencyKey).first();if(row.payload_hash!==hash)throw new HttpError(409,'This submission conflicts with an earlier attempt.');
 }
 const settings=await siteSettings(env);const message=summary(details,row.reference,products);return json({reference:row.reference,message,whatsappURL:whatsapp(settings,message),email:settings.email||null,recordStatus:'web_recorded'},replay?200:201);
}
async function adminAPI(request,env,route){
 const user=await actor(request,env);const method=request.method;const url=new URL(request.url);
 if(route==='session'&&method==='GET')return json({user:user.id,csrf:await csrfToken(env,user),mode:user.mode});
 if(method!=='GET')await verifyCSRF(request,env,user,request.headers.get('X-CSRF-Token'));
 if(route==='logout'&&method==='POST'){if(user.sessionId)await env.DB.prepare('DELETE FROM admin_sessions WHERE id=?').bind(user.sessionId).run();return json({ok:true},200,{'Set-Cookie':cookie(request,'csf_admin','',0)});}
 if(route==='content'&&method==='GET')return json({items:(await env.DB.prepare('SELECT id,type,slug,status,version,updated_at,draft_json FROM content_items ORDER BY type,sort_order,slug').all()).results.map(r=>({...r,draft:JSON.parse(r.draft_json),draft_json:undefined}))});
 if(route.startsWith('content/')&&method==='GET')return json(await contentItem(env,route.slice(8)));
 if(route==='content'&&method==='POST'){
  const raw=await readJSON(request,96000);const type=raw.type;const name=slug(raw.slug);if(type==='page'&&!['about','how-it-works','for-sign-companies'].includes(name))throw new HttpError(422,'Only the existing editorial pages may be edited.');if(type==='landing'&&!['custom-logo-signs','sign-fabrication'].includes(name))throw new HttpError(422,'Only the two configured landing pages may be edited.');
  const data=validateContent(raw,type);const id=crypto.randomUUID();try{await env.DB.prepare('INSERT INTO content_items(id,type,slug,draft_json,sort_order) VALUES(?,?,?,?,?)').bind(id,type,name,JSON.stringify(data),data.sort).run();}catch{throw new HttpError(409,'A page with this type and slug already exists.');}return json({id},201);
 }
 if(route.startsWith('content/')&&method==='PUT'){
  const id=route.slice(8);const current=await contentItem(env,id);const raw=await readJSON(request,96000);const data=validateContent(raw,current.type);if(!Number.isInteger(raw.version))throw new HttpError(422,'Missing content version.');
  if(data.product&&!await env.DB.prepare("SELECT id FROM content_items WHERE type='product' AND slug=?").bind(data.product).first())throw new HttpError(422,'The related product does not exist.');
  if(!['draft','publish','unpublish'].includes(raw.action))throw new HttpError(422,'Invalid publication action.');
  if(raw.action==='publish'){
   if(['product','project','landing'].includes(current.type)&&!data.image)throw new HttpError(422,'Add a main image before publishing.');
   if(current.type==='project'&&(!data.product||!(await published(env,'product')).some(p=>p.slug===data.product)))throw new HttpError(422,'Link this project to a published product before publishing.');
   if(data.image.startsWith('/media/')&&!await env.DB.prepare('SELECT key FROM media WHERE key=?').bind(data.image.slice(7)).first())throw new HttpError(422,'The selected uploaded image does not exist.');
  }
  let publishedJSON=current.published_json,status=current.status;if(raw.action==='publish'){publishedJSON=JSON.stringify(data);status='published';}if(raw.action==='unpublish')status='draft';
  if(current.type==='product'&&raw.action==='unpublish'){
   const related=(await published(env,'project')).some(p=>p.product===current.slug);if(related)throw new HttpError(409,'Unpublish or relink the related project first.');
  }
  const result=await env.DB.prepare('UPDATE content_items SET draft_json=?,published_json=?,status=?,sort_order=?,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=? AND version=?').bind(JSON.stringify(data),publishedJSON,status,data.sort,id,raw.version).run();
  if(!result.meta.changes)throw new HttpError(409,'This page changed in another session. Reload before saving.');await syncMedia(env);return json({ok:true,version:raw.version+1,status});
 }
 if(route==='settings'&&method==='GET')return json(await siteSettings(env));
 if(route==='settings'&&method==='PUT'){const raw=await readJSON(request);const previous=await siteSettings(env);const data=validateSettings(raw);if(data.faq===undefined)data.faq=previous.faq;const r=await env.DB.prepare('UPDATE site_settings SET value_json=?,version=version+1 WHERE id=1 AND version=?').bind(JSON.stringify(data),raw.version).run();if(!r.meta.changes)throw new HttpError(409,'Settings changed. Reload before saving.');return json({ok:true,version:raw.version+1});}
 if(route==='enquiries'&&method==='GET'){
  let where=[],args=[];for(const [key,column,options] of [['record','record_status',RECORD_STATES],['stage','business_stage',BUSINESS_STAGES],['quality','quality',QUALITY]]){const v=url.searchParams.get(key);if(v){if(!options.includes(v))throw new HttpError(422,'Invalid filter.');where.push(column+'=?');args.push(v);}}
  const search=text(url.searchParams.get('q')||'',80);if(search){where.push('reference LIKE ?');args.push('%'+search+'%');}const source=text(url.searchParams.get('source')||'',80);if(source){where.push("json_extract(details_json,'$.source.utm_source')=?");args.push(source);}
  const style=text(url.searchParams.get('style')||'',90);if(style){where.push("json_extract(details_json,'$.style')=?");args.push(style);}
  const sql=where.length?' WHERE '+where.join(' AND '):'';const offset=Math.max(0,Math.min(100000,Number(url.searchParams.get('offset'))||0));const total=await env.DB.prepare('SELECT count(*) total FROM enquiries'+sql).bind(...args).first();
  const rows=await env.DB.prepare('SELECT * FROM enquiries'+sql+' ORDER BY created_at DESC,id DESC LIMIT 25 OFFSET ?').bind(...args,offset).all();return json({total:total.total,offset,items:rows.results.map(r=>({...r,details:JSON.parse(r.details_json),details_json:undefined,payload_hash:undefined,idempotency_key:undefined}))});
 }
 if(route.startsWith('enquiries/')&&method==='GET'){
  const id=route.slice(10);const row=await env.DB.prepare('SELECT * FROM enquiries WHERE id=?').bind(id).first();if(!row)throw new HttpError(404,'Enquiry not found.');const logs=await env.DB.prepare('SELECT * FROM followup_logs WHERE enquiry_id=? ORDER BY created_at,id').bind(id).all();return json({...row,details:JSON.parse(row.details_json),details_json:undefined,payload_hash:undefined,idempotency_key:undefined,logs:logs.results.map(l=>({...l,change:JSON.parse(l.change_json),change_json:undefined}))});
 }
 if(route.startsWith('enquiries/')&&method==='PATCH'){
  const id=route.slice(10);const raw=await readJSON(request);if(!RECORD_STATES.includes(raw.record)||!BUSINESS_STAGES.includes(raw.stage)||!QUALITY.includes(raw.quality))throw new HttpError(422,'Invalid follow-up status.');
  const note=text(raw.note||'',1000);const reason=text(raw.reason||'',500);if(raw.record==='chat_confirmed'&&!note)throw new HttpError(422,'Record how you confirmed the actual conversation.');if(['lost','duplicate_or_spam'].includes(raw.stage==='lost'?'lost':raw.record)&&!reason)throw new HttpError(422,'Record a reason for this status.');
  const amount=raw.amount===null||raw.amount===''||raw.amount===undefined?null:Number(raw.amount);const currency=raw.currency?text(raw.currency,3).toUpperCase():null;if(amount!==null&&(!Number.isSafeInteger(amount)||amount<0))throw new HttpError(422,'Amount must be a non-negative number of minor currency units.');if((amount!==null||raw.stage==='won')&&(!currency||!/^[A-Z]{3}$/.test(currency)))throw new HttpError(422,'Specify a three-letter currency.');if(raw.stage==='won'&&(amount===null||raw.record!=='chat_confirmed'))throw new HttpError(422,'Confirm actual contact and enter the order amount before marking won.');
  const write=crypto.randomUUID();const change={record:raw.record,stage:raw.stage,quality:raw.quality,amount,currency,reason};const batch=await env.DB.batch([
   env.DB.prepare("UPDATE enquiries SET record_status=?,business_stage=?,quality=?,amount_minor=?,currency=?,reason=?,confirmed_at=CASE WHEN ?='chat_confirmed' THEN COALESCE(confirmed_at,CURRENT_TIMESTAMP) ELSE NULL END,closed_at=CASE WHEN ? IN ('won','lost') THEN CURRENT_TIMESTAMP ELSE NULL END,version=version+1,last_write=? WHERE id=? AND version=?").bind(raw.record,raw.stage,raw.quality,amount,currency,reason,raw.record,raw.stage,write,id,raw.version),
   env.DB.prepare('INSERT INTO followup_logs(id,enquiry_id,actor,change_json,note) SELECT ?,id,?,?,? FROM enquiries WHERE id=? AND last_write=?').bind(crypto.randomUUID(),user.id,JSON.stringify(change),note,id,write)
  ]);if(!batch[0].meta.changes)throw new HttpError(409,'This record changed. Reload before saving.');return json({ok:true});
 }
 if(route.startsWith('enquiries/')&&method==='DELETE'){const id=route.slice(10);const r=await env.DB.prepare('DELETE FROM enquiries WHERE id=?').bind(id).run();if(!r.meta.changes)throw new HttpError(404,'Enquiry not found.');return json({ok:true});}
 if(route==='media'&&method==='GET')return json({items:(await env.DB.prepare('SELECT * FROM media ORDER BY created_at DESC').all()).results});
 if(route==='media'&&method==='POST'){
  if(!env.MEDIA)throw new HttpError(503,'Image storage is not configured.');const alt=text(request.headers.get('X-Image-Alt')?decodeURIComponent(request.headers.get('X-Image-Alt')):'',200,true);const source=text(request.headers.get('X-Image-Source')?decodeURIComponent(request.headers.get('X-Image-Source')):'',1000,true);
  const bytes=await limitedBody(request,8*1024*1024);const [ext,mime]=imageType(bytes);const key=crypto.randomUUID()+'.'+ext;await env.MEDIA.put(key,bytes,{httpMetadata:{contentType:mime}});
  try{await env.DB.prepare('INSERT INTO media(key,mime,size,alt,source_note) VALUES(?,?,?,?,?)').bind(key,mime,bytes.length,alt,source).run();}catch(e){await env.MEDIA.delete(key);throw e;}return json({key,url:'/media/'+key},201);
 }
 throw new HttpError(404,'API route not found.');
}
export async function handleAPI(request,env,route){
 try{
  if(route==='auth/email/start'&&request.method==='POST'){const r=await emailStart(request,env,await readJSON(request));return json({challenge:r.challenge,message:'If this email is authorised, a sign-in code has been sent.'},202,{'Set-Cookie':r.cookie});}
  if(route==='auth/email/verify'&&request.method==='POST'){const token=await emailVerify(request,env,await readJSON(request));const headers={'Set-Cookie':cookie(request,'csf_admin',token,28800)};return json({ok:true},200,headers);}
  if(route==='enquiries'&&request.method==='POST')return await createEnquiry(request,env);
  if(route==='admin/login'&&request.method==='POST'){if(!localMode(env,request.url))throw new HttpError(404,'Not found.');sameOrigin(request);await rateLimit(env,request,'login',5);const raw=await readJSON(request);const token=await localLogin(request,env,raw.password);return json({ok:true},200,{'Set-Cookie':cookie(request,'csf_admin',token,28800)});}
  if(route.startsWith('admin/'))return await adminAPI(request,env,route.slice(6));
  throw new HttpError(404,'API route not found.');
 }catch(e){if(e instanceof HttpError)return json({error:e.message,fields:e.fields},e.status,e.status===429?{'Retry-After':'300'}:{});console.error('Request failed:',e?.name||'Error');return json({error:'The service is temporarily unavailable. Please try again.'},503);}
}
