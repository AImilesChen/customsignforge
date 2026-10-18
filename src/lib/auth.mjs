import { SignJWT,jwtVerify,createRemoteJWKSet } from 'jose';
import { HttpError } from './validation.mjs';
export const localMode=(env,url)=>env.APP_ENV==='development'&&env.LOCAL_ADMIN_ENABLED==='true'&&['localhost','127.0.0.1','[::1]'].includes(new URL(url).hostname);
export const key=env=>{if(!env.SESSION_SECRET||env.SESSION_SECRET.length<32)throw new HttpError(503,'Administrator authentication is not configured.');return new TextEncoder().encode(env.SESSION_SECRET);};
export const cookie=(request,name,value,maxAge,sameSite='Strict')=>`${name}=${value}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=${maxAge}${new URL(request.url).protocol==='https:'?'; Secure':''}`;
export const getCookie=(request,name)=>(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1);
export const allowedEmail=(env,email)=>!!email&&String(env.ADMIN_EMAILS||'').split(',').map(e=>e.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());
export async function issueSession(env,subject,mode='email'){
 const id=crypto.randomUUID(),expires=Math.floor(Date.now()/1000)+8*3600;
 await env.DB.prepare('DELETE FROM admin_sessions WHERE expires_at<?').bind(Math.floor(Date.now()/1000)).run();
 await env.DB.prepare('INSERT INTO admin_sessions(id,subject,expires_at) VALUES(?,?,?)').bind(id,subject,expires).run();
 return new SignJWT({role:'admin',mode}).setProtectedHeader({alg:'HS256'}).setSubject(subject).setJti(id).setIssuer('csf').setAudience('csf-admin').setIssuedAt().setExpirationTime(expires).sign(key(env));
}
const jwksCache=new Map();
export async function actor(request,env){
 const session=getCookie(request,'csf_admin');if(session)try{
  const {payload}=await jwtVerify(session,key(env),{algorithms:['HS256'],issuer:'csf',audience:'csf-admin'});
  if(payload.role==='admin'&&(payload.mode==='local'?localMode(env,request.url):allowedEmail(env,payload.sub))){
   const saved=await env.DB.prepare('SELECT id FROM admin_sessions WHERE id=? AND subject=? AND expires_at>?').bind(payload.jti,payload.sub,Math.floor(Date.now()/1000)).first();
   if(saved)return {id:payload.sub,mode:payload.mode,sessionId:payload.jti};
  }
 }catch{}
 if(localMode(env,request.url)){
  // A local development account still requires the server-side session above.
 }else if(env.ACCESS_TEAM_DOMAIN&&env.ACCESS_AUD&&env.ADMIN_EMAILS){
  const domain=env.ACCESS_TEAM_DOMAIN;if(!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(domain))throw new HttpError(503,'Administrator authentication is not configured.');
  const token=request.headers.get('Cf-Access-Jwt-Assertion');if(token)try{let jwks=jwksCache.get(domain);if(!jwks){jwks=createRemoteJWKSet(new URL(domain+'/cdn-cgi/access/certs'));jwksCache.set(domain,jwks);}const {payload}=await jwtVerify(token,jwks,{issuer:domain,audience:env.ACCESS_AUD,algorithms:['RS256']});if(env.ADMIN_EMAILS.split(',').map(e=>e.trim().toLowerCase()).includes(String(payload.email).toLowerCase()))return {id:String(payload.email),mode:'access'};}catch{}
 }
 throw new HttpError(401,'Administrator sign-in is required.');
}
export async function localLogin(request,env,password){
 if(!localMode(env,request.url))throw new HttpError(404,'Not found.');
 const supplied=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(password||'')));
 const expected=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(env.LOCAL_ADMIN_PASSWORD||crypto.randomUUID()));
 let diff=0;const a=new Uint8Array(supplied),b=new Uint8Array(expected);for(let i=0;i<a.length;i++)diff|=a[i]^b[i];if(diff||!env.LOCAL_ADMIN_PASSWORD)throw new HttpError(401,'Sign-in failed.');
 return issueSession(env,'local-owner','local');
}
export async function csrfToken(env,user){return new SignJWT({purpose:'csrf'}).setProtectedHeader({alg:'HS256'}).setSubject(user.id).setIssuer('csf').setAudience('admin-write').setIssuedAt().setExpirationTime('1h').sign(key(env));}
export async function verifyCSRF(request,env,user,token){
 sameOrigin(request);try{const {payload}=await jwtVerify(token||'',key(env),{algorithms:['HS256'],issuer:'csf',audience:'admin-write',subject:user.id});if(payload.purpose!=='csrf')throw 0;}catch{throw new HttpError(403,'Refresh this page before saving.');}
}
export function sameOrigin(request){if(request.headers.get('Origin')!==new URL(request.url).origin)throw new HttpError(403,'This request must come from the website.');}
