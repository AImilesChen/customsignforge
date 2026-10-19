import {HttpError} from './validation.mjs';
import {rateLimit} from './db.mjs';
import {FILE_LIMIT,FILE_TOTAL_LIMIT,FILE_COUNT_LIMIT,FILE_EXTENSIONS,attachmentId} from './enquiry-fields.mjs';
const now=()=>Math.floor(Date.now()/1000);
const missing=()=>new HttpError(404,'File not found.');
const safe=row=>({id:row.id,name:row.filename,size:row.size});

export function checkDrawingFile(name,bytes){
 if(typeof name!=='string'||!name.trim()||name.length>140||/[\\/:\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/.test(name)||name.startsWith('.'))throw new HttpError(422,'Use a simple filename without folders or special control characters.');
 const ext=name.split('.').pop().toLowerCase();
 if(!FILE_EXTENSIONS.includes(ext))throw new HttpError(422,'Use PDF, AI, EPS, DWG, DXF, JPG, PNG or WebP. Export other drawing formats as PDF.');
 if(!bytes.length||bytes.length>FILE_LIMIT)throw new HttpError(413,'Each file must be between 1 byte and 10 MB.');
 const start=new TextDecoder('latin1').decode(bytes.slice(0,4096));
 const signatures={pdf:start.startsWith('%PDF-'),ai:start.startsWith('%PDF-')||start.startsWith('%!PS-Adobe'),eps:start.startsWith('%!PS-Adobe'),dwg:/^AC10\d{2}/.test(start),dxf:start.startsWith('AutoCAD Binary DXF\r\n')||/^\s*0\s+[\r\n]+SECTION(?:\s|$)/.test(start),jpg:bytes[0]===255&&bytes[1]===216&&bytes[2]===255,jpeg:bytes[0]===255&&bytes[1]===216&&bytes[2]===255,png:bytes.slice(0,8).join(',')==='137,80,78,71,13,10,26,10',webp:start.startsWith('RIFF')&&start.slice(8,12)==='WEBP'};
 if(!signatures[ext])throw new HttpError(422,'The file content does not match its extension. Export the drawing as PDF or use a supported image.');
 return {filename:name.trim().normalize('NFC'),ext};
}

export async function uploadEnquiryFile(request,env,user,readBody){
 if(!env.MEDIA)throw new HttpError(503,'File storage is temporarily unavailable.');
 await rateLimit(env,request,'drawing-upload-ip',20);
 await rateLimit(env,request,'drawing-upload-customer',12,user.id);
 const length=Number(request.headers.get('Content-Length'));
 if(length>FILE_LIMIT)throw new HttpError(413,'Each file must be 10 MB or smaller.');
 let name;try{name=decodeURIComponent(request.headers.get('X-File-Name')||'')}catch{throw new HttpError(422,'Invalid filename.');}
 const bytes=await readBody(request,FILE_LIMIT),file=checkDrawingFile(name,bytes);
 const id=crypto.randomUUID(),key='enquiry-files/'+id+'.'+file.ext;
 const reservation=await env.DB.prepare("INSERT INTO enquiry_files(id,customer_id,object_key,filename,size,expires_at) SELECT ?,?,?,?,?,? WHERE (SELECT count(*) FROM enquiry_files WHERE customer_id=? AND enquiry_id IS NULL AND state!='deleting')<? AND (SELECT COALESCE(sum(size),0) FROM enquiry_files WHERE customer_id=? AND enquiry_id IS NULL AND state!='deleting')+?<=?").bind(id,user.id,key,file.filename,bytes.length,now()+86400,user.id,FILE_COUNT_LIMIT,user.id,bytes.length,FILE_TOTAL_LIMIT).run();
 if(!reservation.meta.changes)throw new HttpError(422,'Use up to 3 files and 20 MB in total. Remove an unused file or submit your existing enquiry first.');
 try{
  await env.MEDIA.put(key,bytes,{httpMetadata:{contentType:'application/octet-stream'}});
  await env.DB.prepare("UPDATE enquiry_files SET state='ready' WHERE id=? AND state='uploading'").bind(id).run();
 }catch(e){
  await env.DB.prepare("UPDATE enquiry_files SET state='deleting',expires_at=? WHERE id=?").bind(now(),id).run();
  try{await env.MEDIA.delete(key);await env.DB.prepare('DELETE FROM enquiry_files WHERE id=?').bind(id).run()}catch{}
  throw e;
 }
 return {file:{id,name:file.filename,size:bytes.length}};
}

export async function removePendingFile(env,user,id){
 if(!attachmentId(id))throw missing();
 const row=await env.DB.prepare("UPDATE enquiry_files SET state='deleting',expires_at=? WHERE id=? AND customer_id=? AND enquiry_id IS NULL RETURNING object_key").bind(now(),id,user.id).first();
 if(!row)throw missing();
 await env.MEDIA.delete(row.object_key);
 await env.DB.prepare("DELETE FROM enquiry_files WHERE id=? AND state='deleting' AND enquiry_id IS NULL").bind(id).run();
 return {ok:true};
}

export async function downloadEnquiryFile(env,id,user=null){
 if(!attachmentId(id))throw missing();
 const row=await env.DB.prepare("SELECT * FROM enquiry_files WHERE id=? AND state='ready'"+(user?' AND customer_id=?':'')).bind(...(user?[id,user.id]:[id])).first();
 if(!row||(!row.enquiry_id&&row.expires_at<=now()))throw missing();
 const object=await env.MEDIA.get(row.object_key);if(!object)throw missing();
 return new Response(object.body,{headers:{'Content-Type':'application/octet-stream','Content-Disposition':"attachment; filename=\"drawing."+row.filename.split('.').pop().toLowerCase()+"\"; filename*=UTF-8''"+encodeURIComponent(row.filename).replace(/['()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase()),'Content-Length':String(row.size),'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow','Content-Security-Policy':"sandbox; default-src 'none'",'Referrer-Policy':'no-referrer'}});
}

export async function enquiryFiles(env,enquiryId,customerId=null){
 const rows=await env.DB.prepare("SELECT id,filename,size FROM enquiry_files WHERE enquiry_id=? AND state='ready'"+(customerId?' AND customer_id=?':'')+' ORDER BY created_at,id').bind(...(customerId?[enquiryId,customerId]:[enquiryId])).all();
 return rows.results.map(safe);
}

export async function assertPendingFiles(env,ids,customerId){
 if(!ids.length)return;
 const rows=await env.DB.prepare("SELECT id,size FROM enquiry_files WHERE id IN ("+ids.map(()=>'?').join(',')+") AND customer_id=? AND enquiry_id IS NULL AND state='ready' AND expires_at>?").bind(...ids,customerId,now()).all();
 if(rows.results.length!==ids.length||rows.results.reduce((sum,r)=>sum+r.size,0)>FILE_TOTAL_LIMIT)throw new HttpError(422,'An uploaded file is missing, expired or already assigned. Remove it and upload it again.',{attachments:'Please check your uploaded files.'});
}

export async function deleteEnquiryFiles(env,enquiryId){
 const rows=await env.DB.prepare('SELECT id,object_key FROM enquiry_files WHERE enquiry_id=?').bind(enquiryId).all();
 for(const row of rows.results){await env.MEDIA.delete(row.object_key);await env.DB.prepare('DELETE FROM enquiry_files WHERE id=? AND enquiry_id=?').bind(row.id,enquiryId).run()}
}

export async function cleanupPendingFiles(env){
 const rows=await env.DB.prepare("SELECT id FROM enquiry_files WHERE enquiry_id IS NULL AND expires_at<=? LIMIT 100").bind(now()).all();
 for(const {id} of rows.results){
  const row=await env.DB.prepare("UPDATE enquiry_files SET state='deleting' WHERE id=? AND enquiry_id IS NULL AND expires_at<=? RETURNING object_key").bind(id,now()).first();
  if(!row)continue;
  await env.MEDIA.delete(row.object_key);
  await env.DB.prepare("DELETE FROM enquiry_files WHERE id=? AND enquiry_id IS NULL AND state='deleting'").bind(id).run();
 }
}

export async function pendingEnquiryFiles(env,customerId){
 const rows=await env.DB.prepare("SELECT id,filename,size FROM enquiry_files WHERE customer_id=? AND enquiry_id IS NULL AND state='ready' AND expires_at>? ORDER BY created_at,id").bind(customerId,now()).all();
 return rows.results.map(safe);
}
