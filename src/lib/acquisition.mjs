export const UTM_KEYS=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
export const CTA_POSITIONS=['header','footer','product','project','landing','content','quote_success','quote_direct','footer_direct'];
export const EVENT_NAMES=['page_view','quote_form_open','quote_form_submit_success','whatsapp_click','direct_chat'];
export function campaignSource(raw){
 const result={};
 for(const key of UTM_KEYS){const value=raw?.[key];if(typeof value==='string'&&/^[a-zA-Z0-9_ .~\-]{1,80}$/.test(value)&&!/[0-9]{7,}/.test(value))result[key]=value;}
 return result;
}
export function publicPath(value){return typeof value==='string'&&value.length<=200&&/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)*$/.test(value)&&!/^\/(?:zh\/)?(?:admin|api|auth|account|sign-in|media|design-kit|review)(?:\/|$)/.test(value)?value:'';}
export function acquisition(raw={}){
 return {firstSource:campaignSource(raw.firstSource),currentSource:campaignSource(raw.currentSource),firstEntry:publicPath(raw.firstEntry),entryMode:['form','direct_chat','manual'].includes(raw.entryMode)?raw.entryMode:'form',cta:CTA_POSITIONS.includes(raw.cta)?raw.cta:'content',landing:/^(custom-logo-signs|sign-fabrication)$/.test(raw.landing||'')?raw.landing:''};
}
export function dateRange(params){
 const out={};for(const key of ['from','to']){const value=params.get(key);if(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T00:00:00Z'))||new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value)throw new Error('Use valid calendar dates.');out[key]=value;}}
 if(out.from&&out.to&&out.from>out.to)throw new Error('The start date must not be after the end date.');return out;
}
