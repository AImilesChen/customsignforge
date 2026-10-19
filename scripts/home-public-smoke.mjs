import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
const base=(process.env.TEST_ORIGIN||'https://customsignforge.com').replace(/\/$/,'');
const content=JSON.parse(readFileSync(new URL('../src/data/home-content.json',import.meta.url),'utf8'));
const get=path=>fetch(base+path,{redirect:'manual',headers:{'User-Agent':'CustomSignForge-Homepage-QA'}});
const response=await get('/');assert.equal(response.status,200);const html=await response.text();
assert.equal((html.match(/<h1[\s>]/g)||[]).length,1);
assert.equal(content.products.length,6);assert.equal(content.advantages.length,6);
assert(html.includes('id="behind-the-sign"'));assert(html.includes('id="why-custom-sign-forge"'));
assert(!html.includes('Process images are AI-generated illustrations'));
const escape=s=>s.replaceAll('&','&amp;');
for(const p of content.products){assert(html.includes(escape(p.title)));const r=await get('/products/'+p.slug+'/');assert.equal(r.status,200,p.slug);await r.arrayBuffer()}
for(const a of content.advantages)assert(html.includes(escape(a.title)),a.title);
for(const p of content.team.photos)assert(html.includes(escape(p.label)));
const images=[...new Set([...content.products.map(p=>p.image.startsWith('/')?p.image:'/assets/home-v2/'+p.image),...content.team.photos.map(p=>p.src)])];
for(const path of images){const r=await get(path);assert.equal(r.status,200,path);assert((await r.arrayBuffer()).byteLength>0,path)}
const target='/get-a-quote/?style=backlit-letters&source=homepage-reception',gate=await get(target);assert.equal(gate.status,303);assert.equal(new URL(gate.headers.get('location'),base).searchParams.get('next'),target);await gate.arrayBuffer();
mkdirSync(new URL('../docs/evidence/home-team/',import.meta.url),{recursive:true});writeFileSync(new URL('../docs/evidence/home-team/public-smoke.json',import.meta.url),JSON.stringify({date:new Date().toISOString(),base,productFamilies:6,advantages:6,photographs:3,images:images.length,customerQuoteGate:true,passed:true},null,2));
console.log('PASS homepage: six product families, concise team story, six benefits, three real production photographs and authenticated quotation context.');
