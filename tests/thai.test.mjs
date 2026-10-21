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
import {thaiPublicCopy} from '../src/lib/thai-content.mjs';
import {localizedItem,localeMetadata} from '../src/lib/locale-content.mjs';
import {translate} from '../src/lib/translate.mjs';
import {structuredData} from '../src/lib/structured-data.mjs';
const call=(env,path,method='GET',data,headers={},query='')=>handleAPI(request('api/'+path+query,method,data,headers),env,path);

test('Thai routes and language switching preserve page, query, fragment and safe sign-in destination',()=>{
 assert.equal(LOCALES.th.label,'ไทย');assert.equal(htmlLanguage('th'),'th-TH');
 assert.equal(routeLocale('/th/'),'th');assert.equal(routeLocale('/tha/'),'en');assert.equal(basePath('/th/products/'),'/products/');
 for(const locale of ['en','zh','ms','th']){
  const path=localePath('/th/products/lightbox-neon/?style=lightbox-neon#neon-style',locale);
  assert.equal(basePath(path.split('?')[0]),'/products/lightbox-neon/');
 }
 const switched=switchLanguage('/zh/sign-in/','?next=%2Fzh%2Fget-a-quote%2F%3Fstyle%3Dmetal-letters%26project%3Dstudio-metal-design','','th');
 assert.equal(new URL(switched,'https://test.invalid').searchParams.get('next'),'/th/get-a-quote/?style=metal-letters&project=studio-metal-design');
 assert.equal(customerNext('/th/get-a-quote/?style=metal-letters','th'),'/th/get-a-quote/?style=metal-letters');
 for(const target of ['//evil.test','/th/admin/','/th/api/account/','/th/auth/customer/google','/th/%2e%2e/admin/'])assert.equal(customerNext(target,'th'),'/th/account/');
 for(const path of ['/api/account/session','/admin/','/auth/customer/google','/assets/example.webp'])assert.equal(localePath(path,'th'),path);
});

test('Thai public pages have localized metadata while private pages stay out of indexing and analytics',()=>{
 const env={APP_ENV:'production',PUBLISH_READY:'true'};
 for(const path of ['/th/admin/','/th/api/','/th/auth/','/th/account/','/th/sign-in/','/th/get-a-quote/','/th/media/','/th/review/']){
  assert(!indexablePage(env,{path}));assert(!externalAnalyticsEnabled({environment:'production',path}));assert(!analyticsVisitAllowed('https://customsignforge.com'+path));
 }
 assert.equal(publicPath('/th/account/'),'');assert(indexablePage(env,{path:'/th/products/'}));
 assert(!indexablePage(env,{path:'/th/privacy/',policy:true}));
 assert(analyticsVisitAllowed('https://customsignforge.com/th/products/'));
 const schema=structuredData({base:'https://customsignforge.com',path:'/th/products/metal-letters/',locale:'th',title:'ตัวอักษรโลหะ',description:'ป้ายสั่งทำ',settings:{},item:{type:'product',title:'ตัวอักษรโลหะ'}});
 assert.equal(schema['@graph'].find(v=>v['@type']==='WebPage').inLanguage,'th-TH');
 assert.equal(schema['@graph'].find(v=>v['@type']==='BreadcrumbList').itemListElement[0].name,'หน้าแรก');
});

test('Thai public content and customer messages cover every source key without Chinese fallback',()=>{
 const zh=JSON.parse(readFileSync(new URL('../src/data/zh/messages.json',import.meta.url),'utf8'));
 const th=JSON.parse(readFileSync(new URL('../src/data/th/messages.json',import.meta.url),'utf8'));
 const publicSource=JSON.parse(readFileSync(new URL('../src/data/ms/public.json',import.meta.url),'utf8'));
 const publicThai=JSON.parse(readFileSync(new URL('../src/data/th/public.json',import.meta.url),'utf8'));
 for(const key of Object.keys(zh))assert(Object.hasOwn(th,key),'Missing interface key '+key);
 for(const key of Object.keys(publicSource))assert(Object.hasOwn(publicThai,key),'Missing page key '+key);
 const visit=value=>{if(typeof value==='string')assert(!/[\u3400-\u9fff]/.test(value),'Untranslated '+value);else if(value&&typeof value==='object')Object.values(value).forEach(visit)};
 visit(thaiPublicCopy);visit(th);
 assert.equal(Object.keys(thaiPublicCopy.site.products).length,6);assert.equal(Object.keys(thaiPublicCopy.detail.cases).length,24);
 assert.equal(thaiPublicCopy.detail.products['led-channel-letters'].details[0].src,'/assets/product-pages-zh/front-face.webp');
 assert.equal(thaiPublicCopy.detail.products['backlit-letters'].wideDetails,true);
 const product=localizedItem({type:'product',slug:'metal-letters',image:'/assets/sample.webp'},'th');
 assert.match(product.title,/โลหะ/);assert.equal(product.image,'/assets/sample.webp');
 assert.match(localeMetadata('/contact/',undefined,undefined,'th').title,/ติดต่อ/);
 assert.equal(translate('Have a Sign in Mind?','th'),'มีไอเดียป้ายในใจแล้วหรือยัง?');
});

