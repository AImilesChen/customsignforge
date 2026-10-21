import {defineMiddleware} from 'astro:middleware';
export const onRequest=defineMiddleware(async(context,next)=>{
 if(context.url.hostname==='www.customsignforge.com'){const canonical=new URL(context.url);canonical.hostname='customsignforge.com';canonical.protocol='https:';return Response.redirect(canonical,308);}
 const response=await next();response.headers.set('X-Content-Type-Options','nosniff');response.headers.set('Referrer-Policy','strict-origin-when-cross-origin');response.headers.set('X-Frame-Options','DENY');response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
 if(/^\/(?:(?:zh|ms)\/)?(admin|api|auth|account|sign-in|get-a-quote)(\/|$)/.test(context.url.pathname)){response.headers.set('Cache-Control','no-store');response.headers.set('X-Robots-Tag','noindex, nofollow');response.headers.set('Referrer-Policy','no-referrer');}
 return response;
});
