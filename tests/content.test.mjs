import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fixture,request} from './helpers.mjs';
import {validateContent} from '../src/lib/validation.mjs';
import {handleAPI} from '../src/lib/api.mjs';
import {DatabaseSync} from 'node:sqlite';
const catalog=JSON.parse(readFileSync(new URL('../scripts/content-catalog.json',import.meta.url),'utf8'));
test('content upgrade handles Windows line endings and preserves edited drafts',()=>{
 const db=new DatabaseSync(':memory:');try{
  db.exec(readFileSync(new URL('../migrations/0001_initial.sql',import.meta.url),'utf8'));
  const initial=JSON.parse(readFileSync(new URL('./initial-copy-fixture.json',import.meta.url),'utf8'));
  for(const [slug,value] of Object.entries(initial)){
   const draft=slug==='acrylic-letters'?{...value,body:'Operator edited draft: keep this.'}:value;
   db.prepare('INSERT INTO content_items(id,type,slug,draft_json,published_json,status) VALUES(?,?,?,?,?,?)').run(slug,slug==='about'?'page':'product',slug,JSON.stringify(draft),JSON.stringify(value),'published');
  }
  const migration=readFileSync(new URL('../migrations/0003_enriched_content.sql',import.meta.url),'utf8').replace(/\r?\n/g,'\r\n');db.exec(migration);
  const about=db.prepare("SELECT * FROM content_items WHERE slug='about'").get();assert.equal(JSON.parse(about.published_json).body,catalog.about.body);
  const edited=db.prepare("SELECT * FROM content_items WHERE slug='acrylic-letters'").get();assert.equal(JSON.parse(edited.draft_json).body,'Operator edited draft: keep this.');assert.equal(JSON.parse(edited.published_json).body,initial['acrylic-letters'].body);
  db.exec(migration);assert.equal(db.prepare("SELECT version FROM content_items WHERE slug='about'").get().version,2);
 }finally{db.close()}
});
test('enriched references validate; gallery URLs cannot escape local image paths',()=>{
 for(const [slug,item] of Object.entries(catalog)){
  const type=item.product?'project':slug.includes('sign-fabrication')||slug==='custom-logo-signs'?'landing':['about','for-sign-companies','how-it-works'].includes(slug)?'page':'product';
  const clean=validateContent(item,type);assert.equal(clean.body,item.body);
  for(const image of item.gallery||[])assert(existsSync(new URL('../public'+image.src,import.meta.url)),image.src);
 }
 const base=catalog['acrylic-letters'];
 for(const src of ['https://example.com/image.jpg','/assets/../secret.jpg','javascript:alert(1)'])assert.throws(()=>validateContent({...base,gallery:[{src,alt:'test',caption:'test'}]},'product'));
 assert.throws(()=>validateContent({...base,gallery:[{src:'/assets/test.webp',alt:'',caption:'test'}]},'product'));
});
test('publication rejects missing gallery uploads and unpublished landing references',async()=>{
 const f=fixture();try{
  const login=await handleAPI(request('api/admin/login','POST',{password:f.env.LOCAL_ADMIN_PASSWORD}),f.env,'admin/login');const cookie=login.headers.get('set-cookie').split(';')[0];const session=await (await handleAPI(request('api/admin/session','GET',undefined,{cookie}),f.env,'admin/session')).json();const headers={cookie,'X-CSRF-Token':session.csrf};
  const item=f.sqlite.prepare("SELECT * FROM content_items WHERE slug='custom-logo-signs'").get();const data=JSON.parse(item.draft_json);
  const publish=body=>handleAPI(request('api/admin/content/'+item.id,'PUT',{...data,version:1,action:'publish',...body},headers),f.env,'admin/content/'+item.id);
  assert.equal((await publish({gallery:[{src:'/media/missing.webp',alt:'Reference',caption:'Supplier reference'}]})).status,422);
  assert.equal((await publish({relatedProducts:['missing-product']})).status,422);
  const result=await publish({});assert.equal(result.status,200);
  const saved=JSON.parse(f.sqlite.prepare('SELECT published_json FROM content_items WHERE id=?').get(item.id).published_json);assert.deepEqual(saved.relatedProjects,data.relatedProjects);
 }finally{f.close()}
});
