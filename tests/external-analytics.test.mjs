import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {analyticsVisitAllowed,externalAnalyticsEnabled,startExternalAnalytics} from '../src/lib/external-analytics.mjs';
import {indexablePage,sitemapPaths} from '../src/lib/search-indexing.mjs';
import {CONSENT_VERSION} from '../src/lib/analytics-consent.mjs';
const config={...JSON.parse(readFileSync(new URL('../src/data/analytics.json',import.meta.url))),enabled:true};
function fixture(){
 const target=()=>{const events=new Map();return {addEventListener(k,fn){if(!events.has(k))events.set(k,new Set());events.get(k).add(fn)},removeEventListener(k,fn){events.get(k)?.delete(fn)},fire(k,event={}){for(const fn of events.get(k)||[])fn(event)}}};
 const scripts=[],deletedCookies=[];let cookies='_ga=test; _ga_SH4NV0GRN0=test; _clck=test; _clsk=test; csf_customer=keep',allowed=false,reloaded=0;
 const win={...target(),location:Object.assign(new URL('https://customsignforge.com/'),{reload(){reloaded++}})};
 const doc={...target(),referrer:'',get cookie(){return cookies},set cookie(value){deletedCookies.push(value)},getElementById:id=>scripts.find(s=>s.id===id&&!s.removed),createElement:()=>({attrs:{},setAttribute(k,v){this.attrs[k]=v},remove(){this.removed=true}}),head:{appendChild(s){scripts.push(s)}}};
 return {win,doc,scripts,deletedCookies,consent:()=>allowed,allow(v){allowed=v;win.fire('csf-consent-change')},get reloaded(){return reloaded}};
}
test('external collectors only run on authorised production public pages and reject private URL data',()=>{
 for(const path of ['/admin/','/api/account/','/auth/google/','/account/','/sign-in/','/get-a-quote/','/media/private/','/review/work/']){
  assert.equal(analyticsVisitAllowed('https://customsignforge.com'+path),false);
  assert.equal(externalAnalyticsEnabled({environment:'production',path}),false);
 }
 for(const query of ['?email=person@example.test','?notes=PRIVATE','?utm_source=person@example.test','?utm_campaign=123456789','?next=/account/','#email=private'])assert.equal(analyticsVisitAllowed('https://customsignforge.com/'+query),false);
 assert(analyticsVisitAllowed('https://customsignforge.com/products/?utm_source=google&utm_medium=organic#backlit-letters'));
 assert(!analyticsVisitAllowed('http://localhost:4173/'));
 assert(!analyticsVisitAllowed('https://customsignforge.com/','https://other.test/?email=private'));
 for(const extra of [{environment:'development'},{canManage:true},{found:false},{policy:true}])assert(!externalAnalyticsEnabled({environment:'production',path:'/',...extra}));
});
test('collectors remain blocked until fresh permission, then load all three once with analytics-only consent',()=>{
 const f=fixture();const stop=startExternalAnalytics(config,f);assert.equal(f.scripts.length,0);
 f.allow(true);assert.equal(f.scripts.length,3);f.allow(true);f.win.fire('pageshow');assert.equal(f.scripts.length,3);
 assert(f.scripts.some(s=>s.src==='https://www.googletagmanager.com/gtag/js?id=G-SH4NV0GRN0'));
 assert(f.scripts.some(s=>s.src==='https://www.clarity.ms/tag/z0hfn4bak2'));
 assert.equal(f.scripts.find(s=>s.id==='csf-plausible').attrs['data-domain'],'customsignforge.com');
 const events=f.win.dataLayer.map(v=>Array.from(v));
 assert.deepEqual(events[0].slice(0,2),['consent','default']);
 assert.equal(events[1][2].analytics_storage,'granted');assert.equal(events[1][2].ad_user_data,'denied');
 assert.equal(events.find(v=>v[0]==='config')[2].page_location,'https://customsignforge.com/');
 assert.deepEqual(Array.from(f.win.clarity.q[0]),['consentv2',{analytics_Storage:'granted',ad_Storage:'denied'}]);
 stop();
});
test('external button events never contain WhatsApp messages, contact identity or enquiry references',()=>{
 const f=fixture();startExternalAnalytics(config,f);f.allow(true);
 f.doc.fire('click',{target:{closest:()=>({href:'https://wa.me/12025550123?text=PRIVATE-CUSTOMER-EMAIL-REF'})}});
 f.doc.fire('click',{target:{closest:()=>({href:'https://customsignforge.com/get-a-quote/?entry=/products/backlit-letters/'})}});
 const events=f.win.dataLayer.map(v=>Array.from(v)).filter(v=>v[0]==='event');
 assert.deepEqual(events.map(v=>v[1]),['whatsapp_click','request_quote']);
 assert(!JSON.stringify(events).includes('PRIVATE'));assert(!JSON.stringify(events).includes('12025550123'));
});
test('withdrawal and cross-tab consent changes disable collectors, clear analytics cookies and reload',()=>{
 const f=fixture();startExternalAnalytics(config,f);f.allow(true);f.allow(false);
 assert.equal(f.reloaded,1);assert.equal(f.win['ga-disable-G-SH4NV0GRN0'],true);assert(f.scripts.every(s=>s.removed));
 assert(f.deletedCookies.some(v=>v.startsWith('_ga=;')));assert(f.deletedCookies.some(v=>v.startsWith('_clck=;')));assert(!f.deletedCookies.some(v=>v.includes('csf_customer')));
 const g=fixture();startExternalAnalytics(config,g);g.allow(true);g.win.location.href='https://customsignforge.com/?email=private';g.win.fire('pageshow');assert.equal(g.reloaded,1);
 const h=fixture();startExternalAnalytics({...config,enabled:false},h);h.allow(true);assert.equal(h.scripts.length,0);
});
test('search sitemap includes exactly eligible public routes while preview, policies and account flows remain excluded',()=>{
 const env={APP_ENV:'production',PUBLISH_READY:'true'};
 const items=[{type:'product',slug:'backlit-letters'},{type:'page',slug:'about'},{type:'page',slug:'contact'},{type:'project',slug:'concept',indexable:false},{type:'landing',slug:'custom-logo-signs'},{type:'page',slug:'account'},{type:'page',slug:'bad&slug'}];
 const paths=sitemapPaths(env,items);assert.equal(new Set(paths).size,paths.length);assert(paths.includes('/projects/'));assert(paths.includes('/about/'));assert(paths.includes('/products/backlit-letters/'));assert(!paths.includes('/account/'));assert(!paths.includes('/projects/concept/'));
 for(const item of items.filter(i=>!i.slug.includes('&'))){const prefix={product:'/products/',page:'/',project:'/projects/',landing:'/landing/'}[item.type];const path=prefix+item.slug+'/';assert.equal(paths.includes(path),indexablePage(env,{path,item}));}
 assert(!indexablePage(env,{path:'/privacy/',policy:true}));assert(!indexablePage(env,{path:'/not-found/',found:false}));
 for(const extra of [{APP_ENV:'development'},{PUBLISH_READY:'false'}]){assert.deepEqual(sitemapPaths({...env,...extra},items),[]);assert(!indexablePage({...env,...extra},{path:'/'}));}
 assert(CONSENT_VERSION>3);
});
