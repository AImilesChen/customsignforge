import {SignJWT,jwtVerify} from 'jose';
import {cookie,getCookie,key,sameOrigin} from './auth.mjs';
import {HttpError} from './validation.mjs';
import {fingerprint} from './db.mjs';

const AGE=30*24*3600;
export async function guestActor(request,env){
 try{
  const {payload}=await jwtVerify(getCookie(request,'csf_guest')||'',key(env),{issuer:'csf',audience:'csf-guest',algorithms:['HS256']});
  if(payload.role==='guest'&&typeof payload.jti==='string'&&/^[0-9a-f-]{36}$/i.test(payload.jti))return {id:payload.jti,guest:true};
 }catch{}
 throw new HttpError(401,'Start a guest enquiry session before submitting.');
}
export async function guestSession(request,env){
 let guest;try{guest=await guestActor(request,env)}catch{}
 let setCookie;
 if(!guest){guest={id:crypto.randomUUID(),guest:true};const token=await new SignJWT({role:'guest'}).setProtectedHeader({alg:'HS256'}).setJti(guest.id).setIssuer('csf').setAudience('csf-guest').setIssuedAt().setExpirationTime(Math.floor(Date.now()/1000)+AGE).sign(key(env));setCookie=cookie(request,'csf_guest',token,AGE,'Lax');}
 return {guest,csrf:await guestCSRF(env,guest),setCookie};
}
export async function guestCSRF(env,guest){return new SignJWT({purpose:'guest-write'}).setProtectedHeader({alg:'HS256'}).setJti(guest.id).setIssuer('csf').setAudience('guest-write').setIssuedAt().setExpirationTime('2h').sign(key(env));}
export async function verifyGuestCSRF(request,env,guest){sameOrigin(request);try{const {payload}=await jwtVerify(request.headers.get('X-CSRF-Token')||'',key(env),{issuer:'csf',audience:'guest-write',algorithms:['HS256']});if(payload.purpose!=='guest-write'||payload.jti!==guest.id)throw 0;}catch{throw new HttpError(403,'Refresh this page before submitting again.');}}
export async function guestClaimCode(env,guestId,reference){
 const material=await fingerprint([env.SESSION_SECRET,'guest-claim',guestId,reference]);return material.slice(0,32).toUpperCase();
}
export async function guestClaimHash(env,reference,code){return fingerprint([env.SESSION_SECRET,'claim-hash',reference,code.toUpperCase()]);}
