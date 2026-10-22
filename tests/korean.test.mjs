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
import {koreanPublicCopy} from '../src/lib/korean-content.mjs';
import {localizedItem,localeMetadata} from '../src/lib/locale-content.mjs';
import {translate} from '../src/lib/translate.mjs';
import {structuredData} from '../src/lib/structured-data.mjs';
import koProjects from '../src/data/ko/projects.json' with {type:'json'};
import msProjects from '../src/data/ms/projects.json' with {type:'json'};

const call=(env,path,method='GET',data,headers={},query='')=>handleAPI(request('api/'+path+query,method,data,headers),env,path);

test('Korean routes, structured data and privacy controls work',()=>{
 assert.equal(LOCALES.ko.label,'한국어');
 assert.equal(htmlLanguage('ko'),'ko-KR');
 assert.equal(routeLocale('/ko/products/metal-letters/'),'ko');
 assert.equal(basePath('/ko/products/metal-letters/'),'/products/metal-letters/');
 const switched=switchLanguage('/fr/sign-in/','?next=%2Ffr%2Fget-a-quote%2F%3Fstyle%3Dmetal-letters','','ko');
 assert.equal(new URL(switched,'https://test.invalid').searchParams.get('next'),'/ko/get-a-quote/?style=metal-letters');
 assert.equal(customerNext('/ko/get-a-quote/?style=metal-letters','ko'),'/ko/get-a-quote/?style=metal-letters');
 for(const target of ['//evil.test','/ko/admin/','/ko/api/account/','/ko/auth/customer/google'])assert.equal(customerNext(target,'ko'),'/ko/account/');
 const env={APP_ENV:'production',PUBLISH_READY:'true'};
 for(const path of ['/ko/admin/','/ko/api/','/ko/auth/','/ko/account/','/ko/sign-in/','/ko/get-a-quote/','/ko/media/']){
  assert(!indexablePage(env,{path}));assert(!externalAnalyticsEnabled({environment:'production',path}));assert(!analyticsVisitAllowed('https://customsignforge.com'+path));
 }
 assert.equal(publicPath('/ko/account/'),'');
 assert(indexablePage(env,{path:'/ko/products/'}));
 assert(analyticsVisitAllowed('https://customsignforge.com/ko/products/'));
 const schema=structuredData({base:'https://customsignforge.com',path:'/ko/products/metal-letters/',locale:'ko',title:'금속 입체문자',description:'맞춤형 간판',settings:{},item:{type:'product',title:'금속 입체문자'}});
 assert.equal(schema['@graph'].find(value=>value['@type']==='WebPage').inLanguage,'ko-KR');
 assert.equal(schema['@graph'].find(value=>value['@type']==='BreadcrumbList').itemListElement[0].name,'홈');
});

