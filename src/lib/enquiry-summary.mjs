import {PROJECT_KEYS,PROJECT_LABELS,projectValue} from './enquiry-project.mjs';
import {translate} from './translate.mjs';
import {chineseProducts} from './locale-content.mjs';
export function enquirySummary(details,reference,products,locale=details.locale||'en'){
 if(locale==='zh'){
  const controlled=['dimensionsStatus','environment','deliveryWindow','role'];
  const project=[...PROJECT_KEYS,'role','city','timing'].filter(k=>details[k]).map(k=>translate(PROJECT_LABELS[k]||({city:'Delivery City',timing:'Preferred Timing'}[k]),'zh')+'：'+(controlled.includes(k)||k==='quantity'&&details[k]==='not-sure'?translate(projectValue(k,details[k]),'zh'):details[k])).join('\n');
  return `您好，我想咨询定制标识报价。\n产品类型：${chineseProducts[details.style]?.title||'暂不确定'}\n用途：${translate(details.use,'zh')}\n交付国家或地区：${translate(details.country,'zh')}\n项目阶段：${translate(details.stage,'zh')}\n${project?project+'\n':''}${details.contactEmail?'联系邮箱：'+details.contactEmail+'\n':''}${details.phone?(details.contactMethod==='whatsapp'?'WhatsApp：':'联系号码：')+details.phone+'（未经短信验证）\n':''}${details.drawings?'图纸状态：'+({ready:details.attachments?.length?'已在网站提交附件':'已有图纸，暂未上传',none:'暂时没有图纸',later:'稍后提供文件'}[details.drawings]||details.drawings)+'\n':''}${details.project?'参考项目：'+details.project+'\n':''}询价编号：${reference}`;
 }
 const project=[...PROJECT_KEYS,'role','city','timing'].filter(key=>details[key]).map(key=>(PROJECT_LABELS[key]||({city:'Delivery City',timing:'Preferred Timing',notes:'Notes'}[key]))+': '+projectValue(key,details[key])).join('\n');
 return `Hi, I'd like a quote for a custom sign.\nStyle: ${products.find(p=>p.slug===details.style)?.title||'Not sure yet'}\nUse: ${details.use}\nDelivery country: ${details.country}\nProject stage: ${details.stage}\n${project?project+'\n':''}${details.contactEmail?'Contact email: '+details.contactEmail+'\n':''}${details.phone?(details.contactMethod==='whatsapp'?'WhatsApp: ':'Phone: ')+details.phone+' (not verified)\n':''}${details.drawings?'Drawings: '+({ready:details.attachments?.length?'Files supplied with website enquiry':'Drawings available; no files uploaded',none:'No drawings yet',later:'Files to follow'}[details.drawings]||details.drawings)+'\n':''}${details.project?'Reference project: '+details.project+'\n':''}Enquiry ID: ${reference}`;
}
