import site from '../data/zh/site.json' with {type:'json'};
import detail from '../data/zh/product-detail-content.json' with {type:'json'};
import copy from '../data/pt-br/public.json' with {type:'json'};
import overrides from '../data/pt-br/overrides.json' with {type:'json'};

const dictionary={...copy,...overrides};
const localize=value=>Array.isArray(value)?value.map(localize):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,item])=>[key,localize(item)])):typeof value==='string'&&Object.hasOwn(dictionary,value.trim())?value.replace(value.trim(),dictionary[value.trim()]):value;
export const portuguesePublicCopy={site:localize(site),detail:localize(detail)};
