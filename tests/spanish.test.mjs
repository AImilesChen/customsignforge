import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fixture,request,enquiry,customerHeaders} from './helpers.mjs';
import {handleAPI} from '../src/lib/api.mjs';
import {LOCALES,basePath,routeLocale,switchLanguage,htmlLanguage} from '../src/lib/locale.mjs';
import {customerNext} from '../src/lib/customer-navigation.mjs';
import {indexablePage} from '../src/lib/search-indexing.mjs';
import {externalAnalyticsEnabled,analyticsVisitAllowed} from '../src/lib/external-analytics.mjs';
import {publicPath} from '../src/lib/acquisition.mjs';
import {spanishPublicCopy} from '../src/lib/spanish-content.mjs';
import {localizedItem,localeMetadata} from '../src/lib/locale-content.mjs';
import {translate} from '../src/lib/translate.mjs';
import {structuredData} from '../src/lib/structured-data.mjs';
import {SPANISH_COUNTRIES,COUNTRIES} from '../src/lib/validation.mjs';
import enMessages from '../src/data/zh/messages.json' with {type:'json'};
import esMessages from '../src/data/es/messages.json' with {type:'json'};
import sourcePublic from '../src/data/ms/public.json' with {type:'json'};
import esProjects from '../src/data/es/projects.json' with {type:'json'};
import sourceProjects from '../src/data/ms/projects.json' with {type:'json'};

const call=(env,path,method='GET',data,headers={},query='')=>handleAPI(request('api/'+path+query,method,data,headers),env,path);

test('Spanish URLs, metadata, country options and private boundaries',()=>{
 assert.equal(LOCALES.es.label,'Español');
 assert.equal(htmlLanguage('es'),'es');
 assert.equal(routeLocale('/es/products/metal-letters/'),'es');
 assert.equal(basePath('/es/products/metal-letters/'),'/products/metal-letters/');
 const switched=switchLanguage('/ar/sign-in/','?next=%2Far%2Fget-a-quote%2F%3Fstyle%3Dmetal-letters','','es');
 assert.equal(new URL(switched,'https://test.invalid').searchParams.get('next'),'/es/get-a-quote/?style=metal-letters');
 assert.equal(customerNext('/es/get-a-quote/?style=metal-letters','es'),'/es/get-a-quote/?style=metal-letters');
 for(const target of ['//evil.test','/es/admin/','/es/api/account/','/es/auth/customer/google'])assert.equal(customerNext(target,'es'),'/es/account/');
 for(const country of SPANISH_COUNTRIES)assert(COUNTRIES.includes(country));
 const env={APP_ENV:'production',PUBLISH_READY:'true'};
 for(const path of ['/es/admin/','/es/api/','/es/auth/','/es/account/','/es/sign-in/','/es/get-a-quote/','/es/media/']){
  assert(!indexablePage(env,{path}));
  assert(!externalAnalyticsEnabled({environment:'production',path}));
  assert(!analyticsVisitAllowed('https://customsignforge.com'+path));
 }
 assert.equal(publicPath('/es/account/'),'');
 assert(indexablePage(env,{path:'/es/products/'}));
 assert(analyticsVisitAllowed('https://customsignforge.com/es/products/'));
 const schema=structuredData({base:'https://customsignforge.com',path:'/es/products/metal-letters/',locale:'es',title:'Letras metálicas',description:'Rótulos a medida',settings:{},item:{type:'product',title:'Letras metálicas'}});
 assert.equal(schema['@graph'].find(value=>value['@type']==='WebPage').inLanguage,'es');
 assert.equal(schema['@graph'].find(value=>value['@type']==='BreadcrumbList').itemListElement[0].name,'Inicio');
});

