import assert from 'node:assert/strict';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {DESIGN_NOTE} from '../src/lib/image-copy.mjs';
const base=(process.env.TEST_ORIGIN||'https://customsignforge.com').replace(/\/$/,'');
const products=JSON.parse(readFileSync(new URL('../src/data/product-pages.json',import.meta.url),'utf8'));
const projects={...JSON.parse(readFileSync(new URL('../src/data/project-presentations.json',import.meta.url),'utf8')),...JSON.parse(readFileSync(new URL('../src/data/project-gallery.json',import.meta.url),'utf8'))};
const routes=['/','/products/','/projects/','/how-it-works/','/for-sign-companies/','/about/','/contact/','/sign-in/','/landing/custom-logo-signs/','/landing/sign-fabrication/',...Object.keys(products).map(s=>'/products/'+s+'/'),...Object.keys(projects).map(s=>'/projects/'+s+'/')];
const result=[];
for(const route of routes){
 const response=await fetch(base+route,{headers:{'User-Agent':'CustomSignForge-Microcopy-QA'}});assert.equal(response.status,200,route);const html=await response.text();
 const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];assert(main,route);
 const text=main.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ');
 assert(!/AI-generated|Illustrative imagery|These are not delivered customer projects/i.test(text),route+' repeats image-production notes');
 const notes=main.split(DESIGN_NOTE).length-1;assert(notes<=1,route+' repeats the consolidated design note');
 if(route==='/sign-in/'){assert(main.includes('/privacy/'));assert(main.includes('/terms/'));assert(main.includes('Customer Sign In'));}
 result.push({route,designNotes:notes,passed:true});
}
mkdirSync(new URL('../docs/evidence/microcopy/',import.meta.url),{recursive:true});writeFileSync(new URL('../docs/evidence/microcopy/public-smoke.json',import.meta.url),JSON.stringify({date:new Date().toISOString(),base,pages:result.length,results:result,passed:true},null,2));
console.log('PASS concise marketing copy: '+result.length+' pages, no repeated image-generation notes, at most one design note per page, privacy/terms and login retained.');