test('Thai search titles use actual sign-product terms and match product content',()=>{
 const expected={
  'led-channel-letters':'ป้ายอักษรไฟออกหน้า LED',
  'backlit-letters':'ป้ายอักษรไฟออกหลังแบบฮาโล',
  'metal-letters':'ป้ายอักษรโลหะสามมิติ',
  'acrylic-letters':'ป้ายตัวอักษรอะคริลิกและโลโก้',
  'lightbox-neon':'ป้ายกล่องไฟ LED และป้ายสไตล์นีออน',
  'specialty-signs':'ป้ายสั่งทำดีไซน์พิเศษ'
 };
 for(const [slug,title] of Object.entries(expected)){
  assert.equal(thaiPublicCopy.site.products[slug].title,title);
  const product=localizedItem({type:'product',slug},'th');
  assert(product.seoTitle.startsWith(title));
  assert.match(thaiPublicCopy.detail.products[slug].headline,/ป้าย/);
  assert(!/ข้อความ|คำพูด|การวางแนว/.test(thaiPublicCopy.detail.products[slug].summary));
 }
 assert.match(localeMetadata('/',undefined,undefined,'th').title,/ป้ายไฟ LED/);
 assert.match(localeMetadata('/products/',undefined,undefined,'th').title,/ป้ายอักษรโลหะ/);
});

test('Thai enquiry keeps optional drawings, one stored record and customer text verbatim',async()=>{
 const f=fixture();try{
  const headers=await customerHeaders(f.env,'thai-buyer@example.test'),other=await customerHeaders(f.env,'thai-other@example.test');
  const payload={...enquiry(),locale:'th',contactName:'Phone',businessName:'Contact',notes:'ข้อความลูกค้า: 请保留 Phone',drawings:'ready',attachments:[],entry:'/th/products/backlit-letters/'};
  const response=await call(f.env,'enquiries','POST',payload,headers);assert.equal(response.status,201);const saved=await response.json();
  assert.match(saved.message,/สวัสดี/);assert.match(saved.message,/Phone/);assert.match(saved.message,/มีแบบ แต่ยังไม่ได้อัปโหลด/);
  assert.equal((await call(f.env,'enquiries','POST',{...payload,locale:'zh'},headers)).status,200);
  assert.equal(f.sqlite.prepare('SELECT count(*) n FROM enquiries').get().n,1);
  const raw=JSON.parse(f.sqlite.prepare('SELECT details_json FROM enquiries').get().details_json);
  assert.equal(raw.locale,'th');assert.equal(raw.notes,payload.notes);
  const account=await(await call(f.env,'account/enquiries','GET',undefined,headers,'?locale=th')).json();
  assert.match(account.items[0].styleName,/ฮาโล/);assert.equal(account.items[0].details.notes,payload.notes);
  assert.equal((await call(f.env,'account/enquiries/'+saved.reference,'GET',undefined,other,'?locale=th')).status,404);
 }finally{f.close()}
});

test('Thai sign-in email remains browser-bound and single-use',async()=>{
 const f=fixture();try{
  let sent;Object.assign(f.env,{MAIL_FROM:'hello@customsignforge.com',LOGIN_EMAIL:{send:async message=>{sent=message}}});
  const response=await call(f.env,'account/email/start','POST',{email:'th-login@example.test',locale:'th'});assert.equal(response.status,202);
  const {challenge}=await response.json(),code=sent.text.match(/\d{8}/)[0];assert.match(sent.subject,/รหัสเข้าสู่ระบบ/);assert.match(sent.text,/10 นาที/);
  assert.equal((await call(f.env,'account/email/verify','POST',{challenge,code})).status,401);
  const headers={cookie:response.headers.get('set-cookie').split(';')[0]};
  assert.equal((await call(f.env,'account/email/verify','POST',{challenge,code},headers)).status,200);
  assert.equal((await call(f.env,'account/email/verify','POST',{challenge,code},headers)).status,401);
 }finally{f.close()}
});
