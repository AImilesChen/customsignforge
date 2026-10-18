import type {APIRoute} from 'astro';
import {env} from 'cloudflare:workers';
import {googleStart,googleCallback} from '../../lib/sign-in.mjs';
export const GET:APIRoute=async({request,params})=>{try{if(params.action==='google')return await googleStart(request,env);if(params.action==='google/callback')return await googleCallback(request,env);return new Response('Not found',{status:404});}catch{return new Response(null,{status:303,headers:{Location:'/admin/login/?error=google','Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});}};
