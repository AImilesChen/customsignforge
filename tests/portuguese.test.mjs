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
import {portuguesePublicCopy} from '../src/lib/portuguese-content.mjs';
import {localizedItem,localeMetadata} from '../src/lib/locale-content.mjs';
import {translate} from '../src/lib/translate.mjs';
import {structuredData} from '../src/lib/structured-data.mjs';
import ptProjects from '../src/data/pt-br/projects.json' with {type:'json'};
import msProjects from '../src/data/ms/projects.json' with {type:'json'};

const call=(env,path,method='GET',data,headers={},query='')=>handleAPI(request('api/'+path+query,method,data,headers),env,path);

test('Brazilian Portuguese routes, SEO and privacy boundaries',()=>{
 assert.equal(LOCALES['pt-br'].label,'Português (Brasil)');
 assert.equal(htmlLanguage('pt-br'),'pt-BR');
 assert.equal(routeLocale('/pt-br/products/metal-letters/'),'pt-br');
 assert.equal(basePath('/pt-br/products/metal-letters/'),'/products/metal-letters/');
 const switched=switchLanguage('/ko/sign-in/','?next=%2Fko%2Fget-a-quote%2F%3Fstyle%3Dmetal-letters','','pt-br');
 assert.equal(new URL(switched,'https://test.invalid').searchParams.get('next'),'/pt-br/get-a-quote/?style=metal-letters');
 assert.equal(customerNext('/pt-br/get-a-quote/?style=metal-letters','pt-br'),'/pt-br/get-a-quote/?style=metal-letters');
 for(const target of ['//evil.test','/pt-br/admin/','/pt-br/api/account/','/pt-br/auth/customer/google'])assert.equal(customerNext(target,'pt-br'),'/pt-br/account/');
 const env={APP_ENV:'production',PUBLISH_READY:'true'};
 for(const path of ['/pt-br/admin/','/pt-br/api/','/pt-br/auth/','/pt-br/account/','/pt-br/sign-in/','/pt-br/get-a-quote/','/pt-br/media/']){
  assert(!indexablePage(env,{path}));
  assert(!externalAnalyticsEnabled({environment:'production',path}));
  assert(!analyticsVisitAllowed('https://customsignforge.com'+path));
 }
 assert.equal(publicPath('/pt-br/account/'),'');
 assert(indexablePage(env,{path:'/pt-br/products/'}));
 assert(analyticsVisitAllowed('https://customsignforge.com/pt-br/products/'));
 const schema=structuredData({base:'https://customsignforge.com',path:'/pt-br/products/metal-letters/',locale:'pt-br',title:'Letras de metal',description:'Letreiros sob medida',settings:{},item:{type:'product',title:'Letras de metal'}});
 assert.equal(schema['@graph'].find(value=>value['@type']==='WebPage').inLanguage,'pt-BR');
 assert.equal(schema['@graph'].find(value=>value['@type']==='BreadcrumbList').itemListElement[0].name,'Início');
});

