import {HttpError} from './validation.mjs';

export async function archiveEnquiry(env,user,id,raw){
 if(typeof raw.archived!=='boolean'||!Number.isInteger(raw.version))throw new HttpError(422,'Choose an archive action and provide the current record version.');
 const row=await env.DB.prepare('SELECT * FROM enquiries WHERE id=?').bind(id).first();
 if(!row)throw new HttpError(404,'Enquiry not found.');
 if(row.version!==raw.version)throw new HttpError(409,'This enquiry changed. Refresh the list before trying again.');
 if(Boolean(row.archived_at)===raw.archived)return {ok:true,archived:raw.archived,version:row.version};
 const write=crypto.randomUUID(),change={record:row.record_status,stage:row.business_stage,quality:row.quality,amount:row.amount_minor,currency:row.currency,reason:row.reason,action:raw.archived?'archived':'restored'};
 const result=await env.DB.batch([
  env.DB.prepare('UPDATE enquiries SET archived_at=?,version=version+1,last_write=? WHERE id=? AND version=?').bind(raw.archived?new Date().toISOString().replace('T',' ').slice(0,19):null,write,id,raw.version),
  env.DB.prepare('INSERT INTO followup_logs(id,enquiry_id,actor,change_json,note) SELECT ?,id,?,?,? FROM enquiries WHERE id=? AND last_write=?').bind(crypto.randomUUID(),user.id,JSON.stringify(change),raw.archived?'移入回收站（可恢复）':'从回收站恢复',id,write)
 ]);
 if(!result[0].meta.changes)throw new HttpError(409,'This enquiry changed. Refresh the list before trying again.');
 return {ok:true,archived:raw.archived,version:row.version+1};
}
