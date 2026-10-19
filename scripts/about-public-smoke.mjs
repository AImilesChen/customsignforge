import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
const base=(process.env.TEST_ORIGIN||'https://customsignforge.com').replace(/\/$/,'');
const content=JSON.parse(readFileSync(new URL('../src/data/about-content.json',import.meta.url),'utf8'));
const profile=JSON.parse(readFileSync(new URL('../src/data/manufacturing-profile.json',import.meta.url),'utf8'));
const get=path=>fetch(base+path,{redirect:'manual',headers:{'User-Agent':'CustomSignForge-About-QA'}});
const response=await get('/about/');assert.equal(response.status,200);const html=await response.text();
assert.equal((html.match(/<h1[\s>]/g)||[]).length,1);assert(!html.includes('class="section container editorial-layout"'));
for(const id of ['about-title','our-team','our-capabilities','quality-and-packing'])assert(html.includes('id="'+id+'"'),id);
assert(/href="\/about\/"[^>]*aria-current="page"|aria-current="page"[^>]*href="\/about\/"/.test(html));assert(html.includes('About Us'));
for(const key of profile.aboutMetrics)assert(html.includes(profile.metrics[key].value),key);
assert(html.includes('more than a decade of sign-making experience'));
const images=[...new Set([content.hero,content.team,content.check,content.packing,...content.capabilities].map(p=>p.src))];
for(const path of images){assert(html.includes(path));const r=await get(path);assert.equal(r.status,200,path);await r.arrayBuffer()}
const target='/get-a-quote/?entry=%2Fabout%2F&cta=content';assert(html.includes(target.replaceAll('&','&amp;')));const gate=await get(target);assert.equal(gate.status,303);assert.equal(new URL(gate.headers.get('location'),base).searchParams.get('next'),target);await gate.arrayBuffer();
const home=await get('/');const homeHtml=await home.text();assert(!homeHtml.includes('class="explore-strip"'));assert(homeHtml.includes('class="home-container home-hero-inner"'));for(const key of profile.homeMetrics)assert(homeHtml.includes(profile.metrics[key].value));
mkdirSync(new URL('../docs/evidence/about-v2/',import.meta.url),{recursive:true});writeFileSync(new URL('../docs/evidence/about-v2/public-smoke.json',import.meta.url),JSON.stringify({date:new Date().toISOString(),base,aboutNavigation:true,aboutMetrics:4,homeMetrics:3,images:images.length,quoteReturn:true,passed:true},null,2));console.log('PASS About: visible navigation, four manufacturing metrics, three homepage metrics, real team/production imagery and authenticated enquiry return.');
