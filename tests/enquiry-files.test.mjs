import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fixture,request,enquiry,customerHeaders} from './helpers.mjs';
import {handleAPI} from '../src/lib/api.mjs';
import {fingerprint} from '../src/lib/db.mjs';
import {validateEnquiry} from '../src/lib/validation.mjs';
import {maintenance} from '../src/lib/maintenance.mjs';
const call=(f,path,method='GET',body,headers={})=>handleAPI(request('api/'+path,method,body,headers),f.env,path);
const pdf=new TextEncoder().encode('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF');
const upload=(f,headers,bytes=pdf,name='logo.pdf')=>handleAPI(new Request('http://localhost:4321/api/account/attachments',{method:'POST',headers:{Origin:'http://localhost:4321','Content-Type':'application/octet-stream','X-File-Name':encodeURIComponent(name),...headers},body:bytes}),f.env,'account/attachments');
async function admin(f){const r=await call(f,'admin/login','POST',{password:f.env.LOCAL_ADMIN_PASSWORD});const cookie=r.headers.get('set-cookie').split(';')[0];const s=await(await call(f,'admin/session','GET',undefined,{cookie})).json();return {cookie,'X-CSRF-Token':s.csrf}}

test('new quotes require an international phone or WhatsApp number; email snapshot comes from the verified session',async()=>{
 const f=fixture();try{
  const h=await customerHeaders(f.env,'buyer@example.test');
  for(const phone of ['', '1234567','+00012345','+1 not-a-number','+1234567890123456']){
   const r=await call(f,'enquiries','POST',{...enquiry(),phone},h);assert.equal(r.status,422,phone);
  }
  for(const contactMethod of ['', 'email'])assert.equal((await call(f,'enquiries','POST',{...enquiry(),contactMethod},h)).status,422);
  assert.equal((await call(f,'enquiries','POST',{...enquiry(),drawings:''},h)).status,422);
  assert.equal((await call(f,'enquiries','POST',{...enquiry(),drawings:'ready'},h)).status,422);
  const raw={...enquiry(),phone:'00 44 (20) 7946-0123',contactEmail:'forged@example.test',emailVerified:false,phoneVerified:true};
  const r=await call(f,'enquiries','POST',raw,h);assert.equal(r.status,201);const saved=JSON.parse(f.sqlite.prepare('SELECT details_json FROM enquiries').get().details_json);
  assert.equal(saved.phone,'+442079460123');assert.equal(saved.contactEmail,'buyer@example.test');assert.equal(saved.emailVerified,true);assert.equal(saved.phoneVerified,false);
  assert.equal((await call(f,'enquiries','POST',raw,h)).status,200);
  assert.equal(f.sqlite.prepare('SELECT count(*) n FROM enquiries').get().n,1);
 }finally{f.close()}
});

test('private uploads require customer authentication and CSRF, reject mismatched file signatures and unsafe names',async()=>{
 const f=fixture();try{
  assert.equal((await upload(f,{})).status,401);
  const h=await customerHeaders(f.env),a=await admin(f);
  assert.equal((await upload(f,{cookie:h.cookie})).status,403);
  assert.equal((await upload(f,{...h,Origin:'https://other.example'})).status,403);
  assert.equal((await upload(f,a)).status,401);
  assert.equal((await upload(f,h,new TextEncoder().encode('<script>alert(1)</script>'),'logo.pdf')).status,422);
  for(const name of ['logo.svg','../logo.pdf','folder/logo.pdf','bad\nname.pdf','logo.pdf.exe'])assert.equal((await upload(f,h,pdf,name)).status,422,name);
  assert.equal((await upload(f,h,new Uint8Array(),'empty.pdf')).status,413);
  const tooLarge=new Uint8Array(10*1024*1024+1);assert.equal((await upload(f,h,tooLarge)).status,413);
  assert.equal(f.sqlite.prepare('SELECT count(*) n FROM enquiry_files').get().n,0);
 }finally{f.close()}
});

