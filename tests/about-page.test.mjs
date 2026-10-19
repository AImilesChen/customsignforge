import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,existsSync} from 'node:fs';
import {aboutPresentation} from '../src/lib/about-page.mjs';
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const content=read('../src/data/about-content.json'),defaults=read('../src/data/about-defaults.json'),old=read('../src/data/trade-content.json').about,profile=read('../src/data/manufacturing-profile.json');
const migration=readFileSync(new URL('../migrations/0012_about_page.sql',import.meta.url),'utf8');
function db(){const d=new DatabaseSync(':memory:');d.exec(readFileSync(new URL('../migrations/0001_initial.sql',import.meta.url),'utf8'));return d}
function insert(d,draft,published=draft,status='published'){d.prepare('INSERT INTO content_items(id,type,slug,status,draft_json,published_json) VALUES(?,?,?,?,?,?)').run('about','page','about',status,JSON.stringify(draft),JSON.stringify(published))}
test('About migration upgrades old copy including CRLF, is repeatable and preserves SEO and extra media',()=>{
 const d=db();try{const page={...old,body:old.body.replaceAll('\n','\r\n'),seoTitle:'Custom SEO',gallery:[{src:'/assets/custom.webp',alt:'Custom photograph'}]};insert(d,page);d.exec(migration);const saved=JSON.parse(d.prepare("SELECT published_json FROM content_items WHERE slug='about'").get().published_json);assert.equal(saved.title,content.title);assert.equal(saved.body,defaults.newBody);assert.equal(saved.image,content.hero.src);assert.equal(saved.imageAlt,content.hero.alt);assert.equal(saved.seoTitle,page.seoTitle);assert.deepEqual(saved.gallery,page.gallery);const before=d.prepare('SELECT * FROM content_items').all();d.exec(migration);assert.deepEqual(d.prepare('SELECT * FROM content_items').all(),before)}finally{d.close()}
});
test('About migration and presentation preserve edited drafts, unpublished pages and custom field overrides',()=>{
 for(const [draft,published,status] of [[{...old,body:'Operator draft'},old,'published'],[old,old,'draft'],[{...old,body:'Custom published copy'},{...old,body:'Custom published copy'},'published']]){const d=db();try{insert(d,draft,published,status);const before=d.prepare('SELECT * FROM content_items').all();d.exec(migration);assert.deepEqual(d.prepare('SELECT * FROM content_items').all(),before)}finally{d.close()}}
 const custom={...old,title:'A custom title',intro:'A custom introduction',image:'/assets/custom.webp',imageAlt:'My image',imageKind:'finished_product',gallery:[{src:'/assets/custom-extra.webp'}]};const d=db();try{insert(d,custom);d.exec(migration);const saved=JSON.parse(d.prepare("SELECT published_json FROM content_items WHERE slug='about'").get().published_json);for(const key of ['title','intro','image','imageAlt','imageKind'])assert.equal(saved[key],custom[key]);const view=aboutPresentation({...saved,body:'Additional custom story'},content,defaults);assert.equal(view.hero.src,custom.image);assert(view.customBody);assert.deepEqual(view.extra,custom.gallery)}finally{d.close()}
 assert(!aboutPresentation({...old,body:old.body.replaceAll('\n','\r\n')},content,defaults).customBody);
});
test('About media and metric meanings stay complete and distinguish craft experience from brand age',()=>{
 assert.deepEqual(profile.homeMetrics,['experience','team','equipment']);assert.deepEqual(profile.aboutMetrics,['team','design','equipment','space']);assert.match(profile.metrics.experience.label,/craftspeople/);assert.equal(profile.metrics.team.value,'100+');
 for(const item of [content.hero,content.team,content.check,content.packing,...content.capabilities]){assert(existsSync(new URL('../public'+item.src,import.meta.url)),item.src);assert(item.alt);assert(item.caption)}
 assert.equal(content.roles.length,3);assert.equal(content.quality.length,3);assert.match(content.teamIntro,/senior technical craftspeople.*decade/);assert(!/founded in|established in|years in business|UL.certified|guaranteed delivery/i.test(JSON.stringify(content)));
});
