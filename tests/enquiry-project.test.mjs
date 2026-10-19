import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fixture,request,enquiry,customerHeaders} from './helpers.mjs';
import {handleAPI} from '../src/lib/api.mjs';
import {fingerprint} from '../src/lib/db.mjs';
import {validateEnquiry} from '../src/lib/validation.mjs';
const call=(f,path,method='GET',body,headers={})=>handleAPI(request('api/'+path,method,body,headers),f.env,path.split('?')[0]);
async function admin(f){const r=await call(f,'admin/login','POST',{password:f.env.LOCAL_ADMIN_PASSWORD}),cookie=r.headers.get('set-cookie').split(';')[0];return {cookie,'X-CSRF-Token':(await(await call(f,'admin/session','GET',undefined,{cookie})).json()).csrf}}

test('new enquiries enforce contact name, role, quantity, sizing decision and delivery window on the server',async()=>{
 const f=fixture();try{const h=await customerHeaders(f.env);
  for(const key of ['contactName','role','quantity','dimensionsStatus','deliveryWindow']){
   const data=enquiry();delete data[key];const r=await call(f,'enquiries','POST',data,h);assert.equal(r.status,422,key);assert((await r.json()).fields[key],key);
  }
  for(const bad of [{contactName:' '},{quantity:'0'},{quantity:'1.5'},{quantity:'100001'},{quantity:{}},{dimensionsStatus:'approximate',width:'100',height:'',dimensionUnit:'cm'},{dimensionsStatus:'approximate',width:'-1',height:'100',dimensionUnit:'cm'},{dimensionsStatus:'approximate',width:'100',height:'100',dimensionUnit:'yards'},{deliveryWindow:'tomorrow'},{targetDate:'2027-02-30'},{businessWebsite:'javascript:alert(1)'},{businessWebsite:'https://user:pass@example.com'},{budget:'x'.repeat(81)}])assert.equal((await call(f,'enquiries','POST',{...enquiry(),...bad},h)).status,422,JSON.stringify(bad));
  assert.equal(f.sqlite.prepare('SELECT count(*) n FROM enquiries').get().n,0);
 }finally{f.close()}
});

test('unknown dimensions, quantity and budget do not exclude customers; richer details survive storage, history and WhatsApp summary',async()=>{
 const f=fixture();try{const h=await customerHeaders(f.env),a=await admin(f);
  let r=await call(f,'enquiries','POST',{...enquiry(),quantity:'not-sure',dimensionsStatus:'help',budget:''},h);assert.equal(r.status,201);
  const data={...enquiry(),role:'installer',contactName:'Test Installer',businessName:'Local QA Signs',businessWebsite:'https://example.test/project',quantity:'3',dimensionsStatus:'approximate',width:'240',height:'80',dimensionUnit:'cm',environment:'outdoor',deliveryWindow:'one-three-months',targetDate:'2027-01-15',budget:'USD 2,000 excluding shipping'};
  r=await call(f,'enquiries','POST',data,h);assert.equal(r.status,201);const result=await r.json();assert(result.message.includes('240'));assert(result.message.includes('USD 2,000'));assert(result.message.includes('Test Installer'));assert(!result.message.includes(data.notes));
  const history=await(await call(f,'account/enquiries/'+result.reference,'GET',undefined,h)).json();
  for(const key of ['contactName','role','businessName','businessWebsite','quantity','width','height','dimensionUnit','environment','deliveryWindow','targetDate','budget'])assert.equal(history.items[0].details[key],data[key],key);
  const rows=await(await call(f,'admin/enquiries?role=installer&projectStage=Exploring%20an%20idea&deliveryWindow=one-three-months&quality=unreviewed','GET',undefined,a)).json();assert.equal(rows.total,1);assert.equal(rows.items[0].reference,result.reference);assert.equal(rows.items[0].quality,'unreviewed');assert.equal(rows.items[0].business_stage,'needs_details');
  assert.equal((await call(f,'admin/enquiries?role=invalid','GET',undefined,a)).status,422);
  assert.equal((await call(f,'admin/enquiries?role=installer','GET',undefined,h)).status,401);
  assert.equal((await call(f,'enquiries','POST',data,h)).status,200);
  assert.equal((await call(f,'enquiries','POST',{...data,quantity:'4'},h)).status,409);
 }finally{f.close()}
});

test('existing saved enquiries can be replayed without newly required fields; new legacy-shaped enquiries are rejected',async()=>{
 const f=fixture();try{const h=await customerHeaders(f.env),customer=f.sqlite.prepare('SELECT id,email FROM customers').get(),raw=enquiry();for(const key of ['contactName','role','quantity','dimensionsStatus','deliveryWindow'])delete raw[key];
  const submitted=validateEnquiry(raw,['backlit-letters']),details={...submitted,contactEmail:customer.email,emailVerified:true,phoneVerified:false};
  f.sqlite.prepare('INSERT INTO enquiries(id,reference,idempotency_key,payload_hash,details_json,customer_id) VALUES(?,?,?,?,?,?)').run(crypto.randomUUID(),'CSF-BBBBBBBBBBBBBBBBBBBB',raw.idempotencyKey,await fingerprint(details),JSON.stringify(details),customer.id);
  assert.equal((await call(f,'enquiries','POST',raw,h)).status,200);
  assert.equal((await call(f,'enquiries','POST',{...raw,idempotencyKey:crypto.randomUUID()},h)).status,422);
 }finally{f.close()}
});
