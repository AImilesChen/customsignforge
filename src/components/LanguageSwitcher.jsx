import {useEffect,useRef,useState} from 'react';
import {useSite} from './site-context.jsx';
import {switchLanguage,LOCALES} from '../lib/locale.mjs';

const FLAGS={en:'/brand/flag-gb.svg',zh:'/brand/flag-cn.svg',ms:'/brand/flag-my.svg',th:'/brand/flag-th.svg',de:'/brand/flag-de.svg',fr:'/brand/flag-fr.svg',ko:'/brand/flag-kr.svg?v=2','pt-br':'/brand/flag-br.svg',ar:'/brand/language-globe.svg'};
const LABELS={en:'Website language',zh:'网站语言',ms:'Bahasa laman web',th:'ภาษาของเว็บไซต์',de:'Sprache der Website',fr:'Langue du site',ko:'웹사이트 언어','pt-br':'Idioma do site',ar:'لغة الموقع'};

export default function LanguageSwitcher(){
 const {locale}=useSite();
 const [open,setOpen]=useState(false);
 const root=useRef(null),trigger=useRef(null);
 useEffect(()=>{
  const dismiss=e=>{if(!root.current?.contains(e.target))setOpen(false)};
  const escape=e=>{if(e.key==='Escape'&&root.current?.contains(document.activeElement)){setOpen(false);trigger.current?.focus()}};
  document.addEventListener('pointerdown',dismiss);
  document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',dismiss);document.removeEventListener('keydown',escape)};
 },[]);
 function change(next){
  setOpen(false);
  if(next===locale)return;
  window.dispatchEvent(new Event('csf-save-draft'));
  window.location.assign(switchLanguage(window.location.pathname,window.location.search,window.location.hash,next));
 }
 return <div className="language-switcher" ref={root}>
  <button type="button" ref={trigger} className="language-trigger" aria-label={`${LABELS[locale]}: ${LOCALES[locale].label}`} aria-expanded={open} aria-controls="language-options" onClick={()=>setOpen(value=>!value)}>
   <img src={FLAGS[locale]} alt="" aria-hidden="true" width="22" height="15"/><span className="language-current">{LOCALES[locale].label}</span><svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </button>
  {open&&<div id="language-options" className="language-options" aria-label={LABELS[locale]}>{Object.entries(LOCALES).map(([code,item])=><button key={code} type="button" lang={item.html} aria-current={code===locale?'true':undefined} onClick={()=>change(code)}><img src={FLAGS[code]} alt="" aria-hidden="true" width="22" height="15"/><span>{item.label}</span></button>)}</div>}
 </div>;
}

