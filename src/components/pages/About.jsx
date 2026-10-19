import {PencilRulerIcon,WrenchIcon,SealCheckIcon,CheckIcon} from '@phosphor-icons/react';
import {useSite} from '../site-context.jsx';
import {Button,TextLink,Eyebrow,Markdown,quote} from '../shared.jsx';
import Image from '../Image.jsx';
import content from '../../data/about-content.json';
import defaults from '../../data/about-defaults.json';
import profile from '../../data/manufacturing-profile.json';
import {aboutPresentation} from '../../lib/about-page.mjs';
import '../../styles/about.css';

function Photo({item,hero=false,className=''}){return <figure className={'about-photo '+className}><div><Image src={item.src} alt={item.alt} loading={hero?'eager':'lazy'} fetchPriority={hero?'high':'auto'} sizes="(max-width: 700px) 100vw, 50vw"/></div><figcaption>{item.caption}</figcaption></figure>}
const roleIcons=[PencilRulerIcon,WrenchIcon,SealCheckIcon];

export default function About(){
 const {site,settings}=useSite(),page=site.pages.find(p=>p.slug==='about');
 const presentation=aboutPresentation(page,content,defaults),request=quote({entry:'/about/',cta:'content'});
 return <article className="about-page">
  <section className="about-section about-container about-hero" aria-labelledby="about-title"><div><Eyebrow>ABOUT CUSTOM SIGN FORGE</Eyebrow><h1 id="about-title">{presentation.title===content.title?<><span>Built by People.</span>{' '}<em>Defined by Detail.</em></>:presentation.title}</h1><p className="about-lead">{presentation.intro}</p><div className="button-row"><Button to={request}>Discuss Your Sign</Button><TextLink to="#our-team">Meet the Team</TextLink></div></div><Photo item={presentation.hero} hero/></section>
  <section id="manufacturing-strengths" className="about-strengths" aria-label="Our manufacturing capabilities"><dl className="about-container">{profile.aboutMetrics.map(key=>{const item=profile.metrics[key];return <div key={key}><dt>{item.label}</dt><dd>{item.value}</dd></div>})}</dl></section>
  <section id="our-team" className="about-section about-container about-team" aria-labelledby="about-team-title"><Photo item={content.team}/><div><Eyebrow>PEOPLE WITH PRACTICAL KNOW-HOW</Eyebrow><h2 id="about-team-title">A Team Behind<br/>{' '}<em>Every Detail.</em></h2><p className="about-team-intro">{content.teamIntro}</p><div className="about-roles">{content.roles.map((item,i)=>{const Icon=roleIcons[i];return <div key={item.title}><Icon size={26} aria-hidden="true"/><div><h3>{item.title}</h3><p>{item.text}</p></div></div>})}</div></div></section>
  <section id="our-capabilities" className="about-section about-soft" aria-labelledby="about-capabilities-title"><div className="about-container"><div className="about-section-heading"><div><Eyebrow>FROM MATERIAL TO FINISHED LETTERING</Eyebrow><h2 id="about-capabilities-title">The Craft Behind<br/>{' '}<em>Your Sign.</em></h2></div><p>Metal, acrylic, surface treatments and light. Different processes come together around the approved design.</p></div><div className="about-capability-grid">{content.capabilities.map((item,i)=><article key={item.title}><Photo item={item}/><span className="about-step">0{i+1}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div><TextLink to="/products/">Explore the Sign Styles We Make</TextLink></div></section>
  <section id="quality-and-packing" className="about-section about-container about-quality" aria-labelledby="about-quality-title"><div><Eyebrow>CARE BEFORE YOUR SIGN LEAVES</Eyebrow><h2 id="about-quality-title">Checked with Care.<br/>{' '}<em>Packed for the Journey.</em></h2><p className="about-team-intro">The finished appearance matters. So do the details you will not see once the sign is in place.</p><ul>{content.quality.map(item=><li key={item.title}><CheckIcon size={21} aria-hidden="true"/><div><h3>{item.title}</h3><p>{item.text}</p></div></li>)}</ul><TextLink to="/how-it-works/">See How Your Project Takes Shape</TextLink></div><div className="about-quality-photos"><Photo item={content.check}/><Photo item={content.packing} className="about-packing"/></div></section>
  {(presentation.customBody||presentation.extra.length>0)&&<section className="about-section about-container about-extra" aria-label="More about our work">{presentation.customBody&&<Markdown text={page.body}/>}<div className="about-extra-photos">{presentation.extra.map(item=><Photo key={item.src} item={item}/>)}</div></section>}
  <section className="about-closing"><div className="about-container"><div><Eyebrow>LET’S MAKE YOUR BRAND VISIBLE</Eyebrow><h2>Your Brand.<br/>{' '}<em>Our Next Project.</em></h2><p>{content.closing}</p></div><div><Button to={request}>Share Your Project & Files</Button><TextLink to="/contact/">Contact Us</TextLink><p className="about-sign-in-note">Sign in with Google or verify your email to send your project details.</p>{settings.operatorName&&<p className="about-company">Custom Sign Forge is operated by {settings.operatorName.replace(/\.$/,'')}.<br/><a href="/contact/#company-information">Company & contact details</a></p>}</div></div></section>
 </article>;
}
