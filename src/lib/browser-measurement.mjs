import {campaignSource,acquisition,publicPath,UTM_KEYS} from './acquisition.mjs';
const CHOICE='csf-cookie-preferences',FIRST='csf-first-source',CURRENT='csf-current-source';
export const CONSENT_VERSION=2;
export function hasPrivacyChoice(){try{const choice=JSON.parse(localStorage.getItem(CHOICE)||'null');return choice?.version===CONSENT_VERSION&&Number.isFinite(Date.parse(choice.savedAt))&&Date.now()-Date.parse(choice.savedAt)<180*86400000}catch{return false}}
export function savePrivacyChoice(analytics=false){try{localStorage.setItem(CHOICE,JSON.stringify({necessary:true,analytics,advertising:false,version:CONSENT_VERSION,savedAt:new Date().toISOString()}))}catch{}if(!analytics)forgetAttribution();window.dispatchEvent(new Event('csf-consent-change'))}
export function hasAnalyticsConsent(){try{const choice=JSON.parse(localStorage.getItem(CHOICE)||'null');return choice?.version===CONSENT_VERSION&&choice.analytics===true&&Date.now()-Date.parse(choice.savedAt)<180*86400000}catch{return false}}
export function captureAttribution(){
 const params=new URLSearchParams(location.search),current=campaignSource(Object.fromEntries(UTM_KEYS.map(k=>[k,params.get(k)])));
 const entry=publicPath(location.pathname);let first={source:current,entry},source=current;
 if(hasAnalyticsConsent())try{
  const saved=JSON.parse(localStorage.getItem(FIRST)||'null');if(saved&&Date.now()-saved.at<90*86400000)first={source:campaignSource(saved.source),entry:publicPath(saved.entry)};else localStorage.setItem(FIRST,JSON.stringify({...first,at:Date.now()}));
  if(Object.keys(current).length)sessionStorage.setItem(CURRENT,JSON.stringify(current));else source=campaignSource(JSON.parse(sessionStorage.getItem(CURRENT)||'{}'));
 }catch{}
 return acquisition({firstSource:first.source,currentSource:source,firstEntry:first.entry,entryMode:'form',cta:params.get('cta'),landing:params.get('landing')||(location.pathname.match(/^\/landing\/([^/]+)\//)?.[1]||'')});
}
export function forgetAttribution(){try{localStorage.removeItem(FIRST);sessionStorage.removeItem(CURRENT)}catch{}}
export function measure(name,context={}){
 if(!hasAnalyticsConsent()||!publicPath(location.pathname))return;
 const params=new URLSearchParams(location.search);const product=location.pathname.match(/^\/products\/([^/]+)\/$/)?.[1]||params.get('style');const project=location.pathname.match(/^\/projects\/([^/]+)\/$/)?.[1]||params.get('project');const data={id:crypto.randomUUID(),name,page:location.pathname,consent:true,context:{...captureAttribution(),...(product&&product!=='not-sure'?{product}:{}),...(project?{project}:{}),...context}};
 fetch('/api/measurement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),keepalive:true}).catch(()=>{});
}
export function startMeasurement(){
 if(!publicPath(location.pathname))return()=>{};
 if(!hasAnalyticsConsent())forgetAttribution();
 let viewed=false;const page=()=>{if(hasAnalyticsConsent()&&!viewed){viewed=true;measure('page_view');if(location.pathname==='/get-a-quote/')measure('quote_form_open')}};
 page();const choices=()=>{if(!hasAnalyticsConsent()){forgetAttribution();viewed=false}else page()};window.addEventListener('csf-consent-change',choices);
 const click=event=>{
  const link=event.target?.closest?.('a');if(!link)return;let url;try{url=new URL(link.href)}catch{return}
  const cta=link.closest('header')?'header':link.closest('footer')?'footer':location.pathname.startsWith('/products/')?'product':location.pathname.startsWith('/projects/')?'project':location.pathname.startsWith('/landing/')?'landing':'content';
  if(url.origin===location.origin&&url.pathname==='/get-a-quote/'){
   const attribution=captureAttribution();url.searchParams.set('entry',publicPath(location.pathname)||'/');url.searchParams.set('cta',cta);
   for(const [k,v] of Object.entries(attribution.currentSource))url.searchParams.set(k,v);
   if(attribution.landing)url.searchParams.set('landing',attribution.landing);link.href=url.toString();
  }
  if(url.hostname==='wa.me'){
   const mode=link.dataset.entryMode==='form'?'form':'direct_chat';
   const context={entryMode:mode,cta:mode==='form'?'quote_success':link.closest('footer')?'footer_direct':'quote_direct'};
   measure('whatsapp_click',context);if(mode==='direct_chat')measure('direct_chat',context);
  }
 };
 document.addEventListener('click',click,true);
 return()=>{window.removeEventListener('csf-consent-change',choices);document.removeEventListener('click',click,true)};
}
