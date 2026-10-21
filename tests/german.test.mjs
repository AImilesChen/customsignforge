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
import {germanPublicCopy} from '../src/lib/german-content.mjs';
import {localizedItem,localeMetadata} from '../src/lib/locale-content.mjs';
import {translate} from '../src/lib/translate.mjs';
import {structuredData} from '../src/lib/structured-data.mjs';
const call=(env,path,method='GET',data,headers={},query='')=>handleAPI(request('api/'+path+query,method,data,headers),env,path);

test('German routes, language switching and private destinations stay safe',()=>{
 assert.equal(LOCALES.de.label,'Deutsch');assert.equal(htmlLanguage('de'),'de-DE');
 assert.equal(routeLocale('/de/'),'de');assert.equal(routeLocale('/dev/'),'en');assert.equal(basePath('/de/products/'),'/products/');
 for(const locale of Object.keys(LOCALES)){
  const path=localePath('/de/products/lightbox-neon/?style=lightbox-neon#neon-style',locale);
  assert.equal(basePath(path.split('?')[0]),'/products/lightbox-neon/');
 }
 const switched=switchLanguage('/th/sign-in/','?next=%2Fth%2Fget-a-quote%2F%3Fstyle%3Dmetal-letters%26project%3Dstudio-metal-design','','de');
 assert.equal(new URL(switched,'https://test.invalid').searchParams.get('next'),'/de/get-a-quote/?style=metal-letters&project=studio-metal-design');
 assert.equal(customerNext('/de/get-a-quote/?style=metal-letters','de'),'/de/get-a-quote/?style=metal-letters');
 for(const target of ['//evil.test','/de/admin/','/de/api/account/','/de/auth/customer/google','/de/%2e%2e/admin/'])assert.equal(customerNext(target,'de'),'/de/account/');
 for(const path of ['/api/account/session','/admin/','/auth/customer/google','/assets/example.webp'])assert.equal(localePath(path,'de'),path);
});

test('German public SEO is localized and private routes stay excluded',()=>{
 const env={APP_ENV:'production',PUBLISH_READY:'true'};
 for(const path of ['/de/admin/','/de/api/','/de/auth/','/de/account/','/de/sign-in/','/de/get-a-quote/','/de/media/','/de/review/']){
  assert(!indexablePage(env,{path}));assert(!externalAnalyticsEnabled({environment:'production',path}));assert(!analyticsVisitAllowed('https://customsignforge.com'+path));
 }
 assert.equal(publicPath('/de/account/'),'');assert(indexablePage(env,{path:'/de/products/'}));
 assert(!indexablePage(env,{path:'/de/privacy/',policy:true}));
 assert(analyticsVisitAllowed('https://customsignforge.com/de/products/'));
 const schema=structuredData({base:'https://customsignforge.com',path:'/de/products/metal-letters/',locale:'de',title:'3D-Metallbuchstaben',description:'Werbeschilder',settings:{},item:{type:'product',title:'3D-Metallbuchstaben'}});
 assert.equal(schema['@graph'].find(v=>v['@type']==='WebPage').inLanguage,'de-DE');
 assert.equal(schema['@graph'].find(v=>v['@type']==='BreadcrumbList').itemListElement[0].name,'Startseite');
});

