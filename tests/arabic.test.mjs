import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fixture,request,enquiry,customerHeaders} from './helpers.mjs';
import {handleAPI} from '../src/lib/api.mjs';
import {LOCALES,basePath,routeLocale,switchLanguage,htmlLanguage} from '../src/lib/locale.mjs';
import {customerNext} from '../src/lib/customer-navigation.mjs';
import {indexablePage} from '../src/lib/search-indexing.mjs';
import {externalAnalyticsEnabled,analyticsVisitAllowed} from '../src/lib/external-analytics.mjs';
import {publicPath} from '../src/lib/acquisition.mjs';
import {arabicPublicCopy} from '../src/lib/arabic-content.mjs';
import {localizedItem,localeMetadata} from '../src/lib/locale-content.mjs';
import {translate} from '../src/lib/translate.mjs';
import {structuredData} from '../src/lib/structured-data.mjs';
import {COUNTRIES,ARABIC_COUNTRIES} from '../src/lib/validation.mjs';
import arProjects from '../src/data/ar/projects.json' with {type:'json'};
import ptProjects from '../src/data/pt-br/projects.json' with {type:'json'};

const call=(env,path,method='GET',data,headers={},query='')=>handleAPI(request('api/'+path+query,method,data,headers),env,path);

test('Arabic routes, RTL metadata and private-page boundaries',()=>{
 assert.equal(LOCALES.ar.label,'العربية');
 assert.equal(htmlLanguage('ar'),'ar');
 assert.equal(routeLocale('/ar/products/metal-letters/'),'ar');
 assert.equal(basePath('/ar/products/metal-letters/'),'/products/metal-letters/');
 const switched=switchLanguage('/pt-br/sign-in/','?next=%2Fpt-br%2Fget-a-quote%2F','','ar');
 assert.equal(new URL(switched,'https://test.invalid').searchParams.get('next'),'/ar/get-a-quote/');
 assert.equal(customerNext('/ar/get-a-quote/?style=metal-letters','ar'),'/ar/get-a-quote/?style=metal-letters');
 for(const target of ['//evil.test','/ar/admin/','/ar/api/account/'])assert.equal(customerNext(target,'ar'),'/ar/account/');
 const env={APP_ENV:'production',PUBLISH_READY:'true'};
 for(const path of ['/ar/admin/','/ar/api/','/ar/auth/','/ar/account/','/ar/sign-in/','/ar/get-a-quote/','/ar/media/']){
  assert(!indexablePage(env,{path}));
  assert(!externalAnalyticsEnabled({environment:'production',path}));
  assert(!analyticsVisitAllowed('https://customsignforge.com'+path));
 }
 assert.equal(publicPath('/ar/account/'),'');
 assert(indexablePage(env,{path:'/ar/products/'}));
 assert(analyticsVisitAllowed('https://customsignforge.com/ar/products/'));
 const schema=structuredData({base:'https://customsignforge.com',path:'/ar/products/metal-letters/',locale:'ar',title:'حروف معدنية',description:'لافتات مخصصة',settings:{},item:{type:'product',title:'حروف معدنية'}});
 assert.equal(schema['@graph'].find(value=>value['@type']==='WebPage').inLanguage,'ar');
 assert.equal(schema['@graph'].find(value=>value['@type']==='BreadcrumbList').itemListElement[0].name,'الرئيسية');
});

