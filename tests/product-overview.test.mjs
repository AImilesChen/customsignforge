import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {visibleDirections,productDirectionQuote} from '../src/lib/product-overview.mjs';
const overview=JSON.parse(readFileSync(new URL('../src/data/product-overview.json',import.meta.url),'utf8'));
const presentations=JSON.parse(readFileSync(new URL('../src/data/product-pages.json',import.meta.url),'utf8'));
test('overview only shows published product families, including both lightbox and neon directions',()=>{
 const products=[{slug:'led-channel-letters'},{slug:'lightbox-neon'}];
 const visible=visibleDirections(overview.sections,products);assert.equal(visible.length,3);assert.deepEqual(visible.map(s=>s.id),['led-channel-letters','lightbox-neon','neon-style']);
 assert.deepEqual(visibleDirections(overview.sections,[]),[]);
 const withoutLightbox=visibleDirections(overview.sections,[{slug:'led-channel-letters'}]);assert.equal(withoutLightbox.length,1);
});
test('every overview enquiry retains its exact style and valid direction; media references are complete',()=>{
 assert.equal(overview.sections.length,7);assert.equal(new Set(overview.sections.map(s=>s.slug)).size,6);assert.equal(new Set(overview.sections.map(s=>s.id)).size,7);
 for(const section of overview.sections){
  assert(presentations[section.slug]);assert.equal(section.features.length,3);assert(section.uses.length>0);assert(section.custom);
  for(const photo of [section.image,section.detail]){assert(existsSync(new URL('../public'+photo.src,import.meta.url)),photo.src);assert(photo.alt);assert(photo.caption)}
  const params=productDirectionQuote(section);assert.equal(params.entry,'/products/');assert.equal(params.style,section.slug);assert.equal(params.cta,'content');
  if(section.variant)assert(presentations[section.slug].directions.some(d=>d.anchor===params.variant),section.id);else assert(!('variant' in params));
 }
});
