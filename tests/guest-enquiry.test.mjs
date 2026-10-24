import test from 'node:test';
import assert from 'node:assert/strict';
import {handleAPI} from '../src/lib/api.mjs';
import {fixture,request,enquiry,customerHeaders} from './helpers.mjs';

test('guest can submit the full enquiry, replay safely, and claim only through the matching verified email',async()=>{
 const {env,close}=fixture();try{
  const session=await handleAPI(request('api/guest/session'),env,'guest/session');assert.equal(session.status,200);
  const guestCookie=session.headers.get('set-cookie').split(';')[0],{csrf}=await session.json();
  const payload={...enquiry(),contactEmail:'buyer@example.test'};
  const send=()=>handleAPI(request('api/enquiries','POST',payload,{Cookie:guestCookie,'X-CSRF-Token':csrf}),env,'enquiries');
  const response=await send();assert.equal(response.status,201);const saved=await response.json();
  assert.match(saved.reference,/^CSF-[A-F0-9]{20}$/);assert.match(saved.claimCode,/^[A-F0-9]{32}$/);
  assert.equal((await send()).status,200);
  const other=await handleAPI(request('api/guest/session'),env,'guest/session'),otherCookie=other.headers.get('set-cookie').split(';')[0];
  assert.equal((await handleAPI(request('api/guest/enquiries/'+saved.reference,'GET',undefined,{Cookie:otherCookie}),env,'guest/enquiries/'+saved.reference)).status,404);
  const owner=await customerHeaders(env,'buyer@example.test'),wrong=await customerHeaders(env,'wrong@example.test');
  const claim=(headers,code)=>handleAPI(request('api/account/claim','POST',{reference:saved.reference,claimCode:code},headers),env,'account/claim');
  assert.equal((await claim(wrong,saved.claimCode)).status,404);
  assert.equal((await claim(owner,'A'.repeat(32))).status,404);
  assert.equal((await claim(owner,saved.claimCode)).status,200);
  const list=await handleAPI(request('api/account/enquiries','GET',undefined,owner),env,'account/enquiries');
  assert.equal((await list.json()).items[0].reference,saved.reference);
  assert.equal((await claim(owner,saved.claimCode)).status,404);
  assert.equal((await handleAPI(request('api/guest/enquiries/'+saved.reference,'GET',undefined,{Cookie:guestCookie}),env,'guest/enquiries/'+saved.reference)).status,404);
 }finally{close()}
});

test('guest enquiry requires a real contact email and a guest CSRF token',async()=>{
 const {env,close}=fixture();try{
  const session=await handleAPI(request('api/guest/session'),env,'guest/session'),guestCookie=session.headers.get('set-cookie').split(';')[0],{csrf}=await session.json();
  assert.equal((await handleAPI(request('api/enquiries','POST',{...enquiry(),contactEmail:'invalid'},{Cookie:guestCookie,'X-CSRF-Token':csrf}),env,'enquiries')).status,422);
  assert.equal((await handleAPI(request('api/enquiries','POST',{...enquiry(),contactEmail:'buyer@example.test'},{Cookie:guestCookie}),env,'enquiries')).status,403);
  assert.equal((await handleAPI(request('api/enquiries','POST',{...enquiry(),contactEmail:'buyer@example.test'}),env,'enquiries')).status,401);
 }finally{close()}
});

test('guest artwork stays private, attaches to the saved enquiry, and moves with a verified claim',async()=>{
 const {env,sqlite,close}=fixture();try{
  const session=await handleAPI(request('api/guest/session'),env,'guest/session'),guestCookie=session.headers.get('set-cookie').split(';')[0],{csrf}=await session.json();
  const fileBytes=new TextEncoder().encode('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF');
  const upload=await handleAPI(new Request('http://localhost:4321/api/guest/attachments',{method:'POST',headers:{Origin:'http://localhost:4321',Cookie:guestCookie,'Content-Type':'application/octet-stream','X-CSRF-Token':csrf,'X-File-Name':'artwork.pdf'},body:fileBytes}),env,'guest/attachments');
  assert.equal(upload.status,201);const {file}=await upload.json();
  assert.equal((await handleAPI(request('api/guest/attachments/'+file.id,'GET',undefined,{Cookie:guestCookie}),env,'guest/attachments/'+file.id)).status,200);
  assert.equal((await handleAPI(request('api/account/attachments/'+file.id),env,'account/attachments/'+file.id)).status,401);
  const sent=await handleAPI(request('api/enquiries','POST',{...enquiry(),contactEmail:'buyer@example.test',drawings:'ready',attachments:[file.id]},{Cookie:guestCookie,'X-CSRF-Token':csrf}),env,'enquiries');
  assert.equal(sent.status,201);const saved=await sent.json();assert.equal(saved.files[0].id,file.id);
  const customer=await customerHeaders(env,'buyer@example.test');
  const claimed=await handleAPI(request('api/account/claim','POST',{reference:saved.reference,claimCode:saved.claimCode},customer),env,'account/claim');assert.equal(claimed.status,200);
  assert.equal((await handleAPI(request('api/account/attachments/'+file.id,'GET',undefined,customer),env,'account/attachments/'+file.id)).status,200);
  assert.equal((await handleAPI(request('api/guest/attachments/'+file.id,'GET',undefined,{Cookie:guestCookie}),env,'guest/attachments/'+file.id)).status,404);
  assert.equal(sqlite.prepare('SELECT customer_id IS NOT NULL AS claimed,guest_id FROM enquiry_files WHERE id=?').get(file.id).claimed,1);
 }finally{close()}
});
