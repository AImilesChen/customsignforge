// Shared with the browser; never import authentication keys into a client bundle.
export function customerNext(value,locale='en'){
 const fallback=locale==='zh'?'/zh/account/':'/account/';
 if(typeof value!=='string'||value.length>1800||!value.startsWith('/')||value.startsWith('//')||/[\\\r\n]/.test(value))return fallback;
 const u=new URL(value,'https://customer.invalid');
 return u.origin==='https://customer.invalid'&&['/get-a-quote/','/zh/get-a-quote/','/zh/account/'].includes(u.pathname)?u.pathname+u.search:fallback;
}
