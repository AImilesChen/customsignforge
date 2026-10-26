import {useLocale} from './use-locale.jsx';
import {useEffect,useState} from 'react';
import {hasPrivacyChoice,savePrivacyChoice} from '../lib/browser-measurement.mjs';
export default function PrivacyChoice({settings}){const {t:tr,href}=useLocale();
 const [show,setShow]=useState(false);useEffect(()=>{const update=()=>setShow(!hasPrivacyChoice());update();window.addEventListener('csf-consent-change',update);return()=>window.removeEventListener('csf-consent-change',update)},[]);
 if(!show)return null;
 return <aside className="privacy-choice" aria-label={tr("Optional analytics choices")}><div><strong>{tr("Your privacy choices")}</strong><p>{tr("Allow Google Analytics, Shipsolo traffic statistics and Microsoft Clarity heatmaps and session recordings to help improve this website? Enquiry forms and account pages are excluded.")} {tr("Ahrefs Web Analytics also measures visits on public pages without analytics cookies.")}</p><a href={href("/cookies/")}>{tr("Read the Cookie Notice")}</a></div><div className="privacy-choice-actions"><button className="button secondary" onClick={()=>savePrivacyChoice(false)}>{tr("Reject Optional")}</button><button className="button secondary" onClick={()=>savePrivacyChoice(true)}>{tr("Allow Analytics")}</button><button className="quiet-button" onClick={settings}>{tr("Settings")}</button></div></aside>;
}
