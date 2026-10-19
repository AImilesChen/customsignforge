import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {processQuoteParams,isStandardProcessBody} from '../src/lib/process-page.mjs';
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const content=read('../src/data/process-content.json'),defaults=read('../src/data/process-defaults.json'),catalog=read('../scripts/content-catalog.json');
const migration=readFileSync(new URL('../migrations/0011_process_page.sql',import.meta.url),'utf8');
function db(){const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../migrations/0001_initial.sql',import.meta.url),'utf8'));return db}
function insert(db,slug,draft,published=draft,status='published'){db.prepare('INSERT INTO content_items(id,type,slug,status,draft_json,published_json) VALUES(?,?,?,?,?,?)').run(slug,'page',slug,status,JSON.stringify(draft),JSON.stringify(published))}
test('process copy migration upgrades unchanged defaults including CRLF, preserving custom fields and repeatability',()=>{
 const d=db();try{
  const original={...catalog['how-it-works'],title:defaults.title,intro:defaults.intro,body:defaults.body.replaceAll('\n','\r\n'),image:defaults.image,imageAlt:'Illustrative sign inspection',seoTitle:'My SEO',gallery:[{src:'/assets/custom.webp',alt:'Custom reference',caption:'My caption'}]};
  insert(d,'how-it-works',original);d.exec(migration.replace(/\r?\n/g,'\r\n'));
  const page=JSON.parse(d.prepare("SELECT published_json FROM content_items WHERE slug='how-it-works'").get().published_json);
  assert.equal(page.title,content.title);assert.equal(page.intro,content.intro);assert.equal(page.body,defaults.newBody);assert.equal(page.image,content.hero.src);assert.equal(page.seoTitle,original.seoTitle);assert.deepEqual(page.gallery,original.gallery);
  const before=d.prepare('SELECT * FROM content_items').all();d.exec(migration);assert.deepEqual(d.prepare('SELECT * FROM content_items').all(),before);
 }finally{d.close()}
});
test('process migration protects edited drafts, unpublished pages and explicit image/title overrides',()=>{
 for(const status of ['published','draft']){const d=db();try{
  const original={...catalog['how-it-works'],body:defaults.body};const draft={...original,body:'Operator-edited draft'};insert(d,'how-it-works',draft,original,status);const before=d.prepare('SELECT * FROM content_items').all();d.exec(migration);assert.deepEqual(d.prepare('SELECT * FROM content_items').all(),before);
 }finally{d.close()}}
 const d=db();try{
  const original={...catalog['how-it-works'],body:defaults.body,title:'Custom heading',intro:'Custom introduction',image:'/assets/custom.webp',imageAlt:'Custom alt',imageKind:'finished_product'};insert(d,'how-it-works',original);d.exec(migration);const p=JSON.parse(d.prepare('SELECT published_json FROM content_items').get().published_json);for(const key of ['title','intro','image','imageAlt','imageKind'])assert.equal(p[key],original[key]);assert.equal(p.body,defaults.newBody);
 }finally{d.close()}
 assert(isStandardProcessBody(defaults.body.replaceAll('\n','\r\n'),[defaults.body]));assert(!isStandardProcessBody('Operator-edited copy',[defaults.body,defaults.newBody]));
});
test('process media, preparation, approval and authenticated enquiry references are complete',()=>{
 assert.equal(content.stages.length,4);assert.equal(new Set(content.stages.map(s=>s.id)).size,4);assert.equal(content.preparation.length,4);assert.equal(content.approval.length,6);assert.equal(content.faq.length,8);
 for(const s of content.stages)for(const key of ['input','work','result'])assert(s[key]?.length>30,s.id+' '+key);
 const photos=[content.hero,content.brief,content.specification,content.packing,...content.production];for(const p of photos){assert(existsSync(new URL('../public'+p.src,import.meta.url)),p.src);assert(p.alt);assert(p.caption)}
 const copy=JSON.stringify(content);assert(!/production partners?|manufacturing partners?|our factory|certified factory|24.hour|free design|guaranteed delivery/i.test(copy));assert.deepEqual(processQuoteParams(),{entry:'/how-it-works/',cta:'content'});
 const ledger=read('../docs/process-assets.json');assert.equal(ledger.length,2);for(const item of ledger){assert.equal(item.actual_order_or_inspection_record,false);const bytes=readFileSync(new URL('../public'+item.src,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256)}
});
