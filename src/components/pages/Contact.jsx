import {ArrowRightIcon as ArrowRight,EnvelopeSimpleIcon as Envelope,WhatsappLogoIcon as WhatsappLogo} from '@phosphor-icons/react';
import {Button,Eyebrow,quote} from '../shared.jsx';
import {useSite} from '../site-context.jsx';
import content from '../../data/contact-content.json';
import '../../styles/contact.css';
export default function Contact(){
 const {settings,site}=useSite();
 return <article className="contact-page">
  <section className="contact-container contact-layout" aria-labelledby="contact-project-title">
   <div className="contact-project"><Eyebrow>CONTACT CUSTOM SIGN FORGE</Eyebrow><h1 id="contact-project-title">Let’s Talk About<br/>Your Sign.</h1><p>Share your idea or ask about a sign style. A logo, rough dimensions or a reference photo is enough to start.</p>
    <Button to={quote({entry:'/contact/',cta:'content'})}>Start a Project Enquiry <ArrowRight size={20}/></Button>
    <p className="contact-sign-in-note">{site.customer?'You’re signed in. Continue to your project form.':'Sign in with Google or verify your email to share project details and files.'}</p>
    <p className="contact-quote-note">Made to your requirements. Quoted for your project.</p>
   </div>
   <aside className="contact-channels" aria-label="Business contact details"><h2>Email or WhatsApp</h2>
    {settings.email&&<div className="contact-channel"><Envelope size={28}/><div><h3>Email</h3><a href={'mailto:'+settings.email}>{settings.email}</a><p>Send your questions, logo or project brief.</p></div></div>}
    {settings.whatsapp&&<div className="contact-channel"><WhatsappLogo size={28}/><div><h3>WhatsApp</h3><a href={'https://wa.me/'+settings.whatsapp}>+{settings.whatsapp}</a><p>Discuss your sign idea and project details.</p></div></div>}
   </aside>
  </section>
  <section id="company-information" className="contact-container contact-company" aria-label="Company and business address"><dl>{settings.operatorName&&<div><dt>Company</dt><dd>{settings.operatorName}</dd></div>}<div><dt>{content.addressLabel}</dt><dd><address>{content.address}</address></dd></div></dl></section>
 </article>;
}
