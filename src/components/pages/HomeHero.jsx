import {useLocale} from '../use-locale.jsx';
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

export default function HomeHero(){const {t:tr,locale}=useLocale();
 const [active,setActive]=useState(0),[playing,setPlaying]=useState(true),[hovered,setHovered]=useState(false),[focused,setFocused]=useState(false),[reduced,setReduced]=useState(false),[visible,setVisible]=useState(true);
 useEffect(()=>{const motion=window.matchMedia('(prefers-reduced-motion: reduce)'),updateMotion=()=>setReduced(motion.matches),updateVisibility=()=>setVisible(!document.hidden);updateMotion();updateVisibility();motion.addEventListener('change',updateMotion);document.addEventListener('visibilitychange',updateVisibility);return()=>{motion.removeEventListener('change',updateMotion);document.removeEventListener('visibilitychange',updateVisibility)}},[]);
 const rotating=playing&&!hovered&&!focused&&!reduced&&visible;
 useEffect(()=>{if(!rotating)return;const timer=window.setInterval(()=>setActive(i=>(i+1)%slides.length),6500);return()=>window.clearInterval(timer)},[rotating]);
 const select=i=>{setActive((i+slides.length)%slides.length);setPlaying(false)};
 return <section className="home-immersive" aria-labelledby="home-hero-title">
  <div className="home-immersive-backdrop" aria-hidden="true"><Image src="/assets/home-team/workshop-team.webp" alt={tr("")} loading="eager" sizes="100vw"/></div>
  <div className="home-immersive-stage"><div className="home-container home-hero-inner">
   <div className="home-immersive-copy">
    <p className="home-immersive-eyebrow">{tr("PRECISION CRAFT. MADE FOR YOUR BRAND.")}</p>
    <h1 id="home-hero-title">{locale==='fr'?<>Enseignes sur mesure.<br/><em>Votre marque en lumière.</em></>:locale==='de'?<>Individuelle Werbeschilder.<br/><em>Für Ihre Marke gemacht.</em></>:locale==='th'?<>ป้ายสั่งทำสำหรับธุรกิจ<br/><em>ให้แบรนด์ของคุณโดดเด่น</em></>:locale==='ms'?<>Papan tanda khas.<br/><em>Untuk jenama anda.</em></>:locale==='zh'?<><span className="zh-hero-line">定制标识。</span><span className="zh-hero-line">让您的品牌</span><em className="zh-hero-line">脱颖而出。</em></>:<>{tr("Custom Signs.")}<br/>{tr(' ')}{tr("Built to Make")}<br/>{tr(' ')}<em>{tr("Your Brand ")}<span>{tr("Stand Out.")}</span></em></>}</h1>
    <p className="home-immersive-intro">{tr("Bring your logo to life with custom lettering, lighting and finishes. Made for your storefront, reception or hospitality space.")}</p>
    <div className="home-immersive-actions"><Link className="button" to={quote({source:'homepage-hero',entry:'/',cta:'content'})}>{tr("Get a Custom Quote ")}<ArrowRightIcon size={20} aria-hidden="true"/></Link><Link className="button secondary" to="/products/">{tr("Explore Sign Styles ")}<ArrowRightIcon size={19} aria-hidden="true"/></Link></div>
    <p className="home-immersive-helper">{tr("Start with a logo, a drawing or simply an idea.")}</p>
   </div>
   <div className="home-hero-carousel" role="region" aria-roledescription="carousel" aria-label={tr("Sign design ideas")} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false)}}>
    <div id="home-hero-slide" className="home-hero-slide" aria-live={rotating?'off':'polite'} aria-atomic="true">
     {tr(slides.map((slide,i)=><figure key={slide.src} hidden={active!==i} role="group" aria-roledescription="slide" aria-label={locale==='fr'?`Visuel ${i+1} sur ${slides.length} : ${tr(slide.category)}`:locale==='de'?`Motiv ${i+1} von ${slides.length}: ${tr(slide.category)}`:locale==='th'?`ภาพตัวอย่าง ${i+1} จาก ${slides.length}: ${tr(slide.category)}`:locale==='ms'?`Visual ${i+1} daripada ${slides.length}: ${tr(slide.category)}`:locale==='zh'?`第 ${i+1} / ${slides.length} 个场景：${tr(slide.category)}`:`${i+1} of ${slides.length}: ${slide.category}`}>
      <Image src={slide.src} alt={locale==='fr'?['Concept de lettres rétroéclairées sur une façade de café','Concept de logo rétroéclairé sur un mur d’accueil','Concept de lettres métalliques à l’entrée d’un hôtel'][i]:locale==='de'?['Beispiel: rückleuchtende Buchstaben an einer Caféfassade','Beispiel: warm beleuchtetes Logo an einer Empfangswand','Beispiel: Metallbuchstaben an einem Hoteleingang'][i]:locale==='th'?['แนวคิดป้ายตัวอักษรไฟฮาโลที่หน้าร้านกาแฟ','แนวคิดโลโก้เรืองแสงอบอุ่นบนผนังต้อนรับ','แนวคิดตัวอักษรโลหะที่ทางเข้าโรงแรม'][i]:locale==='ms'?['Inspirasi huruf halo pada fasad kafe','Inspirasi logo bercahaya suam di dinding resepsi','Inspirasi huruf logam di pintu masuk hotel'][i]:locale==='zh'?['咖啡店门头背光字设计灵感','接待背景墙暖光标志设计灵感','酒店入口金属字设计灵感'][i]:slide.alt} loading={i===0?'eager':'lazy'} fetchPriority={i===0?'high':'auto'} sizes="(max-width: 700px) calc(100vw - 40px), 540px" style={{objectPosition:slide.position}}/>
      <span className="home-hero-category">{tr(slide.category)}</span>
      <figcaption><p className="home-hero-scene-title">{tr(slide.title)}</p><p className="home-hero-scene-detail">{tr(slide.detail)}</p><Link to={'/products/'+slide.style+'/'}>{tr("Explore this style ")}<ArrowRightIcon size={17} aria-hidden="true"/></Link></figcaption>
     </figure>))}
    </div>
    <div className="home-hero-controls"><div className="home-hero-pagination" role="group" aria-label={tr("Choose a sign scene")}>{tr(slides.map((slide,i)=><button type="button" key={slide.src} aria-label={locale==='fr'?'Afficher le visuel : '+tr(slide.category):locale==='de'?'Motiv anzeigen: '+tr(slide.category):locale==='th'?'ดู'+tr(slide.category):locale==='ms'?'Lihat '+tr(slide.category):locale==='zh'?'显示'+tr(slide.category)+'场景':'Show '+slide.category.toLowerCase()+' concept'} aria-current={i===active?'true':undefined} aria-controls="home-hero-slide" onClick={()=>select(i)}>{tr("0")}{tr(i+1)}</button>))}</div><div className="home-hero-playback"><button type="button" aria-label={tr("Previous sign scene")} aria-controls="home-hero-slide" onClick={()=>select(active-1)}><CaretLeftIcon size={19} aria-hidden="true"/></button>{tr(!reduced&&<button type="button" aria-label={tr(playing?'Pause scene rotation':'Start scene rotation')} onClick={()=>setPlaying(!playing)}>{tr(playing?<PauseIcon size={18} aria-hidden="true"/>:<PlayIcon size={18} aria-hidden="true"/>)}</button>)}<button type="button" aria-label={tr("Next sign scene")} aria-controls="home-hero-slide" onClick={()=>select(active+1)}><CaretRightIcon size={19} aria-hidden="true"/></button></div></div>
   </div>
  </div></div>
  <div className="home-hero-strengths"><div className="home-container">{tr(profile.homeMetrics.map((key,i)=>{const item=profile.metrics[key],Icon=strengthIcons[i];return <div className="home-hero-strength" key={key}><Icon size={24} weight="regular" aria-hidden="true"/><p><strong>{tr(item.value)}{tr(item.unit&&' '+item.unit)}</strong><span>{tr(item.label)}</span></p></div>}))}<div className="home-hero-strength"><PencilRulerIcon size={24} aria-hidden="true"/><p><strong>{tr("Made to your brand")}</strong><span>{tr("Logo, size, lighting & finish")}</span></p></div></div></div>
 </section>;
}