test('Portuguese content covers all public copy, product types and project references',()=>{
 const zh=JSON.parse(readFileSync(new URL('../src/data/zh/messages.json',import.meta.url),'utf8'));
 const pt=JSON.parse(readFileSync(new URL('../src/data/pt-br/messages.json',import.meta.url),'utf8'));
 const source=JSON.parse(readFileSync(new URL('../src/data/ms/public.json',import.meta.url),'utf8'));
 const publicPortuguese=JSON.parse(readFileSync(new URL('../src/data/pt-br/public.json',import.meta.url),'utf8'));
 for(const key of Object.keys(zh))assert(Object.hasOwn(pt,key),'Missing interface key '+key);
 for(const key of Object.keys(source))assert(Object.hasOwn(publicPortuguese,key),'Missing public copy '+key);
 const visit=value=>{if(typeof value==='string'){assert(!/[\u3400-\u9fff]/.test(value),'Untranslated '+value);assert(!/^\d{2,4}[.:]\s/.test(value),'Numbered translation '+value);}else if(value&&typeof value==='object')Object.values(value).forEach(visit)};
 visit(portuguesePublicCopy);
 assert.equal(Object.keys(portuguesePublicCopy.site.products).length,6);
 assert.equal(Object.keys(portuguesePublicCopy.detail.cases).length,24);
 assert.equal(Object.keys(ptProjects).length,30);
 for(const slug of Object.keys(msProjects))assert(ptProjects[slug],'Missing project title '+slug);
 for(const slug of Object.keys(portuguesePublicCopy.site.products)){
  const item=localizedItem({type:'product',slug,image:'/assets/sample.webp'},'pt-br');
  assert.equal(item.image,'/assets/sample.webp');
  assert.match(item.seoTitle,/letra|letreiro|caixa|neon/i);
  assert.match(item.seoDescription,/letra|letreiro|caixa|neon|acr[ií]lico/i);
 }
 assert.match(portuguesePublicCopy.site.products['led-channel-letters'].title,/Letras caixa/);
 assert.match(portuguesePublicCopy.site.products['backlit-letters'].title,/efeito halo/);
 assert.equal(portuguesePublicCopy.detail.products['led-channel-letters'].details[0].src,'/assets/product-pages-zh/front-face.webp');
 assert.equal(portuguesePublicCopy.detail.products['backlit-letters'].wideDetails,true);
 assert.match(localizedItem({type:'project',slug:'office-logo-concept',product:'backlit-letters',imageKind:'concept'},'pt-br').imageAlt,/gerado por IA/);
 assert.match(localeMetadata('/contact/',undefined,undefined,'pt-br').title,/Contato|orçamento/);
 assert.match(translate('Sign installer','pt-br'),/Instalador de letreiros/);
});

test('Portuguese enquiry and sign-in preserve customer data and account privacy',async()=>{
 const f=fixture();try{
  const headers=await customerHeaders(f.env,'br-buyer@example.test'),other=await customerHeaders(f.env,'br-other@example.test');
  const payload={...enquiry(),locale:'pt-br',contactName:'Ana Souza',businessName:'Exemplo Ltda',notes:'Medida original: 1,25 m; confirmar no local.',drawings:'ready',attachments:[],entry:'/pt-br/products/backlit-letters/'};
  const response=await call(f.env,'enquiries','POST',payload,headers);assert.equal(response.status,201);const saved=await response.json();
  assert.match(saved.message,/orçamento de letreiro/);assert.match(saved.message,/Ana Souza/);assert.match(saved.message,/Desenhos/);
  const raw=JSON.parse(f.sqlite.prepare('SELECT details_json FROM enquiries').get().details_json);
  assert.equal(raw.locale,'pt-br');assert.equal(raw.notes,payload.notes);
  const account=await(await call(f.env,'account/enquiries','GET',undefined,headers,'?locale=pt-br')).json();
  assert.match(account.items[0].styleName,/retroiluminadas/);assert.equal(account.items[0].details.notes,payload.notes);
  assert.equal((await call(f.env,'account/enquiries/'+saved.reference,'GET',undefined,other,'?locale=pt-br')).status,404);
 }finally{f.close()}
 const f2=fixture();try{
  let sent;Object.assign(f2.env,{MAIL_FROM:'hello@customsignforge.com',LOGIN_EMAIL:{send:async message=>{sent=message}}});
  const response=await call(f2.env,'account/email/start','POST',{email:'br-login@example.test',locale:'pt-br'});assert.equal(response.status,202);
  const {challenge}=await response.json(),code=sent.text.match(/\d{8}/)[0];
  assert.match(sent.subject,/código de acesso/);assert.match(sent.text,/10 minutos/);
  assert.equal((await call(f2.env,'account/email/verify','POST',{challenge,code})).status,401);
  const headers={cookie:response.headers.get('set-cookie').split(';')[0]};
  assert.equal((await call(f2.env,'account/email/verify','POST',{challenge,code},headers)).status,200);
 }finally{f2.close()}
});
