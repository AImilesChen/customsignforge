import {localePath,routeLocale} from './locale.mjs';
import {SignJWT,jwtVerify,createRemoteJWKSet} from 'jose';
import {HttpError,text} from './validation.mjs';
import {key,cookie,getCookie,allowedEmail,issueSession,sameOrigin} from './auth.mjs';
import {fingerprint,rateLimit} from './db.mjs';
import {customerNext,customerEmail,verifiedCustomer,issueCustomerSession,CUSTOMER_SESSION_SECONDS} from './customer-auth.mjs';
const googleJWKS=createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const now=()=>Math.floor(Date.now()/1000);
function origin(request,env){const value=env.AUTH_ORIGIN||((env.APP_ENV==='development')?new URL(request.url).origin:'');if(!value||value!==new URL(request.url).origin||(env.APP_ENV!=='development'&&!value.startsWith('https://')))throw new HttpError(503,'Sign-in origin is not configured.');return value;}
export async function googleStart(request,env,{customer=false}={}){
 if(!env.GOOGLE_CLIENT_ID||!env.GOOGLE_CLIENT_SECRET||(!customer&&!env.ADMIN_EMAILS))throw new HttpError(503,'Google sign-in is not configured yet.');
 if(customer)await rateLimit(env,request,'customer-google',20);
 const callback=origin(request,env)+'/auth/google/callback';const state=(customer?'customer.':'')+crypto.randomUUID(),nonce=crypto.randomUUID();const verifier=[...crypto.getRandomValues(new Uint8Array(32))].map(b=>b.toString(16).padStart(2,'0')).join('');
 const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier)));const challenge=btoa(String.fromCharCode(...digest)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 await env.DB.prepare('DELETE FROM oauth_states WHERE expires_at<?').bind(now()).run();await env.DB.prepare('INSERT INTO oauth_states(state_hash,expires_at) VALUES(?,?)').bind(await fingerprint(state),now()+600).run();
 const token=await new SignJWT({state,nonce,verifier,...(customer?{next:customerNext(new URL(request.url).searchParams.get('next'))}:{})}).setProtectedHeader({alg:'HS256'}).setIssuer('csf').setAudience(customer?'google-customer-state':'google-state').setIssuedAt().setExpirationTime('10m').sign(key(env));
 const url=new URL('https://accounts.google.com/o/oauth2/v2/auth');url.search=new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,redirect_uri:callback,response_type:'code',scope:'openid email',state,nonce,code_challenge:challenge,code_challenge_method:'S256',prompt:'select_account'}).toString();
 return new Response(null,{status:302,headers:{Location:url.toString(),'Set-Cookie':cookie(request,customer?'csf_customer_oauth':'csf_oauth',token,600,'Lax'),'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
}
export async function googleCallback(request,env){
 const callback=origin(request,env)+'/auth/google/callback';const params=new URL(request.url).searchParams;let payload,customer=false;
 for(const [name,audience,isCustomer] of [['csf_customer_oauth','google-customer-state',true],['csf_oauth','google-state',false]]){
  try{const candidate=(await jwtVerify(getCookie(request,name)||'',key(env),{issuer:'csf',audience,algorithms:['HS256']})).payload;if(candidate.state===params.get('state')){payload=candidate;customer=isCustomer;break;}}catch{}
 }
 if(!payload)throw new HttpError(401,'Sign-in was cancelled or expired.');
 if(!params.get('state')||params.get('state')!==payload.state||!params.get('code')||params.get('error'))throw new HttpError(401,'Sign-in was cancelled or expired.');
 const used=await env.DB.prepare('DELETE FROM oauth_states WHERE state_hash=? AND expires_at>? RETURNING state_hash').bind(await fingerprint(payload.state),now()).first();if(!used)throw new HttpError(401,'This sign-in attempt has expired.');
 const response=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,client_secret:env.GOOGLE_CLIENT_SECRET,code:params.get('code'),grant_type:'authorization_code',redirect_uri:callback,code_verifier:payload.verifier}),signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new HttpError(401,'Google sign-in could not be completed.');const result=await response.json();let identity;
 try{identity=(await jwtVerify(result.id_token,googleJWKS,{issuer:['https://accounts.google.com','accounts.google.com'],audience:env.GOOGLE_CLIENT_ID,algorithms:['RS256']})).payload;}catch{throw new HttpError(401,'Google identity could not be verified.');}
 if(identity.nonce!==payload.nonce||identity.email_verified!==true)throw new HttpError(403,'Google identity could not be verified.');
 if(customer){
  const email=customerEmail(identity.email);if(typeof identity.sub!=='string'||!identity.sub||identity.sub.length>255)throw new HttpError(403,'Google identity could not be verified.');
  // Google does not attest current ownership of unmanaged third-party email addresses.
  if(!email.endsWith('@gmail.com')&&!identity.hd)throw new HttpError(403,'Use email verification for this email address.');
  const account=await verifiedCustomer(env,email,identity.sub);const token=await issueCustomerSession(env,account,'google');const headers=new Headers({Location:customerNext(payload.next),'Cache-Control':'no-store','Referrer-Policy':'no-referrer'});
  headers.append('Set-Cookie',cookie(request,'csf_customer',token,CUSTOMER_SESSION_SECONDS,'Lax'));headers.append('Set-Cookie',cookie(request,'csf_customer_oauth','',0,'Lax'));return new Response(null,{status:302,headers});
 }
 if(!allowedEmail(env,identity.email))throw new HttpError(403,'This account is not authorised to manage this site.');
 const token=await issueSession(env,identity.email.toLowerCase(),'google');const headers=new Headers({Location:'/admin/','Cache-Control':'no-store','Referrer-Policy':'no-referrer'});headers.append('Set-Cookie',cookie(request,'csf_admin',token,28800,'Lax'));headers.append('Set-Cookie',cookie(request,'csf_oauth','',0,'Lax'));return new Response(null,{status:302,headers});
}
export async function googleFailureRedirect(request,env,startingCustomer=false){
 const url=new URL(request.url),state=url.searchParams.get('state');let next=customerNext(url.searchParams.get('next'));
 try{const {payload}=await jwtVerify(getCookie(request,'csf_customer_oauth')||'',key(env),{issuer:'csf',audience:'google-customer-state',algorithms:['HS256']});if(payload.state===state){startingCustomer=true;next=customerNext(payload.next)}}catch{}
 return startingCustomer||state?.startsWith('customer.')?localePath('/sign-in/',routeLocale(next))+'?'+new URLSearchParams({error:'google',next}):'/admin/login/?error=google';
}
export async function emailStart(request,env,raw,send=sendEmail){
 sameOrigin(request);origin(request,env);key(env);if(!emailConfigured(env))throw new HttpError(503,'Email sign-in is not configured yet.');
 const email=text(raw.email,150,true).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new HttpError(422,'Enter a valid email address.');
 await rateLimit(env,request,'email-login',5);await rateLimit(env,request,'email-address',3,await fingerprint(email));
 const id=crypto.randomUUID(),browser=crypto.randomUUID();const bytes=crypto.getRandomValues(new Uint32Array(1));const code=String(bytes[0]%100000000).padStart(8,'0');
 if(allowedEmail(env,email)){
  await env.DB.prepare('DELETE FROM email_challenges WHERE expires_at<? OR email=?').bind(now(),email).run();
  await env.DB.prepare('INSERT INTO email_challenges(id,email,code_hash,browser_hash,expires_at) VALUES(?,?,?,?,?)').bind(id,email,await fingerprint([env.SESSION_SECRET,id,code]),await fingerprint(browser),now()+600).run();
  try{await send(env,email,code);}catch{await env.DB.prepare('DELETE FROM email_challenges WHERE id=?').bind(id).run();throw new HttpError(503,'The sign-in email could not be sent. Please try again later.');}
 }
 return {challenge:id,cookie:cookie(request,'csf_email',browser,600)};
}
export async function emailVerify(request,env,raw){
 sameOrigin(request);origin(request,env);await rateLimit(env,request,'email-verify',20);const id=text(raw.challenge,50,true),code=text(raw.code,8,true);if(!/^\d{8}$/.test(code))throw new HttpError(401,'The code is invalid or expired.');
 const row=await env.DB.prepare('UPDATE email_challenges SET attempts=attempts+1 WHERE id=? AND expires_at>? AND attempts<5 RETURNING *').bind(id,now()).first();
 if(!row||row.code_hash!==await fingerprint([env.SESSION_SECRET,id,code])||row.browser_hash!==await fingerprint(getCookie(request,'csf_email')||'')||!allowedEmail(env,row.email))throw new HttpError(401,'The code is invalid or expired.');
 const used=await env.DB.prepare('DELETE FROM email_challenges WHERE id=? RETURNING id').bind(id).first();if(!used)throw new HttpError(401,'The code has already been used.');
 return issueSession(env,row.email,'email');
}
export function emailConfigured(env){return !!(env.MAIL_FROM&&env.ADMIN_EMAILS&&(typeof env.LOGIN_EMAIL?.send==='function'||env.MAIL_API_KEY));}
async function sendEmail(env,email,code){const message={from:env.MAIL_FROM,to:[email],subject:'Your Custom Sign Forge administrator sign-in code',text:`Your one-time administrator sign-in code is ${code}. It expires in 10 minutes. If you did not request this, ignore this email.`};if(typeof env.LOGIN_EMAIL?.send==='function'){await env.LOGIN_EMAIL.send(message);return;}const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.MAIL_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(message),signal:AbortSignal.timeout(10000)});if(!r.ok)throw new Error('Mail delivery rejected');}
