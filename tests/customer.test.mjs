import {test,mock} from 'node:test';
import assert from 'node:assert/strict';
import {SignJWT,generateKeyPair,exportJWK} from 'jose';
import {fixture,request,enquiry,customerHeaders} from './helpers.mjs';
import {handleAPI} from '../src/lib/api.mjs';
import {customerActor,customerEmailStart,customerEmailVerify,customerNext,customerCSRF} from '../src/lib/customer-auth.mjs';
import {googleStart,googleCallback,googleFailureRedirect} from '../src/lib/sign-in.mjs';
import {maintenance} from '../src/lib/maintenance.mjs';
const call=(env,path,method='GET',data,headers={})=>handleAPI(request('api/'+path,method,data,headers),env,path);

test('quote writes require a verified customer, customer CSRF and same origin; admin login is not customer login',async()=>{
 const f=fixture();try{
  const data=enquiry();assert.equal((await call(f.env,'enquiries','POST',data)).status,401);
  const admin=await call(f.env,'admin/login','POST',{password:f.env.LOCAL_ADMIN_PASSWORD}),adminCookie=admin.headers.get('set-cookie').split(';')[0];
  assert.equal((await call(f.env,'enquiries','POST',data,{cookie:adminCookie})).status,401);
  const h=await customerHeaders(f.env);
  assert.equal((await call(f.env,'enquiries','POST',data,{cookie:h.cookie})).status,403);
  assert.equal((await call(f.env,'enquiries','POST',data,{...h,Origin:'https://other.test'})).status,403);
  const r=await call(f.env,'enquiries','POST',{...data,customer_id:'forged-owner',quality:'qualified'},h);assert.equal(r.status,201);
  const row=f.sqlite.prepare('SELECT * FROM enquiries').get(),user=await customerActor(request('api/account/session','GET',undefined,h),f.env);
  assert.equal(row.customer_id,user.id);assert.equal(row.quality,'unreviewed');assert.equal(row.record_status,'web_recorded');
  const adminRows=await(await call(f.env,'admin/enquiries','GET',undefined,{cookie:adminCookie})).json();assert.equal(adminRows.items[0].customer_email,'customer@example.test');
  assert.equal((await call(f.env,'admin/enquiries','GET',undefined,h)).status,401);
  assert.equal((await call(f.env,'account/enquiries','GET',undefined,{cookie:adminCookie})).status,401);
 }finally{f.close()}
});

test('customers see only their own requests; references and idempotency keys cannot cross accounts',async()=>{
 const f=fixture();try{
  const a=await customerHeaders(f.env,'a@example.test'),b=await customerHeaders(f.env,'b@example.test'),payload=enquiry();
  const created=await(await call(f.env,'enquiries','POST',payload,a)).json();
  assert.equal((await call(f.env,'enquiries','POST',payload,b)).status,409);
  assert.equal((await call(f.env,'account/enquiries/'+created.reference,'GET',undefined,b)).status,404);
  assert.equal((await(await call(f.env,'account/enquiries','GET',undefined,b)).json()).total,0);
  const row=f.sqlite.prepare('SELECT * FROM enquiries').get();f.sqlite.prepare('INSERT INTO followup_logs(id,enquiry_id,actor,change_json,note) VALUES(?,?,?,?,?)').run('internal',row.id,'owner@example.test','{}','PRIVATE STAFF NOTE');
  const own=await(await call(f.env,'account/enquiries','GET',undefined,a)).json();assert.equal(own.total,1);assert.equal(own.items[0].details.notes,payload.notes);assert.equal(own.items[0].reference,created.reference);assert(!JSON.stringify(own).includes('PRIVATE STAFF NOTE'));assert(!JSON.stringify(own).includes('quality'));assert(!JSON.stringify(own).includes('customer_id'));assert(!JSON.stringify(own).includes('payload_hash'));
  assert.equal((await call(f.env,'account/enquiries/'+created.reference,'DELETE',{},a)).status,404);
  assert.equal((await call(f.env,'enquiries','POST',payload,a)).status,200);
 }finally{f.close()}
});

