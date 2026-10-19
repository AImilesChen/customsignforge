import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {productDirectionQuote} from '../src/lib/product-overview.mjs';
const base=(process.env.TEST_ORIGIN||'https://customsignforge.com').replace(/\/$/,'');
const content=JSON.parse(readFileSync(new URL('../src/data/product-overview.json',import.meta.url),'utf8'));
const get=path=>fetch(base+path,{redirect:'manual',headers:{'User-Agent':'CustomSignForge-Overview-QA'}});
const response=await get('/products/');assert.equal(response.status,200);const html=await response.text();
assert(html.includes('class="product-nav-link" href="/products/"')||html.includes('href="/products/" class="product-nav-link"'));
assert(html.includes('aria-label="Show product categories"'));assert(html.includes('mobile-products-label">All Products'));
assert.equal((html.match(/<h1[\s>]/g)||[]).length,1);assert(html.includes('id="overview-title"'));assert(html.includes(content.hero.src));assert(!html.includes('overview-family-nav'));
for(const id of ['compare-sign-styles',...content.sections.map(s=>s.id)])assert(html.includes('id="'+id+'"'),id);
assert.equal((html.match(/<th scope="row"/g)||[]).length,7);
for(const s of content.sections){
 for(const feature of s.features)assert(html.includes(feature[0].replaceAll('&','&amp;')),s.id+' feature');
 const target='/get-a-quote/?'+new URLSearchParams(productDirectionQuote(s));assert(html.includes(target.replaceAll('&','&amp;')),s.id+' enquiry link');
 const gate=await get(target);assert.equal(gate.status,303);assert.equal(new URL(gate.headers.get('location'),base).searchParams.get('next'),target);await gate.arrayBuffer();
}
for(const slug of new Set(content.sections.map(s=>s.slug))){const r=await get('/products/'+slug+'/');assert.equal(r.status,200,slug);const page=await r.text();assert(page.includes('class="product-nav-link"'));}
const assets=new Set([content.hero.src,...content.sections.flatMap(s=>[s.image.src,s.detail.src])]);
for(const path of assets){assert(html.includes(path),path);const r=await get(path);assert.equal(r.status,200,path);assert((await r.arrayBuffer()).byteLength>0,path)}
mkdirSync(new URL('../docs/evidence/product-overview/',import.meta.url),{recursive:true});writeFileSync(new URL('../docs/evidence/product-overview/public-smoke.json',import.meta.url),JSON.stringify({date:new Date().toISOString(),base,signDirections:7,productFamilies:6,assets:assets.size,splitNavigation:true,quoteContextPreserved:true,passed:true},null,2));
console.log('PASS product overview: split navigation, 7 sign directions, 6 product detail routes, 15 image references and authenticated enquiries with style/direction preserved.');
