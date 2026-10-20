import {basePath} from './locale.mjs';
import {HttpError,slug} from './validation.mjs';
import {sameOrigin} from './auth.mjs';
import {rateLimit,fingerprint} from './db.mjs';
import {siteIdentity} from './site-identity.mjs';
import {CONSENT_VERSION} from './analytics-consent.mjs';
import {EVENT_NAMES,publicPath,acquisition,dateRange} from './acquisition.mjs';
export async function recordMeasurement(request,env,raw){
 sameOrigin(request);
 if(!raw||raw.consent!==true)throw new HttpError(422,'Analytics consent is required.');
 if(Object.keys(raw).some(k=>!['id','name','page','context','consent','consentVersion'].includes(k)))throw new HttpError(422,'Unexpected measurement data.');
 if(!EVENT_NAMES.includes(raw.name)||!/^\w{8}-\w{4}-4\w{3}-[89ab]\w{3}-\w{12}$/.test(raw.id||''))throw new HttpError(422,'Invalid measurement.');
 const page=publicPath(raw.page);if(!page||!await knownPage(env,page))throw new HttpError(422,'Unknown public page.');
 const context=raw.context||{};
 if(Object.keys(context).some(k=>!['firstSource','currentSource','firstEntry','entryMode','cta','landing','product','project'].includes(k)))throw new HttpError(422,'Unexpected measurement context.');
 const safe=acquisition(context);if(safe.firstEntry&&!await knownPage(env,safe.firstEntry))safe.firstEntry='';
 for(const [key,type] of [['product','product'],['project','project']])if(context[key]){safe[key]=slug(context[key]);if(!await env.DB.prepare("SELECT id FROM content_items WHERE type=? AND slug=? AND status='published'").bind(type,safe[key]).first())throw new HttpError(422,'Unknown reference.');}
 await rateLimit(env,request,'measurement',120);
 const {customer,canManage}=await siteIdentity(request,env);
 if(raw.consentVersion!==CONSENT_VERSION||!customer||canManage)return {ok:true,recorded:false};
 const accountKey=await fingerprint([env.SESSION_SECRET,'measurement-account-v1',customer.id]);
 await env.DB.prepare('DELETE FROM measurement_events WHERE created_at < datetime(\'now\',\'-90 days\')').run();
 await env.DB.prepare('INSERT OR IGNORE INTO measurement_events(id,name,page,context_json,account_key) VALUES(?,?,?,?,?)').bind(raw.id,raw.name,page,JSON.stringify(safe),accountKey).run();
 return {ok:true,recorded:true};
}
async function knownPage(env,page){
 page=basePath(page);
 if(['/','/products/','/projects/','/get-a-quote/','/privacy/','/terms/','/cookies/','/cancellations-returns/','/shipping-installation/','/legal-notice/'].includes(page))return true;
 const match=page.match(/^\/(products|projects|landing)\/([a-z0-9-]+)\/$/);const type=match?{products:'product',projects:'project',landing:'landing'}[match[1]]:'page';
 return !!await env.DB.prepare("SELECT id FROM content_items WHERE type=? AND slug=? AND status='published'").bind(type,match?match[2]:page.slice(1,-1)).first();
}
export function sqlDateRange(params,column='created_at'){
 let range;try{range=dateRange(params)}catch(e){throw new HttpError(422,e.message)}
 const where=[],args=[];if(range.from){where.push(column+'>=?');args.push(range.from+' 00:00:00')}if(range.to){where.push(column+'<datetime(?,\'+1 day\')');args.push(range.to+' 00:00:00')}return {where,args,range};
}
export async function measurementReport(env,params){
 const {where,args,range}=sqlDateRange(params);const leadWhere=[...where],leadArgs=[...args];const source=params.get('source')||'';if(source){if(!/^[a-zA-Z0-9_ .~\-]{1,80}$/.test(source))throw new HttpError(422,'Invalid source filter.');where.push("COALESCE(NULLIF(json_extract(context_json,'$.currentSource.utm_source'),''),'direct_or_unknown')=?");args.push(source);leadWhere.push("COALESCE(NULLIF(json_extract(details_json,'$.source.utm_source'),''),'direct_or_unknown')=?");leadArgs.push(source)}const filter=where.length?' WHERE '+where.join(' AND '):'';
 const accountFilter=(filter?filter+' AND ':' WHERE ')+'account_key IS NOT NULL';
 const counts=(await env.DB.prepare('SELECT name,count(DISTINCT account_key) count FROM measurement_events'+accountFilter+' GROUP BY name').bind(...args).all()).results;
 const sources=(await env.DB.prepare("SELECT COALESCE(NULLIF(json_extract(context_json,'$.currentSource.utm_source'),''),'direct_or_unknown') source,name,count(DISTINCT account_key) count FROM measurement_events"+accountFilter+' GROUP BY source,name ORDER BY count DESC LIMIT 100').bind(...args).all()).results;
 const legacy=await env.DB.prepare('SELECT count(*) count FROM measurement_events'+(filter?filter+' AND ':' WHERE ')+'account_key IS NULL').bind(...args).first();
 const leadFilter=' WHERE archived_at IS NULL AND record_status!=\'duplicate_or_spam\''+(leadWhere.length?' AND '+leadWhere.join(' AND '):'');
 const leads=await env.DB.prepare(`SELECT count(*) total, sum(CASE WHEN json_extract(details_json,'$.acquisition.entryMode')='manual' THEN 1 ELSE 0 END) manual, sum(CASE WHEN (record_status='chat_confirmed' OR EXISTS(SELECT 1 FROM followup_logs l WHERE l.enquiry_id=enquiries.id AND json_extract(l.change_json,'$.record')='chat_confirmed')) THEN 1 ELSE 0 END) contacted, sum(CASE WHEN (quality='qualified' OR EXISTS(SELECT 1 FROM followup_logs l WHERE l.enquiry_id=enquiries.id AND json_extract(l.change_json,'$.quality')='qualified')) THEN 1 ELSE 0 END) qualified, sum(CASE WHEN (business_stage IN ('quoted','negotiating','won') OR EXISTS(SELECT 1 FROM followup_logs l WHERE l.enquiry_id=enquiries.id AND json_extract(l.change_json,'$.stage') IN ('quoted','negotiating','won'))) THEN 1 ELSE 0 END) quoted, sum(CASE WHEN (business_stage='won' OR EXISTS(SELECT 1 FROM followup_logs l WHERE l.enquiry_id=enquiries.id AND json_extract(l.change_json,'$.stage')='won')) THEN 1 ELSE 0 END) won FROM enquiries`+leadFilter).bind(...leadArgs).first();
 return {range,source,countingMode:'unique_accounts',legacyEventsExcluded:legacy.count,events:Object.fromEntries(EVENT_NAMES.map(name=>[name,counts.find(r=>r.name===name)?.count||0])),sources,leads,retentionDays:90};
}