test('customer sessions expire, cannot reuse admin tokens and logout revokes replay',async()=>{
 const f=fixture();try{
  const h=await customerHeaders(f.env),user=await customerActor(request('account','GET',undefined,h),f.env);
  assert.equal((await call(f.env,'account/logout','POST',{}, {cookie:h.cookie})).status,403);
  assert.equal((await call(f.env,'account/logout','POST',{},h)).status,200);
  assert.equal((await call(f.env,'account/session','GET',undefined,h)).status,401);
  const fresh=await customerHeaders(f.env);f.sqlite.prepare('UPDATE customer_sessions SET expires_at=0').run();
  assert.equal((await call(f.env,'account/session','GET',undefined,fresh)).status,401);
  assert(await customerCSRF(f.env,user));
 }finally{f.close()}
});

test('customer email is open to non-admins, verified only after browser-bound single-use code',async()=>{
 const f=fixture();try{
  let sent;Object.assign(f.env,{MAIL_FROM:'hello@customsignforge.com',LOGIN_EMAIL:{send:async message=>{sent=message}}});
  const start=await call(f.env,'account/email/start','POST',{email:'Buyer@Example.test'});assert.equal(start.status,202);const challenge=(await start.json()).challenge,browser=start.headers.get('set-cookie').split(';')[0],code=sent.text.match(/code is (\d{8})/)[1];
  assert.deepEqual(sent.to,['buyer@example.test']);assert.equal(f.sqlite.prepare('SELECT count(*) n FROM customers').get().n,0);
  assert.equal((await call(f.env,'account/email/verify','POST',{challenge,code})).status,401);
  const verified=await call(f.env,'account/email/verify','POST',{challenge,code},{cookie:browser});assert.equal(verified.status,200);
  const cookies=verified.headers.getSetCookie();const customerCookie=cookies.find(c=>c.startsWith('csf_customer=')).split(';')[0];assert(!cookies.some(c=>c.startsWith('csf_admin=')));
  assert.equal((await call(f.env,'account/email/verify','POST',{challenge,code},{cookie:browser})).status,401);
  const session=await(await call(f.env,'account/session','GET',undefined,{cookie:customerCookie})).json();assert.equal(session.customer.email,'buyer@example.test');assert.equal(session.mode,'email');assert(session.csrf);
  assert.equal(f.sqlite.prepare('SELECT count(*) n FROM customers').get().n,1);
 }finally{f.close()}
});

test('customer email attempts, provider errors and challenge expiration fail closed',async()=>{
 const f=fixture();try{
  Object.assign(f.env,{MAIL_FROM:'hello@customsignforge.com',MAIL_API_KEY:'unit-test-not-a-real-key'});
  let code;const start=await customerEmailStart(request('api/account/email/start','POST',{}),f.env,{email:'buyer@example.test'},async(_env,_email,value)=>{code=value});const req=request('api/account/email/verify','POST',{}, {cookie:start.cookie.split(';')[0]});
  for(let i=0;i<6;i++)await assert.rejects(()=>customerEmailVerify(req,f.env,{challenge:start.challenge,code:code==='99999999'?'00000000':'99999999'}),/invalid or expired/);
  assert.equal(f.sqlite.prepare('SELECT attempts FROM customer_email_challenges').get().attempts,5);
  await assert.rejects(()=>customerEmailVerify(req,f.env,{challenge:start.challenge,code}),/invalid or expired/);
  await assert.rejects(()=>customerEmailStart(request('api/account/email/start','POST',{}),f.env,{email:'fail@example.test'},async()=>{throw Error('provider failure')}),/could not be sent/);
  assert.equal(f.sqlite.prepare("SELECT count(*) n FROM customer_email_challenges WHERE email='fail@example.test'").get().n,0);
  const stale=await customerEmailStart(request('api/account/email/start','POST',{}),f.env,{email:'expired@example.test'},async()=>{});f.sqlite.prepare('UPDATE customer_email_challenges SET expires_at=0 WHERE id=?').run(stale.challenge);await assert.rejects(()=>customerEmailVerify(request('api/account/email/verify','POST',{}, {cookie:stale.cookie.split(';')[0]}),f.env,{challenge:stale.challenge,code:'00000000'}),/invalid or expired/);
 }finally{f.close()}
});