test('German content covers every source key and all six products and 24 cases',()=>{
 const zh=JSON.parse(readFileSync(new URL('../src/data/zh/messages.json',import.meta.url),'utf8'));
 const de=JSON.parse(readFileSync(new URL('../src/data/de/messages.json',import.meta.url),'utf8'));
 const source=JSON.parse(readFileSync(new URL('../src/data/ms/public.json',import.meta.url),'utf8'));
 const publicGerman=JSON.parse(readFileSync(new URL('../src/data/de/public.json',import.meta.url),'utf8'));
 for(const key of Object.keys(zh))assert(Object.hasOwn(de,key),'Missing interface key '+key);
 for(const key of Object.keys(source))assert(Object.hasOwn(publicGerman,key),'Missing page key '+key);
 const visit=value=>{if(typeof value==='string')assert(!/[\u3400-\u9fff]/.test(value),'Untranslated '+value);else if(value&&typeof value==='object')Object.values(value).forEach(visit)};
 visit(germanPublicCopy);visit(de);
 assert.equal(Object.keys(germanPublicCopy.site.products).length,6);
 assert.equal(Object.keys(germanPublicCopy.detail.cases).length,24);
 assert.equal(germanPublicCopy.detail.products['led-channel-letters'].details[0].src,'/assets/product-pages-zh/front-face.webp');
 assert.equal(germanPublicCopy.detail.products['backlit-letters'].wideDetails,true);
 const expected={
  'led-channel-letters':'Frontleuchtende LED-Buchstaben',
  'backlit-letters':'Rückleuchtende Buchstaben mit Halo-Effekt',
  'metal-letters':'3D-Metallbuchstaben',
  'acrylic-letters':'Acrylglasbuchstaben und Logos',
  'lightbox-neon':'LED-Leuchtkästen und Schilder in Neon-Optik',
  'specialty-signs':'Individuelle Sonderanfertigungen'
 };
 for(const [slug,title] of Object.entries(expected)){
  assert.equal(germanPublicCopy.site.products[slug].title,title);
  const product=localizedItem({type:'product',slug,image:'/assets/sample.webp'},'de');
  assert(product.seoTitle.startsWith(title));assert.equal(product.image,'/assets/sample.webp');
 }
 assert.match(localeMetadata('/contact/',undefined,undefined,'de').title,/Kontakt/);
 assert.match(translate('Have a Sign in Mind?','de'),/Schild/);
});

test('German enquiry preserves optional drawings, saved identity and customer text',async()=>{
 const f=fixture();try{
  const headers=await customerHeaders(f.env,'german-buyer@example.test'),other=await customerHeaders(f.env,'german-other@example.test');
  const payload={...enquiry(),locale:'de',contactName:'Anna',businessName:'Beispiel GmbH',notes:'Bitte dieses Original 请保留 unverändert lassen',drawings:'ready',attachments:[],entry:'/de/products/backlit-letters/'};
  const response=await call(f.env,'enquiries','POST',payload,headers);assert.equal(response.status,201);const saved=await response.json();
  assert.match(saved.message,/Guten Tag/);assert.match(saved.message,/Anna/);assert.match(saved.message,/Zeichnungen vorhanden, aber keine Datei hochgeladen/);
  assert.equal((await call(f.env,'enquiries','POST',{...payload,locale:'zh'},headers)).status,200);
  assert.equal(f.sqlite.prepare('SELECT count(*) n FROM enquiries').get().n,1);
  const raw=JSON.parse(f.sqlite.prepare('SELECT details_json FROM enquiries').get().details_json);
  assert.equal(raw.locale,'de');assert.equal(raw.notes,payload.notes);
  const account=await(await call(f.env,'account/enquiries','GET',undefined,headers,'?locale=de')).json();
  assert.match(account.items[0].styleName,/Halo/);assert.equal(account.items[0].details.notes,payload.notes);
  assert.equal((await call(f.env,'account/enquiries/'+saved.reference,'GET',undefined,other,'?locale=de')).status,404);
 }finally{f.close()}
});

test('German sign-in email is localized, browser-bound and single-use',async()=>{
 const f=fixture();try{
  let sent;Object.assign(f.env,{MAIL_FROM:'hello@customsignforge.com',LOGIN_EMAIL:{send:async message=>{sent=message}}});
  const response=await call(f.env,'account/email/start','POST',{email:'de-login@example.test',locale:'de'});assert.equal(response.status,202);
  const {challenge}=await response.json(),code=sent.text.match(/\d{8}/)[0];assert.match(sent.subject,/Anmeldecode/);assert.match(sent.text,/10 Minuten/);
  assert.equal((await call(f.env,'account/email/verify','POST',{challenge,code})).status,401);
  const headers={cookie:response.headers.get('set-cookie').split(';')[0]};
  assert.equal((await call(f.env,'account/email/verify','POST',{challenge,code},headers)).status,200);
  assert.equal((await call(f.env,'account/email/verify','POST',{challenge,code},headers)).status,401);
 }finally{f.close()}
});
