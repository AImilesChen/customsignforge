import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fixture,request,enquiry,customerHeaders} from './helpers.mjs';
import {handleAPI} from '../src/lib/api.mjs';
import {LOCALES,basePath,localePath,routeLocale,switchLanguage,htmlLanguage} from '../src/lib/locale.mjs';
import {customerNext} from '../src/lib/customer-navigation.mjs';
import {indexablePage} from '../src/lib/search-indexing.mjs';
import {externalAnalyticsEnabled,analyticsVisitAllowed} from '../src/lib/external-analytics.mjs';
import {publicPath} from '../src/lib/acquisition.mjs';
import {publicCopy} from '../src/lib/malay-content.mjs';
import {localizedItem,localeMetadata} from '../src/lib/locale-content.mjs';
import {translate} from '../src/lib/translate.mjs';
import {structuredData} from '../src/lib/structured-data.mjs';
const call=(env,path,method='GET',data,headers={},query='')=>handleAPI(request('api/'+path+query,method,data,headers),env,path);

test('Malay shares safe customer destinations and cross-language product/query/hash navigation',()=>{
 assert.equal(LOCALES.ms.label,'Bahasa Melayu');assert.equal(htmlLanguage('ms'),'ms-MY');
 assert.equal(routeLocale('/ms/'),'ms');assert.equal(routeLocale('/msa/'),'en');assert.equal(basePath('/ms/products/'),'/products/');
 for(const locale of ['en','zh','ms']){
  const path=localePath('/ms/products/lightbox-neon/?style=lightbox-neon#neon-style',locale);
  assert.equal(basePath(path.split('?')[0]),'/products/lightbox-neon/');
 }
 const switched=switchLanguage('/zh/sign-in/','?next=%2Fzh%2Fget-a-quote%2F%3Fstyle%3Dmetal-letters%26project%3Dstudio-metal-design','','ms');
 assert.equal(new URL(switched,'https://test.invalid').searchParams.get('next'),'/ms/get-a-quote/?style=metal-letters&project=studio-metal-design');
 assert.equal(customerNext('/ms/get-a-quote/?style=metal-letters','ms'),'/ms/get-a-quote/?style=metal-letters');
 for(const target of ['//evil.test','/ms/admin/','/ms/api/account/','/ms/auth/customer/google','/ms/%2e%2e/admin/','/ms/get-a-quote/\r\nLocation: evil'])assert.equal(customerNext(target,'ms'),'/ms/account/');
 assert.equal(customerNext('/account/?next=https://evil.test','ms'),'/account/');
 for(const path of ['/api/account/session','/admin/','/auth/customer/google','/assets/example.webp'])assert.equal(localePath(path,'ms'),path);
});

test('Malay private paths remain excluded from search, acquisition and external analytics',()=>{
 const env={APP_ENV:'production',PUBLISH_READY:'true'};
 for(const path of ['/ms/admin/','/ms/api/','/ms/auth/','/ms/account/','/ms/sign-in/','/ms/get-a-quote/','/ms/media/','/ms/review/']){
  assert(!indexablePage(env,{path}));assert(!externalAnalyticsEnabled({environment:'production',path}));assert(!analyticsVisitAllowed('https://customsignforge.com'+path));
 }
 assert.equal(publicPath('/ms/account/'),'');assert(indexablePage(env,{path:'/ms/products/'}));
 assert(!indexablePage(env,{path:'/ms/projects/concept/',item:{indexable:false}}));assert(!indexablePage(env,{path:'/ms/privacy/',policy:true}));
 assert(analyticsVisitAllowed('https://customsignforge.com/ms/products/'));
 const schema=structuredData({base:'https://customsignforge.com',path:'/ms/products/metal-letters/',locale:'ms',title:'Huruf Logam',description:'Pembuatan khas',settings:{},item:{type:'product',title:'Huruf Logam'}});
 assert.equal(schema['@graph'].find(v=>v['@type']==='WebPage').inLanguage,'ms-MY');
 assert.equal(schema['@graph'].find(v=>v['@type']==='BreadcrumbList').itemListElement[0].name,'Utama');
});

