import {useEffect,useRef,useState} from 'react';
import {UsersThreeIcon,PencilRulerIcon,WrenchIcon,StackIcon,SealCheckIcon,ChatCircleDotsIcon} from '@phosphor-icons/react';
import {Button,TextLink,Eyebrow,FAQs,Link,quote} from '../shared.jsx';
import Image from '../Image.jsx';
import {useSite} from '../site-context.jsx';
import content from '../../data/home-content.json';
import profile from '../../data/manufacturing-profile.json';
import HomeHero from './HomeHero.jsx';
import '../../styles/home.css';

const asset=name=>name.startsWith('/')?name:'/assets/home-v2/'+name;
function HomePhoto({image,alt,className=''}){return <div className={'home-photo '+className}><Image src={asset(image)} alt={alt} loading="lazy"/></div>;}

// Server-rendered content stays visible. Only off-screen items opt into motion.
function useHomeReveal(root){useEffect(()=>{
  const node=root.current,preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(!node||preference.matches||!('IntersectionObserver' in window))return;
  const items=[...node.querySelectorAll('[data-home-reveal],.home-section-heading,.home-product-grid article,.home-scene,.home-process-grid li')];
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('home-revealed');observer.unobserve(entry.target)}},{threshold:0.06});
  for(const item of items)if(item.getBoundingClientRect().top>window.innerHeight){item.classList.add('home-will-reveal');observer.observe(item)}
  const showAll=()=>{observer.disconnect();items.forEach(item=>item.classList.remove('home-will-reveal','home-revealed'))};
  preference.addEventListener('change',showAll);
  return()=>{showAll();preference.removeEventListener('change',showAll)};
},[root]);}

export function HomeProducts(){
  const {products}=useSite();
  const selected=content.products.filter(item=>products.some(p=>p.slug===item.slug));
  return <section id="sign-styles" className="home-section home-container home-products" aria-labelledby="home-styles-title">
    <div className="home-section-heading"><div><Eyebrow>SIGN STYLES</Eyebrow><h2 id="home-styles-title">Find the Right Sign for Your Brand</h2><p>Compare the look. We’ll help confirm the specification.</p></div><TextLink to="/products/">Explore All Styles</TextLink></div>
    <div className="home-product-grid">{selected.map(item=><article key={item.slug}>
      <Link to={'/products/'+item.slug+'/'} aria-label={'Explore '+item.title}><HomePhoto image={item.image} alt={item.alt}/></Link>
      <h3><Link to={'/products/'+item.slug+'/'}>{item.title}</Link></h3>
      <p className="home-product-description">{item.description}</p><p className="home-product-use">{item.use}</p><TextLink to={'/products/'+item.slug+'/'}>{item.action}</TextLink>
    </article>)}</div>
    <p className="home-image-note">AI-generated design concepts · Final details are confirmed for your project.</p>
  </section>;
}

export function HomeWork(){
  const {products}=useSite();
  return <section id="sign-ideas" className="home-section home-context" aria-labelledby="home-ideas-title"><div className="home-container">
    <div className="home-section-heading"><div><Eyebrow>SIGNAGE IN CONTEXT</Eyebrow><h2 id="home-ideas-title">Picture Your Sign in the Right Space.</h2><p>Explore the possibilities for your storefront, reception or hospitality space.</p></div><TextLink to="/projects/">Explore Design Ideas</TextLink></div>
    <div className="home-context-grid">{content.scenes.filter(item=>products.some(p=>p.slug===item.style)).map(item=><article key={item.id} className={item.feature?'home-scene home-scene-feature':'home-scene'}>
      <Link className="home-scene-image" to={quote({style:item.style,source:'homepage-'+item.id})} aria-label={'Plan a sign inspired by this '+item.id+' concept'}><HomePhoto image={item.image} alt={item.alt}/></Link>
      <div className="home-scene-caption"><h3>{item.title}</h3><TextLink to={quote({style:item.style,source:'homepage-'+item.id})}>Plan a Similar Sign</TextLink><p>{item.meta}</p></div>
    </article>)}</div>
    <p className="home-image-note">AI-generated design concepts · Shown for inspiration, not as completed client projects.</p>
  </div></section>;
}

export function HomeCustom(){return <section id="make-it-yours" className="home-section home-container home-custom" aria-labelledby="home-custom-title">
  <figure><HomePhoto image="custom-arc.webp" alt="ARC dimensional letters with physical finish samples — AI-generated material study"/><figcaption>AI-generated material and lettering study</figcaption></figure>
  <div><Eyebrow>MADE TO YOUR PROJECT</Eyebrow><h2 id="home-custom-title">Your Brand.<br/>Your Specification.</h2><p className="home-custom-intro">Start with your logo or an idea. We’ll work through the details with you.</p><dl className="home-custom-options">{content.customOptions.map(item=><div key={item.title}><dt>{item.title}</dt><dd>{item.text}</dd></div>)}</dl><TextLink to={quote({source:'homepage-custom'})}>Discuss Your Custom Sign</TextLink></div>
</section>;}

