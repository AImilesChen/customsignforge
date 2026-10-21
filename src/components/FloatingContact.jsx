import {useLocale} from './use-locale.jsx';
import {useEffect,useRef,useState} from 'react';
import {WhatsappLogoIcon,ChatCircleDotsIcon,XIcon,ArrowUpRightIcon,ArrowRightIcon} from '@phosphor-icons/react';
import {useSite} from './site-context.jsx';
import {quote} from './shared.jsx';
import '../styles/floating-contact.css';

export default function FloatingContact(){const {t:tr,href:localHref}=useLocale();
 const {settings,path,locale}=useSite();
 const [open,setOpen]=useState(false),[bottom,setBottom]=useState(24);
 const root=useRef(null),trigger=useRef(null),close=useRef(null);
 const number=String(settings.whatsapp||'');
 const valid=/^[1-9]\d{6,14}$/.test(number);
 const href=valid?'https://wa.me/'+number+'?text='+encodeURIComponent(locale==='th'?'สวัสดี Custom Sign Forge ฉันต้องการปรึกษาเรื่องป้ายสั่งทำสำหรับโครงการของฉัน':locale==='ms'?'Hai Custom Sign Forge, saya ingin membincangkan papan tanda khas untuk projek saya.':locale==='zh'?'您好，Custom Sign Forge，我想咨询一个定制标识项目。':'Hello Custom Sign Forge, I’d like to discuss a custom sign for my project.'):null;
 const dismiss=()=>{setOpen(false);trigger.current?.focus()};

 // Keep the controls above consent choices and the local preview ribbon.
 useEffect(()=>{
  if(!valid)return;
  let banner;
  const update=()=>{
   const next=document.querySelector('.privacy-choice');
   if(next!==banner){if(banner)resize.unobserve(banner);banner=next;if(banner)resize.observe(banner)}
   const ribbon=document.querySelector('.preview-ribbon');
   const top=Math.min(banner?.getBoundingClientRect().top??innerHeight,ribbon?.getBoundingClientRect().top??innerHeight);
   setBottom(Math.max(24,innerHeight-top+16));
  };
  const resize=new ResizeObserver(update),mutations=new MutationObserver(update);
  if(root.current?.parentNode)mutations.observe(root.current.parentNode,{childList:true});
  update();window.addEventListener('resize',update);
  return()=>{resize.disconnect();mutations.disconnect();window.removeEventListener('resize',update)};
 },[valid]);
 useEffect(()=>{
  if(!open)return;
  close.current?.focus();
  const key=e=>{if(e.key==='Escape'){e.preventDefault();dismiss()}};
  const outside=e=>{if(!root.current?.contains(e.target))setOpen(false)};
  document.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);
  return()=>{document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside)};
 },[open]);
 if(!valid)return null;
 return <aside ref={root} className="floating-contact" style={{'--contact-bottom':bottom+'px'}} aria-label={tr("Quick contact")}>
  {tr(open&&<section id="quick-contact-panel" className="floating-contact-panel" aria-labelledby="quick-contact-title">
   <div className="floating-contact-heading"><div><span>{tr("CUSTOM SIGN FORGE")}</span><h2 id="quick-contact-title">{tr("Let’s talk about your sign.")}</h2></div><button type="button" ref={close} onClick={dismiss} aria-label={tr("Close contact window")}><XIcon size={22} aria-hidden="true"/></button></div>
   <div className="floating-contact-body"><p>{tr("Have a logo, drawing or an idea? Share it with us on WhatsApp.")}</p>
    <a className="floating-contact-whatsapp" href={localHref(href)} target="_blank" rel="noopener noreferrer"><WhatsappLogoIcon size={25} aria-hidden="true"/><span>{tr("Chat on WhatsApp")}</span><ArrowUpRightIcon size={20} aria-hidden="true"/></a>
    <span className="floating-contact-number">{tr("+")}{tr(number)}</span>
    <div className="floating-contact-brief"><strong>{tr("Ready to share your project?")}</strong><p>{tr("Send dimensions, requirements and drawings through our enquiry form.")}</p><a href={localHref(quote({entry:path,cta:'content'}))}>{tr("Request a Quote ")}<ArrowRightIcon size={18} aria-hidden="true"/></a></div>
   </div>
  </section>)}
  <div className="floating-contact-controls"><a className="floating-contact-button floating-contact-direct" href={localHref(href)} target="_blank" rel="noopener noreferrer" aria-label={tr("Contact us on WhatsApp (opens in a new tab)")}><WhatsappLogoIcon size={30} aria-hidden="true"/><span className="floating-contact-tooltip">{tr("Chat on WhatsApp")}</span></a><button type="button" ref={trigger} className="floating-contact-button floating-contact-toggle" aria-label={tr(open?'Close contact options':'Open contact options')} aria-expanded={open} aria-controls={open?'quick-contact-panel':undefined} onClick={()=>open?dismiss():setOpen(true)}>{tr(open?<XIcon size={27} aria-hidden="true"/>:<ChatCircleDotsIcon size={28} aria-hidden="true"/>)}<span className="floating-contact-tooltip">{tr(open?'Close':'Contact us')}</span></button></div>
 </aside>;
}
