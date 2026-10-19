import PrivacyChoice from './PrivacyChoice.jsx';
import {useState} from 'react';
import {SiteContext,useSite} from './site-context.jsx';
import seedCopy from '../data/copy.json';
import Quote from './Quote.jsx';
import {CustomerSignIn,CustomerAccount} from './pages/Customer.jsx';
import {Header,Footer,Link} from './shared.jsx';
import Home,{HomeProducts,HomeWork,HomeCustom,HomeProof} from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import Contact from './pages/Contact.jsx';
import ProductPage from './pages/ProductPage.jsx';
import Projects from './pages/Projects.jsx';
import Project from './pages/Project.jsx';
import About from './pages/About.jsx';
import Trade from './pages/Trade.jsx';
import Process from './pages/Process.jsx';
import Policy from './pages/Policy.jsx';
import Landing from './pages/Landing.jsx';
import CookieDialog from './pages/CookieDialog.jsx';
import NotFound from './pages/NotFound.jsx';
import Kit from './pages/Kit.jsx';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/source-sans-3/latin-400.css';
import '@fontsource/source-sans-3/latin-600.css';
import '../styles/layout.css';
function AppInner(){const {products,works,copy,path:requestedPath,settings}=useSite();const[cookies,setCookies]=useState(false);let path=requestedPath;if(path!=='/'&&!path.endsWith('/'))path+='/';let body;const p=products.find(p=>path==='/products/'+p.slug+'/'),w=works.find(w=>path==='/projects/'+w.slug+'/'),policy=copy.policies.find(p=>p.route===path);if(path==='/'){body=<Home/>}else if(path==='/products/'){body=<Products/>}else if(p){body=<ProductPage p={p}/>}else if(path==='/projects/'){body=<Projects/>}else if(w){body=<Project w={w}/>}else if(path==='/for-sign-companies/'){body=<Trade/>}else if(path==='/about/'){body=<About/>}else if(path==='/how-it-works/'){body=<Process/>}else if(path==='/contact/'){body=<Contact/>}else if(path==='/sign-in/'){body=<CustomerSignIn/>}else if(path==='/account/'){body=<CustomerAccount/>}else if(path==='/get-a-quote/'){body=<Quote/>}else if(policy){body=<Policy p={policy}/>}else if(['/landing/custom-logo-signs/','/landing/sign-fabrication/'].includes(path)){body=<Landing trade={path.includes('sign-fabrication')}/>}else if(path==='/design-kit/'){body=<Kit/>}else{body=<NotFound/>}if(['/review/products/','/review/work/','/review/custom/'].includes(path))return <div className="home-redesign home-review"><Header home/><main id="main">{path==='/review/products/'?<HomeProducts/>:path==='/review/work/'?<HomeWork/>:<><HomeCustom/><HomeProof/></>}</main></div>;return <><Header home={path==='/'}/><main id="main">{body}</main><Footer settings={()=>setCookies(true)}/><PrivacyChoice settings={()=>setCookies(true)}/>{settings.environment!=='production'&&<div className="preview-ribbon"><Link to="/admin/">Development preview · Admin</Link><span>Local database · Illustrative imagery</span></div>}{cookies&&<CookieDialog onClose={()=>setCookies(false)}/>}</>}
export function App({site,path='/',query=''}){
 const picture=p=>p?.startsWith('/assets/')?p.replace(/\.png$/,'.webp'):p;const products=site.products.map((p,i)=>({...p,i:p.seedIndex??i,desc:p.cardDescription||({'led-channel-letters':'A bright, clearly defined face.','backlit-letters':'A glow behind your lettering.','metal-letters':'Depth, texture and metal finishes.','acrylic-letters':'Colour, depth and layering.','lightbox-neon':'Explore a different lighting effect.','specialty-signs':'A starting point for distinctive fabrication.'}[p.slug])||p.intro,img:picture(p.image)}));
 const works=site.works.map(w=>({...w,productSlug:w.product,desc:w.intro,img:picture(w.image),type:w.setting,product:Math.max(0,products.findIndex(p=>p.slug===w.product))}));
 const copy=JSON.parse(JSON.stringify(seedCopy));
 for(const p of site.pages){const id={'for-sign-companies':'8','how-it-works':'9','about':'10'}[p.slug];if(id)copy.sections[id]=`# ${p.title}\n\n${p.intro}\n\n${p.body}`;}
 for(const p of site.landings){const id=p.slug==='sign-fabrication'?'13':'12';copy.sections[id]=`# ${p.title}\n\n${p.intro}\n\n${p.body}`;}
 return <SiteContext.Provider value={{products,works,copy,path,query,settings:site.settings,site}}><AppInner/></SiteContext.Provider>
}
