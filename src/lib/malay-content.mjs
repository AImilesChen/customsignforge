import site from '../data/zh/site.json' with {type:'json'};
import detail from '../data/zh/product-detail-content.json' with {type:'json'};
import copy from '../data/ms/public.json' with {type:'json'};
export function malayPublic(value){return typeof value==='string'&&Object.hasOwn(copy,value.trim())?value.replace(value.trim(),copy[value.trim()]):value;}
const localize=value=>Array.isArray(value)?value.map(localize):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,localize(v)])):malayPublic(value);
export const publicCopy={site:localize(site),detail:localize(detail)};