test('Spanish dictionaries and product pages cover the public corpus',()=>{
 for(const key of Object.keys(enMessages))assert(Object.hasOwn(esMessages,key),'Missing UI translation: '+key);
 for(const key of Object.keys(sourcePublic))assert.notEqual(translate(key,'es'),key,'Missing public translation: '+key);
 const visit=value=>{if(typeof value==='string')assert(!/[\u3400-\u9fff]/.test(value),'Untranslated Chinese: '+value);else if(value&&typeof value==='object')Object.values(value).forEach(visit)};
 visit(spanishPublicCopy);
 assert.equal(Object.keys(spanishPublicCopy.site.products).length,6);
 assert.equal(Object.keys(spanishPublicCopy.detail.cases).length,24);
 assert.equal(Object.keys(esProjects).length,30);
 for(const slug of Object.keys(sourceProjects))assert(esProjects[slug],'Missing project title: '+slug);
 for(const slug of Object.keys(spanishPublicCopy.site.products)){
  const item=localizedItem({type:'product',slug,image:'/assets/sample.webp'},'es');
  assert.equal(item.image,'/assets/sample.webp');
  assert.match(item.seoTitle,/letras|rótulos|cajas de luz/i);
  assert.match(item.seoDescription,/letras|rótulos|cajas de luz|neón/i);
 }
 assert.match(spanishPublicCopy.site.products['led-channel-letters'].title,/letras corpóreas/i);
 assert.match(spanishPublicCopy.site.products['backlit-letters'].title,/retroiluminadas/i);
 assert.equal(spanishPublicCopy.detail.products['led-channel-letters'].details[0].src,'/assets/product-pages-zh/front-face.webp');
 assert.equal(spanishPublicCopy.detail.products['backlit-letters'].wideDetails,true);
 assert.match(localizedItem({type:'project',slug:'office-logo-concept',product:'backlit-letters',imageKind:'concept'},'es').imageAlt,/generado por IA/);
 assert.match(localeMetadata('/landing/sign-fabrication/',undefined,undefined,'es').title,/rótulos/i);
 assert.equal(translate('管理后台','es'),'Panel de administración');
 assert.equal(translate('Sign installer','es'),'Instalador de rótulos');
});

test('Spanish enquiry and sign-in preserve the customer record and localized messages',async()=>{
 const f=fixture();try{
  const headers=await customerHeaders(f.env,'es-buyer@example.test'),other=await customerHeaders(f.env,'es-other@example.test');
  const payload={...enquiry(),locale:'es',contactName:'Ana García',businessName:'Ejemplo S.L.',notes:'Medida original: 1,25 m; confirmar en obra.',drawings:'ready',attachments:[],country:'Spain',entry:'/es/products/backlit-letters/'};
  const response=await call(f.env,'enquiries','POST',payload,headers);assert.equal(response.status,201);const saved=await response.json();
  assert.match(saved.message,/presupuesto|rótulo/i);assert.match(saved.message,/Ana García/);
  const raw=JSON.parse(f.sqlite.prepare('SELECT details_json FROM enquiries').get().details_json);
  assert.equal(raw.locale,'es');assert.equal(raw.notes,payload.notes);
  const account=await(await call(f.env,'account/enquiries','GET',undefined,headers,'?locale=es')).json();
  assert.match(account.items[0].styleName,/retroiluminadas/i);assert.equal(account.items[0].details.notes,payload.notes);
  assert.equal((await call(f.env,'account/enquiries/'+saved.reference,'GET',undefined,other,'?locale=es')).status,404);
 }finally{f.close()}
 const f2=fixture();try{
  let sent;Object.assign(f2.env,{MAIL_FROM:'hello@customsignforge.com',LOGIN_EMAIL:{send:async message=>{sent=message}}});
  const response=await call(f2.env,'account/email/start','POST',{email:'es-login@example.test',locale:'es'});assert.equal(response.status,202);
  const {challenge}=await response.json(),code=sent.text.match(/\d{8}/)[0];
  assert.match(sent.subject,/código/i);assert.match(sent.text,/10 minutos/);
  assert.equal((await call(f2.env,'account/email/verify','POST',{challenge,code})).status,401);
  const headers={cookie:response.headers.get('set-cookie').split(';')[0]};
  assert.equal((await call(f2.env,'account/email/verify','POST',{challenge,code},headers)).status,200);
 }finally{f2.close()}
});