test('Arabic dictionaries cover existing public text and correct core product terms',()=>{
 const root=new URL('../src/data/',import.meta.url);
 const zh=JSON.parse(readFileSync(new URL('zh/messages.json',root),'utf8'));
 const ar=JSON.parse(readFileSync(new URL('ar/messages.json',root),'utf8'));
 const source=JSON.parse(readFileSync(new URL('pt-br/public.json',root),'utf8'));
 const publicArabic=JSON.parse(readFileSync(new URL('ar/public.json',root),'utf8'));
 for(const key of Object.keys(zh))assert(Object.hasOwn(ar,key),'Missing interface key '+key);
 for(const key of Object.keys(source))assert(Object.hasOwn(publicArabic,key),'Missing public copy '+key);
 const visit=value=>{if(typeof value==='string'){assert(!/[\u3400-\u9fff]/.test(value),'Untranslated '+value);assert(!/^AR\d{4}[.:]/.test(value),'Numbered translation '+value);}else if(value&&typeof value==='object')Object.values(value).forEach(visit)};
 visit(arabicPublicCopy);
 assert.equal(Object.keys(arabicPublicCopy.site.products).length,6);
 assert.equal(Object.keys(arabicPublicCopy.detail.cases).length,24);
 assert.equal(Object.keys(arProjects).length,30);
 for(const slug of Object.keys(ptProjects))assert(arProjects[slug],'Missing project title '+slug);
 for(const slug of Object.keys(arabicPublicCopy.site.products)){
  const item=localizedItem({type:'product',slug,image:'/assets/sample.webp'},'ar');
  assert.equal(item.image,'/assets/sample.webp');
  assert.match(item.seoTitle,/حروف|لافتات|إضاءة|نيون/);
  assert.match(item.seoDescription,/حروف|لافتات|إضاءة|نيون|أكريليك/);
 }
 assert.match(arabicPublicCopy.site.products['led-channel-letters'].title,/حروف بارزة/);
 assert.match(arabicPublicCopy.site.products['backlit-letters'].title,/إضاءة خلفية/);
 assert.match(localeMetadata('/contact/',undefined,undefined,'ar').title,/تواصل|لافتة/);
 assert.equal(translate('Your Sign','ar'),'لافتتك');
 assert.equal(translate('Have a Sign in Mind?','ar'),'هل لديك فكرة للافتة؟');
 assert.equal(translate('Sign company / reseller','ar'),'شركة لافتات / موزع');
 assert.equal(translate('No Final Drawings','ar'),'لا تحتاج إلى رسومات نهائية');
 assert.equal(translate('Saudi Arabia','ar'),'المملكة العربية السعودية');
 assert.equal(translate('管理后台','ar'),'لوحة الإدارة');
 assert.equal(translate('管理后台入口','ar'),'الدخول إلى لوحة الإدارة');
 assert.equal(translate('进入管理后台','ar'),'افتح لوحة الإدارة');
 assert.equal(translate('字面与字壳','ar'),'واجهة الحروف وهيكلها');
 assert.equal(translate('聊聊您的','ar'),'لنتحدث عن');
 assert.equal(translate('标识项目。','ar'),'مشروع لافتتك.');
 assert(!translate('需要结合最小笔画、整体尺寸、字厚和材料透光性评估。提供矢量标志与大致尺寸后，我们会讨论适合的制作方向。','ar').includes('السكتة الدماغية'));
 for(const name of ['messages','public','overrides','projects']){
  const dictionary=JSON.parse(readFileSync(new URL(`ar/${name}.json`,root),'utf8'));
  for(const value of Object.values(dictionary))assert(!/[\u3400-\u9fff]/.test(value),`Untranslated ${name} value: ${value}`);
 }
 assert(ARABIC_COUNTRIES.every(country=>COUNTRIES.includes(country)));
});

test('Arabic enquiry keeps uploaded drawings optional and preserves submitted details',async()=>{
 const f=fixture();try{
  const headers=await customerHeaders(f.env,'arabic-buyer@example.test'),other=await customerHeaders(f.env,'other-buyer@example.test');
  const payload={...enquiry(),locale:'ar',country:'Saudi Arabia',contactName:'نور',notes:'العرض 1.5 متر',drawings:'ready',attachments:[],entry:'/ar/products/backlit-letters/'};
  const response=await call(f.env,'enquiries','POST',payload,headers);assert.equal(response.status,201);
  const saved=await response.json();
  assert.match(saved.message,/عرض سعر للافتة/);
  assert.match(saved.message,/المملكة العربية السعودية/);
  assert.match(saved.message,/لم ترفع ملفات/);
  const raw=JSON.parse(f.sqlite.prepare('SELECT details_json FROM enquiries').get().details_json);
  assert.equal(raw.locale,'ar');assert.equal(raw.notes,payload.notes);
  assert.equal((await call(f.env,'account/enquiries/'+saved.reference,'GET',undefined,other,'?locale=ar')).status,404);
 }finally{f.close()}
});