test('draft files recover after reload, are owner-only and cannot be attached or removed by another customer',async()=>{
 const f=fixture();try{
  const owner=await customerHeaders(f.env,'one@example.test'),other=await customerHeaders(f.env,'two@example.test');
  const r=await upload(f,owner,pdf,'招牌 logo.pdf');assert.equal(r.status,201);const {file}=await r.json();
  const recovered=await(await call(f,'account/attachments','GET',undefined,owner)).json();assert.deepEqual(recovered.files,[file]);
  assert.equal((await call(f,'account/attachments/'+file.id,'GET')).status,401);
  assert.equal((await call(f,'account/attachments/'+file.id,'GET',undefined,other)).status,404);
  assert.equal((await call(f,'account/attachments/'+file.id,'DELETE',undefined,other)).status,404);
  assert.equal((await call(f,'enquiries','POST',{...enquiry(),drawings:'ready',attachments:[file.id]},other)).status,422);
  assert.equal(f.sqlite.prepare('SELECT count(*) n FROM enquiries').get().n,0);
  const download=await call(f,'account/attachments/'+file.id,'GET',undefined,owner);assert.equal(download.status,200);
  assert.equal(download.headers.get('Content-Type'),'application/octet-stream');assert(download.headers.get('Content-Disposition').startsWith('attachment;'));assert(download.headers.get('Content-Disposition').includes("filename*=UTF-8''"));assert(download.headers.get('Cache-Control').includes('no-store'));assert.equal(download.headers.get('X-Content-Type-Options'),'nosniff');assert.equal(download.headers.get('Content-Security-Policy'),"sandbox; default-src 'none'");assert.deepEqual(new Uint8Array(await download.arrayBuffer()),pdf);
  const storageRow=f.sqlite.prepare('SELECT object_key FROM enquiry_files').get();assert(storageRow.object_key.startsWith('enquiry-files/'));assert.equal(f.sqlite.prepare('SELECT count(*) n FROM media').get().n,0);
 }finally{f.close()}
});

test('files attach once with the enquiry, remain downloadable to the owner/admin, and cannot be reused',async()=>{
 const f=fixture();try{
  const h=await customerHeaders(f.env),a=await admin(f),{file}=await(await upload(f,h)).json();
  const raw={...enquiry(),drawings:'ready',attachments:[file.id]};
  const first=await call(f,'enquiries','POST',raw,h);assert.equal(first.status,201);const result=await first.json();assert.deepEqual(result.files,[file]);
  const row=f.sqlite.prepare('SELECT * FROM enquiry_files').get();assert(row.enquiry_id);assert.equal(row.expires_at,null);
  const retry=await call(f,'enquiries','POST',raw,h);assert.equal(retry.status,200);assert.deepEqual((await retry.json()).files,[file]);
  assert.equal((await call(f,'enquiries','POST',{...raw,idempotencyKey:crypto.randomUUID()},h)).status,422);
  assert.equal((await call(f,'account/attachments/'+file.id,'DELETE',undefined,h)).status,404);
  const history=await(await call(f,'account/enquiries','GET',undefined,h)).json();assert.deepEqual(history.items[0].files,[file]);assert.equal(history.items[0].details.phone,'+12025550123');
  assert.equal((await call(f,'admin/attachments/'+file.id,'GET',undefined,h)).status,401);
  assert.equal((await call(f,'admin/attachments/'+file.id,'GET',undefined,a)).status,200);
  const record=await(await call(f,'admin/enquiries/'+row.enquiry_id,'GET',undefined,a)).json();assert.deepEqual(record.files,[file]);
  assert.equal((await call(f,'admin/enquiries/'+row.enquiry_id,'DELETE',undefined,a)).status,200);
  assert.equal(await f.env.MEDIA.get(row.object_key),null);assert.equal(f.sqlite.prepare('SELECT count(*) n FROM enquiry_files').get().n,0);
 }finally{f.close()}
});

test('draft file counts and total bytes are enforced on the server, and removal releases the quota',async()=>{
 const f=fixture();try{
  const h=await customerHeaders(f.env),files=[];
  for(let i=0;i<3;i++){const r=await upload(f,h,pdf,'logo-'+i+'.pdf');assert.equal(r.status,201);files.push((await r.json()).file)}
  assert.equal((await upload(f,h)).status,422);
  assert.equal((await call(f,'account/attachments/'+files[0].id,'DELETE',undefined,h)).status,200);
  assert.equal((await upload(f,h)).status,201);
  for(const {id} of f.sqlite.prepare('SELECT id FROM enquiry_files').all())await call(f,'account/attachments/'+id,'DELETE',undefined,h);
  const large=new Uint8Array(10*1024*1024);large.set(pdf);
  assert.equal((await upload(f,h,large,'large-1.pdf')).status,201);assert.equal((await upload(f,h,large,'large-2.pdf')).status,201);assert.equal((await upload(f,h,pdf,'extra.pdf')).status,422);
 }finally{f.close()}
});

