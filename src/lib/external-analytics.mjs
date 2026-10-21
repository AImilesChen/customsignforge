import {basePath} from './locale.mjs';
import {hasAnalyticsConsent} from './browser-measurement.mjs';
import {campaignSource,publicPath} from './acquisition.mjs';

const PRIVATE=/^\/(?:(?:zh|ms|th|de)\/)?(admin|api|auth|account|sign-in|get-a-quote|media|design-kit|review)(\/|$)/;
export const externalAnalyticsEnabled=({environment,path,found=true,policy=false,canManage=false})=>environment==='production'&&found&&!policy&&!canManage&&!PRIVATE.test(path);
export function analyticsVisitAllowed(href,referrer=''){
 try{
  const url=new URL(href);
  if(url.origin!=='https://customsignforge.com'||!publicPath(url.pathname)||PRIVATE.test(url.pathname))return false;
  // The supplied collectors read the current URL. Never load them on URLs carrying form data.
  if(url.hash&&!/^#[a-z0-9-]{1,100}$/.test(url.hash))return false;
  for(const [key,value] of url.searchParams)if(campaignSource({[key]:value})[key]!==value)return false;
  if(referrer){const source=new URL(referrer);if(source.search||source.hash||PRIVATE.test(source.pathname))return false;}
  return true;
 }catch{return false;}
}

export function startExternalAnalytics(config,{win=window,doc=document,consent=hasAnalyticsConsent}={}){
 if(!config?.enabled)return()=>{};
 let started=false;
 const scripts=[];
 const load=(id,src,attrs={})=>{
  if(doc.getElementById(id))return;
  const script=doc.createElement('script');script.id=id;script.src=src;script.async=true;
  for(const [key,value] of Object.entries(attrs))script.setAttribute(key,value);
  // A failed collector must not affect the site or prevent the other collectors loading.
  script.onerror=()=>{script.remove();};scripts.push(script);doc.head.appendChild(script);
 };
 const clearCookies=()=>{
  const names=doc.cookie.split(';').map(v=>v.trim().split('=')[0]).filter(v=>/^(_ga(?:_|$)|_clck$|_clsk$)/.test(v));
  for(const name of names)for(const domain of ['', '; Domain=customsignforge.com','; Domain=.customsignforge.com'])doc.cookie=name+'=; Max-Age=0; Path=/'+domain+'; SameSite=Lax; Secure';
 };
 const eligible=()=>analyticsVisitAllowed(win.location.href,doc.referrer);
 const sync=()=>{
  if(consent()&&eligible()){
   if(started)return;started=true;
   win['ga-disable-'+config.ga4]=false;
   win.dataLayer=win.dataLayer||[];
   win.gtag=win.gtag||function(){win.dataLayer.push(arguments)};
   win.gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
   win.gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
   win.gtag('js',new Date());
   win.gtag('config',config.ga4,{page_location:win.location.origin+win.location.pathname,page_referrer:doc.referrer?new URL(doc.referrer).origin:'',allow_google_signals:false,allow_ad_personalization_signals:false,send_page_view:true,language:config.language||'en'});
   load('csf-ga4','https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(config.ga4));
   win.clarity=win.clarity||function(){(win.clarity.q=win.clarity.q||[]).push(arguments)};
   win.clarity('consentv2',{analytics_Storage:'granted',ad_Storage:'denied'});
   load('csf-clarity','https://www.clarity.ms/tag/'+encodeURIComponent(config.clarity));
   load('csf-plausible',config.plausibleScript,{'data-domain':config.plausibleDomain,'defer':''});
  }else if(started){
   win['ga-disable-'+config.ga4]=true;
   win.gtag?.('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
   win.clarity?.('consentv2',{analytics_Storage:'denied',ad_Storage:'denied'});
   win.clarity?.('consent',false);
   for(const script of scripts)script.remove();clearCookies();
   // Reload unloads collectors and their listeners, including Plausible's engagement timer.
   win.location.reload();
  }else if(!consent())clearCookies();
 };
 const click=event=>{
  if(!started||!consent()||!eligible())return;
  const link=event.target?.closest?.('a');if(!link)return;
  let url;try{url=new URL(link.href,win.location.href)}catch{return;}
  const name=url.hostname==='wa.me'?'whatsapp_click':url.origin===win.location.origin&&basePath(url.pathname)==='/get-a-quote/'?'request_quote':null;
  // Never pass link URLs, text, email addresses, customer IDs or enquiry references.
  if(name)win.gtag?.('event',name,{page_location:win.location.origin+win.location.pathname});
 };
 const storage=event=>{if(event.key==='csf-cookie-preferences')sync()};
 sync();win.addEventListener('csf-consent-change',sync);win.addEventListener('storage',storage);win.addEventListener('pageshow',sync);doc.addEventListener('click',click,true);
 return()=>{win.removeEventListener('csf-consent-change',sync);win.removeEventListener('storage',storage);win.removeEventListener('pageshow',sync);doc.removeEventListener('click',click,true)};
}
