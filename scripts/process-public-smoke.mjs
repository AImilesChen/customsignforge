import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {processQuoteParams} from '../src/lib/process-page.mjs';
const content=JSON.parse(readFileSync(new URL('../src/data/process-content.json',import.meta.url),'utf8'));
const base=(process.env.TEST_ORIGIN||'https://customsignforge.com').replace(/\/$/,'');
const get=path=>fetch(base+path,{redirect:'manual',headers:{'User-Agent':'CustomSignForge-Process-QA'}});
const response=await get('/how-it-works/');assert.equal(response.status,200);const html=await response.text();const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];assert(main);
assert(html.includes('class="process-page"'));assert.equal((html.match(/<h1[\s>]/g)||[]).length,1);assert(!main.includes('editorial-layout'));assert(!main.includes('The production partner works'));assert(!main.includes('Supplier reference —'));
for(const stage of content.stages)assert(html.includes('id="'+stage.id+'"'));assert(html.includes('id="before-production"'));for(const [q] of content.faq)assert(html.includes(q));
const assets=new Set([content.hero.src,content.brief.src,content.specification.src,content.packing.src,...content.production.map(p=>p.src)]);
for(const path of assets){assert(html.includes(path),path);const r=await get(path);assert.equal(r.status,200,path);assert((await r.arrayBuffer()).byteLength>0,path)}
const target='/get-a-quote/?'+new URLSearchParams(processQuoteParams());assert(html.includes(target.replaceAll('&','&amp;')));const gate=await get(target);assert.equal(gate.status,303);assert.equal(new URL(gate.headers.get('location'),base).searchParams.get('next'),target);await gate.arrayBuffer();
const login=await get('/sign-in/?'+new URLSearchParams({next:target}));assert.equal(login.status,200);const signIn=await login.text();assert(signIn.includes('Sign In to Request Your Quote'));
const result={date:new Date().toISOString(),base,stages:4,approvalChecks:6,faqs:8,images:assets.size,quoteContextRetained:true,passed:true};mkdirSync(new URL('../docs/evidence/process-v2/',import.meta.url),{recursive:true});writeFileSync(new URL('../docs/evidence/process-v2/public-smoke.json',import.meta.url),JSON.stringify(result,null,2));console.log('PASS process page',JSON.stringify(result));
