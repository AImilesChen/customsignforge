import {basePath} from './locale.mjs';
const FIXED=['/','/products/','/projects/','/contact/'];
const PRIVATE=/^\/(admin|api|auth|account|sign-in|get-a-quote|media|design-kit|review)(\/|$)/;
export const publishingEnabled=env=>env.APP_ENV==='production'&&env.PUBLISH_READY==='true';
export function indexablePage(env,{path,found=true,policy=false,item=null}){
 path=basePath(path);
 if(!publishingEnabled(env)||!found||policy||PRIVATE.test(path))return false;
 return item?item.indexable!==false:FIXED.includes(path);
}
export function sitemapPaths(env,items){
 if(!publishingEnabled(env))return [];
 const paths=new Set(FIXED);
 const prefix={product:'/products/',page:'/',landing:'/landing/',project:'/projects/'};
 for(const item of items){
  if(!prefix[item.type]||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug))continue;
  const path=prefix[item.type]+item.slug+'/';
  if(indexablePage(env,{path,item}))paths.add(path);
 }
 return [...paths];
}
