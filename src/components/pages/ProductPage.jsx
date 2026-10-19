import {useEffect,useRef,useState} from 'react';
import {ArrowRightIcon,MagnifyingGlassPlusIcon,XIcon,PlusIcon} from '@phosphor-icons/react';
import {quote,Link,Button,TextLink,Eyebrow,imageCaption,Figure,mdHeadings,Markdown,CTA,Gallery} from '../shared.jsx';
import Image from '../Image.jsx';
import presentations from '../../data/product-pages.json';
import ProductScenes from './ProductScenes.jsx';
import {displayCaption} from '../../lib/image-copy.mjs';
import '../../styles/product-page.css';

function Photo({photo,onEnlarge,hero=false,className='',hideCaption=false,label='Sign detail'}){
 const caption=displayCaption(photo.caption,'');
 return <figure className={'product-photo '+className+(photo.kind==='supplier_reference'?' is-supplier':'')}><button type="button" className="product-photo-control" onClick={()=>onEnlarge({...photo,caption:caption||label})} aria-label={'Enlarge image: '+(caption||label)}>
  <Image src={photo.src} alt={photo.alt} loading={hero?'eager':'lazy'} fetchPriority={hero?'high':undefined} sizes={hero?'(max-width: 700px) 100vw, 60vw':'(max-width: 700px) 100vw, 50vw'}/><span className="product-photo-zoom" aria-hidden="true"><MagnifyingGlassPlusIcon size={20}/></span>
 </button>{!hideCaption&&caption&&<figcaption>{caption}</figcaption>}</figure>;
}
function LegacyProduct({p}){return <><div className="container breadcrumb"><Link to="/products/">Products</Link><span>/</span>{p.title}</div><section className="container detail-hero"><div><Eyebrow>CUSTOM SIGN STYLES</Eyebrow><h1>{p.title}</h1><p className="lead">{p.intro}</p><Button to={quote({style:p.slug})}>Request This Style</Button></div><Figure src={p.img} alt={p.imageAlt||p.title} caption={imageCaption(p.imageKind)}/></section><section className="section container"><Markdown text={p.body||''}/></section><Gallery items={p.gallery}/><CTA to={quote({style:p.slug})}/></>}