test('customer email sending cannot bypass production Turnstile and has an address send limit',async()=>{
 const f=fixture();try{
  let sent=0;Object.assign(f.env,{MAIL_FROM:'hello@customsignforge.com',LOGIN_EMAIL:{send:async()=>{sent++}}});
  for(let i=0;i<3;i++)assert.equal((await call(f.env,'account/email/start','POST',{email:'limited@example.test'})).status,202);
  assert.equal((await call(f.env,'account/email/start','POST',{email:'limited@example.test'})).status,429);assert.equal(sent,3);
  f.env.APP_ENV='production';Object.assign(f.env,{TURNSTILE_SECRET:'unit-test',TURNSTILE_SITE_KEY:'unit-test'});
  const r=await handleAPI(new Request('https://customsignforge.com/api/account/email/start',{method:'POST',headers:{Origin:'https://customsignforge.com','CF-Connecting-IP':'192.0.2.30','Content-Type':'application/json'},body:JSON.stringify({email:'not-sent@example.test'})}),f.env,'account/email/start');assert.equal(r.status,422);assert.equal(sent,3);
 }finally{f.close()}
});

test('customer return addresses cannot redirect to external services or administrator paths',()=>{
 for(const value of ['https://evil.test/','//evil.test/','/\\evil.test/','/admin/','/auth/google','/account/?next=https://evil.test','/get-a-quote/\r\nLocation: evil'])assert.equal(customerNext(value),'/account/');
 assert.equal(customerNext('/get-a-quote/?style=metal-letters&utm_source=search'),'/get-a-quote/?style=metal-letters&utm_source=search');
});

