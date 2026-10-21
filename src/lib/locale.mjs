// One registry drives paths, validation, language choices and search alternates.
export const LOCALES={en:{label:'English',html:'en',prefix:''},zh:{label:'简体中文',html:'zh-Hans',prefix:'/zh'},ms:{label:'Bahasa Melayu',html:'ms-MY',prefix:'/ms'},th:{label:'ไทย',html:'th-TH',prefix:'/th'},de:{label:'Deutsch',html:'de-DE',prefix:'/de'}};
export const localeCodes=Object.keys(LOCALES);
export const validLocale=value=>Object.hasOwn(LOCALES,value);
export function routeLocale(path='/') {return localeCodes.find(code=>LOCALES[code].prefix&&(path===LOCALES[code].prefix||path.startsWith(LOCALES[code].prefix+'/')))||'en';}
export function basePath(path='/') {const locale=routeLocale(path);return LOCALES[locale].prefix?(path.slice(LOCALES[locale].prefix.length)||'/'):path;}
export function localePath(value='/',locale='en') {
 if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||/[\\\r\n]/.test(value))return value;
 const match=value.match(/^([^?#]*)([?#].*)?$/),path=basePath(match[1]);
 if(/^\/(admin|api|auth|assets|brand|media|_astro|design-kit|review)(\/|$)/.test(path))return path+(match[2]||'');
 return ((LOCALES[locale]?.prefix||'')+path)+(match[2]||'');
}
export function switchLanguage(path,search='',hash='',locale='en') {
 const params=new URLSearchParams(search);
 if(basePath(path)==='/sign-in/'&&params.has('next'))params.set('next',localePath(params.get('next'),locale));
 return localePath(path,locale)+(params.size?'?'+params:'')+(/^(#[a-z0-9-]*)?$/i.test(hash)?hash:'');
}
export const htmlLanguage=locale=>LOCALES[locale]?.html||'en';
