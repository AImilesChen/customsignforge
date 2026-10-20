import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fixture,request,enquiry,customerHeaders} from './helpers.mjs';
import {handleAPI} from '../src/lib/api.mjs';
import {issueSession,csrfToken,actor} from '../src/lib/auth.mjs';

const call=(f,path,method='GET',body,headers={})=>handleAPI(request('api/'+path,method,body,headers),f.env,path.split('?')[0]);
async function admin(f){const cookie='csf_admin='+await issueSession(f.env,'owner@example.test');const user=await actor(request('admin/', 'GET',undefined,{cookie}),f.env);return {cookie,'X-CSRF-Token':await csrfToken(f.env,user)}}
function seed(f,n=1){for(let i=1;i<=n;i++)f.sqlite.prepare('INSERT INTO enquiries(id,reference,idempotency_key,payload_hash,details_json,created_at) VALUES(?,?,?,?,?,?)').run('row-'+i,'CSF-INBOX-'+String(i).padStart(3,'0'),'inbox-'+i,'test',JSON.stringify({...enquiry(),contactName:'Buyer '+i,country:i%2?'United States':'Singapore'}),'2030-01-'+String(Math.ceil(i/2)).padStart(2,'0')+' '+(i%2?'09':'10')+':00:00')}

test('country and date filters combine with search; sorting and bounded pagination remain stable',async()=>{
 const f=fixture();try{
  const h=await admin(f);seed(f,32);
  const get=async q=>(await call(f,'admin/enquiries?'+q,'GET',undefined,h)).json();
  let r=await get('country=Singapore&from=2030-01-03&to=2030-01-05&sort=oldest&limit=10');
  assert.equal(r.total,3);assert.deepEqual(r.items.map(i=>i.id),['row-6','row-8','row-10']);assert.equal(r.countries.find(c=>c.country==='United States').count,3);
  r=await get('country=Singapore&q=Buyer%208&from=2030-01-03&to=2030-01-05');assert.equal(r.total,1);assert.equal(r.items[0].id,'row-8');
  r=await get('limit=10&sort=oldest&offset=10');assert.equal(r.total,32);assert.equal(r.offset,10);assert.equal(r.items[0].id,'row-11');assert.equal(r.items.length,10);
  r=await get('limit=10&offset=99999');assert.equal(r.offset,30);assert.equal(r.items.length,2);
  r=await get('country=Canada');assert.equal(r.total,0);assert.equal(r.offset,0);
  for(const q of ['limit=1000','sort=bad','view=bad','from=not-a-date'])assert.equal((await call(f,'admin/enquiries?'+q,'GET',undefined,h)).status,422);
 }finally{f.close()}
});

test('recycle and restore preserve contact data, files, ownership and history; stale or unauthorised writes fail',async()=>{
 const f=fixture();try{
  const owner=await customerHeaders(f.env),a=await admin(f),pdf=new TextEncoder().encode('%PDF-1.7\n%%EOF');
  const upload=await handleAPI(new Request('http://localhost:4321/api/account/attachments',{method:'POST',headers:{Origin:'http://localhost:4321',...owner,'Content-Type':'application/octet-stream','X-File-Name':'inbox-test.pdf'},body:pdf}),f.env,'account/attachments');
  assert.equal(upload.status,201);const {file}=await upload.json();
  assert.equal((await call(f,'enquiries','POST',{...enquiry(),drawings:'ready',attachments:[file.id]},owner)).status,201);
  const row=f.sqlite.prepare('SELECT * FROM enquiries').get(),path='admin/enquiries/'+row.id+'/archive',body={archived:true,version:row.version};
  assert.equal((await call(f,path,'PATCH',body)).status,401);assert.equal((await call(f,path,'PATCH',body,owner)).status,401);
  assert.equal((await call(f,path,'PATCH',body,{cookie:a.cookie})).status,403);
  assert.equal((await call(f,path,'PATCH',body,{...a,Origin:'https://other.test'})).status,403);
  assert.equal((await call(f,path,'PATCH',{...body,version:99},a)).status,409);
  assert.equal((await call(f,path,'PATCH',body,a)).status,200);
  assert.equal(f.sqlite.prepare('SELECT details_json FROM enquiries').get().details_json,row.details_json);
  assert.equal((await(await call(f,'admin/enquiries','GET',undefined,a)).json()).total,0);
  assert.equal((await(await call(f,'admin/enquiries?view=trash','GET',undefined,a)).json()).total,1);
  assert.equal((await(await call(f,'admin/measurement','GET',undefined,a)).json()).leads.total,0);
  assert.equal((await call(f,'account/attachments/'+file.id,'GET',undefined,owner)).status,200);
  assert.equal((await call(f,'admin/attachments/'+file.id,'GET',undefined,a)).status,200);
  assert.equal((await(await call(f,'account/enquiries','GET',undefined,owner)).json()).total,1);
  assert.equal((await call(f,path,'PATCH',{archived:true,version:2},a)).status,200);assert.equal(f.sqlite.prepare('SELECT count(*) n FROM followup_logs').get().n,1);
  assert.equal((await call(f,path,'PATCH',{archived:false,version:2},a)).status,200);
  assert.equal((await(await call(f,'admin/enquiries','GET',undefined,a)).json()).total,1);
  assert.equal((await(await call(f,'admin/measurement','GET',undefined,a)).json()).leads.total,1);
  assert.equal(f.sqlite.prepare('SELECT count(*) n FROM followup_logs').get().n,2);
  assert.equal(f.sqlite.prepare('SELECT count(*) n FROM enquiry_files').get().n,1);
 }finally{f.close()}
});

test('selected-record operations report stale records without modifying unrelated records',async()=>{
 const f=fixture();try{
  const h=await admin(f);seed(f,3);f.sqlite.prepare("UPDATE enquiries SET version=2 WHERE id='row-2'").run();
  const results=await Promise.all([1,2,3].map(i=>call(f,'admin/enquiries/row-'+i+'/archive','PATCH',{archived:true,version:1},h)));
  assert.deepEqual(results.map(r=>r.status),[200,409,200]);
  assert.equal(f.sqlite.prepare("SELECT archived_at FROM enquiries WHERE id='row-2'").get().archived_at,null);
  assert.equal((await(await call(f,'admin/enquiries?view=trash','GET',undefined,h)).json()).total,2);
  assert.equal((await call(f,'admin/enquiries/missing/archive','PATCH',{archived:true,version:1},h)).status,404);
 }finally{f.close()}
});