function HomeProcess(){return <section id="your-project" className="home-section home-process" aria-labelledby="home-process-title"><div className="home-container">
  <div className="home-section-heading"><div><Eyebrow>HOW IT WORKS</Eyebrow><h2 id="home-process-title">From Your Idea to a Sign Specification.</h2><p>You don’t need every answer to start. We’ll confirm the details together.</p></div></div>
  <ol className="home-process-grid">{content.steps.map((item,i)=><li key={item.title}><span className="home-step-number">0{i+1}</span><h3>{item.title}</h3><p>{item.text}</p><p className="home-step-result">{item.result}</p></li>)}</ol><TextLink to="/how-it-works/">Explore the Full Process</TextLink>
</div></section>;}

const advantageIcons=[UsersThreeIcon,PencilRulerIcon,WrenchIcon,StackIcon,SealCheckIcon,ChatCircleDotsIcon];
export function HomeProof(){
  const [selected,setSelected]=useState(0),photo=content.team.photos[selected];
  return <>
    <section id="behind-the-sign" className="home-section home-container home-story" aria-labelledby="home-story-title">
      <div className="home-story-copy" data-home-reveal><Eyebrow>THE PEOPLE BEHIND YOUR SIGN</Eyebrow><h2 id="home-story-title">Precision Craft.<br/>{' '}Built Around <em>Your Brand.</em></h2><p>{content.team.intro}</p><p>{content.team.detail}</p>
        <ul className="home-story-qualities home-story-numbers">{profile.homeMetrics.map(key=>{const item=profile.metrics[key];return <li key={key}><strong>{item.value}{item.unit&&<small>{' '}{item.unit}</small>}</strong><span>{item.label}</span></li>})}</ul>
        <TextLink to="/about/">About Our Team & Craft</TextLink>
      </div>
      <figure className="home-story-figure" data-home-reveal><div className={'home-story-photo '+(photo.position||'')}><Image src={photo.src} alt={photo.alt} loading="lazy"/></div>
        <div className="home-story-photo-options" role="group" aria-label="View production photographs">{content.team.photos.map((item,i)=><button key={item.src} type="button" aria-pressed={selected===i} onClick={()=>setSelected(i)}>{item.label}</button>)}</div>
        <figcaption aria-live="polite">{photo.caption}</figcaption>
      </figure>
    </section>
    <section id="why-custom-sign-forge" className="home-section home-advantages" aria-labelledby="home-advantages-title"><div className="home-container">
      <div className="home-advantages-heading" data-home-reveal><Eyebrow>WHY CUSTOM SIGN FORGE</Eyebrow><h2 id="home-advantages-title">Custom Signs. <em>Made Around You.</em></h2><p>Practical expertise, custom choices and care from drawing to shipment.</p></div>
      <div className="home-advantage-grid">{content.advantages.map((item,i)=>{const Icon=advantageIcons[i];return <article key={item.title} data-home-reveal><span className="home-advantage-icon"><Icon size={25} weight="regular" aria-hidden="true"/></span><h3>{item.title}</h3><p>{item.text}</p></article>})}</div>
    </div></section>
  </>;
}

function HomeTrade(){return <section className="home-trade" aria-labelledby="home-trade-title"><div className="home-container"><div><Eyebrow>FOR THE TRADE</Eyebrow><h2 id="home-trade-title">Custom Fabrication for Your Next Project.</h2><p>Sign companies, installers and procurement teams: share your drawings, quantities and supply requirements for a project-based discussion.</p></div><Button secondary to="/for-sign-companies/">For Sign Companies & Installers</Button></div></section>;}

export default function Home(){const root=useRef(null);useHomeReveal(root);return <div className="home-redesign" ref={root}>
  <HomeHero/>
  <HomeProducts/><HomeWork/><HomeCustom/><HomeProof/><HomeProcess/><HomeTrade/>
  <section className="home-section home-container home-faq" aria-labelledby="home-faq-title"><div><Eyebrow>A FEW THINGS TO KNOW</Eyebrow><h2 id="home-faq-title">Start with<br/>What You Know.</h2><p>No final dimensions or drawing yet? Share the idea and we can discuss what comes next.</p><TextLink to={quote({source:'homepage-faq'})}>Ask About Your Project</TextLink></div><FAQs/></section>
  <section className="home-section home-final" aria-labelledby="home-final-title"><div className="home-container"><Eyebrow>LET’S TALK ABOUT YOUR SIGN</Eyebrow><h2 id="home-final-title">Tell Us About Your Sign.</h2><p>Sign in, share a few details and continue on WhatsApp. We’ll discuss the specification and quote for your project.</p><Button/><p className="home-final-helper">Custom-made to your requirements. Quoted individually.</p></div></section>
</div>;}
