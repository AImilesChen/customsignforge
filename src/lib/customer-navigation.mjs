// Shared with the browser; never import authentication keys into a client bundle.
export function customerNext(value){
 if(typeof value!=='string'||value.length>1800||!value.startsWith('/')||value.startsWith('//')||/[\\\r\n]/.test(value))return '/account/';
 const u=new URL(value,'https://customer.invalid');
 return u.origin==='https://customer.invalid'&&u.pathname==='/get-a-quote/'?u.pathname+u.search:'/account/';
}