export default function ProductPage({p}){
 const c=presentations[p.slug];
 const [enlarged,setEnlarged]=useState(null),dialog=useRef(null);
 useEffect(()=>{if(enlarged&&!dialog.current?.open)dialog.current?.showModal()},[enlarged]);
 if(!c)return <LegacyProduct p={p}/>;
 const request=quote({style:p.slug});
 // Explicitly replaced CMS images remain authoritative; seed images use the curated visual.
 const hero=p.img&&p.img!==c.oldHero?{src:p.img,alt:p.imageAlt||p.title,caption:imageCaption(p.imageKind),kind:p.imageKind}:c.hero;
 const shown=new Set([hero,...(c.detail||[]),c.custom,...(c.contexts||[]),...(c.directions||[]).map(d=>d.photo)].filter(Boolean).map(i=>i.src));
 const extra=(p.gallery||[]).filter(i=>!shown.has(i.src));
 const photo=props=><Photo {...props} onEnlarge={setEnlarged}/>;
 return <article className={'product-redesign product-'+p.slug}>
  <section className="product-container product-hero" aria-labelledby="product-title">
   <div className="product-breadcrumb"><Link to="/products/">Products</Link><span>/</span><span>{p.title}</span></div>
   <div className="product-hero-heading"><Eyebrow>{p.title}</Eyebrow><h1 id="product-title">{c.headline.map((line,i)=><span key={line}>{i>0&&' '}{line}</span>)}</h1></div>
   {photo({photo:hero,hero:true,className:'product-hero-photo',label:p.title})}
   <div className="product-hero-summary"><p className="product-intro">{c.intro}</p><ul className="product-benefits">{c.benefits.map(t=><li key={t}>{t}</li>)}</ul><Button to={request}>Request This Style</Button></div>
  </section>
  {!!c.technicalNotes?.length&&<section className="product-section-v2 product-container product-technical" aria-labelledby="product-technical-title"><div className="product-section-heading"><Eyebrow>WHAT SHAPES THE FINISHED EFFECT</Eyebrow><h2 id="product-technical-title">The Details Make the Difference.</h2></div><div className="product-technical-grid">{c.technicalNotes.map(([title,text])=><div key={title}><h3>{title}</h3><p>{text}</p></div>)}</div></section>}
  <ProductScenes product={p} items={c.contexts} photo={photo}/>
  <section className="product-section-v2 product-container product-details" aria-labelledby="product-details-title"><div className="product-section-heading"><h2 id="product-details-title">{(c.detailTitleLines||[c.detailTitle]).map((line,i)=><span key={line}>{i>0&&' '}{line}</span>)}</h2><p>{c.detailIntro}</p></div>
   {c.directions?<div className="product-directions">{c.directions.map(d=><div id={'direction-'+d.anchor} key={d.anchor}><span id={d.anchor} className="product-direction-anchor" aria-hidden="true"/>{photo({photo:d.photo})}<h3>{d.title}</h3><p>{d.text}</p><TextLink to={quote({style:p.slug,variant:d.anchor})}>Discuss This Direction</TextLink></div>)}</div>:<div className={'product-detail-photos'+(c.detail.length===2?' product-detail-pair':'')}>{c.detail.map((item,i)=><div className={i===0?'product-detail-main':''} key={item.src}>{photo({photo:item})}</div>)}</div>}

  </section>
  <section className="product-section-v2 product-custom-section" aria-labelledby="product-custom-title"><div className={'product-container product-custom'+(!c.custom?' product-custom-text':'')}>
   {c.custom&&photo({photo:c.custom})}<div><h2 id="product-custom-title">Made Around Your Project.</h2><dl className="product-option-list">{c.options.map(([title,text])=><div key={title}><dt>{title}</dt><dd>{text}</dd></div>)}</dl></div>
  </div></section>
  <section className="product-section-v2 product-start-section" aria-labelledby="product-start-title"><div className="product-container"><h2 id="product-start-title">A Clear Starting Point.</h2><ol className="product-start-steps">{[
   ['Share your idea','Sign in, then share a logo or reference, approximate size and delivery country.'],
   ['Confirm the details','We’ll discuss the finish, lighting, mounting and delivery needs for your space.'],
   ['Review your quote','Receive a project-based quote with the scope and specification to review.']
  ].map(([title,text],i)=><li key={title}><span className="product-step-number">0{i+1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol><TextLink to="/shipping-installation/">Delivery & Installation</TextLink></div></section>
  <section className="product-section-v2 product-container product-faq" aria-labelledby="product-faq-title"><h2 id="product-faq-title">{c.faqTitle||'Questions Before You Start.'}</h2><div className="faqs">{c.faq.map(([q,a])=><details key={q}><summary>{q}<PlusIcon size={20} aria-hidden="true"/></summary><p>{a}</p></details>)}</div>
   {(p.body||p.intro||extra.length>0)&&<details className="product-notes"><summary>More Product Information <ArrowRightIcon size={18}/></summary><div className="product-published-notes">{p.intro&&<p className="product-published-intro">{p.intro}</p>}{p.body&&<Markdown text={mdHeadings('# '+p.title+'\n\nIntroduction\n\n'+p.body)}/>} {!!extra.length&&<div className="product-extra-references"><h3>Additional Construction References</h3>{extra.map(item=><Photo key={item.src} photo={{...item,caption:item.caption||'Fabrication reference',kind:'supplier_reference'}} onEnlarge={setEnlarged}/>)}</div>}</div></details>}
  </section>
  <section className="product-final" aria-labelledby="product-final-title"><div className="product-container"><div><h2 id="product-final-title">Let’s Shape Your Sign.</h2><p>Share your idea and we’ll review the finish, lighting and mounting for your space.</p></div><div><Button to={request}>Request This Style</Button><p>Sign in to send your details and drawings.</p><Link to="/contact/">Contact Us</Link></div></div></section>
  <dialog className="product-image-dialog" ref={dialog} onClose={()=>setEnlarged(null)} onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close()}} aria-labelledby="product-image-title"><button type="button" className="product-image-close" onClick={()=>dialog.current?.close()} aria-label="Close image" autoFocus><XIcon size={26}/></button>{enlarged&&<><Image src={enlarged.src} alt={enlarged.alt} loading="eager" sizes="95vw"/><p id="product-image-title">{displayCaption(enlarged.caption,enlarged.kind==='supplier_reference'?'Fabrication sample':'Design inspiration')}</p></>}</dialog>
 </article>;
}
