import {env} from 'cloudflare:workers';
import {LOCALES} from '../lib/locale.mjs';
export const GET=()=>{
 const privatePaths=['admin','api','auth','account','sign-in','get-a-quote','design-kit','review'];
 const rules=Object.values(LOCALES).flatMap(({prefix})=>privatePaths.map(path=>'Disallow: '+prefix+'/'+path+'/')).join('\n');
 return new Response(env.APP_ENV==='production'&&env.PUBLISH_READY==='true'?`User-agent: *\nAllow: /\n${rules}\nSitemap: ${env.SITE_URL||'https://customsignforge.com'}/sitemap.xml\n`:'User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain','Cache-Control':'no-store'}});
};
