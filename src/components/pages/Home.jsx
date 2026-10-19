import {ArrowDownIcon as ArrowDown} from '@phosphor-icons/react';
import {Button,TextLink,Eyebrow,Figure,FAQs,Link,quote} from '../shared.jsx';
import Image from '../Image.jsx';
import {useSite} from '../site-context.jsx';
import content from '../../data/home-content.json';
import '../../styles/home.css';

const asset=name=>'/assets/home-v2/'+name;
function HomePhoto({image,alt,className=''}){return <div className={'home-photo '+className}><Image src={asset(image)} alt={alt} loading="lazy"/></div>;}

export function HomeProducts(){
  const {products}=useSite();
  const selected=content.products.filter(item=>products.some(p=>p.slug===item.slug));
  return <section id="sign-styles" className="home-section home-container home-products" aria-labelledby="home-styles-title">
    <div className="home-section-heading"><div><Eyebrow>SIGN STYLES</Eyebrow><h2 id="home-styles-title">Find the Right Sign for Your Brand</h2><p>Compare the look. We’ll help confirm the specification.</p></div><TextLink to="/products/">Explore All Styles</TextLink></div>
    <div className="home-product-grid">{selected.map(item=><article key={item.slug}>
      <Link to={'/products/'+item.slug+'/'} aria-label={'Explore '+item.title}><HomePhoto image={item.image} alt={item.alt}/></Link>
      <h3><Link to={'/products/'+item.slug+'/'}>{products.find(p=>p.slug===item.slug)?.title||item.title}</Link></h3>
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

export function HomeProof(){return <section id="behind-the-sign" className="home-section home-container home-proof" aria-labelledby="home-proof-title">
  <div className="home-section-heading"><div><Eyebrow>THE DETAILS BEHIND YOUR SIGN</Eyebrow><h2 id="home-proof-title">Look Beyond the Finished Face.</h2><p>We build each sign around the agreed specification, with construction, lighting checks and packing considered from the start.</p></div><TextLink to="/about/">About Our Fabrication</TextLink></div>
  <div className="home-proof-grid">{content.proof.map(item=><figure key={item.image}><HomePhoto image={item.image} alt={item.alt}/><figcaption><h3>{item.title}</h3><p>{item.text}</p></figcaption></figure>)}</div>
  <p className="home-image-note">Process images are AI-generated illustrations of the topics to discuss. They are not records of actual production, inspection or delivery.</p>
</section>;}

function HomeTrade(){return <section className="home-trade" aria-labelledby="home-trade-title"><div className="home-container"><div><Eyebrow>FOR THE TRADE</Eyebrow><h2 id="home-trade-title">Custom Fabrication for Your Next Project.</h2><p>Sign companies, installers and procurement teams: share your drawings, quantities and supply requirements for a project-based discussion.</p></div><Button secondary to="/for-sign-companies/">For Sign Companies & Installers</Button></div></section>;}

export default function Home(){return <div className="home-redesign">
  <section className="hero"><div className="hero-copy"><Eyebrow>CUSTOM BUSINESS SIGNAGE</Eyebrow><h1>Custom Signs,<br/>Made for Your Business</h1><p>Bring your logo, lettering or reference idea to life. Explore illuminated signs, dimensional letters and custom finishes.</p><div className="button-row"><Button/><Button secondary to="/projects/">Explore Our Work</Button></div><p className="hero-helper">Not sure about the size or style? Start with your idea or a reference photo.</p></div><Figure src="hero-cafe.webp" alt="Warm illuminated lettering on a contemporary café facade — illustrative concept" className="hero-figure"/></section>
  <div className="explore-strip"><a href="#sign-styles">Explore sign styles<ArrowDown size={22}/></a></div>
  <HomeProducts/><HomeWork/><HomeCustom/><HomeProcess/><HomeProof/><HomeTrade/>
  <section className="home-section home-container home-faq" aria-labelledby="home-faq-title"><div><Eyebrow>A FEW THINGS TO KNOW</Eyebrow><h2 id="home-faq-title">Start with<br/>What You Know.</h2><p>No final dimensions or drawing yet? Share the idea and we can discuss what comes next.</p><TextLink to={quote({source:'homepage-faq'})}>Ask About Your Project</TextLink></div><FAQs/></section>
  <section className="home-section home-final" aria-labelledby="home-final-title"><div className="home-container"><Eyebrow>LET’S TALK ABOUT YOUR SIGN</Eyebrow><h2 id="home-final-title">Tell Us About Your Sign.</h2><p>Sign in, share a few details and continue on WhatsApp. We’ll discuss the specification and quote for your project.</p><Button/><p className="home-final-helper">Custom-made to your requirements. Quoted individually.</p></div></section>
</div>;}