test('concurrent file cancellation cannot leave an enquiry with missing attachments',async()=>{
 const f=fixture();try{
  const h=await customerHeaders(f.env),{file}=await(await upload(f,h)).json(),batch=f.env.DB.batch;
  f.env.DB.batch=async statements=>{f.sqlite.prepare("UPDATE enquiry_files SET state='deleting' WHERE id=?").run(file.id);return batch(statements)};
  const r=await call(f,'enquiries','POST',{...enquiry(),drawings:'ready',attachments:[file.id]},h);assert.equal(r.status,409);assert.equal(f.sqlite.prepare('SELECT count(*) n FROM enquiries').get().n,0);
 }finally{f.close()}
});

test('expired pending files are inaccessible and cleaned, while submitted enquiry files survive cleanup',async()=>{
 const f=fixture();try{
  const h=await customerHeaders(f.env),{file:attached}=await(await upload(f,h,pdf,'keep.pdf')).json();
  assert.equal((await call(f,'enquiries','POST',{...enquiry(),drawings:'ready',attachments:[attached.id]},h)).status,201);
  const {file:expired}=await(await upload(f,h,pdf,'expire.pdf')).json();const row=f.sqlite.prepare('SELECT object_key FROM enquiry_files WHERE id=?').get(expired.id);
  f.sqlite.prepare('UPDATE enquiry_files SET expires_at=0 WHERE id=?').run(expired.id);
  assert.equal((await call(f,'account/attachments/'+expired.id,'GET',undefined,h)).status,404);
  await maintenance(f.env);assert.equal(await f.env.MEDIA.get(row.object_key),null);assert.equal(f.sqlite.prepare('SELECT count(*) n FROM enquiry_files').get().n,1);
  assert.equal((await call(f,'account/attachments/'+attached.id,'GET',undefined,h)).status,200);
 }finally{f.close()}
});

test('legacy retries still work after introducing mandatory contact fields, without allowing new empty-contact submissions',async()=>{
 const f=fixture();try{
  const h=await customerHeaders(f.env),raw=enquiry();delete raw.contactMethod;delete raw.phone;delete raw.drawings;delete raw.attachments;
  const details=validateEnquiry(raw,['backlit-letters']),customer=f.sqlite.prepare('SELECT id FROM customers').get();
  f.sqlite.prepare('INSERT INTO enquiries(id,reference,idempotency_key,payload_hash,details_json,customer_id) VALUES(?,?,?,?,?,?)').run(crypto.randomUUID(),'CSF-AAAAAAAAAAAAAAAAAAAA',raw.idempotencyKey,await fingerprint(details),JSON.stringify(details),customer.id);
  assert.equal((await call(f,'enquiries','POST',raw,h)).status,200);
  assert.equal((await call(f,'enquiries','POST',{...raw,idempotencyKey:crypto.randomUUID()},h)).status,422);
 }finally{f.close()}
});

test('storage failures retain cleanup information and do not make inaccessible uploads public',async()=>{
 const f=fixture();try{
  const h=await customerHeaders(f.env),put=f.env.MEDIA.put,remove=f.env.MEDIA.delete;
  f.env.MEDIA.put=async()=>{throw Error('test upload failure')};assert.equal((await upload(f,h)).status,503);assert.equal(f.sqlite.prepare('SELECT count(*) n FROM enquiry_files').get().n,0);
  f.env.MEDIA.put=put;const {file}=await(await upload(f,h)).json();
  f.env.MEDIA.delete=async()=>{throw Error('test delete failure')};assert.equal((await call(f,'account/attachments/'+file.id,'DELETE',undefined,h)).status,503);
  assert.equal(f.sqlite.prepare('SELECT state FROM enquiry_files WHERE id=?').get(file.id).state,'deleting');assert.equal((await call(f,'account/attachments/'+file.id,'GET',undefined,h)).status,404);
  f.env.MEDIA.delete=remove;await maintenance(f.env);assert.equal(f.sqlite.prepare('SELECT count(*) n FROM enquiry_files').get().n,0);
 }finally{f.close()}
});

test('legacy contact-page entry values map to the correct context without accepting arbitrary paths',async()=>{
 const f=fixture();try{
  const h=await customerHeaders(f.env);assert.equal((await call(f,'enquiries','POST',{...enquiry(),entry:'contact'},h)).status,201);
  assert.equal(JSON.parse(f.sqlite.prepare('SELECT details_json FROM enquiries').get().details_json).entry,'/contact/');
  assert.equal((await call(f,'enquiries','POST',{...enquiry(),entry:'https://other.example'},h)).status,422);
 }finally{f.close()}
});
