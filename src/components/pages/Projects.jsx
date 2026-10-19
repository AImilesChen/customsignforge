import {useState} from 'react';
import {useSite} from '../site-context.jsx';
import {Button,Link,TextLink,Eyebrow,quote} from '../shared.jsx';
import Image from '../Image.jsx';
import {DESIGN_NOTE} from '../../lib/image-copy.mjs';
import {PROJECT_SETTINGS,filterProjects,isFabrication,projectLabel,projectQuoteParams} from '../../lib/project-library.mjs';
import '../../styles/projects.css';

export function DesignCard({work,products,compact=false}){
 const product=products.find(p=>p.slug===work.productSlug);
 return <article className={'design-card'+(compact?' design-card-compact':'')}>
  <Link className="design-card-image" to={'/projects/'+work.slug+'/'} aria-label={'View '+work.title}><Image src={work.img} alt={work.imageAlt||work.title} loading="lazy" sizes={compact?'(max-width: 760px) 100vw, 33vw':'(max-width: 760px) 100vw, 50vw'}/></Link>
  <p className="design-meta">{work.imageKind==='concept'?work.setting:<>{projectLabel(work)} <span aria-hidden="true">/</span> {isFabrication(work)?'Construction & finish':work.setting}</>}</p>
  <h3><Link to={'/projects/'+work.slug+'/'}>{work.title}</Link></h3><p className="design-description">{work.desc}</p>
  {product&&<p className="design-style">{product.title}</p>}
  <div className="design-card-actions"><TextLink to={'/projects/'+work.slug+'/'}>{isFabrication(work)?'View Construction':'View Design'}</TextLink>{!compact&&<Link className="design-quote-link" to={quote(projectQuoteParams(work))}>Request a Similar Sign</Link>}</div>
 </article>;
}

export default function Projects(){
 const {query,works,products}=useSite(),params=new URLSearchParams(query);
 const [application,setApplication]=useState(PROJECT_SETTINGS.includes(params.get('application'))?params.get('application'):'All');
 const [style,setStyle]=useState(products.some(p=>p.slug===params.get('style'))?params.get('style'):'All');
 const [demoEmpty,setDemoEmpty]=useState(params.get('state')==='empty'),[limit,setLimit]=useState(12);
 const scenes=works.filter(w=>!isFabrication(w)),samples=works.filter(isFabrication),selected=demoEmpty?[]:filterProjects(works,{application,style});
 const clear=()=>{setApplication('All');setStyle('All');setDemoEmpty(false);setLimit(12)};
 const chooseStyle=value=>{setStyle(value);setDemoEmpty(false);setLimit(12)};
 const active=application!=='All'||style!=='All'||demoEmpty;
 const labels={'led-channel-letters':'Front-Lit Letters','backlit-letters':'Halo-Lit Letters','metal-letters':'Metal Letters','acrylic-letters':'Acrylic & Logos','lightbox-neon':'Lightboxes & Neon','specialty-signs':'Specialty Signs'};
 return <article className="projects-page">
  <section className="projects-intro"><div className="projects-container projects-intro-grid"><div><Eyebrow>SIGN DESIGN GALLERY</Eyebrow><h1>Different Brands.<br/>Distinctive Signs.</h1><p className="projects-lead">Find a look for your space. Explore illuminated lettering, dimensional logos and custom sign details, then make the direction your own.</p><div className="button-row"><Button to="#design-library">Explore the Gallery</Button><TextLink to={quote({entry:'/projects/',cta:'content'})}>Discuss Your Project</TextLink></div></div><figure className="projects-featured"><Image src="/assets/gallery-v2/library-hero.webp" alt="A curated display of halo-lit bronze, front-lit lettering and a layered acrylic logo" loading="eager" fetchPriority="high" sizes="(max-width: 760px) 100vw, 55vw"/><figcaption>Light. Material. Possibility.</figcaption></figure></div></section>
  <section id="design-library" className="projects-container projects-section" aria-labelledby="design-library-title"><div className="projects-heading"><div><Eyebrow>FIND A DIRECTION</Eyebrow><h2 id="design-library-title">Find Your Sign.<br/>Make It Your Own.</h2></div><p>Compare the shape, light and finish. Explore a design, then discuss the details for your own space.</p></div>
   <div className="projects-filter-bar"><fieldset className="projects-applications projects-product-filters"><legend>Choose a sign style</legend><div><button type="button" onClick={()=>chooseStyle('All')} aria-pressed={style==='All'}>All Styles <span>{scenes.length}</span></button>{products.filter(p=>scenes.some(w=>w.productSlug===p.slug)).map(p=><button type="button" key={p.slug} onClick={()=>chooseStyle(p.slug)} aria-pressed={style===p.slug}>{labels[p.slug]||p.title} <span>{scenes.filter(w=>w.productSlug===p.slug).length}</span></button>)}</div></fieldset><label className="projects-style-select">Application<select value={application} onChange={e=>{setApplication(e.target.value);setDemoEmpty(false);setLimit(12)}}><option value="All">All Spaces</option>{PROJECT_SETTINGS.filter(s=>scenes.some(w=>w.setting===s)).map(s=><option key={s} value={s}>{({Office:'Office & Reception',Dining:'Café & Dining',Other:'Creative & Entertainment'}[s]||s)}</option>)}</select></label></div>
   <div className="projects-results"><p role="status" aria-live="polite">{selected.length} {selected.length===1?'design':'designs'}{selected.length>limit?' · Showing '+limit:''}{application!=='All'?' · '+application:''}{style!=='All'?' · '+products.find(p=>p.slug===style)?.title:''}</p>{active&&<button type="button" onClick={clear}>Clear Filters</button>}<a href="#fabrication-library">Explore Fabrication Details ↓</a></div>
   {selected.length?<><div className="design-grid">{selected.slice(0,limit).map(w=><DesignCard key={w.slug} work={w} products={products}/>)}</div>{selected.length>12&&<div className="projects-load-more"><button type="button" className="button secondary" disabled={limit>=selected.length} onClick={()=>setLimit(n=>n+12)}>{limit>=selected.length?'All '+selected.length+' Designs Shown':'Load More Designs'}</button></div>}</>:<div className="projects-empty"><h3>No Designs Match These Filters</h3><p>Try another application or sign style. You can also send your own reference with your enquiry.</p><button className="button secondary" type="button" onClick={clear}>Show All Designs</button><TextLink to={quote({entry:'/projects/',cta:'content'})}>Discuss a Different Idea</TextLink></div>}
   <p className="projects-image-note">{DESIGN_NOTE}</p>
  </section>
  {samples.length>0&&<section id="fabrication-library" className="projects-section projects-fabrication" aria-labelledby="fabrication-library-title"><div className="projects-container"><div className="projects-heading"><div><Eyebrow>LOOK CLOSER</Eyebrow><h2 id="fabrication-library-title">The Details Behind<br/>the Finished Look.</h2></div><p>Real fabrication samples help you compare edges, returns, layers and lighting before choosing your specification.</p></div><div className="fabrication-grid">{samples.map(w=><DesignCard key={w.slug} work={w} products={products} compact/>)}</div></div></section>}
  <section className="projects-final"><div className="projects-container"><div><Eyebrow>MAKE IT YOUR OWN</Eyebrow><h2>Have a Direction in Mind?</h2><p>Bring your logo, a reference you like and approximate dimensions. We’ll review the construction and prepare a quote for your project.</p></div><div><Button to={quote({entry:'/projects/',cta:'content'})}>Share Your Brief & Files</Button><p>Sign in to send your brief and files.</p></div></div></section>
 </article>;
}
