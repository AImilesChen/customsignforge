import {validLocale} from './locale.mjs';
import {SignJWT,jwtVerify} from 'jose';
import {HttpError,text} from './validation.mjs';
import {key,cookie,getCookie,sameOrigin} from './auth.mjs';
import {fingerprint,rateLimit} from './db.mjs';
import {verifyTurnstile} from './security.mjs';
export {customerNext} from './customer-navigation.mjs';
export const CUSTOMER_SESSION_SECONDS=7*24*3600;
const now=()=>Math.floor(Date.now()/1000);
export function customerEmail(value){const email=text(value,150,true).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new HttpError(422,'Enter a valid email address.');return email;}
export async function verifiedCustomer(env,email,googleSub=null){
 email=customerEmail(email);
 if(googleSub){const linked=await env.DB.prepare('SELECT id,email,google_sub FROM customers WHERE google_sub=?').bind(googleSub).first();if(linked){const collision=await env.DB.prepare('SELECT id FROM customers WHERE email=? COLLATE NOCASE AND id<>?').bind(email,linked.id).first();if(collision)throw new HttpError(403,'Use email verification to sign in to this account.');await env.DB.prepare('UPDATE customers SET email=?,last_login_at=CURRENT_TIMESTAMP WHERE id=?').bind(email,linked.id).run();return {...linked,email};}}
 await env.DB.prepare('INSERT INTO customers(id,email,google_sub) VALUES(?,?,?) ON CONFLICT(email) DO NOTHING').bind(crypto.randomUUID(),email,googleSub).run();
 let customer=await env.DB.prepare('SELECT id,email,google_sub FROM customers WHERE email=? COLLATE NOCASE').bind(email).first();
 if(googleSub){if(customer.google_sub&&customer.google_sub!==googleSub)throw new HttpError(403,'Use email verification to sign in to this account.');await env.DB.prepare('UPDATE customers SET google_sub=?,last_login_at=CURRENT_TIMESTAMP WHERE id=? AND (google_sub IS NULL OR google_sub=?)').bind(googleSub,customer.id,googleSub).run();}
 else await env.DB.prepare('UPDATE customers SET last_login_at=CURRENT_TIMESTAMP WHERE id=?').bind(customer.id).run();
 return customer;
}
export async function issueCustomerSession(env,customer,mode){
 const id=crypto.randomUUID(),expires=now()+CUSTOMER_SESSION_SECONDS;
 await env.DB.prepare('DELETE FROM customer_sessions WHERE expires_at<?').bind(now()).run();
 await env.DB.prepare('INSERT INTO customer_sessions(id,customer_id,expires_at) VALUES(?,?,?)').bind(id,customer.id,expires).run();
 return new SignJWT({role:'customer',mode}).setProtectedHeader({alg:'HS256'}).setSubject(customer.id).setJti(id).setIssuer('csf').setAudience('csf-customer').setIssuedAt().setExpirationTime(expires).sign(key(env));
}
export async function customerActor(request,env){
 try{const {payload}=await jwtVerify(getCookie(request,'csf_customer')||'',key(env),{issuer:'csf',audience:'csf-customer',algorithms:['HS256']});
  if(payload.role==='customer'&&['email','google'].includes(payload.mode)){
   const row=await env.DB.prepare('SELECT c.id,c.email,s.id sessionId FROM customer_sessions s JOIN customers c ON c.id=s.customer_id WHERE s.id=? AND c.id=? AND s.expires_at>?').bind(payload.jti,payload.sub,now()).first();
   if(row)return {...row,mode:payload.mode};
  }
 }catch{}
 throw new HttpError(401,'Please sign in to submit or view your sign enquiries.');
}
export async function customerCSRF(env,user){return new SignJWT({purpose:'customer-write'}).setProtectedHeader({alg:'HS256'}).setSubject(user.id).setJti(user.sessionId).setIssuer('csf').setAudience('customer-write').setIssuedAt().setExpirationTime('2h').sign(key(env));}
export async function verifyCustomerCSRF(request,env,user){sameOrigin(request);try{const {payload}=await jwtVerify(request.headers.get('X-CSRF-Token')||'',key(env),{issuer:'csf',audience:'customer-write',subject:user.id,algorithms:['HS256']});if(payload.purpose!=='customer-write'||payload.jti!==user.sessionId)throw 0;}catch{throw new HttpError(403,'Refresh this page before submitting again.');}}
export function customerMailConfigured(env){return !!(env.MAIL_FROM&&(typeof env.LOGIN_EMAIL?.send==='function'||env.MAIL_API_KEY));}
export async function customerEmailStart(request,env,raw,send=sendCustomerEmail){
 sameOrigin(request);key(env);if(!customerMailConfigured(env))throw new HttpError(503,'Email sign-in is temporarily unavailable. Please use Google or try again later.');
 const email=customerEmail(raw.email);await rateLimit(env,request,'customer-email-ip',5);await rateLimit(env,request,'customer-email-address',3,await fingerprint(email));await rateLimit(env,request,'customer-email-global',100,'customer-email-global');
 await verifyTurnstile(env,request,raw.turnstileToken,'customer-login');
 const id=crypto.randomUUID(),browser=crypto.randomUUID();const random=new Uint32Array(1);do{crypto.getRandomValues(random)}while(random[0]>=4200000000);const code=String(random[0]%100000000).padStart(8,'0');
 await env.DB.prepare('DELETE FROM customer_email_challenges WHERE expires_at<?').bind(now()).run();
 await env.DB.prepare('INSERT INTO customer_email_challenges(id,email,code_hash,browser_hash,expires_at) VALUES(?,?,?,?,?)').bind(id,email,await fingerprint([env.SESSION_SECRET,'customer',id,code]),await fingerprint(browser),now()+600).run();
 try{await send(env,email,code,validLocale(raw.locale)?raw.locale:'en');}catch{await env.DB.prepare('DELETE FROM customer_email_challenges WHERE id=?').bind(id).run();throw new HttpError(503,'The sign-in email could not be sent. Please try again later.');}
 return {challenge:id,cookie:cookie(request,'csf_customer_email',browser,600)};
}
export async function customerEmailVerify(request,env,raw){
 sameOrigin(request);await rateLimit(env,request,'customer-email-verify',20);const id=text(raw.challenge,50,true),code=text(raw.code,8,true);if(!/^\d{8}$/.test(code))throw new HttpError(401,'The code is invalid or expired.');
 const row=await env.DB.prepare('UPDATE customer_email_challenges SET attempts=attempts+1 WHERE id=? AND expires_at>? AND attempts<5 RETURNING *').bind(id,now()).first();
 if(!row||row.code_hash!==await fingerprint([env.SESSION_SECRET,'customer',id,code])||row.browser_hash!==await fingerprint(getCookie(request,'csf_customer_email')||''))throw new HttpError(401,'The code is invalid or expired.');
 const used=await env.DB.prepare('DELETE FROM customer_email_challenges WHERE id=? RETURNING id').bind(id).first();if(!used)throw new HttpError(401,'The code has already been used.');
 const customer=await verifiedCustomer(env,row.email);return issueCustomerSession(env,customer,'email');
}
async function sendCustomerEmail(env,email,code,locale='en'){
 const message={from:env.MAIL_FROM,to:[email],subject:locale==='ms'?'Kod log masuk Custom Sign Forge anda':locale==='zh'?'您的 Custom Sign Forge 登录验证码':'Your Custom Sign Forge sign-in code',text:locale==='ms'?`Kod log masuk pelanggan Custom Sign Forge anda ialah ${code}. Kod sah selama 10 minit. Masukkan hanya di customsignforge.com. Abaikan e-mel ini jika anda tidak memintanya.`:locale==='zh'?`您的 Custom Sign Forge 客户登录验证码是 ${code}，10 分钟内有效。请仅在 customsignforge.com 输入。如非本人请求，请忽略此邮件。`:`Your Custom Sign Forge customer sign-in code is ${code}. It expires in 10 minutes. Enter it only on customsignforge.com. If you did not request this code, ignore this email.`};
 if(typeof env.LOGIN_EMAIL?.send==='function'){await env.LOGIN_EMAIL.send(message);return;}
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.MAIL_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(message),signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Email delivery rejected');
}
