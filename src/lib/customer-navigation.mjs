import {basePath,localePath} from './locale.mjs';
// Shared with the browser; never import authentication keys into a client bundle.
export function customerNext(value,locale='en'){
 const fallback=localePath('/account/',locale);
 if(typeof value!=='string'||value.length>1800||!value.startsWith('/')||value.startsWith('//')||/[\\\r\n]/.test(value))return fallback;
 const u=new URL(value,'https://customer.invalid');
 if(u.origin!=='https://customer.invalid')return fallback;
 if(basePath(u.pathname)==='/account/')return u.pathname;
 return basePath(u.pathname)==='/get-a-quote/'?u.pathname+u.search:fallback;
}
