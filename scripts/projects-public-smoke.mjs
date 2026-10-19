import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {projectQuoteParams} from '../src/lib/project-library.mjs';
const base=(process.env.TEST_ORIGIN||'https://customsignforge.com').replace(/\/$/,'');
const content=JSON.parse(readFileSync(new URL('../src/data/project-presentations.json',import.meta.url),'utf8'));
const get=path=>fetch(base+path,{redirect:'manual',headers:{'User-Agent':'CustomSignForge-Projects-QA'}});
const list=await get('/projects/');assert.equal(list.status,200);const html=await list.text();
for(const id of ['design-library','fabrication-library'])assert(html.includes('id="'+id+'"'),id);
assert.equal((html.match(/class="design-card"/g)||[]).length,6);assert.equal((html.match(/class="design-card design-card-compact"/g)||[]).length,6);
assert(!/supplier reference|manufacturing partners/i.test(html.split('<main id="main">')[1]));
const images=new Set();
for(const [slug,d] of Object.entries(content)){
 const path='/projects/'+slug+'/',r=await get(path);assert.equal(r.status,200,path);const body=await r.text();
 assert.equal((body.match(/<h1[\s>]/g)||[]).length,1,path);assert(body.includes(d.title.replaceAll('&','&amp;')),path);assert(body.includes('id="design-approach"'),path);assert(body.includes('id="site-preparation"'),path);
 if(d.imageKind==='concept'){assert(body.includes('id="design-specification"'),path);assert(body.includes('id="design-details"'),path);}
 assert(!/supplier reference|manufacturing partners|our supplier/i.test(body.split('<main id="main">')[1]),path);
 const target='/get-a-quote/?'+new URLSearchParams(projectQuoteParams({...d,slug}));assert(body.includes(target.replaceAll('&','&amp;')),path+' quote');
 const gate=await get(target);assert.equal(gate.status,303,path);assert.equal(new URL(gate.headers.get('location'),base).searchParams.get('next'),target,path+' login preserves context');
 for(const src of [d.image,...d.gallery.map(p=>p.src)]){assert(body.includes(src),src);images.add(src)}
}
for(const src of images)assert.equal((await get(src)).status,200,src);
const noResults=await get('/projects/?application=Office&style=specialty-signs');assert((await noResults.text()).includes('No Designs Match These Filters'));
mkdirSync(new URL('../docs/evidence/projects-redesign/',import.meta.url),{recursive:true});writeFileSync(new URL('../docs/evidence/projects-redesign/public-smoke.json',import.meta.url),JSON.stringify({date:new Date().toISOString(),base,pages:13,images:images.size,quoteContextPreserved:true,passed:true},null,2));
console.log('PASS projects: 6 scene designs, 6 fabrication references, 12 detail routes, image assets, filter empty state and authenticated enquiry context.');
