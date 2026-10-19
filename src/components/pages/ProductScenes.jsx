import {Eyebrow,TextLink,Link,quote} from '../shared.jsx';
import {useSite} from '../site-context.jsx';
import {DESIGN_NOTE} from '../../lib/image-copy.mjs';
import {sceneQuoteParams} from '../../lib/product-scenes.mjs';
export default function ProductScenes({product,items,photo}){
 const {works}=useSite();
 const scenes=(items||[]).map(scene=>({scene,work:works.find(w=>w.slug===scene.projectSlug&&w.productSlug===product.slug)})).filter(item=>item.work);
 if(!scenes.length)return null;
 const title=({'backlit-letters':'Backlit Sign Design Gallery','led-channel-letters':'Front-Lit Sign Design Gallery','metal-letters':'Metal Lettering Design Gallery','acrylic-letters':'Acrylic Sign Design Gallery','lightbox-neon':'Lightbox & Neon Design Gallery','specialty-signs':'Specialty Sign Design Gallery'}[product.slug]||'Sign Design Gallery');
 return <section id="product-design-gallery" className="product-section-v2 product-scene-section product-gallery-v3" aria-labelledby="product-context-title"><div className="product-container"><div className="product-section-heading product-gallery-heading"><div><Eyebrow>FIND YOUR DIRECTION</Eyebrow><h2 id="product-context-title">{title}</h2></div><p>Different identities, settings and finishes. Find a direction for your own sign.</p></div><div className="product-case-grid">{scenes.map(({scene,work})=><article id={scene.id} key={scene.id} className="product-case-card">{photo({photo:{...scene,src:work.img,alt:work.imageAlt||scene.alt,caption:work.title},hideCaption:true,className:'product-scene-photo'})}<div><p className="product-scene-meta">{scene.space}</p><h3><Link to={'/projects/'+work.slug+'/'}>{work.title}</Link></h3><p className="product-case-effect">{scene.tags.join(' · ')}</p><div className="product-case-actions"><TextLink to={'/projects/'+work.slug+'/'}>View Design</TextLink><Link to={quote(sceneQuoteParams(product.slug,scene))}>Request a Similar Look</Link></div></div></article>)}</div><div className="product-gallery-footer"><p className="product-source-note">{DESIGN_NOTE}</p><TextLink to={'/projects/?style='+product.slug+'#design-library'}>Explore This Style in the Gallery</TextLink></div></div></section>;
}
