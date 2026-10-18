import {useState} from 'react';
import {SiteContext,useSite} from './site-context.jsx';
import seedCopy from '../data/copy.json';
import Quote from './Quote.jsx';
import {Header,Footer,Link,Eyebrow,TextLink,ProductCards,WorkCards} from './shared.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductPage from './pages/ProductPage.jsx';
import Projects from './pages/Projects.jsx';
import Project from './pages/Project.jsx';
import Editorial from './pages/Editorial.jsx';
import Policy from './pages/Policy.jsx';
import Landing from './pages/Landing.jsx';
import CookieDialog from './pages/CookieDialog.jsx';
import NotFound from './pages/NotFound.jsx';
import Kit from './pages/Kit.jsx';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/source-sans-3/400.css';
import '@fontsource/source-sans-3/600.css';
function AppInner(){const {products,works,copy,path:requestedPath,settings}=useSite();const[cookies,setCookies]=useState(false);let path=requestedPath;if(path!=='/'&&!path.endsWith('/'))path+='/';let body,title;const p=products.find(p=>path==='/products/'+p.slug+'/'),w=works.find(w=>path==='/projects/'+w.slug+'/'),policy=copy.policies.find(p=>p.route===path);if(path==='/'){body=<Home/>;title='Custom Signs, Made for Your Business'}else if(path==='/products/'){body=<Products/>;title='Custom Sign Styles'}else if(p){body=<ProductPage p={p}/>;title=p.title}else if(path==='/projects/'){body=<Projects/>;title='Our Sign Work'}else if(w){body=<Project w={w}/>;title=w.title}else if(path==='/for-sign-companies/'){body=<Editorial id="8" eyebrow="FOR THE TRADE" title="Custom Sign Fabrication for Sign Companies & Installers" img="craft-details.webp"/>;title='For Sign Companies'}else if(path==='/about/'){body=<Editorial id="10" eyebrow="ABOUT CUSTOM SIGN FORGE" title="Custom Signs, Through Clear Project Coordination" img="craft-details.webp"/>;title='About'}else if(path==='/how-it-works/'){body=<Editorial id="9" eyebrow="HOW IT WORKS" title="How Your Custom Sign Project Works"/>;title='How It Works'}else if(path==='/get-a-quote/'){body=<Quote/>;title='Get a Custom Quote'}else if(policy){body=<Policy p={policy}/>;title=policy.title}else if(['/landing/custom-logo-signs/','/landing/sign-fabrication/'].includes(path)){body=<Landing trade={path.includes('sign-fabrication')}/>;title='Discuss Your Sign Project'}else if(path==='/design-kit/'){body=<Kit/>;title='Design Review Index'}else{body=<NotFound/>;title='Page Not Found'}if(path==='/review/products/')return <main><section className="section container product-section"><Eyebrow>SIGN STYLES</Eyebrow><h2>Find the Right Look for Your Sign</h2><p className="lead">Start with the effect you want. We’ll help clarify the details.</p><ProductCards/><div className="section-bottom"><span className="small">Images labelled by type</span><TextLink to="/products/">Explore All Sign Styles</TextLink></div></section></main>;if(path==='/review/work/')return <main className="work-section"><section className="section container"><Eyebrow>SELECTED WORK</Eyebrow><div className="section-title"><div><h2>See the Details. Picture Your Project.</h2><p className="lead">Explore sign styles in commercial spaces.</p></div><TextLink to="/projects/">Explore Our Work</TextLink></div><WorkCards/><p className="small work-note">Visual references · Image types are labelled.</p></section></main>;return <><Header/><main id="main">{body}</main><Footer settings={()=>setCookies(true)}/>{settings.environment!=='production'&&<div className="preview-ribbon"><Link to="/admin/">Development preview · Admin</Link><span>Local database · Illustrative imagery</span></div>}{cookies&&<CookieDialog onClose={()=>setCookies(false)}/>}</>}
export function App({site,path='/',query=''}){
 const picture=p=>p?.startsWith('/assets/')?p.replace(/\.png$/,'.webp'):p;const products=site.products.map((p,i)=>({...p,i:p.seedIndex??i,desc:p.cardDescription||({'led-channel-letters':'A bright, clearly defined face.','backlit-letters':'A glow behind your lettering.','metal-letters':'Depth, texture and metal finishes.','acrylic-letters':'Colour, depth and layering.','lightbox-neon':'Explore a different lighting effect.','specialty-signs':'A starting point for distinctive fabrication.'}[p.slug])||p.intro,img:picture(p.image)}));
 const works=site.works.map(w=>({...w,desc:w.intro,img:picture(w.image),type:w.setting,product:Math.max(0,products.findIndex(p=>p.slug===w.product))}));
 const copy=JSON.parse(JSON.stringify(seedCopy));
 for(const p of site.pages){const id={'for-sign-companies':'8','how-it-works':'9','about':'10'}[p.slug];if(id)copy.sections[id]=`# ${p.title}\n\n${p.intro}\n\n${p.body}`;}
 for(const p of site.landings){const id=p.slug==='sign-fabrication'?'13':'12';copy.sections[id]=`# ${p.title}\n\n${p.intro}\n\n${p.body}`;}
 return <SiteContext.Provider value={{products,works,copy,path,query,settings:site.settings,site}}><AppInner/></SiteContext.Provider>
}
