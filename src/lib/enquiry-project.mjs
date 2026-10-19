export const ROLES=[['business','My own business'],['sign-company','Sign company / reseller'],['installer','Sign installer'],['designer','Designer / agency'],['trade','Buying for a customer (other)'],['other','Other or not sure']];
export const ENVIRONMENTS=[['indoor','Indoors'],['outdoor','Outdoors'],['both','Both'],['not-sure','Not sure yet']];
export const DIMENSIONS=[['approximate','I have approximate dimensions'],['help','I need help deciding']];
export const DELIVERY_WINDOWS=[['within-month','Within 1 month'],['one-three-months','In 1–3 months'],['later','More than 3 months away'],['not-sure','Not sure yet']];
export const PROJECT_KEYS=['contactName','businessName','businessWebsite','quantity','dimensionsStatus','width','height','dimensionUnit','environment','deliveryWindow','targetDate','budget'];
export const STEP_FIELDS=[['contactName','contactMethod','phone','role','businessName','businessWebsite'],['style','use','quantity','dimensionsStatus','width','height','dimensionUnit','environment','drawings','attachments'],['country','city','stage','deliveryWindow','targetDate','budget','notes','turnstile']];
export const PROJECT_LABELS={contactName:'Contact Name',role:'Customer Type',businessName:'Business / Shop Name',businessWebsite:'Business Website / Social Profile',quantity:'Number of Complete Signs',dimensionsStatus:'Size Planning',width:'Approximate Width',height:'Approximate Height',dimensionUnit:'Dimension Unit',environment:'Installation Environment',deliveryWindow:'Preferred Delivery Window',targetDate:'Target Arrival / Opening Date',budget:'Indicative Project Budget'};
export function projectValue(key,value){
 const options={role:ROLES,dimensionsStatus:DIMENSIONS,environment:ENVIRONMENTS,deliveryWindow:DELIVERY_WINDOWS};
 if(key==='quantity'&&value==='not-sure')return 'Not sure yet';
 return options[key]?.find(([id])=>id===value)?.[1]||value;
}
const positive=value=>typeof value==='string'&&/^\d+(?:\.\d{1,2})?$/.test(value)&&Number(value)>0&&Number(value)<=100000;
const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
export function projectErrors(raw,required=false){
 const errors={};
 for(const [key,max] of Object.entries({contactName:80,businessName:120,businessWebsite:250,quantity:12,dimensionsStatus:20,width:12,height:12,dimensionUnit:8,environment:20,deliveryWindow:30,targetDate:10,budget:80})){
  if(raw[key]!==undefined&&(typeof raw[key]!=='string'||raw[key].length>max||/[\u0000-\u001f]/.test(raw[key])))errors[key]='Please check this value.';
 }
 if(required&&(typeof raw.contactName!=='string'||!raw.contactName.trim()))errors.contactName='Enter the name we should use to contact you.';
 for(const [key,options] of [['role',ROLES],['dimensionsStatus',DIMENSIONS],['deliveryWindow',DELIVERY_WINDOWS],['environment',ENVIRONMENTS]]){
  if((required&&key!=='environment'||raw[key])&&!options.some(([id])=>id===raw[key]))errors[key]='Please select an option.';
 }
 if((required||raw.quantity)&&!(raw.quantity==='not-sure'||typeof raw.quantity==='string'&&/^\d{1,6}$/.test(raw.quantity)&&Number(raw.quantity)>=1&&Number(raw.quantity)<=100000))errors.quantity='Enter a whole number of signs, or choose not sure yet.';
 if(raw.dimensionsStatus==='approximate'){
  for(const key of ['width','height'])if(!positive(raw[key]))errors[key]='Enter a positive approximate size (up to 100,000).';
  if(!['mm','cm','m','in','ft'].includes(raw.dimensionUnit))errors.dimensionUnit='Select a measurement unit.';
 }
 if(raw.targetDate&&!validDate(raw.targetDate))errors.targetDate='Choose a valid calendar date.';
 if(raw.businessWebsite){try{const url=new URL(raw.businessWebsite);if(!['https:','http:'].includes(url.protocol)||!url.hostname.includes('.')||url.username||url.password)throw Error();}catch{errors.businessWebsite='Use a full website or social profile URL, starting with https://.'}}
 return errors;
}
