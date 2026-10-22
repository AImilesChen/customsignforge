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
import {frenchPublicCopy} from '../src/lib/french-content.mjs';
import {localizedItem,localeMetadata} from '../src/lib/locale-content.mjs';
import {translate} from '../src/lib/translate.mjs';
import {structuredData} from '../src/lib/structured-data.mjs';
import frProjects from '../src/data/fr/projects.json' with {type:'json'};
import msProjects from '../src/data/ms/projects.json' with {type:'json'};

const call=(env,path,method='GET',data,headers={},query='')=>handleAPI(request('api/'+path+query,method,data,headers),env,path);

test('French routes preserve deep links and keep private pages out of search and analytics',()=>{
 assert.equal(LOCALES.fr.label,'Français');
 assert.equal(htmlLanguage('fr'),'fr');
 assert.equal(routeLocale('/fr/products/metal-letters/'),'fr');
 assert.equal(basePath('/fr/products/metal-letters/'),'/products/metal-letters/');
 const switched=switchLanguage('/de/sign-in/','?next=%2Fde%2Fget-a-quote%2F%3Fstyle%3Dmetal-letters','','fr');
 assert.equal(new URL(switched,'https://test.invalid').searchParams.get('next'),'/fr/get-a-quote/?style=metal-letters');
 assert.equal(customerNext('/fr/get-a-quote/?style=metal-letters','fr'),'/fr/get-a-quote/?style=metal-letters');
 for(const target of ['//evil.test','/fr/admin/','/fr/api/account/','/fr/auth/customer/google'])assert.equal(customerNext(target,'fr'),'/fr/account/');
 const env={APP_ENV:'production',PUBLISH_READY:'true'};
 for(const path of ['/fr/admin/','/fr/api/','/fr/auth/','/fr/account/','/fr/sign-in/','/fr/get-a-quote/','/fr/media/']){
  assert(!indexablePage(env,{path}));assert(!externalAnalyticsEnabled({environment:'production',path}));assert(!analyticsVisitAllowed('https://customsignforge.com'+path));
 }
 assert.equal(publicPath('/fr/account/'),'');
 assert(indexablePage(env,{path:'/fr/products/'}));
 assert(analyticsVisitAllowed('https://customsignforge.com/fr/products/'));
 const schema=structuredData({base:'https://customsignforge.com',path:'/fr/products/metal-letters/',locale:'fr',title:'Lettres métalliques en relief',description:'Enseignes sur mesure',settings:{},item:{type:'product',title:'Lettres métalliques en relief'}});
 assert.equal(schema['@graph'].find(v=>v['@type']==='WebPage').inLanguage,'fr');
 assert.equal(schema['@graph'].find(v=>v['@type']==='BreadcrumbList').itemListElement[0].name,'Accueil');
});

