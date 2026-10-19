import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {sceneQuoteParams} from '../src/lib/product-scenes.mjs';
import {DESIGN_NOTE} from '../src/lib/image-copy.mjs';
const base=(process.env.TEST_ORIGIN||'https://customsignforge.com').replace(/\/$/,'');
const pages=JSON.parse(readFileSync(new URL('../src/data/product-pages.json',import.meta.url),'utf8'));
const get=path=>fetch(base+path,{redirect:'manual',headers:{'User-Agent':'CustomSignForge-Product-Depth-QA'}});
let count=0;const assets=new Set();
for(const [slug,page] of Object.entries(pages)){
 const response=await get('/products/'+slug+'/');assert.equal(response.status,200,slug);const html=await response.text();
 assert.equal((html.match(/<h1[\s>]/g)||[]).length,1);assert(html.includes('id="product-design-gallery"'));assert(html.includes('id="product-technical-title"'));assert(html.includes(DESIGN_NOTE));assert.equal((html.match(/class="product-source-note"/g)||[]).length,1);
 assert.equal((html.match(/Request a Similar Look/g)||[]).length,page.contexts.length,slug);
 for(const scene of page.contexts){
  count++;assert(html.includes('id="'+scene.id+'"'));assert(html.includes(scene.src),scene.src);assets.add(scene.src);
  const target='/get-a-quote/?'+new URLSearchParams(sceneQuoteParams(slug,scene));assert(html.includes(target.replaceAll('&','&amp;')),target);
  const gate=await get(target);assert.equal(gate.status,303);assert.equal(new URL(gate.headers.get('location'),base).searchParams.get('next'),target);await gate.arrayBuffer();
 }
 for(const direction of page.directions||[])assert(html.includes('id="direction-'+direction.anchor+'"'));
}
for(const path of assets){const r=await get(path);assert.equal(r.status,200,path);assert((await r.arrayBuffer()).byteLength>0,path)}
const result={date:new Date().toISOString(),base,productFamilies:6,sceneConcepts:count,uniqueSceneAssets:assets.size,authenticatedContextHandoff:true,passed:true};
mkdirSync(new URL('../docs/evidence/product-depth/',import.meta.url),{recursive:true});writeFileSync(new URL('../docs/evidence/product-depth/public-smoke.json',import.meta.url),JSON.stringify(result,null,2));console.log('PASS product depth:',JSON.stringify(result));
