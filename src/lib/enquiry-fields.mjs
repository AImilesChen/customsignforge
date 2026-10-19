export const CONTACT_METHODS=[['whatsapp','WhatsApp'],['phone','Phone']];
export const DRAWING_STATES=[['ready','Yes — upload artwork, photos or drawings now'],['none','No — I need help with the design'],['later','I will provide files later']];
export const DRAWING_LABELS={ready:'Files supplied',none:'No drawings yet',later:'Files to follow'};
export const FILE_LIMIT=10*1024*1024;
export const FILE_TOTAL_LIMIT=20*1024*1024;
export const FILE_COUNT_LIMIT=3;
export const FILE_EXTENSIONS=['pdf','ai','eps','dwg','dxf','jpg','jpeg','png','webp'];
export const FILE_ACCEPT=FILE_EXTENSIONS.map(e=>'.'+e).join(',');
export function internationalPhone(value){
 if(typeof value!=='string'||value.length>40||!/^[+\d\s().-]+$/.test(value))return null;
 const phone=value.trim().replace(/[\s().-]/g,'').replace(/^00/,'+');
 return /^\+[1-9]\d{6,14}$/.test(phone)?phone:null;
}
export const attachmentId=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
