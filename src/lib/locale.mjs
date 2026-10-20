// The URL is the source of truth. API, assets and owner management keep one shared route.
export function routeLocale(path='/') {return path==='/zh'||path.startsWith('/zh/')?'zh':'en';}
export function basePath(path='/') {return routeLocale(path)==='zh'?(path.slice(3)||'/'):path;}
export function localePath(value='/',locale='en') {
 if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||/[\\\r\n]/.test(value))return value;
 const match=value.match(/^([^?#]*)([?#].*)?$/),path=basePath(match[1]);
 if(/^\/(admin|api|auth|assets|brand|media|_astro|design-kit|review)(\/|$)/.test(path))return path+(match[2]||'');
 return (locale==='zh'?'/zh'+(path==='/'?'/':path):path)+(match[2]||'');
}
export function switchLanguage(path,search='',hash='',locale='en') {
 const params=new URLSearchParams(search);
 if(basePath(path)==='/sign-in/'&&params.has('next'))params.set('next',localePath(params.get('next'),locale));
 return localePath(path,locale)+(params.size?'?'+params:'')+(/^(#[a-z0-9-]*)?$/i.test(hash)?hash:'');
}
export const htmlLanguage=locale=>locale==='zh'?'zh-Hans':'en';
