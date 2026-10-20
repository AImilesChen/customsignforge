import {useEffect,useRef,useState} from 'react';
import {tabStorage,draftKey,readQuoteDraft,writeQuoteDraft} from '../lib/quote-draft.mjs';
export function useQuoteDraft({account,context,form,setForm,step,setStep,key,state}){
 const [loaded,setLoaded]=useState(false),snapshot=useRef(null);
 snapshot.current={form,step,state};
 useEffect(()=>{const saved=readQuoteDraft(tabStorage(),account,context);if(saved){setForm(initial=>Object.fromEntries(Object.entries(initial).map(([k,v])=>[k,k!=='website'&&typeof saved.form[k]==='string'&&saved.form[k].length<=Math.max(300,String(v).length)?saved.form[k]:v])));setStep(saved.step);if(/^[0-9a-f-]{36}$/i.test(saved.idempotencyKey||''))key.current=saved.idempotencyKey;}setLoaded(true);},[account,context]);
 useEffect(()=>{if(!loaded)return;const save=()=>{const current=snapshot.current;if(current.state==='success'){tabStorage()?.removeItem(draftKey(account));return;}writeQuoteDraft(tabStorage(),account,context,current.form,current.step,key.current);};save();window.addEventListener('pagehide',save);window.addEventListener('csf-save-draft',save);return()=>{window.removeEventListener('pagehide',save);window.removeEventListener('csf-save-draft',save);};},[loaded,account,context,form,step,state]);
}