test('Malay public content and shared customer messages are explicit, complete and keep asset paths and factory figures',()=>{
 const zh=JSON.parse(readFileSync(new URL('../src/data/zh/messages.json',import.meta.url),'utf8')),ms=JSON.parse(readFileSync(new URL('../src/data/ms/messages.json',import.meta.url),'utf8'));
 for(const key of Object.keys(zh))assert(Object.hasOwn(ms,key),'Missing '+key);
 const visit=value=>{if(typeof value==='string')assert(!/[\u3400-\u9fff]/.test(value),'Untranslated '+value);else if(value&&typeof value==='object')Object.values(value).forEach(visit)};
 visit(publicCopy);visit(ms);
 assert.equal(Object.keys(publicCopy.site.products).length,6);assert.equal(Object.keys(publicCopy.detail.cases).length,24);
 assert.equal(publicCopy.detail.products['led-channel-letters'].details[0].src,'/assets/product-pages-zh/front-face.webp');
 assert.equal(publicCopy.detail.products['backlit-letters'].wideDetails,true);
 const product=localizedItem({type:'product',slug:'metal-letters',image:'/assets/sample.webp'},'ms');assert.match(product.title,/Logam/);assert.equal(product.image,'/assets/sample.webp');
 assert.match(localeMetadata('/contact/',undefined,undefined,'ms').title,/Hubungi/);
 assert.equal(translate('Select an option','ms'),'Pilih satu pilihan');
});

test('Malay enquiry, optional drawings and language-only retries preserve one record and verbatim customer information',async()=>{
 const f=fixture();try{
  const h=await customerHeaders(f.env,'malay-buyer@example.test'),other=await customerHeaders(f.env,'malay-other@example.test');
  const payload={...enquiry(),locale:'ms',contactName:'Phone',businessName:'Contact',notes:'Teks asal pelanggan: 请保留 Phone',drawings:'ready',attachments:[],entry:'/ms/products/backlit-letters/'};
  const response=await call(f.env,'enquiries','POST',payload,h);assert.equal(response.status,201);const saved=await response.json();
  assert.match(saved.message,/Hai, saya/);assert.match(saved.message,/Nama Hubungan: Phone/);assert.match(saved.message,/Lukisan tersedia; tiada fail dimuat naik/);assert.match(saved.message,/E-mel hubungan: malay-buyer@example.test/);
  assert.equal((await call(f.env,'enquiries','POST',{...payload,locale:'zh'},h)).status,200);
  assert.equal(f.sqlite.prepare('SELECT count(*) n FROM enquiries').get().n,1);
  const raw=JSON.parse(f.sqlite.prepare('SELECT details_json FROM enquiries').get().details_json);assert.equal(raw.locale,'ms');assert.equal(raw.contactName,'Phone');assert.equal(raw.businessName,'Contact');assert.equal(raw.notes,payload.notes);
  const result=await(await call(f.env,'account/enquiries','GET',undefined,h,'?locale=ms')).json();assert.match(result.items[0].styleName,/Halo/);assert.equal(result.items[0].details.notes,payload.notes);
  assert.equal((await call(f.env,'account/enquiries/'+saved.reference,'GET',undefined,other,'?locale=ms')).status,404);
  assert.equal((await call(f.env,'enquiries','POST',{...enquiry(),locale:'my'},h)).status,422);
 }finally{f.close()}
});

test('Malay sign-in email remains browser-bound, expiring and single-use',async()=>{
 const f=fixture();try{
  let sent;Object.assign(f.env,{MAIL_FROM:'hello@customsignforge.com',LOGIN_EMAIL:{send:async message=>{sent=message}}});
  const response=await call(f.env,'account/email/start','POST',{email:'ms-login@example.test',locale:'ms'});assert.equal(response.status,202);
  const {challenge}=await response.json(),code=sent.text.match(/\d{8}/)[0];assert.match(sent.subject,/Kod log masuk/);assert.match(sent.text,/10 minit/);
  assert.equal((await call(f.env,'account/email/verify','POST',{challenge,code})).status,401);
  const headers={cookie:response.headers.get('set-cookie').split(';')[0]};assert.equal((await call(f.env,'account/email/verify','POST',{challenge,code},headers)).status,200);
  assert.equal((await call(f.env,'account/email/verify','POST',{challenge,code},headers)).status,401);
 }finally{f.close()}
});
