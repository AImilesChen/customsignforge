import type {APIRoute} from 'astro';
import {env} from 'cloudflare:workers';
export const GET:APIRoute=async({params})=>{
 if(!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(params.key||''))return new Response('Not found',{status:404});
 const row=await env.DB.prepare('SELECT mime FROM media WHERE key=? AND published=1').bind(params.key).first();if(!row)return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});
 const object=await env.MEDIA.get(params.key!);if(!object)return new Response('Not found',{status:404});
 return new Response(object.body,{headers:{'Content-Type':row.mime as string,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'}});
};
