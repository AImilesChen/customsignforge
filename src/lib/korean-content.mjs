import site from '../data/zh/site.json' with {type:'json'};
import detail from '../data/zh/product-detail-content.json' with {type:'json'};
import copy from '../data/ko/public.json' with {type:'json'};
import overrides from '../data/ko/overrides.json' with {type:'json'};
import cases from '../data/ko/case-descriptions.json' with {type:'json'};

const dictionary={...Object.fromEntries(Object.entries(copy).map(([key,value])=>[key,value.trim()])),...overrides};
const localize=value=>Array.isArray(value)?value.map(localize):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,item])=>[key,localize(item)])):typeof value==='string'&&Object.hasOwn(dictionary,value.trim())?value.replace(value.trim(),dictionary[value.trim()]):value;
const koreanDetail=localize(detail);
koreanDetail.cases={...koreanDetail.cases,...cases};
export const koreanPublicCopy={site:localize(site),detail:koreanDetail};