test('Korean content covers six products and the full public source corpus',()=>{
 const zh=JSON.parse(readFileSync(new URL('../src/data/zh/messages.json',import.meta.url),'utf8'));
 const ko=JSON.parse(readFileSync(new URL('../src/data/ko/messages.json',import.meta.url),'utf8'));
 const source=JSON.parse(readFileSync(new URL('../src/data/ms/public.json',import.meta.url),'utf8'));
 const publicKorean=JSON.parse(readFileSync(new URL('../src/data/ko/public.json',import.meta.url),'utf8'));
 for(const key of Object.keys(zh))assert(Object.hasOwn(ko,key),'Missing interface key '+key);
 for(const key of Object.keys(source))assert(Object.hasOwn(publicKorean,key),'Missing page key '+key);
 const visit=value=>{if(typeof value==='string'){assert(!/[\u3400-\u9fff]/.test(value),'Untranslated '+value);assert(!/메탈캐릭터|서명 설치 프로그램|전체 신분증|대만$/i.test(value),'Bad translation '+value);}else if(value&&typeof value==='object')Object.values(value).forEach(visit)};
 visit(koreanPublicCopy);visit({...ko,...JSON.parse(readFileSync(new URL('../src/data/ko/overrides.json',import.meta.url),'utf8'))});
 assert.equal(Object.keys(koreanPublicCopy.site.products).length,6);
 assert.equal(Object.keys(koreanPublicCopy.detail.cases).length,24);
 assert.equal(Object.keys(koProjects).length,30);
 for(const slug of Object.keys(msProjects))assert(koProjects[slug],'Missing project title '+slug);
 for(const [slug,title] of Object.entries({'led-channel-letters':'LED 채널간판 · 전면 발광','backlit-letters':'LED 후광 채널간판','metal-letters':'금속 입체문자','acrylic-letters':'아크릴 입체문자와 로고','lightbox-neon':'LED 라이트박스와 LED 네온사인','specialty-signs':'맞춤형 특수 간판'})){
  assert.equal(koreanPublicCopy.site.products[slug].title,title);
  const item=localizedItem({type:'product',slug,image:'/assets/sample.webp'},'ko');
  assert.equal(item.image,'/assets/sample.webp');assert.match(item.seoTitle,/간판|입체문자|로고|라이트박스|네온사인/);
  assert.match(item.seoDescription,/LED|간판|문자|로고/);
 }
 assert.equal(koreanPublicCopy.detail.products['led-channel-letters'].details[0].src,'/assets/product-pages-zh/front-face.webp');
 assert.equal(koreanPublicCopy.detail.products['backlit-letters'].wideDetails,true);
 assert.match(localizedItem({type:'project',slug:'office-logo-concept',product:'backlit-letters',imageKind:'concept'},'ko').imageAlt,/AI 생성 디자인 예시/);
 assert.match(localeMetadata('/contact/',undefined,undefined,'ko').title,/견적 문의/);
 assert.match(translate('Sign installer','ko'),/간판 설치업체/);
 assert.match(translate('Enter the code sent to','ko'),/인증 코드/);
});

test('Korean enquiry and sign-in email preserve project data and account privacy',async()=>{
 const f=fixture();try{
  const headers=await customerHeaders(f.env,'korean-buyer@example.test'),other=await customerHeaders(f.env,'korean-other@example.test');
  const payload={...enquiry(),locale:'ko',contactName:'김민지',businessName:'예시 주식회사',notes:'고객 원문 그대로 보관',drawings:'ready',attachments:[],entry:'/ko/products/backlit-letters/'};
  const response=await call(f.env,'enquiries','POST',payload,headers);assert.equal(response.status,201);const saved=await response.json();
  assert.match(saved.message,/맞춤형 간판 견적/);assert.match(saved.message,/김민지/);assert.match(saved.message,/도면 있음, 파일은 업로드하지 않음/);
  const raw=JSON.parse(f.sqlite.prepare('SELECT details_json FROM enquiries').get().details_json);
  assert.equal(raw.locale,'ko');assert.equal(raw.notes,payload.notes);
  const account=await(await call(f.env,'account/enquiries','GET',undefined,headers,'?locale=ko')).json();
  assert.match(account.items[0].styleName,/후광 채널간판/);assert.equal(account.items[0].details.notes,payload.notes);
  assert.equal((await call(f.env,'account/enquiries/'+saved.reference,'GET',undefined,other,'?locale=ko')).status,404);
 }finally{f.close()}
 const f2=fixture();try{
  let sent;Object.assign(f2.env,{MAIL_FROM:'hello@customsignforge.com',LOGIN_EMAIL:{send:async message=>{sent=message}}});
  const response=await call(f2.env,'account/email/start','POST',{email:'ko-login@example.test',locale:'ko'});assert.equal(response.status,202);
  const {challenge}=await response.json(),code=sent.text.match(/\d{8}/)[0];
  assert.match(sent.subject,/인증 코드/);assert.match(sent.text,/10분/);
  assert.equal((await call(f2.env,'account/email/verify','POST',{challenge,code})).status,401);
  const headers={cookie:response.headers.get('set-cookie').split(';')[0]};
  assert.equal((await call(f2.env,'account/email/verify','POST',{challenge,code},headers)).status,200);
 }finally{f2.close()}
});
