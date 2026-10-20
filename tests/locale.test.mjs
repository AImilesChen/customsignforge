import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fixture,request,enquiry,customerHeaders} from './helpers.mjs';
import {handleAPI} from '../src/lib/api.mjs';
import {customerNext} from '../src/lib/customer-navigation.mjs';
import {localePath,basePath,routeLocale,switchLanguage} from '../src/lib/locale.mjs';
import {indexablePage} from '../src/lib/search-indexing.mjs';
import {analyticsVisitAllowed,externalAnalyticsEnabled} from '../src/lib/external-analytics.mjs';
import {publicPath} from '../src/lib/acquisition.mjs';
import {readQuoteDraft,writeQuoteDraft,clearQuoteDrafts,draftKey} from '../src/lib/quote-draft.mjs';
import {structuredData} from '../src/lib/structured-data.mjs';
const call=(env,path,method='GET',data,headers={},query='')=>handleAPI(request('api/'+path+query,method,data,headers),env,path);

test('locale URLs preserve English paths, quote references and safe return targets without localizing API or owner routes',()=>{
 assert.equal(localePath('/products/backlit-letters/?style=metal-letters#detail','zh'),'/zh/products/backlit-letters/?style=metal-letters#detail');
 assert.equal(localePath('/zh/products/','en'),'/products/');assert.equal(basePath('/zh/'),'/');assert.equal(routeLocale('/zha/'),'en');
 for(const path of ['/api/account/session','/admin/','/auth/customer/google','/assets/image.webp','https://wa.me/123','//evil.test/'])assert.equal(localePath(path,'zh'),path);
 const changed=switchLanguage('/sign-in/','?next=%2Fget-a-quote%2F%3Fstyle%3Dbacklit-letters','','zh');
 assert.equal(new URL(changed,'https://example.test').searchParams.get('next'),'/zh/get-a-quote/?style=backlit-letters');
 assert.equal(switchLanguage('/zh/products/','?style=backlit-letters','#metal-letters','en'),'/products/?style=backlit-letters#metal-letters');
 assert.equal(customerNext('/zh/get-a-quote/?style=backlit-letters'),'/zh/get-a-quote/?style=backlit-letters');assert.equal(customerNext(null,'zh'),'/zh/account/');
 for(const path of ['//evil.test','/\\evil.test','/zh/admin/','/zh/auth/','/zh/get-a-quote/\r\nLocation: evil','/zh/%2e%2e/admin/'])assert.equal(customerNext(path,'zh'),'/zh/account/');
});

test('translated privacy exclusions cannot be bypassed; public SEO and schema use the translated URL and language',()=>{
 const env={APP_ENV:'production',PUBLISH_READY:'true'};
 for(const path of ['/zh/sign-in/','/zh/account/','/zh/get-a-quote/','/zh/admin/','/zh/api/account/']){
  assert(!indexablePage(env,{path}));assert(!analyticsVisitAllowed('https://customsignforge.com'+path));assert(!externalAnalyticsEnabled({environment:'production',path}));
 }
 assert.equal(publicPath('/zh/account/'),'');assert.equal(publicPath('/zh/get-a-quote/'),'/zh/get-a-quote/');
 assert(indexablePage(env,{path:'/zh/'}));assert(indexablePage(env,{path:'/zh/products/backlit-letters/',item:{indexable:true}}));assert(!indexablePage(env,{path:'/zh/projects/concept/',item:{indexable:false}}));assert(!indexablePage(env,{path:'/zh/privacy/',policy:true}));
 assert(analyticsVisitAllowed('https://customsignforge.com/zh/products/?utm_source=google'));
 const schema=structuredData({base:'https://customsignforge.com',path:'/zh/products/backlit-letters/',locale:'zh',title:'背光字',description:'中文介绍',settings:{},item:{type:'product',title:'背光字',intro:'中文介绍'}});
 assert.equal(schema['@graph'].find(v=>v['@type']==='WebPage').inLanguage,'zh-Hans');assert.equal(schema['@graph'].find(v=>v['@type']==='Product').url,'https://customsignforge.com/zh/products/backlit-letters/');
});

