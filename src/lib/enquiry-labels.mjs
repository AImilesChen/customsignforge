import {HttpError} from './validation.mjs';
export const CLIENT_LABELS=[['good','优质客户'],['bad','低质量客户'],['contacted','已联系'],['ordered','已下单']];
export const labelName=key=>CLIENT_LABELS.find(([id])=>id===key)?.[1]||key;
// Existing explicit follow-up states supply initial labels until an owner edits them.
export const LABELS_SQL=`COALESCE(labels_json,(SELECT json_group_array(label) FROM (
 SELECT 'good' label WHERE enquiries.quality='qualified' AND enquiries.record_status!='duplicate_or_spam'
 UNION ALL SELECT 'bad' WHERE enquiries.quality='not_a_fit' OR enquiries.record_status='duplicate_or_spam'
 UNION ALL SELECT 'contacted' WHERE enquiries.record_status='chat_confirmed'
 UNION ALL SELECT 'ordered' WHERE enquiries.business_stage='won'
)))`;
export function enquiryLabels(row){
 if(row.labels_json!==null&&row.labels_json!==undefined){try{return JSON.parse(row.labels_json)}catch{return []}}
 const labels=[];
 if(row.quality==='not_a_fit'||row.record_status==='duplicate_or_spam')labels.push('bad');else if(row.quality==='qualified')labels.push('good');
 if(row.record_status==='chat_confirmed')labels.push('contacted');if(row.business_stage==='won')labels.push('ordered');return labels;
}
export async function saveEnquiryLabels(env,user,id,raw){
 if(!Number.isInteger(raw.version)||!Array.isArray(raw.labels)||raw.labels.length>4||raw.labels.some(v=>!CLIENT_LABELS.some(([key])=>key===v))||new Set(raw.labels).size!==raw.labels.length||(raw.labels.includes('good')&&raw.labels.includes('bad')))throw new HttpError(422,'Choose valid client labels and provide the current record version.');
 const row=await env.DB.prepare('SELECT * FROM enquiries WHERE id=?').bind(id).first();if(!row)throw new HttpError(404,'Enquiry not found.');if(row.version!==raw.version)throw new HttpError(409,'This enquiry changed. Refresh before updating its labels.');
 const labels=CLIENT_LABELS.map(([key])=>key).filter(key=>raw.labels.includes(key)),write=crypto.randomUUID();
 const change={record:row.record_status,stage:row.business_stage,quality:row.quality,amount:row.amount_minor,currency:row.currency,reason:row.reason,action:'labels_updated',labels};
 const result=await env.DB.batch([
  env.DB.prepare('UPDATE enquiries SET labels_json=?,version=version+1,last_write=? WHERE id=? AND version=?').bind(JSON.stringify(labels),write,id,raw.version),
  env.DB.prepare('INSERT INTO followup_logs(id,enquiry_id,actor,change_json,note) SELECT ?,id,?,?,? FROM enquiries WHERE id=? AND last_write=?').bind(crypto.randomUUID(),user.id,JSON.stringify(change),'客户标记：'+(labels.map(labelName).join('、')||'已清除全部标记'),id,write)
 ]);
 if(!result[0].meta.changes)throw new HttpError(409,'This enquiry changed. Refresh before updating its labels.');
 return {ok:true,labels,version:row.version+1};
}
