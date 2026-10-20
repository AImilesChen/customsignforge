export const tabStorage=()=>{try{return globalThis.sessionStorage}catch{return null;}};
const PREFIX='csf-quote-draft:';
export const draftKey=account=>PREFIX+account;
export function readQuoteDraft(storage,account,context,now=Date.now()){
 try{const key=draftKey(account),d=JSON.parse(storage.getItem(key)||'null');if(!d)return null;if(d.account!==account||d.context!==context||!Number.isFinite(d.at)||now-d.at>86400000||now<d.at){storage.removeItem(key);return null;}if(!d.form||typeof d.form!=='object'||Array.isArray(d.form))return null;return {...d,step:Number.isInteger(d.step)?Math.min(2,Math.max(0,d.step)):0};}catch{return null;}
}
export function writeQuoteDraft(storage,account,context,form,step,idempotencyKey,now=Date.now()){
 try{storage.setItem(draftKey(account),JSON.stringify({account,context,form,step,idempotencyKey,at:now}));}catch{}
}
export function clearQuoteDrafts(storage){try{for(let i=storage.length-1;i>=0;i--){const key=storage.key(i);if(key?.startsWith(PREFIX)||key==='csf-login-draft')storage.removeItem(key);}}catch{}}
