import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const base=(process.env.TEST_ORIGIN||'https://customsignforge.com').replace(/\/$/,'');
const content=JSON.parse(readFileSync(new URL('../src/data/trade-content.json',import.meta.url),'utf8'));
const get=path=>fetch(base+path,{redirect:'manual',headers:{'User-Agent':'CustomSignForge-Trade-QA'}});
const r=await get('/for-sign-companies/');assert.equal(r.status,200);const html=await r.text(),rendered=html.slice(html.indexOf('<main id="main">'));
assert.equal((html.match(/<h1[\s>]/g)||[]).length,1);assert(html.includes(content.title));
for(const id of ['trade-capabilities','trade-custom','trade-production','trade-support','trade-references-title','trade-order','trade-faq-title','trade-final-title'])assert(html.includes('id="'+id+'"'),id);
assert(!/manufacturing partners|production partners|supplier reference|Supplier imagery to be confirmed/i.test(rendered));
const images=[content.hero.src,...content.products.map(p=>p.image),...content.production.map(p=>p.image),...content.references.map(p=>p.image)];
for(const path of new Set(images)){assert(html.includes(path),path);assert.equal((await get(path)).status,200,path)}
for(const path of ['/about/','/']){const r=await get(path);assert.equal(r.status,200);assert(!/manufacturing partners|production partners|Our Role and the Manufacturing/i.test((await r.text()).split('<main id="main">')[1]),path)}
for(const p of content.products)assert.equal((await get('/products/'+p.slug+'/')).status,200,p.slug);
const next='/get-a-quote/?entry=%2Ffor-sign-companies%2F&cta=content',gate=await get(next);assert.equal(gate.status,303);const signIn=new URL(gate.headers.get('location'),base);assert.equal(signIn.pathname,'/sign-in/');assert.equal(signIn.searchParams.get('next'),next);
mkdirSync(new URL('../docs/evidence/trade-redesign/',import.meta.url),{recursive:true});writeFileSync(new URL('../docs/evidence/trade-redesign/public-smoke.json',import.meta.url),JSON.stringify({date:new Date().toISOString(),base,sections:8,images:new Set(images).size,tradeContextPreserved:true,passed:true},null,2));
console.log('PASS trade page: 8 sections, referenced images, existing product routes, consistent manufacturing copy, authenticated quote entry with source preserved.');
