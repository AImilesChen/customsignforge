import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {selectedScene,sceneQuoteParams} from '../src/lib/product-scenes.mjs';
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const pages=read('../src/data/product-pages.json');
test('each product has a distinct, explained gallery and valid scene enquiry context',()=>{
 assert.equal(Object.keys(pages).length,6);let count=0;
 for(const [slug,page] of Object.entries(pages)){
  assert(page.contexts.length>=4&&page.contexts.length<=6,slug);
  assert.equal(new Set(page.contexts.map(s=>s.id)).size,page.contexts.length);
  assert.equal(new Set(page.contexts.map(s=>s.src)).size,page.contexts.length);
  assert.equal(page.technicalNotes.length,3);assert.equal(page.faq.length,6);
  for(const scene of page.contexts){
   count++;assert(existsSync(new URL('../public'+scene.src,import.meta.url)),scene.src);
   for(const field of ['caption','alt','space','description','prepare'])assert(scene[field]?.length>5,slug+' '+field);
   assert.equal(scene.kind,'concept');assert.equal(scene.tags.length,2);
   assert.equal(selectedScene(pages,slug,scene.id),scene);
   const params=sceneQuoteParams(slug,scene);assert.equal(params.style,slug);assert.equal(params.entry,'/products/'+slug+'/');assert.equal(params.concept,scene.id);assert.equal(params.cta,'product');
   if(scene.variant)assert(page.directions.some(d=>d.anchor===params.variant));else assert(!('variant' in params));
   for(const other of Object.keys(pages).filter(s=>s!==slug))assert.equal(selectedScene(pages,other,scene.id),null);
  }
 }
 assert.equal(count,25);assert.equal(selectedScene(pages,'unknown','unknown'),null);assert.equal(selectedScene(pages,'backlit-letters','untrusted free text'),null);
});
test('new concept media matches the provenance ledger and responsive image index',()=>{
 const ledger=read('../docs/product-depth-assets.json'),sizes=read('../src/data/image-sizes.json'),responsive=read('../src/data/image-variants.json');assert.equal(ledger.length,16);
 for(const media of ledger){
  const body=readFileSync(new URL('../public'+media.src,import.meta.url));assert.equal(createHash('sha256').update(body).digest('hex'),media.sha256);
  assert.equal(media.real_project_or_production_evidence,false);assert.deepEqual(sizes[media.src],[media.width,media.height]);
  assert.equal(responsive[media.src].width,media.width);assert.equal(responsive[media.src].variants.length,3);
  for(const variant of responsive[media.src].variants)assert(existsSync(new URL('../public'+variant.src,import.meta.url)));
 }
});
