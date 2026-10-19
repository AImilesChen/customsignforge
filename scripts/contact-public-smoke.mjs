import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const content=JSON.parse(readFileSync(new URL('../src/data/contact-content.json',import.meta.url),'utf8'));
const base=(process.env.TEST_ORIGIN||'https://customsignforge.com').replace(/\/$/,'');
const get=path=>fetch(base+path,{redirect:'manual',headers:{'User-Agent':'CustomSignForge-Contact-QA'}});
const response=await get('/contact/');assert.equal(response.status,200);const html=await response.text(),main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];assert(main);
assert.equal((main.match(/<h1[\s>]/g)||[]).length,1);assert(main.includes('class="contact-page"'));assert(main.includes('id="company-information"'));assert(main.includes(content.address));assert(main.includes('<address>'));assert(!main.includes('Registered Address'));assert(!main.includes('Business Information'));assert(!main.includes('Registration details:'));assert(!main.includes('Tax details:'));assert(!main.includes('Review required'));assert(!main.includes('[Actual'));
assert(main.includes('mailto:hello@customsignforge.com'));assert(main.includes('https://wa.me/8615990661727'));
const footer=html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/)?.[1];assert(footer);assert(!footer.includes('href="/legal-notice/"'));assert(footer.includes('href="/privacy/"'));assert(footer.includes('href="/terms/"'));
for(const path of ['/legal-notice/','/legal-notice']){const r=await get(path);assert.equal(r.status,301,path);assert.equal(new URL(r.headers.get('location'),base).href,base+'/contact/#company-information');await r.arrayBuffer()}
const target='/get-a-quote/?'+new URLSearchParams({entry:'/contact/',cta:'content'});assert(main.includes(target.replaceAll('&','&amp;')));const gate=await get(target);assert.equal(gate.status,303);assert.equal(new URL(gate.headers.get('location'),base).searchParams.get('next'),target);await gate.arrayBuffer();
const result={date:new Date().toISOString(),base,confirmedBusinessAddress:content.address,legacyRedirect:true,quoteContextRetained:true,passed:true};mkdirSync(new URL('../docs/evidence/contact-v2/',import.meta.url),{recursive:true});writeFileSync(new URL('../docs/evidence/contact-v2/public-smoke.json',import.meta.url),JSON.stringify(result,null,2));console.log('PASS contact page',JSON.stringify(result));
