import {useState} from 'react';
import {useSite} from '../site-context.jsx';
import {Button,Link,TextLink,Eyebrow,quote} from '../shared.jsx';
import Image from '../Image.jsx';
import {PROJECT_SETTINGS,filterProjects,isFabrication,projectLabel,projectQuoteParams} from '../../lib/project-library.mjs';
import '../../styles/projects.css';

export function DesignCard({work,products,compact=false}){
 const product=products.find(p=>p.slug===work.productSlug);
 return <article className={'design-card'+(compact?' design-card-compact':'')}>
  <Link className="design-card-image" to={'/projects/'+work.slug+'/'} aria-label={'View '+work.title}><Image src={work.img} alt={work.imageAlt||work.title} loading="lazy" sizes={compact?'(max-width: 760px) 100vw, 33vw':'(max-width: 760px) 100vw, 50vw'}/></Link>
  <p className="design-meta">{projectLabel(work)} <span aria-hidden="true">/</span> {isFabrication(work)?'Construction & finish':work.setting}</p>
  <h3><Link to={'/projects/'+work.slug+'/'}>{work.title}</Link></h3><p className="design-description">{work.desc}</p>
  {product&&<p className="design-style">{product.title}</p>}
  <div className="design-card-actions"><TextLink to={'/projects/'+work.slug+'/'}>{isFabrication(work)?'View Construction':'View Design'}</TextLink>{!compact&&<Link className="design-quote-link" to={quote(projectQuoteParams(work))}>Request a Similar Sign</Link>}</div>
 </article>;
}

export default function Projects(){
 const {query,works,products}=useSite(),params=new URLSearchParams(query);
 const [application,setApplication]=useState(PROJECT_SETTINGS.includes(params.get('application'))?params.get('application'):'All');
 const [style,setStyle]=useState(products.some(p=>p.slug===params.get('style'))?params.get('style'):'All');
 const [demoEmpty,setDemoEmpty]=useState(params.get('state')==='empty');
 const scenes=works.filter(w=>!isFabrication(w)),samples=works.filter(isFabrication),selected=demoEmpty?[]:filterProjects(works,{application,style});
 const featured=scenes.find(w=>w.slug==='office-logo-concept')||scenes[0];
 const clear=()=>{setApplication('All');setStyle('All');setDemoEmpty(false)};
 const active=application!=='All'||style!=='All'||demoEmpty;
 return <article className="projects-page">
  <section className="projects-intro"><div className="projects-container projects-intro-grid"><div><Eyebrow>COMMERCIAL SIGN DESIGN LIBRARY</Eyebrow><h1>Picture Your Sign.<br/>In Your Space.</h1><p className="projects-lead">Explore signage for storefronts, reception walls and hospitality spaces. Find a direction, understand the details, then make it your own.</p><div className="button-row"><Button to="#design-library">Explore Sign Designs</Button><TextLink to={quote({entry:'/projects/',cta:'content'})}>Discuss Your Project</TextLink></div></div>{featured&&<figure className="projects-featured"><Link to={'/projects/'+featured.slug+'/'} aria-label={'Explore '+featured.title}><Image src={featured.img} alt={featured.imageAlt||featured.title} loading="eager" fetchPriority="high" sizes="(max-width: 760px) 100vw, 55vw"/></Link><figcaption><span>{projectLabel(featured)}</span><Link to={'/projects/'+featured.slug+'/'}>{featured.title} <span aria-hidden="true">↗</span></Link></figcaption></figure>}</div></section>
  <section id="design-library" className="projects-container projects-section" aria-labelledby="design-library-title"><div className="projects-heading"><div><Eyebrow>FIND A DIRECTION</Eyebrow><h2 id="design-library-title">Different Spaces.<br/>Considered Signage.</h2></div><p>Compare the lighting, finish and placement. Each design is a starting point for your own logo and installation.</p></div>
   <div className="projects-filter-bar"><fieldset className="projects-applications"><legend>Application</legend><div>{['All',...PROJECT_SETTINGS.filter(s=>scenes.some(w=>w.setting===s))].map(s=><button type="button" key={s} onClick={()=>{setApplication(s);setDemoEmpty(false)}} aria-pressed={application===s}>{({All:'All Spaces',Office:'Office & Reception','Dining':'Café & Dining'}[s]||s)}</button>)}</div></fieldset><label className="projects-style-select">Sign Style<select value={style} onChange={e=>{setStyle(e.target.value);setDemoEmpty(false)}}><option value="All">All Sign Styles</option>{products.filter(p=>scenes.some(w=>w.productSlug===p.slug)).map(p=><option key={p.slug} value={p.slug}>{p.title}</option>)}</select></label></div>
   <div className="projects-results"><p role="status">{selected.length} {selected.length===1?'design':'designs'}{application!=='All'?' · '+application:''}{style!=='All'?' · '+products.find(p=>p.slug===style)?.title:''}</p>{active&&<button type="button" onClick={clear}>Clear Filters</button>}<a href="#fabrication-library">Explore Fabrication Details ↓</a></div>
   {selected.length?<div className="design-grid">{selected.map(w=><DesignCard key={w.slug} work={w} products={products}/>)}</div>:<div className="projects-empty"><h3>No Designs Match These Filters</h3><p>Try another application or sign style. You can also send your own reference with your enquiry.</p><button className="button secondary" type="button" onClick={clear}>Show All Designs</button><TextLink to={quote({entry:'/projects/',cta:'content'})}>Discuss a Different Idea</TextLink></div>}
   <p className="projects-image-note">Design concepts use AI-generated imagery to illustrate a visual direction. Materials, dimensions, lighting and installation details are agreed for your own order.</p>
  </section>
  {samples.length>0&&<section id="fabrication-library" className="projects-section projects-fabrication" aria-labelledby="fabrication-library-title"><div className="projects-container"><div className="projects-heading"><div><Eyebrow>LOOK CLOSER</Eyebrow><h2 id="fabrication-library-title">The Details Behind<br/>the Finished Look.</h2></div><p>Real fabrication samples help you compare edges, returns, layers and lighting before choosing your specification.</p></div><div className="fabrication-grid">{samples.map(w=><DesignCard key={w.slug} work={w} products={products} compact/>)}</div></div></section>}
  <section className="projects-final"><div className="projects-container"><div><Eyebrow>MAKE IT YOUR OWN</Eyebrow><h2>Have a Direction in Mind?</h2><p>Bring your logo, a reference you like and approximate dimensions. We’ll review the construction and prepare a quote for your project.</p></div><div><Button to={quote({entry:'/projects/',cta:'content'})}>Share Your Brief & Files</Button><p>Sign in to save your details and upload drawings.</p></div></div></section>
 </article>;
}
