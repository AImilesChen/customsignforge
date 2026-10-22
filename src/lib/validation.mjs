import {PROJECT_SETTINGS} from './project-library.mjs';
import {validLocale} from './locale.mjs';
import {CONTACT_METHODS,DRAWING_STATES,FILE_COUNT_LIMIT,internationalPhone,attachmentId} from './enquiry-fields.mjs';
import {campaignSource,acquisition} from './acquisition.mjs';
import {PROJECT_KEYS,ROLES,projectErrors} from './enquiry-project.mjs';
export class HttpError extends Error { constructor(status,message,fields={}) { super(message);this.status=status;this.fields=fields; } }
export const USES=['Shop or storefront','Office or reception','Other commercial space','Multiple locations or projects','Other or not sure'];
export const ARABIC_COUNTRIES=['Saudi Arabia','United Arab Emirates','Qatar','Kuwait','Bahrain','Oman','Egypt','Jordan','Morocco','Algeria'];
export const COUNTRIES=['United States','Canada','United Kingdom','France','Germany','Italy','Spain','Netherlands','Singapore','Malaysia','Thailand','Philippines','Indonesia','Vietnam','Australia',...ARABIC_COUNTRIES,'Other / discuss destination'];
export const STAGES=['Ready to discuss a quote','Comparing options','Exploring an idea'];
export const RECORD_STATES=['web_recorded','chat_confirmed','duplicate_or_spam'];
export const BUSINESS_STAGES=['needs_details','evaluating','ready_to_quote','quoted','negotiating','won','lost','on_hold'];
export const QUALITY=['unreviewed','needs_confirmation','qualified','not_a_fit'];
export function text(value,max=300,required=false) { if(typeof value!=='string'||value.length>max||(required&&!value.trim())||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))throw new HttpError(422,'Please check the supplied details.');return value.trim(); }
export function slug(value){const s=text(value,90,true);if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s))throw new HttpError(422,'Use a lowercase, hyphenated slug.');return s;}
export function path(value){if(!value)return '';const s=text(value,200);if(!s.startsWith('/')||s.startsWith('//')||s.includes('?')||s.includes('#')||s.includes('\\'))throw new HttpError(422,'Invalid page context.');return s;}
export function validateEnquiry(raw,styles){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new HttpError(422,'Invalid request.');
 const fields={};for(const [key,options] of [['use',USES],['country',COUNTRIES],['stage',STAGES]])if(!options.includes(raw[key]))fields[key]='Please select a valid option.';
 if(Object.keys(fields).length)throw new HttpError(422,'Please check the highlighted fields.',fields);
 const style=raw.style||'not-sure';if(style!=='not-sure'&&!styles.includes(style))throw new HttpError(422,'Please select an available sign style.',{style:'Please select an available sign style.'});
 if(!/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(raw.idempotencyKey||''))throw new HttpError(422,'Please reload the form and try again.');
 const role=raw.role||'';if(!['',...ROLES.map(([key])=>key),'My own business','A customer’s project','Other or not sure'].includes(role))throw new HttpError(422,'Invalid enquiry role.',{role:'Choose a customer type.'});
 const projectFields=Object.fromEntries(PROJECT_KEYS.filter(key=>raw[key]!==undefined).map(key=>[key,raw[key]]));
 const projectProblems=projectErrors({...projectFields,role},false);delete projectProblems.role;
 if(Object.keys(projectProblems).length)throw new HttpError(422,'Please check your project details.',projectProblems);
 for(const key of PROJECT_KEYS)if(projectFields[key]!==undefined)projectFields[key]=projectFields[key].trim();
 const contact={};
 if(raw.locale!==undefined){if(!validLocale(raw.locale))throw new HttpError(422,'Invalid language.');contact.locale=raw.locale;}
 if(raw.contactMethod!==undefined){if(!CONTACT_METHODS.some(([key])=>key===raw.contactMethod))throw new HttpError(422,'Choose WhatsApp or phone.',{contactMethod:'Choose how we can reach you.'});contact.contactMethod=raw.contactMethod;}
 if(raw.phone!==undefined){const phone=internationalPhone(raw.phone);if(!phone)throw new HttpError(422,'Enter a valid international number including + and the country code.',{phone:'Include the country code, for example +1, +44 or +60.'});contact.phone=phone;}
 if(raw.drawings!==undefined){if(!DRAWING_STATES.some(([key])=>key===raw.drawings))throw new HttpError(422,'Tell us whether you have drawings.',{drawings:'Choose an option.'});contact.drawings=raw.drawings;}
 if(raw.attachments!==undefined){if(!Array.isArray(raw.attachments)||raw.attachments.length>FILE_COUNT_LIMIT||raw.attachments.some(id=>!attachmentId(id))||new Set(raw.attachments).size!==raw.attachments.length)throw new HttpError(422,'Use up to 3 distinct uploaded files.',{attachments:'Please check your uploaded files.'});contact.attachments=[...raw.attachments].sort();}
 const source=campaignSource(raw.source);
 if(raw.website)throw new HttpError(422,'Unable to submit this form.');
 const attribution=acquisition(raw.acquisition);attribution.entryMode='form';
 return {...projectFields,...contact,role,style,use:raw.use,country:raw.country,stage:raw.stage,city:text(raw.city||'',80),timing:text(raw.timing||'',100),notes:text(raw.notes||'',300),entry:path(raw.entry==='contact'?'/contact/':raw.entry||''),project:raw.project?slug(raw.project):'',source,acquisition:attribution,idempotencyKey:raw.idempotencyKey};
}
export function validateContent(raw,type){
 if(!['product','project','landing','page'].includes(type))throw new HttpError(422,'Invalid content type.');
 const d={title:text(raw.title,120,true),intro:text(raw.intro||'',500),cardDescription:text(raw.cardDescription||'',160),body:text(raw.body||'',18000),image:text(raw.image||'',250),imageAlt:text(raw.imageAlt||'',200),imageKind:raw.imageKind||'concept',seoTitle:text(raw.seoTitle||'',100),seoDescription:text(raw.seoDescription||'',200),indexable:raw.indexable===true,product:raw.product||'',setting:raw.setting||'Other',sort:Number(raw.sort)||0};
 if(d.image&&(!/^\/(?:assets|media)\/[a-zA-Z0-9/_ .-]+\.(?:webp|png|jpe?g)$/.test(d.image)||d.image.split('/').includes('..')))throw new HttpError(422,'Select a local promotional image.');
 if(!['concept','sample','finished_product','client_project','supplier_reference'].includes(d.imageKind))throw new HttpError(422,'Invalid image classification.');
 if(d.image&&!d.imageAlt)throw new HttpError(422,'Add alternative text for the image.');
 if(d.imageKind!=='concept'&&!text(raw.sourceNote||'',1000).trim())throw new HttpError(422,'Record the source and permitted use for real photography.');
 d.sourceNote=text(raw.sourceNote||'',1000);if(d.product)d.product=slug(d.product);
 if(!PROJECT_SETTINGS.includes(d.setting))throw new HttpError(422,'Invalid setting.');
 if(!Number.isInteger(d.sort)||d.sort<0||d.sort>9999)throw new HttpError(422,'Invalid sort order.');
 if(raw.gallery!==undefined&&!Array.isArray(raw.gallery))throw new HttpError(422,'Invalid image gallery.');
 if((raw.gallery||[]).length>6)throw new HttpError(422,'Use no more than six gallery images.');
 d.gallery=(raw.gallery||[]).map(item=>{
  if(!item||typeof item!=='object')throw new HttpError(422,'Invalid gallery image.');
  const src=text(item.src||'',250,true);
  if(!/^\/(?:assets|media)\/[a-zA-Z0-9/_ .-]+\.(?:webp|png|jpe?g)$/.test(src)||src.split('/').includes('..'))throw new HttpError(422,'Select a local gallery image.');
  return {src,alt:text(item.alt||'',200,true),caption:text(item.caption||'',400,true)};
 });
 for(const field of ['relatedProducts','relatedProjects']){
  if(raw[field]!==undefined&&(!Array.isArray(raw[field])||raw[field].length>6))throw new HttpError(422,'Invalid related references.');
  d[field]=[...new Set((raw[field]||[]).map(value=>slug(value)))];
 }
 return d;
}
export function validateSettings(raw){
 const phone=text(raw.whatsapp||'',16);if(phone&&!/^[1-9]\d{6,14}$/.test(phone))throw new HttpError(422,'Use an international WhatsApp number with digits only.');
 const email=text(raw.email||'',150);if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new HttpError(422,'Use a valid business email.');
 return {brand:'Custom Sign Forge',operatorName:text(raw.operatorName||'',160),operatorNameLocal:text(raw.operatorNameLocal||'',160),whatsapp:phone,email,businessDescription:text(raw.businessDescription||'',700),faq:raw.faq===undefined?undefined:validateFAQ(raw.faq)};
}
function validateFAQ(faq){if(!Array.isArray(faq)||faq.length>15)throw new HttpError(422,'Use at most 15 FAQ entries.');return faq.map(f=>[text(f[0],160,true),text(f[1],1500,true)]);}
export function imageType(bytes){if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return ['jpg','image/jpeg'];if(bytes.slice(0,8).join(',')==='137,80,78,71,13,10,26,10')return ['png','image/png'];if(new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP')return ['webp','image/webp'];throw new HttpError(422,'Upload a JPEG, PNG or WebP image.');}

export function requireEnquiryContact(details){
 const fields=projectErrors(details,true);
 if(!details.contactMethod)fields.contactMethod='Choose WhatsApp or phone.';
 if(!details.phone)fields.phone='A contact number with country code is required.';
 if(!details.drawings)fields.drawings='Tell us whether you have drawings.';
 if(details.drawings!=='ready'&&details.attachments?.length)fields.attachments='Remove uploaded files before changing your drawing status.';
 if(Object.keys(fields).length)throw new HttpError(422,'Please check your contact details and drawing selection.',fields);
}
