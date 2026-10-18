import {useEffect,useState} from 'react';
import {hasPrivacyChoice,savePrivacyChoice} from '../lib/browser-measurement.mjs';
export default function PrivacyChoice({settings}){
 const [show,setShow]=useState(false);useEffect(()=>{const update=()=>setShow(!hasPrivacyChoice());update();window.addEventListener('csf-consent-change',update);return()=>window.removeEventListener('csf-consent-change',update)},[]);
 if(!show)return null;
 return <aside className="privacy-choice" aria-label="Optional analytics choices"><div><strong>Your privacy choices</strong><p>Allow optional first-party analytics to help improve this website? Enquiry details and WhatsApp messages are excluded. You can change your choice in Cookie Settings.</p><a href="/cookies/">Read the Cookie Notice</a></div><div className="privacy-choice-actions"><button className="button secondary" onClick={()=>savePrivacyChoice(false)}>Reject Optional</button><button className="button secondary" onClick={()=>savePrivacyChoice(true)}>Allow Analytics</button><button className="quiet-button" onClick={settings}>Settings</button></div></aside>;
}