test('customer Google flow verifies signature, nonce and email, separates roles and uses the existing callback',async()=>{
 const f=fixture(),pair=await generateKeyPair('RS256'),jwk={...await exportJWK(pair.publicKey),kid:'customer-unit-test',alg:'RS256',use:'sig'};let claims,nonce;
 const fetchMock=mock.method(globalThis,'fetch',async url=>{if(String(url).includes('/token'))return Response.json({id_token:await new SignJWT({...claims,nonce}).setProtectedHeader({alg:'RS256',kid:jwk.kid}).setIssuer('https://accounts.google.com').setAudience('test-google-client').setSubject(claims.sub||'google-buyer-1').setIssuedAt().setExpirationTime('5m').sign(pair.privateKey)});if(String(url).includes('/certs'))return Response.json({keys:[jwk]});throw Error('Unexpected network request')});
 try{
  Object.assign(f.env,{GOOGLE_CLIENT_ID:'test-google-client',GOOGLE_CLIENT_SECRET:'test-google-secret'});
  async function flow(customer,email,extra={}){const r=await googleStart(request((customer?'auth/customer/google':'auth/google')+'?next='+encodeURIComponent('/get-a-quote/?style=metal-letters')),f.env,{customer});const u=new URL(r.headers.get('Location')),state=u.searchParams.get('state');nonce=u.searchParams.get('nonce');claims={email,email_verified:true,...extra};assert.equal(u.searchParams.get('redirect_uri'),'http://localhost:4321/auth/google/callback');assert.equal(u.searchParams.get('code_challenge_method'),'S256');return {cookie:r.headers.get('Set-Cookie').split(';')[0],state};}
  let flowState=await flow(true,'buyer@gmail.com');let r=await googleCallback(request('auth/google/callback?state='+flowState.state+'&code=test','GET',undefined,{cookie:flowState.cookie}),f.env);assert.equal(r.headers.get('Location'),'/get-a-quote/?style=metal-letters');const cookie=r.headers.getSetCookie().find(c=>c.startsWith('csf_customer=')).split(';')[0];const actor=await customerActor(request('api/account/session','GET',undefined,{cookie}),f.env);assert.equal(actor.email,'buyer@gmail.com');assert.equal(actor.mode,'google');assert.equal((await call(f.env,'admin/session','GET',undefined,{cookie})).status,401);
  await assert.rejects(()=>googleCallback(request('auth/google/callback?state='+flowState.state+'&code=replay','GET',undefined,{cookie:flowState.cookie}),f.env),/expired/);
  flowState=await flow(false,'outsider@gmail.com');await assert.rejects(()=>googleCallback(request('auth/google/callback?state='+flowState.state+'&code=test','GET',undefined,{cookie:flowState.cookie}),f.env),/not authorised/);
  flowState=await flow(true,'unverified@gmail.com',{email_verified:false});await assert.rejects(()=>googleCallback(request('auth/google/callback?state='+flowState.state+'&code=test','GET',undefined,{cookie:flowState.cookie}),f.env),/could not be verified/);
  flowState=await flow(true,'third-party@example.test',{sub:'different-google-sub'});await assert.rejects(()=>googleCallback(request('auth/google/callback?state='+flowState.state+'&code=test','GET',undefined,{cookie:flowState.cookie}),f.env),/email verification/);
  flowState=await flow(true,'nonce@gmail.com',{sub:'nonce-test'});nonce='forged-nonce';await assert.rejects(()=>googleCallback(request('auth/google/callback?state='+flowState.state+'&code=test','GET',undefined,{cookie:flowState.cookie}),f.env),/could not be verified/);
 }finally{fetchMock.mock.restore();f.close()}
});

test('scheduled cleanup removes expired customer authentication data, retaining accounts and enquiries',async()=>{
 const f=fixture();try{const h=await customerHeaders(f.env);await call(f.env,'enquiries','POST',enquiry(),h);f.sqlite.exec("UPDATE customer_sessions SET expires_at=0; INSERT INTO customer_email_challenges VALUES('expired','buyer@example.test','hash','browser',0,0)");await maintenance(f.env);assert.equal(f.sqlite.prepare('SELECT count(*) n FROM customer_sessions').get().n,0);assert.equal(f.sqlite.prepare('SELECT count(*) n FROM customer_email_challenges').get().n,0);assert.equal(f.sqlite.prepare('SELECT count(*) n FROM customers').get().n,1);assert.equal(f.sqlite.prepare('SELECT count(*) n FROM enquiries').get().n,1);}finally{f.close()}
});

test('cancelled or expired customer Google sign-in returns to customer login with a safe quote return path',async()=>{
 const f=fixture();try{Object.assign(f.env,{GOOGLE_CLIENT_ID:'test-client',GOOGLE_CLIENT_SECRET:'test-secret'});const next='/get-a-quote/?style=metal-letters';const start=await googleStart(request('auth/customer/google?next='+encodeURIComponent(next)),f.env,{customer:true}),state=new URL(start.headers.get('Location')).searchParams.get('state'),cookie=start.headers.get('Set-Cookie').split(';')[0];
  const location=new URL(await googleFailureRedirect(request('auth/google/callback?error=access_denied&state='+state,'GET',undefined,{cookie}),f.env),'http://localhost:4321');assert.equal(location.pathname,'/sign-in/');assert.equal(location.searchParams.get('next'),next);
  assert((await googleFailureRedirect(request('auth/google/callback?state=customer.expired'),f.env)).startsWith('/sign-in/'));
  assert.equal(await googleFailureRedirect(request('auth/google/callback?state=admin-attempt','GET',undefined,{cookie}),f.env),'/admin/login/?error=google');
 }finally{f.close()}
});
