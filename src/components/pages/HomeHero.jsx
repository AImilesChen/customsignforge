import {useEffect,useState} from 'react';
import {ArrowRightIcon,CaretLeftIcon,CaretRightIcon,PauseIcon,PlayIcon,UsersThreeIcon,WrenchIcon,PencilRulerIcon,MedalIcon} from '@phosphor-icons/react';
import Image from '../Image.jsx';
import {Link,quote} from '../shared.jsx';
import profile from '../../data/manufacturing-profile.json';

const slides=[
 {src:'/assets/hero-cafe.webp',alt:'Warm halo-lit lettering on a contemporary cafe facade, AI-generated design concept',category:'STOREFRONT SIGNS',title:'A name worth noticing.',detail:'Halo-lit lettering · Café facade',style:'backlit-letters',position:'50% 35%'},
 {src:'/assets/home-hero-v3/reception-portrait.webp',alt:'AVEN reception lettering with a warm halo, AI-generated design concept',category:'RECEPTION & OFFICE',title:'Make the first impression count.',detail:'Backlit logo · Reception wall',style:'backlit-letters',position:'50% 50%'},
 {src:'/assets/home-hero-v3/hospitality-portrait.webp',alt:'SABLE hospitality entrance with brass letters, AI-generated design concept',category:'HOTEL & HOSPITALITY',title:'Details that belong.',detail:'Metal lettering · Hospitality entrance',style:'metal-letters',position:'50% 50%'}
];
const strengthIcons=[MedalIcon,UsersThreeIcon,WrenchIcon];

export default function HomeHero(){
 const [active,setActive]=useState(0),[playing,setPlaying]=useState(true),[hovered,setHovered]=useState(false),[focused,setFocused]=useState(false),[reduced,setReduced]=useState(false),[visible,setVisible]=useState(true);
 useEffect(()=>{const motion=window.matchMedia('(prefers-reduced-motion: reduce)'),updateMotion=()=>setReduced(motion.matches),updateVisibility=()=>setVisible(!document.hidden);updateMotion();updateVisibility();motion.addEventListener('change',updateMotion);document.addEventListener('visibilitychange',updateVisibility);return()=>{motion.removeEventListener('change',updateMotion);document.removeEventListener('visibilitychange',updateVisibility)}},[]);
 const rotating=playing&&!hovered&&!focused&&!reduced&&visible;
 useEffect(()=>{if(!rotating)return;const timer=window.setInterval(()=>setActive(i=>(i+1)%slides.length),6500);return()=>window.clearInterval(timer)},[rotating]);
 const select=i=>{setActive((i+slides.length)%slides.length);setPlaying(false)};
 return <section className="home-immersive" aria-labelledby="home-hero-title">
  <div className="home-immersive-backdrop" aria-hidden="true"><Image src="/assets/home-team/workshop-team.webp" alt="" loading="eager" sizes="100vw"/></div>
  <div className="home-immersive-stage"><div className="home-container home-hero-inner">
   <div className="home-immersive-copy">
    <p className="home-immersive-eyebrow">PRECISION CRAFT. MADE FOR YOUR BRAND.</p>
    <h1 id="home-hero-title">Custom Signs.<br/>{' '}Built to Make<br/>{' '}<em>Your Brand <span>Stand Out.</span></em></h1>
    <p className="home-immersive-intro">Bring your logo to life with custom lettering, lighting and finishes. Made for your storefront, reception or hospitality space.</p>
    <div className="home-immersive-actions"><Link className="button" to={quote({source:'homepage-hero',entry:'/',cta:'content'})}>Get a Custom Quote <ArrowRightIcon size={20} aria-hidden="true"/></Link><Link className="button secondary" to="/products/">Explore Sign Styles <ArrowRightIcon size={19} aria-hidden="true"/></Link></div>
    <p className="home-immersive-helper">Start with a logo, a drawing or simply an idea.</p>
   </div>
   <div className="home-hero-carousel" role="region" aria-roledescription="carousel" aria-label="Sign design ideas" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false)}}>
    <div id="home-hero-slide" className="home-hero-slide" aria-live={rotating?'off':'polite'} aria-atomic="true">
     {slides.map((slide,i)=><figure key={slide.src} hidden={active!==i} role="group" aria-roledescription="slide" aria-label={`${i+1} of ${slides.length}: ${slide.category}`}>
      <Image src={slide.src} alt={slide.alt} loading={i===0?'eager':'lazy'} fetchPriority={i===0?'high':'auto'} sizes="(max-width: 700px) calc(100vw - 40px), 540px" style={{objectPosition:slide.position}}/>
      <span className="home-hero-category">{slide.category}</span>
      <figcaption><p className="home-hero-scene-title">{slide.title}</p><p className="home-hero-scene-detail">{slide.detail}</p><Link to={'/products/'+slide.style+'/'}>Explore this style <ArrowRightIcon size={17} aria-hidden="true"/></Link></figcaption>
     </figure>)}
    </div>
    <div className="home-hero-controls"><div className="home-hero-pagination" role="group" aria-label="Choose a sign scene">{slides.map((slide,i)=><button type="button" key={slide.src} aria-label={'Show '+slide.category.toLowerCase()+' concept'} aria-current={i===active?'true':undefined} aria-controls="home-hero-slide" onClick={()=>select(i)}>0{i+1}</button>)}</div><div className="home-hero-playback"><button type="button" aria-label="Previous sign scene" aria-controls="home-hero-slide" onClick={()=>select(active-1)}><CaretLeftIcon size={19} aria-hidden="true"/></button>{!reduced&&<button type="button" aria-label={playing?'Pause scene rotation':'Start scene rotation'} onClick={()=>setPlaying(!playing)}>{playing?<PauseIcon size={18} aria-hidden="true"/>:<PlayIcon size={18} aria-hidden="true"/>}</button>}<button type="button" aria-label="Next sign scene" aria-controls="home-hero-slide" onClick={()=>select(active+1)}><CaretRightIcon size={19} aria-hidden="true"/></button></div></div>
   </div>
  </div></div>
  <div className="home-hero-strengths"><div className="home-container">{profile.homeMetrics.map((key,i)=>{const item=profile.metrics[key],Icon=strengthIcons[i];return <div className="home-hero-strength" key={key}><Icon size={24} weight="regular" aria-hidden="true"/><p><strong>{item.value}{item.unit&&' '+item.unit}</strong><span>{item.label}</span></p></div>})}<div className="home-hero-strength"><PencilRulerIcon size={24} aria-hidden="true"/><p><strong>Made to your brand</strong><span>Logo, size, lighting & finish</span></p></div></div></div>
 </section>;
}
