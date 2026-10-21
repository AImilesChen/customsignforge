import {validLocale} from './locale.mjs';
import {publicCopy} from './malay-content.mjs';
import {chineseProducts} from './locale-content.mjs';
import {enquirySummary as summary} from './enquiry-summary.mjs';
import {LABELS_SQL,CLIENT_LABELS,enquiryLabels,saveEnquiryLabels} from './enquiry-labels.mjs';
import {archiveEnquiry} from './enquiry-archive.mjs';
import {uploadEnquiryFile,removePendingFile,downloadEnquiryFile,enquiryFiles,assertPendingFiles,deleteEnquiryFiles,pendingEnquiryFiles} from './enquiry-files.mjs';
import {emailStart,emailVerify} from './sign-in.mjs';
import {recordMeasurement,measurementReport,sqlDateRange} from './measurement.mjs';
import { HttpError,text,slug,validateEnquiry,validateContent,validateSettings,imageType,RECORD_STATES,BUSINESS_STAGES,QUALITY,requireEnquiryContact } from './validation.mjs';
import { actor,csrfToken,verifyCSRF,localLogin,sameOrigin,cookie,localMode } from './auth.mjs';
import { published,siteSettings,contentItem,syncMedia,rateLimit,fingerprint,whatsapp } from './db.mjs';
import {customerActor,customerCSRF,verifyCustomerCSRF,customerEmailStart,customerEmailVerify,CUSTOMER_SESSION_SECONDS} from './customer-auth.mjs';
import {verifyTurnstile} from './security.mjs';
import {PROJECT_KEYS,ROLES} from './enquiry-project.mjs';
export const json=(value,status=200,headers={})=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
async function limitedBody(request,max=24000){const reader=request.body?.getReader();if(!reader)return new Uint8Array();let parts=[],size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw new HttpError(413,'The request is too large.');}parts.push(value);}const out=new Uint8Array(size);let offset=0;for(const p of parts){out.set(p,offset);offset+=p.length;}return out;}
async function readJSON(request,max=24000){if(!request.headers.get('content-type')?.startsWith('application/json'))throw new HttpError(415,'Use JSON for this request.');try{return JSON.parse(new TextDecoder().decode(await limitedBody(request,max)));}catch(e){if(e instanceof HttpError)throw e;throw new HttpError(400,'Invalid JSON.');}}
async function createEnquiry(request,env){
 sameOrigin(request);const customer=await customerActor(request,env);await verifyCustomerCSRF(request,env,customer);const raw=await readJSON(request);const products=await published(env,'product');const submitted=validateEnquiry(raw,products.map(p=>p.slug));
 if(submitted.project&&!(await published(env,'project')).some(p=>p.slug===submitted.project))throw new HttpError(422,'This project reference is no longer available.');
 let row=await env.DB.prepare('SELECT id,reference,payload_hash,customer_id,details_json FROM enquiries WHERE idempotency_key=?').bind(submitted.idempotencyKey).first();
 if(row&&row.customer_id!==customer.id)throw new HttpError(409,'Start a new enquiry before submitting again.');
 const saved=row?JSON.parse(row.details_json):null;
 const details={...submitted,contactEmail:saved?.contactEmail||customer.email,emailVerified:true,phoneVerified:false};
 if(saved){if(Object.hasOwn(saved,'locale'))details.locale=saved.locale;else delete details.locale;}
 const hash=await fingerprint(details),replay=!!row;
 if(row){
  const previousFormat={...submitted};delete previousFormat.acquisition;
  const legacyAllowed=!saved.contactEmail&&(row.payload_hash===await fingerprint(submitted)||row.payload_hash===await fingerprint(previousFormat));
  if(row.payload_hash!==hash&&!legacyAllowed)throw new HttpError(409,'These details changed. Start a new enquiry before submitting again.');
 }else{
  requireEnquiryContact(details);const ids=details.attachments||[];await assertPendingFiles(env,ids,customer.id);
  await rateLimit(env,request,'enquiry');await rateLimit(env,request,'customer-enquiry',12,customer.id);await verifyTurnstile(env,request,raw.turnstileToken);
  const reference='CSF-'+[...crypto.getRandomValues(new Uint8Array(10))].map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
  const validFiles=ids.length?" WHERE (SELECT count(*) FROM enquiry_files WHERE id IN ("+ids.map(()=>'?').join(',')+") AND customer_id=? AND enquiry_id IS NULL AND state='ready' AND expires_at>?)=?":'';
  const insert=env.DB.prepare('INSERT INTO enquiries(id,reference,idempotency_key,payload_hash,details_json,customer_id) SELECT ?,?,?,?,?,?'+validFiles+' ON CONFLICT(idempotency_key) DO NOTHING').bind(crypto.randomUUID(),reference,details.idempotencyKey,hash,JSON.stringify(details),customer.id,...(ids.length?[...ids,customer.id,Math.floor(Date.now()/1000),ids.length]:[]));
  const batch=[insert];
  if(ids.length)batch.push(env.DB.prepare("UPDATE enquiry_files SET enquiry_id=(SELECT id FROM enquiries WHERE idempotency_key=? AND customer_id=? AND payload_hash=?),expires_at=NULL WHERE id IN ("+ids.map(()=>'?').join(',')+") AND customer_id=? AND enquiry_id IS NULL AND state='ready' AND EXISTS(SELECT 1 FROM enquiries WHERE idempotency_key=? AND customer_id=? AND payload_hash=?)").bind(details.idempotencyKey,customer.id,hash,...ids,customer.id,details.idempotencyKey,customer.id,hash));
  await env.DB.batch(batch);
  row=await env.DB.prepare('SELECT id,reference,payload_hash,customer_id,details_json FROM enquiries WHERE idempotency_key=?').bind(details.idempotencyKey).first();
  if(!row||row.customer_id!==customer.id||row.payload_hash!==hash)throw new HttpError(409,'This submission conflicts with an earlier attempt. Please check your files and try again.');
 }
 const settings=await siteSettings(env),message=summary(JSON.parse(row.details_json),row.reference,products,validLocale(raw.locale)?raw.locale:undefined);
 return json({reference:row.reference,message,whatsappURL:whatsapp(settings,message),email:settings.email||null,recordStatus:'web_recorded',files:await enquiryFiles(env,row.id,customer.id)},replay?200:201);
}
async function customerAPI(request,env,route){
 const method=request.method;
 if(route==='email/start'&&method==='POST'){const r=await customerEmailStart(request,env,await readJSON(request,4000));return json({challenge:r.challenge,message:'Check your inbox for your 8-digit sign-in code.'},202,{'Set-Cookie':r.cookie});}
 if(route==='email/verify'&&method==='POST'){const token=await customerEmailVerify(request,env,await readJSON(request,4000));const headers=new Headers();headers.append('Set-Cookie',cookie(request,'csf_customer',token,CUSTOMER_SESSION_SECONDS,'Lax'));headers.append('Set-Cookie',cookie(request,'csf_customer_email','',0));const response=json({ok:true});for(const [name,value] of response.headers)headers.set(name,value);return new Response(response.body,{status:200,headers});}
 const user=await customerActor(request,env);
 if(route==='session'&&method==='GET')return json({customer:{id:user.id,email:user.email},mode:user.mode,csrf:await customerCSRF(env,user)});
 if(route.startsWith('attachments/')&&method==='GET')return downloadEnquiryFile(env,route.slice(12),user);
 if(method!=='GET')await verifyCustomerCSRF(request,env,user);
 if(route==='attachments'&&method==='GET')return json({files:await pendingEnquiryFiles(env,user.id)});
 if(route==='attachments'&&method==='POST')return json(await uploadEnquiryFile(request,env,user,limitedBody),201);
 if(route.startsWith('attachments/')&&method==='DELETE')return json(await removePendingFile(env,user,route.slice(12)));
 if(route==='logout'&&method==='POST'){await env.DB.prepare('DELETE FROM customer_sessions WHERE id=? AND customer_id=?').bind(user.sessionId,user.id).run();return json({ok:true},200,{'Set-Cookie':cookie(request,'csf_customer','',0,'Lax')});}
 if((route==='enquiries'||/^enquiries\/CSF-[A-F0-9]{20}$/.test(route))&&method==='GET'){
  const requestedLocale=new URL(request.url).searchParams.get('locale');
  const reference=route==='enquiries'?null:route.slice(10);const offset=Math.max(0,Math.min(100000,Math.floor(Number(new URL(request.url).searchParams.get('offset'))||0)));
  const rows=reference?{results:[await env.DB.prepare('SELECT id,reference,created_at,details_json FROM enquiries WHERE customer_id=? AND reference=?').bind(user.id,reference).first()].filter(Boolean)}:await env.DB.prepare('SELECT id,reference,created_at,details_json FROM enquiries WHERE customer_id=? ORDER BY created_at DESC,id DESC LIMIT 25 OFFSET ?').bind(user.id,offset).all();
  if(reference&&!rows.results.length)throw new HttpError(404,'Enquiry not found.');
  const products=await published(env,'product'),settings=await siteSettings(env);const items=await Promise.all(rows.results.map(async row=>{const d=JSON.parse(row.details_json);const details=Object.fromEntries([...PROJECT_KEYS,'role','style','use','country','city','stage','timing','notes','contactEmail','contactMethod','phone','drawings','locale'].map(k=>[k,d[k]||'']));const message=summary(d,row.reference,products,validLocale(requestedLocale)?requestedLocale:d.locale||'en');return {reference:row.reference,createdAt:row.created_at,details,styleName:requestedLocale==='ms'?(publicCopy.site.products[d.style]?.title||'Belum pasti'):requestedLocale==='zh'?(chineseProducts[d.style]?.title||'暂不确定'):products.find(p=>p.slug===d.style)?.title||'Not sure yet',message,whatsappURL:whatsapp(settings,message),files:await enquiryFiles(env,row.id,user.id)};}));
  const total=reference?1:(await env.DB.prepare('SELECT count(*) total FROM enquiries WHERE customer_id=?').bind(user.id).first()).total;
  return json({items,total,offset});
 }
 throw new HttpError(404,'Account route not found.');
}
async function adminAPI(request,env,route){
 const user=await actor(request,env);const method=request.method;const url=new URL(request.url);
 if(route==='session'&&method==='GET')return json({user:user.id,csrf:await csrfToken(env,user),mode:user.mode});
 if(route.startsWith('attachments/')&&method==='GET')return downloadEnquiryFile(env,route.slice(12));
 if(route==='measurement'&&method==='GET')return json(await measurementReport(env,url.searchParams));
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
   for(const path of [data.image,...data.gallery.map(image=>image.src)])if(path.startsWith('/media/')&&!await env.DB.prepare('SELECT key FROM media WHERE key=?').bind(path.slice(7)).first())throw new HttpError(422,'A selected uploaded image does not exist.');
   for(const [field,type] of [['relatedProducts','product'],['relatedProjects','project']]){const live=await published(env,type);if(data[field].some(slug=>!live.some(item=>item.slug===slug)))throw new HttpError(422,'Related references must be published before selecting them.');}
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
 if(route==='enquiries'&&method==='POST'){
  const raw=await readJSON(request);const products=await published(env,'product');const details=validateEnquiry({...raw,entry:'',source:{},project:''},products.map(p=>p.slug));
  if(!['whatsapp','email','offline','other'].includes(raw.channel))throw new HttpError(422,'Select the actual contact channel.');
  const note=text(raw.note||'',1000,true);details.acquisition.entryMode='manual';details.channel=raw.channel;details.contact=text(raw.contact||'',150);details.source={};
  const confirmed=raw.confirmed===true;const record=confirmed?'chat_confirmed':'web_recorded';const hash=await fingerprint({details,note,confirmed});
  const previous=await env.DB.prepare('SELECT id,reference,payload_hash FROM enquiries WHERE idempotency_key=?').bind(details.idempotencyKey).first();
  if(previous){if(previous.payload_hash!==hash)throw new HttpError(409,'These details changed. Start a new manual entry.');return json({id:previous.id,reference:previous.reference},200);}
  const id=crypto.randomUUID(),reference='CSF-'+[...crypto.getRandomValues(new Uint8Array(10))].map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
  await env.DB.batch([
   env.DB.prepare("INSERT INTO enquiries(id,reference,idempotency_key,payload_hash,details_json,record_status,confirmed_at) VALUES(?,?,?,?,?,?,CASE WHEN ?='chat_confirmed' THEN CURRENT_TIMESTAMP ELSE NULL END)").bind(id,reference,details.idempotencyKey,hash,JSON.stringify(details),record,record),
   env.DB.prepare('INSERT INTO followup_logs(id,enquiry_id,actor,change_json,note) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),id,user.id,JSON.stringify({record,stage:'needs_details',quality:'unreviewed',amount:null,currency:null,reason:'',action:'manual_created'}),note)
  ]);return json({id,reference},201);
 }
 if(route==='enquiries'&&method==='GET'){
  const view=url.searchParams.get('view')||'active';if(!['active','trash'].includes(view))throw new HttpError(422,'Invalid list view.');
  let where=[view==='trash'?'archived_at IS NOT NULL':'archived_at IS NULL'],args=[];for(const [key,column,options] of [['record','record_status',RECORD_STATES],['stage','business_stage',BUSINESS_STAGES],['quality','quality',QUALITY]]){const v=url.searchParams.get(key);if(v){if(!options.includes(v))throw new HttpError(422,'Invalid filter.');where.push(column+'=?');args.push(v);}}
  const search=text(url.searchParams.get('q')||'',80);if(search){where.push("instr(lower(reference||' '||COALESCE(json_extract(details_json,'$.contactName'),'')||' '||COALESCE(json_extract(details_json,'$.businessName'),'')||' '||COALESCE(json_extract(details_json,'$.contactEmail'),'')||' '||COALESCE(json_extract(details_json,'$.phone'),'')||' '||COALESCE(json_extract(details_json,'$.contact'),'')||' '||COALESCE((SELECT email FROM customers WHERE id=customer_id),'')),?)>0");args.push(search.toLowerCase());}const source=text(url.searchParams.get('source')||'',80);if(source){where.push("json_extract(details_json,'$.source.utm_source')=?");args.push(source);}
  const style=text(url.searchParams.get('style')||'',90);if(style){where.push("json_extract(details_json,'$.style')=?");args.push(style);}
  for(const [key,options] of [['role',ROLES.map(([id])=>id)],['projectStage',['Ready to discuss a quote','Comparing options','Exploring an idea']],['deliveryWindow',['within-month','one-three-months','later','not-sure']]]){const value=url.searchParams.get(key);if(value){if(!options.includes(value))throw new HttpError(422,'Invalid project filter.');where.push("json_extract(details_json,'$."+(key==='projectStage'?'stage':key)+"')=?");args.push(value);}}
  const label=url.searchParams.get('label')||'';if(label){if(label!=='unmarked'&&!CLIENT_LABELS.some(([key])=>key===label))throw new HttpError(422,'Invalid client label.');if(label==='unmarked')where.push('json_array_length('+LABELS_SQL+')=0');else{where.push('EXISTS(SELECT 1 FROM json_each('+LABELS_SQL+') WHERE value=?)');args.push(label);}}
  const dates=sqlDateRange(url.searchParams);where.push(...dates.where);args.push(...dates.args);
  const countryWhere=where.join(' AND '),countryArgs=[...args];
  const country=text(url.searchParams.get('country')||'',100);if(country){where.push("COALESCE(json_extract(details_json,'$.country'),'')=?");args.push(country);}
  const sql=' WHERE '+where.join(' AND ');
  const limit=Number(url.searchParams.get('limit')||25);if(![10,25,50].includes(limit))throw new HttpError(422,'Use 10, 25 or 50 records per page.');
  const sort=url.searchParams.get('sort')||'newest';if(!['newest','oldest'].includes(sort))throw new HttpError(422,'Invalid date sort.');
  const requestedOffset=Math.max(0,Math.min(100000,Math.floor(Number(url.searchParams.get('offset'))||0)));
  const total=await env.DB.prepare('SELECT count(*) total FROM enquiries'+sql).bind(...args).first();
  const offset=Math.min(requestedOffset,Math.max(0,Math.floor((total.total-1)/limit)*limit));
  const countries=await env.DB.prepare("SELECT COALESCE(json_extract(details_json,'$.country'),'') country,count(*) count FROM enquiries WHERE "+countryWhere+" GROUP BY country ORDER BY country").bind(...countryArgs).all();
  const rows=await env.DB.prepare('SELECT enquiries.*,(SELECT email FROM customers WHERE id=customer_id) customer_email FROM enquiries'+sql+' ORDER BY created_at '+(sort==='oldest'?'ASC':'DESC')+',id '+(sort==='oldest'?'ASC':'DESC')+' LIMIT ? OFFSET ?').bind(...args,limit,offset).all();return json({total:total.total,offset,limit,sort,view,countries:countries.results,items:rows.results.map(r=>({...r,labels:enquiryLabels(r),labels_json:undefined,details:JSON.parse(r.details_json),details_json:undefined,payload_hash:undefined,idempotency_key:undefined}))});
 }
 const labelsRoute=route.match(/^enquiries\/([^/]+)\/labels$/);
 if(labelsRoute&&method==='PATCH')return json(await saveEnquiryLabels(env,user,labelsRoute[1],await readJSON(request)));
 const archiveRoute=route.match(/^enquiries\/([^/]+)\/archive$/);
 if(archiveRoute&&method==='PATCH')return json(await archiveEnquiry(env,user,archiveRoute[1],await readJSON(request)));
 if(route.startsWith('enquiries/')&&method==='GET'){
  const id=route.slice(10);const row=await env.DB.prepare('SELECT enquiries.*,(SELECT email FROM customers WHERE id=customer_id) customer_email FROM enquiries WHERE id=?').bind(id).first();if(!row)throw new HttpError(404,'Enquiry not found.');const logs=await env.DB.prepare('SELECT * FROM followup_logs WHERE enquiry_id=? ORDER BY created_at,id').bind(id).all();return json({...row,labels:enquiryLabels(row),labels_json:undefined,details:JSON.parse(row.details_json),details_json:undefined,payload_hash:undefined,idempotency_key:undefined,files:await enquiryFiles(env,row.id),logs:logs.results.map(l=>({...l,change:JSON.parse(l.change_json),change_json:undefined}))});
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
 if(route.startsWith('enquiries/')&&method==='DELETE'){const id=route.slice(10);await deleteEnquiryFiles(env,id);const r=await env.DB.prepare('DELETE FROM enquiries WHERE id=?').bind(id).run();if(!r.meta.changes)throw new HttpError(404,'Enquiry not found.');return json({ok:true});}
 if(route==='media'&&method==='GET')return json({items:(await env.DB.prepare('SELECT * FROM media ORDER BY created_at DESC').all()).results});
 if(route.startsWith('media/')&&method==='DELETE'){
  const key=route.slice(6);const item=await env.DB.prepare('SELECT key,published FROM media WHERE key=?').bind(key).first();if(!item)throw new HttpError(404,'Image not found.');
  const content=(await env.DB.prepare('SELECT draft_json,published_json FROM content_items').all()).results;if(content.some(row=>(row.draft_json+'\n'+(row.published_json||'')).includes('/media/'+key)))throw new HttpError(409,'Remove this image from saved drafts and published content before deleting it.');
  await env.MEDIA.delete(key);await env.DB.prepare('DELETE FROM media WHERE key=?').bind(key).run();return json({ok:true});
 }
 if(route==='media'&&method==='POST'){
  if(!env.MEDIA)throw new HttpError(503,'Image storage is not configured.');const alt=text(request.headers.get('X-Image-Alt')?decodeURIComponent(request.headers.get('X-Image-Alt')):'',200,true);const source=text(request.headers.get('X-Image-Source')?decodeURIComponent(request.headers.get('X-Image-Source')):'',1000,true);
  const bytes=await limitedBody(request,8*1024*1024);const [ext,mime]=imageType(bytes);const key=crypto.randomUUID()+'.'+ext;await env.MEDIA.put(key,bytes,{httpMetadata:{contentType:mime}});
  try{await env.DB.prepare('INSERT INTO media(key,mime,size,alt,source_note) VALUES(?,?,?,?,?)').bind(key,mime,bytes.length,alt,source).run();}catch(e){await env.MEDIA.delete(key);throw e;}return json({key,url:'/media/'+key},201);
 }
 throw new HttpError(404,'API route not found.');
}
export async function handleAPI(request,env,route){
 try{
  if(route.startsWith('account/'))return await customerAPI(request,env,route.slice(8));
  if(route==='auth/email/start'&&request.method==='POST'){const r=await emailStart(request,env,await readJSON(request));return json({challenge:r.challenge,message:'If this email is authorised, a sign-in code has been sent.'},202,{'Set-Cookie':r.cookie});}
  if(route==='auth/email/verify'&&request.method==='POST'){const token=await emailVerify(request,env,await readJSON(request));const headers={'Set-Cookie':cookie(request,'csf_admin',token,28800)};return json({ok:true},200,headers);}
  if(route==='enquiries'&&request.method==='POST')return await createEnquiry(request,env);
  if(route==='measurement'&&request.method==='POST')return json(await recordMeasurement(request,env,await readJSON(request,4000)),202);
  if(route==='admin/login'&&request.method==='POST'){if(!localMode(env,request.url))throw new HttpError(404,'Not found.');sameOrigin(request);await rateLimit(env,request,'login',5);const raw=await readJSON(request);const token=await localLogin(request,env,raw.password);return json({ok:true},200,{'Set-Cookie':cookie(request,'csf_admin',token,28800)});}
  if(route.startsWith('admin/'))return await adminAPI(request,env,route.slice(6));
  throw new HttpError(404,'API route not found.');
 }catch(e){if(e instanceof HttpError)return json({error:e.message,fields:e.fields},e.status,e.status===429?{'Retry-After':'300'}:{});console.error('Request failed:',e?.name||'Error');return json({error:'The service is temporarily unavailable. Please try again.'},503);}
}
