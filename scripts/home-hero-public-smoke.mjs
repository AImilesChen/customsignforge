import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const base=(process.env.TEST_ORIGIN||'https://customsignforge.com').replace(/\/$/,'');
const get=path=>fetch(base+path,{redirect:'manual',headers:{'User-Agent':'CustomSignForge-Hero-QA'}});
const home=await get('/');assert.equal(home.status,200);const html=await home.text();
assert(/<header[^>]*class="[^"]*home-immersive-header/.test(html));assert(html.includes('id="home-hero-title"'));
assert.equal((html.match(/<h1[\s>]/g)||[]).length,1);
for(const label of ['Sign design ideas','Show storefront signs concept','Show reception &amp; office concept','Show hotel &amp; hospitality concept','Pause scene rotation','Next sign scene','Previous sign scene'])assert(html.includes(label),label);
const images=['/assets/hero-cafe.webp','/assets/home-team/workshop-team.webp','/assets/home-hero-v3/reception-portrait.webp','/assets/home-hero-v3/hospitality-portrait.webp'];
for(const path of images){assert(html.includes(path),path);const response=await get(path);assert.equal(response.status,200,path);assert(response.headers.get('content-type').startsWith('image/'));assert((await response.arrayBuffer()).byteLength>1000)}
assert(html.includes('AI-generated design concept'));assert(html.includes('Senior craftspeople’s experience'));
const target='/get-a-quote/?source=homepage-hero&entry=%2F&cta=content';assert(html.includes(target.replaceAll('&','&amp;')));
const gate=await get(target);assert.equal(gate.status,303);assert.equal(new URL(gate.headers.get('location'),base).searchParams.get('next'),target);await gate.arrayBuffer();
const about=await get('/about/');assert.equal(about.status,200);const aboutHtml=await about.text();assert(!/<header[^>]*class="[^"]*home-immersive-header/.test(aboutHtml));assert(aboutHtml.includes('/brand/horizontal-graphite.svg'));
mkdirSync(new URL('../docs/evidence/hero-immersive/',import.meta.url),{recursive:true});
writeFileSync(new URL('../docs/evidence/hero-immersive/public-smoke.json',import.meta.url),JSON.stringify({date:new Date().toISOString(),base,scenes:3,images:images.length,quoteReturn:true,innerHeaderPreserved:true,passed:true},null,2));
console.log('PASS immersive hero: three scenes, complete portrait assets, controls, exact authenticated quote return and unchanged inner-page header.');