test('French public content covers the source corpus and six product families',()=>{
 const zh=JSON.parse(readFileSync(new URL('../src/data/zh/messages.json',import.meta.url),'utf8'));
 const fr=JSON.parse(readFileSync(new URL('../src/data/fr/messages.json',import.meta.url),'utf8'));
 const source=JSON.parse(readFileSync(new URL('../src/data/ms/public.json',import.meta.url),'utf8'));
 const publicFrench=JSON.parse(readFileSync(new URL('../src/data/fr/public.json',import.meta.url),'utf8'));
 for(const key of Object.keys(zh))assert(Object.hasOwn(fr,key),'Missing interface key '+key);
 for(const key of Object.keys(source))assert(Object.hasOwn(publicFrench,key),'Missing page key '+key);
 const visit=value=>{if(typeof value==='string'){assert(!/[\u3400-\u9fff]/.test(value),'Untranslated '+value);assert(!/personnage|05h30|06h30|0169|Taïwan|demandes de signature|nombre entier de lettres/i.test(value),'Bad translation '+value);}else if(value&&typeof value==='object')Object.values(value).forEach(visit)};
 visit(frenchPublicCopy);visit(fr);
 assert.equal(Object.keys(frenchPublicCopy.site.products).length,6);
 assert.equal(Object.keys(frenchPublicCopy.detail.cases).length,24);
 assert.equal(Object.keys(frProjects).length,30);
 for(const slug of Object.keys(msProjects))assert(frProjects[slug],'Missing project title '+slug);
 const expected={
  'led-channel-letters':['Lettres boîtiers lumineuses à éclairage frontal','Lettres boîtiers lumineuses LED sur mesure'],
  'backlit-letters':['Lettres rétroéclairées LED à effet halo','Lettres rétroéclairées LED à effet halo'],
  'metal-letters':['Lettres métalliques en relief','Lettres métalliques en relief sur mesure'],
  'acrylic-letters':['Lettres et logos en plexiglas','Lettres et logos en plexiglas sur mesure'],
  'lightbox-neon':['Caissons lumineux LED et enseignes effet néon LED','Caissons lumineux et enseignes effet néon LED'],
  'specialty-signs':['Enseignes spéciales sur mesure','Enseignes spéciales sur mesure']
 };
 for(const [slug,[title,seoTitle]] of Object.entries(expected)){
  assert.equal(frenchPublicCopy.site.products[slug].title,title);
  const product=localizedItem({type:'product',slug,image:'/assets/sample.webp'},'fr');
  assert.equal(product.seoTitle,seoTitle);assert.equal(product.image,'/assets/sample.webp');
  assert.match(product.seoDescription,/lettres|caisson|enseigne/i);
 }
 assert.equal(frenchPublicCopy.detail.products['led-channel-letters'].details[0].src,'/assets/product-pages-zh/front-face.webp');
 assert.equal(frenchPublicCopy.detail.products['backlit-letters'].wideDetails,true);
 assert.match(frenchPublicCopy.site.products['lightbox-neon'].intro,/technologie LED/);
 assert.match(localizedItem({type:'project',slug:'office-logo-concept',product:'backlit-letters',imageKind:'concept'},'fr').imageAlt,/visuel conceptuel généré par IA/);
 assert.match(localeMetadata('/contact/',undefined,undefined,'fr').title,/Contact et devis/);
 for(const path of ['/', '/products/', '/projects/', '/about/', '/how-it-works/', '/for-sign-companies/', '/contact/', ...Object.keys(expected).map(slug=>'/products/'+slug+'/')]){
  const item=path.startsWith('/products/')&&path!=='/products/'?{type:'product',slug:path.split('/')[2]}:undefined;
  const meta=localeMetadata(path,item,undefined,'fr');
  assert(meta.description.length>=90&&meta.description.length<=165,'SEO description length '+path);
  assert(!/caractères|panneaux acryliques|logo personnalisé/i.test(meta.description),'SEO copy '+path);
 }
 assert.match(translate('Have a Sign in Mind?','fr'),/enseigne/);
});

test('French enquiry preserves customer data, optional drawings and account isolation',async()=>{
 const f=fixture();try{
  const headers=await customerHeaders(f.env,'french-buyer@example.test'),other=await customerHeaders(f.env,'french-other@example.test');
  const payload={...enquiry(),locale:'fr',contactName:'Amélie',businessName:'Exemple SAS',notes:'Texte du client 请保留 tel quel',drawings:'ready',attachments:[],entry:'/fr/products/backlit-letters/'};
  const response=await call(f.env,'enquiries','POST',payload,headers);assert.equal(response.status,201);const saved=await response.json();
  assert.match(saved.message,/Bonjour/);assert.match(saved.message,/Amélie/);assert.match(saved.message,/Plans disponibles, sans fichier téléversé/);
  const raw=JSON.parse(f.sqlite.prepare('SELECT details_json FROM enquiries').get().details_json);
  assert.equal(raw.locale,'fr');assert.equal(raw.notes,payload.notes);
  const account=await(await call(f.env,'account/enquiries','GET',undefined,headers,'?locale=fr')).json();
  assert.match(account.items[0].styleName,/rétroéclairées/);assert.equal(account.items[0].details.notes,payload.notes);
  assert.equal((await call(f.env,'account/enquiries/'+saved.reference,'GET',undefined,other,'?locale=fr')).status,404);
 }finally{f.close()}
});

test('French customer sign-in email is localized and browser-bound',async()=>{
 const f=fixture();try{
  let sent;Object.assign(f.env,{MAIL_FROM:'hello@customsignforge.com',LOGIN_EMAIL:{send:async message=>{sent=message}}});
  const response=await call(f.env,'account/email/start','POST',{email:'fr-login@example.test',locale:'fr'});assert.equal(response.status,202);
  const {challenge}=await response.json(),code=sent.text.match(/\d{8}/)[0];
  assert.match(sent.subject,/code de connexion/);assert.match(sent.text,/10 minutes/);
  assert.equal((await call(f.env,'account/email/verify','POST',{challenge,code})).status,401);
  const headers={cookie:response.headers.get('set-cookie').split(';')[0]};
  assert.equal((await call(f.env,'account/email/verify','POST',{challenge,code},headers)).status,200);
 }finally{f.close()}
});
