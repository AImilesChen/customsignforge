import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {filterProjects,isFabrication,projectQuoteParams,PROJECT_SETTINGS} from '../src/lib/project-library.mjs';
import {validateContent} from '../src/lib/validation.mjs';
const catalog=JSON.parse(readFileSync(new URL('../scripts/content-catalog.json',import.meta.url),'utf8'));
const designs=JSON.parse(readFileSync(new URL('../src/data/project-presentations.json',import.meta.url),'utf8'));
const migration=readFileSync(new URL('../migrations/0010_projects_library.sql',import.meta.url),'utf8');
function database(){const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../migrations/0001_initial.sql',import.meta.url),'utf8'));return db}
function insert(db,slug,draft,published=draft,status='published'){db.prepare('INSERT INTO content_items(id,type,slug,status,draft_json,published_json) VALUES(?,?,?,?,?,?)').run(slug,'project',slug,status,JSON.stringify(draft),JSON.stringify(published))}
test('projects migration upgrades 8 starter records, adds 4 scenes, survives CRLF and is idempotent',()=>{
 const db=database();try{
  for(const slug of Object.keys(designs).filter(slug=>catalog[slug]))insert(db,slug,{...catalog[slug],body:catalog[slug].body.replaceAll('\n','\r\r\n')});
  db.exec(migration.replace(/\r?\n/g,'\r\n'));
  const rows=db.prepare("SELECT * FROM content_items WHERE type='project' ORDER BY slug").all();assert.equal(rows.length,12);
  for(const row of rows){const actual=JSON.parse(row.published_json),expected=designs[row.slug];for(const field of ['title','intro','body','image','imageAlt','imageKind','setting','gallery'])assert.deepEqual(actual[field],expected[field],row.slug+' '+field)}
  db.exec(migration);assert.deepEqual(db.prepare("SELECT * FROM content_items WHERE type='project' ORDER BY slug").all(),rows);
 }finally{db.close()}
});
test('projects migration protects edited drafts, SEO, galleries and unpublished or pre-existing slugs',()=>{
 const db=database();try{
  const original=catalog['office-logo-concept'];
  insert(db,'office-logo-concept',{...original,body:'Custom draft',gallery:[],seoTitle:'Draft SEO'},{...original,seoTitle:'Published SEO'});
  insert(db,'storefront-concept',catalog['storefront-concept'],catalog['storefront-concept'],'draft');
  insert(db,'hospitality-metal-concept',{title:'Operator-owned draft',body:'Do not publish'},null,'draft');
  db.exec(migration);
  const office=db.prepare("SELECT * FROM content_items WHERE slug='office-logo-concept'").get(),d=JSON.parse(office.draft_json),p=JSON.parse(office.published_json);
  assert.equal(d.body,'Custom draft');assert.equal(p.body,original.body);assert.deepEqual(d.gallery,[]);assert.deepEqual(p.gallery,original.gallery);assert.equal(d.seoTitle,'Draft SEO');assert.equal(p.seoTitle,'Published SEO');
  const draft=db.prepare("SELECT * FROM content_items WHERE slug='storefront-concept'").get();assert.equal(draft.status,'draft');assert.deepEqual(JSON.parse(draft.draft_json),catalog['storefront-concept']);
  const existing=db.prepare("SELECT * FROM content_items WHERE slug='hospitality-metal-concept'").get();assert.equal(existing.status,'draft');assert.equal(JSON.parse(existing.draft_json).title,'Operator-owned draft');assert.equal(JSON.parse(existing.published_json),null);
 }finally{db.close()}
});
test('application and style filters intersect, exclude samples and preserve the selected quote context',()=>{
 const works=Object.entries(designs).map(([slug,d])=>({...d,slug,productSlug:d.product}));
 assert.equal(filterProjects(works).length,6);assert.equal(works.filter(isFabrication).length,6);
 assert.equal(filterProjects(works,{application:'Office'}).length,2);
 assert.equal(filterProjects(works,{application:'Office',style:'backlit-letters'})[0].slug,'office-logo-concept');
 assert.equal(filterProjects(works,{application:'Office',style:'specialty-signs'}).length,0);
 const work=works.find(w=>w.slug==='marquee-entrance-concept'),context=projectQuoteParams(work);
 assert.deepEqual(context,{entry:'/projects/marquee-entrance-concept/',cta:'project',project:work.slug,style:'specialty-signs'});
 assert(!('style' in projectQuoteParams({slug:'unassigned',product:-1})));
});
test('design content round-trips through CMS and uses existing assets without fabricated deliveries',()=>{
 for(const [slug,d] of Object.entries(designs)){
  const checked=validateContent(d,'project');assert.equal(checked.body,d.body,slug);assert(PROJECT_SETTINGS.includes(checked.setting));assert(catalog[d.product],d.product);
  for(const photo of [{src:d.image},...d.gallery])assert(existsSync(new URL('../public'+photo.src,import.meta.url)),photo.src);
  for(const reference of d.references)assert(designs[reference],reference);
  assert(d.rationale.length>=2);assert(d.installation.length>0);
  if(d.imageKind==='concept'){assert.equal(d.specs.length,6);assert.equal(d.gallery.length,2);assert(d.sourceNote.includes('not a delivered client installation'));}
  const publicCopy=JSON.stringify({...d,sourceNote:''});assert(!/manufacturing partners|our supplier|delivered in|completed for|certified factory/i.test(publicCopy),slug);
 }
});
