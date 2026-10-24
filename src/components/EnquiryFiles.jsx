import {useLocale} from './use-locale.jsx';
import {useEffect,useState} from 'react';
import {FILE_ACCEPT,FILE_EXTENSIONS,FILE_COUNT_LIMIT,FILE_LIMIT,FILE_TOTAL_LIMIT} from '../lib/enquiry-fields.mjs';
export const fileSize=size=>size>=1024*1024?(size/(1024*1024)).toFixed(1)+' MB':Math.max(1,Math.ceil(size/1024))+' KB';

export default function EnquiryFiles({files,setFiles,enabled,disabled,csrf,setBusy,recovered,fieldError,basePath='/api/account/attachments'}){const {t:tr,href}=useLocale();
 const [error,setError]=useState(''),[working,setWorking]=useState(false);
 const workingState=value=>{setWorking(value);setBusy(value)};
 async function load(){
  workingState(true);setError('');
  try{await csrf();const r=await fetch(basePath,{signal:AbortSignal.timeout(15000)}),data=await r.json();if(!r.ok)throw Error(data.error||'Unable to load uploaded files.');setFiles(data.files);if(data.files.length)recovered()}
  catch(e){setError(e.name==='TimeoutError'?'Loading files timed out. Try again.':e.message)}finally{workingState(false)}
 }
 useEffect(()=>{load()},[]);
 async function upload(e){
  const selected=Array.from(e.target.files||[]);e.target.value='';if(!selected.length)return;setError('');
  if(files.length+selected.length>FILE_COUNT_LIMIT){setError('Use up to 3 files in total.');return}
  if(selected.some(f=>!f.size||f.size>FILE_LIMIT)){setError('Each file must be between 1 byte and 10 MB.');return}
  if([...files,...selected].reduce((sum,f)=>sum+f.size,0)>FILE_TOTAL_LIMIT){setError('Keep all files together within 20 MB.');return}
  if(selected.some(f=>!FILE_EXTENSIONS.includes(f.name.split('.').pop().toLowerCase()))){setError('Use PDF, AI, EPS, DWG, DXF, JPG, PNG or WebP. Export other formats as PDF.');return}
  workingState(true);
  try{const token=await csrf();for(const file of selected){const r=await fetch(basePath,{method:'POST',headers:{'Content-Type':'application/octet-stream','X-CSRF-Token':token,'X-File-Name':encodeURIComponent(file.name)},body:file,signal:AbortSignal.timeout(90000)}),data=await r.json();if(!r.ok)throw Error(data.error||'Unable to upload this file.');setFiles(current=>[...current,data.file])}}
  catch(e){setError(e.name==='TimeoutError'?'The upload timed out. Reload the uploaded file list before trying again.':e.message)}finally{workingState(false)}
 }
 async function remove(file){
  workingState(true);setError('');
  try{const token=await csrf(),r=await fetch(basePath+'/'+file.id,{method:'DELETE',headers:{'X-CSRF-Token':token},signal:AbortSignal.timeout(20000)}),data=await r.json();if(!r.ok)throw Error(data.error||'Unable to remove this file.');setFiles(current=>current.filter(item=>item.id!==file.id))}
  catch(e){setError(e.name==='TimeoutError'?'Removing the file timed out. Reload the uploaded file list.':e.message)}finally{workingState(false)}
 }
 return <div id="attachments" tabIndex={-1}>
  {tr(enabled&&<div className="quote-file-picker"><label htmlFor="drawing-files">{tr("Upload Drawings or Reference Files (Optional)")}</label><p className="quote-file-help" id="drawing-file-help">{tr("You can continue without uploading. PDF, AI, EPS, DWG, DXF, JPG, PNG or WebP. Up to 3 files, 10 MB each and 20 MB in total. Export CDR or other formats as PDF.")}</p><input id="drawing-files" type="file" multiple accept={FILE_ACCEPT} onChange={upload} disabled={disabled||working} aria-describedby="drawing-file-help drawing-file-privacy"/></div>)}
  {!!files.length&&<ul className="quote-file-list" aria-label={tr("Your uploaded files")}>{files.map(file=><li key={file.id}><span><a href={href(basePath+'/'+file.id)} download>{file.name}</a><small>{tr(fileSize(file.size))}{tr(" · Uploaded")}</small></span><button type="button" disabled={disabled||working} onClick={()=>remove(file)}>{tr("Remove")}</button></li>)}</ul>}
  {tr(working&&<p className="quote-file-status" role="status">{tr("Updating your uploaded files…")}</p>)}
  {tr((error||fieldError)&&<p className="field-error" role="alert">{tr(error||fieldError)}</p>)}
  {tr(error&&<button className="inline-link" type="button" onClick={load} disabled={disabled||working}>{tr("Reload Uploaded Files")}</button>)}
  <p className="quote-file-help" id="drawing-file-privacy">{tr("Uploaded files are visible only to you in this browser session and our authorised team. Upload only files you may share. Unsubmitted uploads expire after 24 hours.")}</p>
 </div>;
}
