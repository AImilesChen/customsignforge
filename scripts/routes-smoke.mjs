import assert from 'node:assert/strict';
import {writeFileSync,mkdirSync} from 'node:fs';
const origin=process.env.TEST_ORIGIN||'http://localhost:4321';
const pending=['/'],seen=new Set(),results=[],images=new Set();
while(pending.length){
 const path=pending.shift();if(seen.has(path))continue;seen.add(path);
 const response=await fetch(origin+path);const html=await response.text();
 assert.equal(response.status,200,path);assert(html.includes('noindex'),path+' must remain a preview');
 assert.equal((html.match(/<h1[\s>]/g)||[]).length,1,path+' must have one main heading');
 results.push({path,status:response.status});
 for(const match of html.matchAll(/href="(\/[^"?#]*)/g)){
  const link=match[1];if(!/^\/(admin|api|auth|_astro|assets|brand|media|design-system)(\/|$)/.test(link)&&!seen.has(link))pending.push(link);
 }
 for(const match of html.matchAll(/src="(\/(?:assets|brand)\/[^"?#]+)/g))images.add(match[1]);
}
for(const path of images)assert.equal((await fetch(origin+path)).status,200,path);
mkdirSync(new URL('../docs/evidence/',import.meta.url),{recursive:true});
writeFileSync(new URL('../docs/evidence/routes-smoke.json',import.meta.url),JSON.stringify({date:new Date().toISOString(),results,images:images.size},null,2));
console.log(`PASS ${results.length} linked public pages; ${images.size} image assets; preview indexing protection and main headings.`);
