import {HttpError} from './validation.mjs';
export async function verifyTurnstile(env,request,token,action='quote'){
 if(env.APP_ENV==='development'&&['localhost','127.0.0.1','[::1]'].includes(new URL(request.url).hostname))return;
 if(!env.TURNSTILE_SECRET||!env.TURNSTILE_SITE_KEY)throw new HttpError(503,'Security verification is temporarily unavailable. Please try again later.');
 if(typeof token!=='string'||!token||token.length>2048)throw new HttpError(422,'Please complete the security check.',{turnstile:'Complete the security check.'});
 let result;try{const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token}),signal:AbortSignal.timeout(10000)});result=await r.json();}catch{throw new HttpError(503,'Security verification is unavailable. Please try again.');}
 if(!result.success||result.action!==action||result.hostname!==new URL(request.url).hostname)throw new HttpError(422,'The security check expired. Please try again.',{turnstile:'Please repeat the security check.'});
}
