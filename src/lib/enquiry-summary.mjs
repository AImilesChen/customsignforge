import {PROJECT_KEYS,PROJECT_LABELS,projectValue} from './enquiry-project.mjs';
import {translate} from './translate.mjs';
import {chineseProducts} from './locale-content.mjs';
import {publicCopy} from './malay-content.mjs';
import {thaiPublicCopy} from './thai-content.mjs';
import {germanPublicCopy} from './german-content.mjs';
import {frenchPublicCopy} from './french-content.mjs';
import {koreanPublicCopy} from './korean-content.mjs';
export function enquirySummary(details,reference,products,locale=details.locale||'en'){
 if(locale==='ko'){
  const controlled=['dimensionsStatus','environment','deliveryWindow','role'];
  const project=[...PROJECT_KEYS,'role','city','timing'].filter(key=>details[key]).map(key=>translate(PROJECT_LABELS[key]||({city:'배송 도시',timing:'희망 일정'}[key]),'ko')+': '+(controlled.includes(key)||key==='quantity'&&details[key]==='not-sure'?translate(projectValue(key,details[key]),'ko'):details[key])).join('\n');
  const drawing={ready:details.attachments?.length?'문의서에 파일 첨부됨':'도면 있음, 파일은 업로드하지 않음',none:'도면 없음',later:'나중에 파일 전달 예정'}[details.drawings]||details.drawings;
  return `안녕하세요. 맞춤형 간판 견적을 요청합니다.\n제품: ${koreanPublicCopy.site.products[details.style]?.title||'미정'}\n용도: ${translate(details.use,'ko')}\n배송 국가: ${translate(details.country,'ko')}\n프로젝트 단계: ${translate(details.stage,'ko')}\n${project?project+'\n':''}${details.contactEmail?'연락 이메일: '+details.contactEmail+'\n':''}${details.phone?(details.contactMethod==='whatsapp'?'WhatsApp: ':'전화번호: ')+details.phone+' (미인증)\n':''}${details.drawings?'도면: '+drawing+'\n':''}${details.project?'참고 프로젝트: '+details.project+'\n':''}문의 번호: ${reference}`;
 }
 if(locale==='fr'){
  const controlled=['dimensionsStatus','environment','deliveryWindow','role'];
  const project=[...PROJECT_KEYS,'role','city','timing'].filter(key=>details[key]).map(key=>translate(PROJECT_LABELS[key]||({city:'Delivery City',timing:'Preferred Timing'}[key]),'fr')+' : '+(controlled.includes(key)||key==='quantity'&&details[key]==='not-sure'?translate(projectValue(key,details[key]),'fr'):details[key])).join('\n');
  const drawing={ready:details.attachments?.length?'Fichiers joints à la demande':'Plans disponibles, sans fichier téléversé',none:'Pas encore de plans',later:'Fichiers à transmettre plus tard'}[details.drawings]||details.drawings;
  return `Bonjour, je souhaite demander un devis pour une enseigne sur mesure.\nProduit : ${frenchPublicCopy.site.products[details.style]?.title||'À définir'}\nUtilisation : ${translate(details.use,'fr')}\nPays de livraison : ${translate(details.country,'fr')}\nAvancement du projet : ${translate(details.stage,'fr')}\n${project?project+'\n':''}${details.contactEmail?'E-mail de contact : '+details.contactEmail+'\n':''}${details.phone?(details.contactMethod==='whatsapp'?'WhatsApp : ':'Téléphone : ')+details.phone+' (non vérifié)\n':''}${details.drawings?'Plans : '+drawing+'\n':''}${details.project?'Projet de référence : '+details.project+'\n':''}Référence de la demande : ${reference}`;
 }
 if(locale==='de'){
  const controlled=['dimensionsStatus','environment','deliveryWindow','role'];
  const project=[...PROJECT_KEYS,'role','city','timing'].filter(key=>details[key]).map(key=>translate(PROJECT_LABELS[key]||({city:'Delivery City',timing:'Preferred Timing'}[key]),'de')+': '+(controlled.includes(key)||key==='quantity'&&details[key]==='not-sure'?translate(projectValue(key,details[key]),'de'):details[key])).join('\n');
  const drawing={ready:details.attachments?.length?'Dateien mit der Anfrage hochgeladen':'Zeichnungen vorhanden, aber keine Datei hochgeladen',none:'Noch keine Zeichnungen',later:'Dateien werden später nachgereicht'}[details.drawings]||details.drawings;
  return `Guten Tag, ich möchte ein Angebot für ein individuelles Werbeschild anfordern.\nProdukt: ${germanPublicCopy.site.products[details.style]?.title||'Noch nicht sicher'}\nVerwendung: ${translate(details.use,'de')}\nLieferland: ${translate(details.country,'de')}\nProjektstand: ${translate(details.stage,'de')}\n${project?project+'\n':''}${details.contactEmail?'Kontakt-E-Mail: '+details.contactEmail+'\n':''}${details.phone?(details.contactMethod==='whatsapp'?'WhatsApp: ':'Telefon: ')+details.phone+' (nicht verifiziert)\n':''}${details.drawings?'Zeichnungen: '+drawing+'\n':''}${details.project?'Referenzprojekt: '+details.project+'\n':''}Anfragenummer: ${reference}`;
 }
 if(locale==='th'){
  const controlled=['dimensionsStatus','environment','deliveryWindow','role'];
  const project=[...PROJECT_KEYS,'role','city','timing'].filter(key=>details[key]).map(key=>translate(PROJECT_LABELS[key]||({city:'Delivery City',timing:'Preferred Timing'}[key]),'th')+': '+(controlled.includes(key)||key==='quantity'&&details[key]==='not-sure'?translate(projectValue(key,details[key]),'th'):details[key])).join('\n');
  const drawing={ready:details.attachments?.length?'แนบไฟล์ในแบบฟอร์มแล้ว':'มีแบบ แต่ยังไม่ได้อัปโหลด',none:'ยังไม่มีแบบ',later:'จะส่งไฟล์ภายหลัง'}[details.drawings]||details.drawings;
  return `สวัสดี ฉันต้องการขอใบเสนอราคาป้ายสั่งทำ\nประเภท: ${thaiPublicCopy.site.products[details.style]?.title||'ยังไม่แน่ใจ'}\nการใช้งาน: ${translate(details.use,'th')}\nประเทศที่จัดส่ง: ${translate(details.country,'th')}\nขั้นตอนโครงการ: ${translate(details.stage,'th')}\n${project?project+'\n':''}${details.contactEmail?'อีเมลติดต่อ: '+details.contactEmail+'\n':''}${details.phone?(details.contactMethod==='whatsapp'?'WhatsApp: ':'โทรศัพท์: ')+details.phone+' (ยังไม่ได้ยืนยัน)\n':''}${details.drawings?'แบบ: '+drawing+'\n':''}${details.project?'โครงการอ้างอิง: '+details.project+'\n':''}เลขที่คำขอ: ${reference}`;
 }
 if(locale==='ms'){
  const controlled=['dimensionsStatus','environment','deliveryWindow','role'];
  const project=[...PROJECT_KEYS,'role','city','timing'].filter(k=>details[k]).map(k=>translate(PROJECT_LABELS[k]||({city:'Delivery City',timing:'Preferred Timing'}[k]),'ms')+': '+(controlled.includes(k)||k==='quantity'&&details[k]==='not-sure'?translate(projectValue(k,details[k]),'ms'):details[k])).join('\n');
  return `Hai, saya ingin meminta sebut harga papan tanda khas.\nJenis: ${publicCopy.site.products[details.style]?.title||'Belum pasti'}\nKegunaan: ${translate(details.use,'ms')}\nNegara penghantaran: ${translate(details.country,'ms')}\nPeringkat projek: ${translate(details.stage,'ms')}\n${project?project+'\n':''}${details.contactEmail?'E-mel hubungan: '+details.contactEmail+'\n':''}${details.phone?(details.contactMethod==='whatsapp'?'WhatsApp: ':'Telefon: ')+details.phone+' (belum disahkan)\n':''}${details.drawings?'Lukisan: '+({ready:details.attachments?.length?'Fail disertakan bersama pertanyaan':'Lukisan tersedia; tiada fail dimuat naik',none:'Belum ada lukisan',later:'Fail akan menyusul'}[details.drawings]||details.drawings)+'\n':''}${details.project?'Rujukan projek: '+details.project+'\n':''}Rujukan pertanyaan: ${reference}`;
 }
 if(locale==='zh'){
  const controlled=['dimensionsStatus','environment','deliveryWindow','role'];
  const project=[...PROJECT_KEYS,'role','city','timing'].filter(k=>details[k]).map(k=>translate(PROJECT_LABELS[k]||({city:'Delivery City',timing:'Preferred Timing'}[k]),'zh')+'：'+(controlled.includes(k)||k==='quantity'&&details[k]==='not-sure'?translate(projectValue(k,details[k]),'zh'):details[k])).join('\n');
  return `您好，我想咨询定制标识报价。\n产品类型：${chineseProducts[details.style]?.title||'暂不确定'}\n用途：${translate(details.use,'zh')}\n交付国家或地区：${translate(details.country,'zh')}\n项目阶段：${translate(details.stage,'zh')}\n${project?project+'\n':''}${details.contactEmail?'联系邮箱：'+details.contactEmail+'\n':''}${details.phone?(details.contactMethod==='whatsapp'?'WhatsApp：':'联系号码：')+details.phone+'（未经短信验证）\n':''}${details.drawings?'图纸状态：'+({ready:details.attachments?.length?'已在网站提交附件':'已有图纸，暂未上传',none:'暂时没有图纸',later:'稍后提供文件'}[details.drawings]||details.drawings)+'\n':''}${details.project?'参考项目：'+details.project+'\n':''}询价编号：${reference}`;
 }
 const project=[...PROJECT_KEYS,'role','city','timing'].filter(key=>details[key]).map(key=>(PROJECT_LABELS[key]||({city:'Delivery City',timing:'Preferred Timing',notes:'Notes'}[key]))+': '+projectValue(key,details[key])).join('\n');
 return `Hi, I'd like a quote for a custom sign.\nStyle: ${products.find(p=>p.slug===details.style)?.title||'Not sure yet'}\nUse: ${details.use}\nDelivery country: ${details.country}\nProject stage: ${details.stage}\n${project?project+'\n':''}${details.contactEmail?'Contact email: '+details.contactEmail+'\n':''}${details.phone?(details.contactMethod==='whatsapp'?'WhatsApp: ':'Phone: ')+details.phone+' (not verified)\n':''}${details.drawings?'Drawings: '+({ready:details.attachments?.length?'Files supplied with website enquiry':'Drawings available; no files uploaded',none:'No drawings yet',later:'Files to follow'}[details.drawings]||details.drawings)+'\n':''}${details.project?'Reference project: '+details.project+'\n':''}Enquiry ID: ${reference}`;
}
