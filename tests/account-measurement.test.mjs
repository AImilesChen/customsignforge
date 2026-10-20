import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fixture,request,customerHeaders,enquiry} from './helpers.mjs';
import {recordMeasurement,measurementReport} from '../src/lib/measurement.mjs';
import {handleAPI} from '../src/lib/api.mjs';
import {enquiryContact} from '../src/lib/enquiry-contact.mjs';
import {issueSession} from '../src/lib/auth.mjs';
import {CONSENT_VERSION} from '../src/lib/analytics-consent.mjs';

const event=(name='whatsapp_click',source='facebook')=>({id:crypto.randomUUID(),name,page:'/',consent:true,consentVersion:CONSENT_VERSION,context:{currentSource:{utm_source:source}}});
const record=(env,headers,data)=>recordMeasurement(request('api/measurement','POST',data,headers),env,data);

test('repeated actions across sessions/pages count once per verified account and action within the report range',async()=>{
 const f=fixture();try{
  const a=await customerHeaders(f.env,'a@example.test'),a2=await customerHeaders(f.env,'a@example.test'),b=await customerHeaders(f.env,'b@example.test');
  for(let i=0;i<6;i++)await record(f.env,i%2?a:a2,event());
  await record(f.env,a,{...event(),page:'/products/'});
  await record(f.env,b,event('whatsapp_click','google'));
  await record(f.env,a,event('page_view'));await record(f.env,a2,event('page_view','google'));
  const rows=f.sqlite.prepare('SELECT * FROM measurement_events').all();
  assert.equal(new Set(rows.map(r=>r.account_key)).size,2);
  assert(!JSON.stringify(rows).includes('a@example.test'));assert(!JSON.stringify(rows).includes('csf_customer'));
  f.sqlite.prepare("UPDATE measurement_events SET created_at='2030-01-01 10:00:00'").run();
  f.sqlite.prepare("UPDATE measurement_events SET created_at='2030-01-02 10:00:00' WHERE id IN (?,?)").run(rows[6].id,rows[7].id);
  f.sqlite.prepare("INSERT INTO measurement_events(id,name,page,context_json,created_at) VALUES('legacy','whatsapp_click','/','{}','2030-01-01 12:00:00')").run();
  let r=await measurementReport(f.env,new URLSearchParams());
  assert.equal(r.countingMode,'unique_accounts');assert.equal(r.events.whatsapp_click,2);assert.equal(r.events.page_view,1);assert.equal(r.legacyEventsExcluded,1);
  r=await measurementReport(f.env,new URLSearchParams({from:'2030-01-02',to:'2030-01-02'}));assert.equal(r.events.whatsapp_click,2);assert.equal(r.events.page_view,0);
  r=await measurementReport(f.env,new URLSearchParams({source:'facebook'}));assert.equal(r.events.whatsapp_click,1);assert.equal(r.sources.find(s=>s.name==='whatsapp_click').count,1);
  r=await measurementReport(f.env,new URLSearchParams({source:'google'}));assert.equal(r.events.whatsapp_click,1);
 }finally{f.close()}
});

test('anonymous, administrators, expired sessions, forged identity and outdated consent never contribute account metrics',async()=>{
 const f=fixture();try{
  const ordinary=await customerHeaders(f.env),owner=await customerHeaders(f.env,'owner@example.test');
  for(const h of [{},owner,{cookie:'csf_customer=forged'}])assert.equal((await record(f.env,h,event())).recorded,false);
  const admin=await issueSession(f.env,'owner@example.test');
  assert.equal((await record(f.env,{...ordinary,cookie:ordinary.cookie+'; csf_admin='+admin},event())).recorded,false);
  assert.equal((await record(f.env,ordinary,{...event(),consentVersion:2})).recorded,false);
  await assert.rejects(record(f.env,ordinary,{...event(),account_key:'fake-owner'}),e=>e.status===422);
  f.sqlite.prepare('UPDATE customer_sessions SET expires_at=0').run();
  assert.equal((await record(f.env,ordinary,event())).recorded,false);
  assert.equal(f.sqlite.prepare('SELECT count(*) n FROM measurement_events').get().n,0);
 }finally{f.close()}
});

test('administrator list, search and detail expose submitted contact identity without leaking it to other customers',async()=>{
 const f=fixture();try{
  const customer=await customerHeaders(f.env,'verified@example.test');
  const data={...enquiry(),contactName:'Taylor Lee',businessName:'QA Sample Store',businessWebsite:'https://example.test',phone:'+12025550123'};
  const created=await handleAPI(request('api/enquiries','POST',data,customer),f.env,'enquiries');assert.equal(created.status,201);
  const id=f.sqlite.prepare('SELECT id FROM enquiries').get().id;
  const admin={cookie:'csf_admin='+await issueSession(f.env,'owner@example.test')};
  for(const q of ['Taylor','sample STORE','verified@example.test','12025550123']){
   const r=await handleAPI(request('api/admin/enquiries?q='+encodeURIComponent(q),'GET',undefined,admin),f.env,'admin/enquiries');
   const list=await r.json();assert.equal(list.total,1,q);assert.equal(enquiryContact(list.items[0]).email,'verified@example.test');assert.equal(enquiryContact(list.items[0]).company,'QA Sample Store');
  }
  const detail=await(await handleAPI(request('api/admin/enquiries/'+id,'GET',undefined,admin),f.env,'admin/enquiries/'+id)).json();
  assert.equal(detail.details.contactName,'Taylor Lee');assert.equal(detail.details.phone,'+12025550123');assert.equal(detail.details.businessWebsite,'https://example.test');
  assert.equal((await handleAPI(request('api/admin/enquiries/'+id,'GET',undefined,customer),f.env,'admin/enquiries/'+id)).status,401);
  assert.equal(enquiryContact({details:{},customer_email:'legacy@example.test'}).email,'legacy@example.test');
  assert.equal(enquiryContact({details:{phone:'javascript:alert(1)'}}).phoneURL,null);
 }finally{f.close()}
});
