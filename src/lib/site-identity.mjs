import {actor,allowedEmail,getCookie} from './auth.mjs';
import {customerActor} from './customer-auth.mjs';

// Navigation only. Administrative pages and APIs still require their own session.
export async function siteIdentity(request,env){
 let customer=null,canManage=false;
 try{customer=await customerActor(request,env);}catch{}
 if(customer)canManage=allowedEmail(env,customer.email);
 if(!canManage&&(getCookie(request,'csf_admin')||request.headers.has('Cf-Access-Jwt-Assertion'))){
  try{await actor(request,env);canManage=true;}catch{}
 }
 return {customer,canManage};
}
