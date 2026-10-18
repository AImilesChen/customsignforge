import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const catalog=JSON.parse(readFileSync(new URL('./content-catalog.json',import.meta.url),'utf8'));
const origin=process.env.TEST_ORIGIN||'http://localhost:4321';
const results=[];
for(const [slug,item] of Object.entries(catalog)){
 const path=item.product?`/projects/${slug}/`:['about','for-sign-companies','how-it-works'].includes(slug)?`/${slug}/`:['custom-logo-signs','sign-fabrication'].includes(slug)?`/landing/${slug}/`:`/products/${slug}/`;
 const response=await fetch(origin+path);assert.equal(response.status,200,path);
 const html=await response.text();const main=html.split('<main id="main">')[1]?.split('</main>')[0];assert(main,path);
 assert(!/\[(?:Legal entity|Verified location|Business email|WhatsApp number)\]/.test(main),path+' unresolved business placeholder');
 const firstHeading=item.body.match(/^## (.+)$/m)?.[1];if(firstHeading)assert(main.includes(firstHeading.replaceAll('&','&amp;')),path+' missing enriched copy');
 for(const image of item.gallery||[]){assert(main.includes(image.src),path+' missing gallery image');assert(main.includes(image.alt.replaceAll('&','&amp;')),path+' missing gallery description');}
 if(item.product){assert(main.includes(`/products/${item.product}/`),path+' missing product relationship');assert(main.includes('project='+slug),path+' missing enquiry context');}
 for(const related of item.relatedProducts||[])assert(main.includes(`/products/${related}/`),path+' missing selected product');
 for(const related of item.relatedProjects||[])assert(main.includes(`/projects/${related}/`),path+' missing selected reference');
 if(slug==='acrylic-letters'){assert(!main.includes('/projects/office-logo-concept/'));assert(main.includes('/projects/acrylic-letter-reference/'));}
 const headings=[...main.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map(match=>match[1].replace(/<[^>]+>/g,'').trim());assert.equal(new Set(headings).size,headings.length,path+' repeated section heading');
 results.push({path,galleryImages:(item.gallery||[]).length,passed:true});
}
mkdirSync(new URL('../docs/evidence/',import.meta.url),{recursive:true});writeFileSync(new URL('../docs/evidence/inner-content-smoke.json',import.meta.url),JSON.stringify({date:new Date().toISOString(),results},null,2));
console.log(`PASS ${results.length} content pages: enriched copy, image galleries, selected references, enquiry context and no repeated section headings.`);
