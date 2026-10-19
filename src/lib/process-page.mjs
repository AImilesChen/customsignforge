export const processQuoteParams=()=>({entry:'/how-it-works/',cta:'content'});
export const normaliseProcessBody=body=>(body||'').replace(/\r\n?/g,'\n').trim();
export function isStandardProcessBody(body,known){return known.some(value=>normaliseProcessBody(body)===normaliseProcessBody(value))}