test('quote drafts are scoped to the account and reference, expire, retain the same key, and clear on logout',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k),get length(){return map.size},key:i=>[...map.keys()][i]};
 const key=crypto.randomUUID(),form={contactName:'Phone',phone:'+8613820000000',notes:'Do not translate me',style:'backlit-letters'};
 writeQuoteDraft(storage,'a','same-reference',form,2,key,1000);
 assert.equal(readQuoteDraft(storage,'b','same-reference',1001),null);assert.equal(map.size,1);
 const saved=readQuoteDraft(storage,'a','same-reference',1001);assert.deepEqual(saved.form,form);assert.equal(saved.idempotencyKey,key);assert.equal(saved.step,2);
 assert.equal(readQuoteDraft(storage,'a','same-reference',86401001),null);assert.equal(map.size,0);
 writeQuoteDraft(storage,'a','same-reference',form,1,key,1000);assert.equal(readQuoteDraft(storage,'a','different-reference',1001),null);
 writeQuoteDraft(storage,'a','same-reference',form,1,key);storage.setItem('unrelated','keep');clearQuoteDrafts(storage);assert.equal(storage.getItem(draftKey('a')),null);assert.equal(storage.getItem('unrelated'),'keep');
});

test('Chinese enquiries use the shared account and stable codes, preserve customer text, and show in English without duplicating records',async()=>{
 const f=fixture();try{
  const h=await customerHeaders(f.env,'buyer@example.test'),other=await customerHeaders(f.env,'other@example.test');
  const payload={...enquiry(),locale:'zh',contactName:'Phone',businessName:'Contact',notes:'客户原文：请保持不变',drawings:'ready',attachments:[],entry:'/zh/products/backlit-letters/'};
  const r=await call(f.env,'enquiries','POST',payload,h);assert.equal(r.status,201);const created=await r.json();assert.match(created.message,/您好/);assert.match(created.message,/联系人姓名：Phone/);assert.match(created.message,/已有图纸，暂未上传/);assert.match(created.message,/联系邮箱：buyer@example.test/);
  assert.equal((await call(f.env,'enquiries','POST',payload,h)).status,200);const replay=await call(f.env,'enquiries','POST',{...payload,locale:'en'},h);assert.equal(replay.status,200);assert.match((await replay.json()).message,/Hi, I'd like/);assert.equal(f.sqlite.prepare('SELECT count(*) n FROM enquiries').get().n,1);
  const details=JSON.parse(f.sqlite.prepare('SELECT details_json FROM enquiries').get().details_json);assert.equal(details.locale,'zh');assert.equal(details.style,'backlit-letters');assert.equal(details.country,'United Kingdom');assert.equal(details.notes,payload.notes);
  const en=await(await call(f.env,'account/enquiries','GET',undefined,h,'?locale=en')).json();assert.match(en.items[0].message,/Hi, I'd like/);assert.equal(en.items[0].details.notes,payload.notes);assert.equal(en.items[0].details.locale,'zh');
  const cn=await(await call(f.env,'account/enquiries','GET',undefined,h,'?locale=zh')).json();assert.equal(cn.items[0].styleName,'背光字与光晕字');
  assert.equal((await call(f.env,'account/enquiries/'+created.reference,'GET',undefined,other,'?locale=zh')).status,404);
  assert.equal((await call(f.env,'enquiries','POST',{...enquiry(),locale:'unsupported'},h)).status,422);
 }finally{f.close()}
});

test('Chinese login codes use the requested language while preserving browser-bound single-use verification',async()=>{
 const f=fixture();try{
  let sent;Object.assign(f.env,{MAIL_FROM:'hello@customsignforge.com',LOGIN_EMAIL:{send:async message=>{sent=message}}});
  const started=await call(f.env,'account/email/start','POST',{email:'zh-buyer@example.test',locale:'zh'});assert.equal(started.status,202);const challenge=(await started.json()).challenge,code=sent.text.match(/\d{8}/)[0];assert.match(sent.subject,/验证码/);assert.match(sent.text,/10 分钟/);
  assert.equal((await call(f.env,'account/email/verify','POST',{challenge,code})).status,401);
  const headers={cookie:started.headers.get('set-cookie').split(';')[0]};assert.equal((await call(f.env,'account/email/verify','POST',{challenge,code},headers)).status,200);assert.equal((await call(f.env,'account/email/verify','POST',{challenge,code},headers)).status,401);
 }finally{f.close()}
});
