import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fixture,request,enquiry,customerHeaders} from './helpers.mjs';
import {handleAPI} from '../src/lib/api.mjs';
import {issueSession,csrfToken,actor} from '../src/lib/auth.mjs';
const call=(f,path,method='GET',body,headers={})=>handleAPI(request('api/'+path,method,body,headers),f.env,path.split('?')[0]);
async function admin(f){const cookie='csf_admin='+await issueSession(f.env,'owner@example.test');return {cookie,'X-CSRF-Token':await csrfToken(f.env,await actor(request('admin/','GET',undefined,{cookie}),f.env))}}
function seed(f,id,quality='unreviewed',record='web_recorded',stage='needs_details'){f.sqlite.prepare('INSERT INTO enquiries(id,reference,idempotency_key,payload_hash,details_json,quality,record_status,business_stage,created_at) VALUES(?,?,?,?,?,?,?,?,?)').run(id,'CSF-LABEL-'+id,id,'test',JSON.stringify(enquiry()),quality,record,stage,'2030-01-01 12:00:00')}

test('manual client labels can be combined, queried and cleared without overwriting project facts or sales amounts',async()=>{
 const f=fixture();try{
  const h=await admin(f);seed(f,'a');seed(f,'b');
  const initial=f.sqlite.prepare("SELECT * FROM enquiries WHERE id='a'").get();
  const path='admin/enquiries/a/labels';
  assert.equal((await call(f,path,'PATCH',{version:1,labels:['good','contacted','ordered']},h)).status,200);
  const row=f.sqlite.prepare("SELECT * FROM enquiries WHERE id='a'").get();
  assert.equal(row.details_json,initial.details_json);assert.equal(row.business_stage,'needs_details');assert.equal(row.record_status,'web_recorded');assert.equal(row.amount_minor,null);
  let report=await(await call(f,'admin/enquiries?country=United%20Kingdom&label=good&from=2030-01-01&to=2030-01-01','GET',undefined,h)).json();assert.equal(report.total,1);assert.deepEqual(report.items[0].labels,['good','contacted','ordered']);assert(!('labels_json' in report.items[0]));
  const detail=await(await call(f,'admin/enquiries/a','GET',undefined,h)).json();assert.deepEqual(detail.labels,['good','contacted','ordered']);assert.equal(detail.logs[0].change.action,'labels_updated');
  assert.equal((await call(f,path,'PATCH',{version:2,labels:[]},h)).status,200);
  report=await(await call(f,'admin/enquiries?label=good','GET',undefined,h)).json();assert.equal(report.total,0);
  report=await(await call(f,'admin/enquiries?label=unmarked','GET',undefined,h)).json();assert.equal(report.total,2);
 }finally{f.close()}
});

test('existing follow-up states initialise labels; an explicit clear remains cleared',async()=>{
 const f=fixture();try{
  const h=await admin(f);seed(f,'a','qualified');seed(f,'b','unreviewed','duplicate_or_spam');seed(f,'c','unreviewed','chat_confirmed','won');
  for(const [label,id] of [['good','a'],['bad','b'],['contacted','c'],['ordered','c']]){const r=await(await call(f,'admin/enquiries?label='+label,'GET',undefined,h)).json();assert.equal(r.total,1);assert.equal(r.items[0].id,id)}
  assert.equal((await call(f,'admin/enquiries/a/labels','PATCH',{version:1,labels:[]},h)).status,200);
  assert.equal((await(await call(f,'admin/enquiries?label=good','GET',undefined,h)).json()).total,0);
 }finally{f.close()}
});

test('labels require administrator CSRF/current version, reject conflicting values and stay private from customers',async()=>{
 const f=fixture();try{
  const h=await admin(f),customer=await customerHeaders(f.env),path='admin/enquiries/a/labels';seed(f,'a');
  const data={version:1,labels:['good']};
  assert.equal((await call(f,path,'PATCH',data)).status,401);assert.equal((await call(f,path,'PATCH',data,customer)).status,401);assert.equal((await call(f,path,'PATCH',data,{cookie:h.cookie})).status,403);assert.equal((await call(f,path,'PATCH',data,{...h,Origin:'https://other.test'})).status,403);
  for(const labels of [['good','bad'],['unknown'],['good','good'],null])assert.equal((await call(f,path,'PATCH',{version:1,labels},h)).status,422);
  assert.equal((await call(f,path,'PATCH',{...data,version:99},h)).status,409);assert.equal((await call(f,'admin/enquiries?label=unknown','GET',undefined,h)).status,422);
  assert.equal((await call(f,path,'PATCH',data,h)).status,200);
  const body={...enquiry(),idempotencyKey:crypto.randomUUID()};assert.equal((await call(f,'enquiries','POST',body,customer)).status,201);
  const id=f.sqlite.prepare('SELECT id FROM enquiries WHERE customer_id IS NOT NULL').get().id;
  assert.equal((await call(f,'admin/enquiries/'+id+'/labels','PATCH',{version:1,labels:['bad']},h)).status,200);
  const own=await(await call(f,'account/enquiries','GET',undefined,customer)).json();assert(!JSON.stringify(own).includes('labels'));assert(!JSON.stringify(own).includes('低质量客户'));
  assert.equal(f.sqlite.prepare("SELECT count(*) n FROM followup_logs WHERE enquiry_id='a'").get().n,1);
 }finally{f.close()}
});
