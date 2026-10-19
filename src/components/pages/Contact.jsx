import {ArrowRightIcon as ArrowRight,EnvelopeSimpleIcon as Envelope,WhatsappLogoIcon as WhatsappLogo} from '@phosphor-icons/react';
import {Button,PageIntro,Link,Eyebrow} from '../shared.jsx';
import {useSite} from '../site-context.jsx';
import '../../styles/contact.css';

export default function Contact(){
 const {settings,site}=useSite();
 return <>
  <PageIntro eyebrow="CONTACT CUSTOM SIGN FORGE" title="Let’s Talk About Your Sign." text="Share your idea, ask about a sign style or start a project enquiry. We welcome projects for Southeast Asia, Europe and North America."/>
  <section className="section container contact-layout" aria-labelledby="contact-project-title">
   <div className="contact-project"><Eyebrow>START YOUR PROJECT</Eyebrow><h2 id="contact-project-title">Tell Us What You Have in Mind.</h2><p>Use our project form to share the sign style, intended location and delivery country. Rough dimensions, a logo or a reference idea are enough to begin.</p>
    <ul><li>Your preferred sign style or lighting effect</li><li>Where the sign will be used</li><li>Delivery country and any timing requirements</li></ul>
    <Button to="/get-a-quote/?entry=contact">Fill In the Project Form <ArrowRight size={20}/></Button>
    <p className="contact-sign-in-note">{site.customer?'You’re signed in. Go straight to the form and save your project details.':'Sign in with Google or verify your email first. You’ll then return directly to the project form.'}</p>
    <p className="contact-quote-note">Every sign is made to order. Pricing and delivery arrangements are confirmed after we review your requirements.</p>
   </div>
   <aside className="contact-channels" aria-label="Business contact details"><h2>Other Ways to Reach Us</h2>
    {settings.email&&<div className="contact-channel"><Envelope size={28}/><div><h3>Email</h3><a href={'mailto:'+settings.email}>{settings.email}</a><p>Send your questions, logo or project brief.</p></div></div>}
    {settings.whatsapp&&<div className="contact-channel"><WhatsappLogo size={28}/><div><h3>WhatsApp</h3><a href={'https://wa.me/'+settings.whatsapp}>+{settings.whatsapp}</a><p>Discuss your sign idea and project details.</p></div></div>}
    {settings.operatorName&&<div className="contact-operator"><span>Operated by</span><p>{settings.operatorName}</p><Link to="/legal-notice/">Business Information <ArrowRight size={17}/></Link></div>}
   </aside>
  </section>
 </>;
}
