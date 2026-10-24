import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,existsSync} from 'node:fs';
const catalog=JSON.parse(readFileSync(new URL('../scripts/content-catalog.json',import.meta.url),'utf8'));
const trade=JSON.parse(readFileSync(new URL('../src/data/trade-content.json',import.meta.url),'utf8'));
const oldTradeBody=trade.body.replace('Share your artwork, approximate dimensions, quantity, delivery destination and target date without signing in.','Sign in to share your artwork, approximate dimensions, quantity, delivery destination and target date.');
const oldAboutBody=trade.about.body.replace('Send your full project details and optional files without creating an account, then discuss the specification and quote with us.','Sign in to send your project details and files, then discuss the specification and quote with us.');
const migration=readFileSync(new URL('../migrations/0009_trade_manufacturing_copy.sql',import.meta.url),'utf8');
const guestCopyMigration=readFileSync(new URL('../migrations/0018_guest_enquiry_copy.sql',import.meta.url),'utf8');
function database(){const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../migrations/0001_initial.sql',import.meta.url),'utf8'));return db}
function insertPage(db,slug,draft,published=draft){db.prepare('INSERT INTO content_items(id,type,slug,status,draft_json,published_json) VALUES(?,?,?,?,?,?)').run(slug,'page',slug,'published',JSON.stringify(draft),JSON.stringify(published))}

test('trade marketing migration upgrades known defaults, preserves contact identity and is idempotent',()=>{
 const db=database();try{
  for(const slug of ['about','for-sign-companies'])insertPage(db,slug,catalog[slug]);
  const original={email:'hello@example.test',whatsapp:'12025550123',operatorName:'Confirmed operator',businessDescription:'Custom business signs, illuminated letters and dimensional lettering, supplied through manufacturing partners. We welcome project enquiries for Southeast Asia, Europe and North America. Specifications, price and delivery arrangements are confirmed individually.'};
  db.prepare('INSERT INTO site_settings(id,value_json) VALUES(1,?)').run(JSON.stringify(original));
  db.exec(migration.replace(/\r?\n/g,'\r\n'));
  const about=JSON.parse(db.prepare("SELECT published_json FROM content_items WHERE slug='about'").get().published_json);
  const page=JSON.parse(db.prepare("SELECT published_json FROM content_items WHERE slug='for-sign-companies'").get().published_json);
  assert.equal(page.body,oldTradeBody);assert.equal(page.title,trade.title);assert.equal(page.image,trade.hero.src);assert.equal(page.imageKind,'sample');assert.equal(about.body,oldAboutBody);
  const settings=JSON.parse(db.prepare('SELECT value_json FROM site_settings').get().value_json);assert.equal(settings.businessDescription,trade.businessDescription);
  for(const key of ['email','whatsapp','operatorName'])assert.equal(settings[key],original[key]);
  const before=db.prepare('SELECT id,version,draft_json,published_json FROM content_items ORDER BY id').all();db.exec(migration);assert.deepEqual(db.prepare('SELECT id,version,draft_json,published_json FROM content_items ORDER BY id').all(),before);
 }finally{db.close()}
});

test('guest enquiry copy migration updates only former login instructions and is repeatable',()=>{
 const db=database();try{
  insertPage(db,'about',{...catalog.about,body:oldAboutBody});
  insertPage(db,'for-sign-companies',{...catalog['for-sign-companies'],body:oldTradeBody});
  const custom={...catalog['for-sign-companies'],body:'Operator-defined trade copy'};
  insertPage(db,'custom',custom);
  db.exec(guestCopyMigration);
  const about=JSON.parse(db.prepare("SELECT published_json FROM content_items WHERE slug='about'").get().published_json);
  const tradePage=JSON.parse(db.prepare("SELECT published_json FROM content_items WHERE slug='for-sign-companies'").get().published_json);
  const untouched=JSON.parse(db.prepare("SELECT published_json FROM content_items WHERE slug='custom'").get().published_json);
  assert.equal(about.body,trade.about.body);assert.equal(tradePage.body,trade.body);assert.equal(untouched.body,custom.body);
  const before=db.prepare('SELECT id,version,draft_json,published_json FROM content_items ORDER BY id').all();db.exec(guestCopyMigration);assert.deepEqual(db.prepare('SELECT id,version,draft_json,published_json FROM content_items ORDER BY id').all(),before);
 }finally{db.close()}
});

test('trade migration never replaces custom drafts, SEO, galleries or operator business descriptions',()=>{
 const db=database();try{
  const custom={...catalog['for-sign-companies'],body:'Operator custom draft',seoTitle:'Operator SEO',gallery:[{src:'/assets/custom.webp',alt:'Custom',caption:'Custom'}]};
  insertPage(db,'for-sign-companies',custom,{...catalog['for-sign-companies'],seoTitle:'Published SEO'});
  db.prepare('INSERT INTO site_settings(id,value_json) VALUES(1,?)').run(JSON.stringify({businessDescription:'Operator business description',email:'contact@example.test'}));db.exec(migration);
  const r=db.prepare("SELECT * FROM content_items WHERE slug='for-sign-companies'").get(),d=JSON.parse(r.draft_json),p=JSON.parse(r.published_json);
  assert.equal(d.body,custom.body);assert.equal(p.body,catalog['for-sign-companies'].body);assert.equal(d.seoTitle,'Operator SEO');assert.equal(p.seoTitle,'Published SEO');assert.deepEqual(d.gallery,custom.gallery);assert.deepEqual(p.gallery,catalog['for-sign-companies'].gallery);
  assert.equal(JSON.parse(db.prepare('SELECT value_json FROM site_settings').get().value_json).businessDescription,'Operator business description');
 }finally{db.close()}
});

test('trade content uses available image assets, links existing product types and makes no invented scale or certification claims',()=>{
 const photos=[trade.hero,...trade.products.map(p=>({src:p.image})),...trade.production.map(p=>({src:p.image})),...trade.references.map(p=>({src:p.image})),...trade.about.gallery];
 for(const p of photos)assert(existsSync(new URL('../public'+p.src,import.meta.url)),p.src);
 for(const p of trade.products)assert(catalog[p.slug],p.slug);
 const copy=JSON.stringify(trade);assert(!/manufacturing partners|production partners|our factory|certified factory|24.hour|100% guaranteed/i.test(copy));
});
