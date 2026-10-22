import zh from '../data/zh/site.json' with {type:'json'};
import {publicCopy} from './malay-content.mjs';
import msProjects from '../data/ms/projects.json' with {type:'json'};
import thProjects from '../data/th/projects.json' with {type:'json'};
import {thaiPublicCopy} from './thai-content.mjs';
import {germanPublicCopy} from './german-content.mjs';
import deProjects from '../data/de/projects.json' with {type:'json'};
import {frenchPublicCopy} from './french-content.mjs';
import frProjects from '../data/fr/projects.json' with {type:'json'};
export const chineseProducts=zh.products;
export const chineseSpace=value=>zh.settings[value]||value;
const projects={
 'office-logo-concept':'Meridian · 接待墙背光标志','wellness-halo-design':'The Wellness Room · 造型光晕标志','corporate-halo-design':'Studio Reception · 冷白光背光字','hospitality-halo-design':'The Lane · 餐饮空间暖光字',
 'storefront-concept':'Northside Dental · 正面发光标志','food-front-design':'Green Table · 餐厅发光标志','retail-front-design':'Market · 蓝色正面发光字','bakery-front-design':'Bakery · 夜间店面招牌',
 'hospitality-metal-concept':'The Lounge · 酒店金属字','studio-metal-design':'Atelier · 建筑金属标志','architectural-metal-design':'Fieldwork · 非发光入口字','interior-metal-design':'Studio · 拉丝金属墙面字',
 'acrylic-reception-concept':'RAE · 彩色接待标志','layered-acrylic-design':'Create · 叠层亚克力标志','salon-acrylic-design':'The Salon · 手写体亚克力字','office-acrylic-design':'Collective · 办公室立体标志',
 'cafe-neon-concept':'Open · 橱窗线条灯光字','dental-lightbox-design':'Dental Studio · 店面灯箱','projecting-lightbox-design':'Lume · 圆形侧挂灯箱','cafe-neon-design':'Good Company · 咖啡店霓虹图形',
 'marquee-entrance-concept':'Echo · 外露光源入口字','cinema-special-design':'Cinema · 剧院风格字','social-special-design':'Play · 立体娱乐场所标志','restaurant-special-design':'Fire & Grain · 组合材料招牌',
 'front-lit-letter-reference':'发光字字面与围边结构','halo-letter-reference':'背光字制作结构','metal-letter-reference':'金属围边字工艺','acrylic-letter-reference':'亚克力叠层字工艺','neon-style-reference':'霓虹风格线条工艺','exposed-light-reference':'外露光源字工艺'
};
const frenchProductSeoTitles={
 'led-channel-letters':'Lettres boîtiers lumineuses LED sur mesure',
 'backlit-letters':'Lettres rétroéclairées LED à effet halo',
 'metal-letters':'Lettres métalliques en relief sur mesure',
 'acrylic-letters':'Lettres et logos en plexiglas sur mesure',
 'lightbox-neon':'Caissons lumineux et enseignes effet néon LED',
 'specialty-signs':'Enseignes spéciales sur mesure'
};
const frenchSeoPageTitles={
 '/':'Enseignes sur mesure et lettres lumineuses',
 '/projects/':'Réalisations d’enseignes sur mesure',
 '/about/':'Fabrication d’enseignes sur mesure : notre atelier',
 '/how-it-works/':'Fabrication d’une enseigne sur mesure',
 '/for-sign-companies/':'Fabrication d’enseignes pour enseignistes',
 '/contact/':'Contact et devis pour enseigne sur mesure'
};
const frenchSeoDescriptions={
 '/':'Enseignes sur mesure pour commerces, bureaux et hôtels : lettres lumineuses LED, lettres métalliques et logos en plexiglas. Étudions votre projet.',
 '/products/':'Comparez lettres boîtiers lumineuses, lettres rétroéclairées, enseignes en métal ou en plexiglas et caissons lumineux pour votre projet sur mesure.',
 '/projects/':'Découvrez des exemples d’enseignes sur mesure et des références de fabrication : matériaux, éclairage, finitions et applications commerciales.',
 '/about/':'Découvrez l’équipe et l’atelier de Custom Sign Forge : conception, fabrication, contrôle qualité et emballage d’enseignes sur mesure.',
 '/how-it-works/':'De votre logo à la livraison : étude du projet, validation des plans, fabrication et contrôle de votre enseigne sur mesure.',
 '/for-sign-companies/':'Fabrication d’enseignes sur plan pour enseignistes et installateurs : lettres lumineuses, métal, plexiglas et solutions sur mesure.',
 '/contact/':'Envoyez votre projet d’enseigne sur mesure à Custom Sign Forge par formulaire, e-mail ou WhatsApp pour discuter des matériaux et demander un devis.',
 '/landing/custom-logo-signs/':'Transformez votre logo en enseigne sur mesure. Définissez les dimensions, les matériaux, les finitions et l’éclairage selon votre espace.',
 '/landing/sign-fabrication/':'Fabrication d’enseignes sur mesure à partir de vos plans. Précisez les quantités, les matériaux et le lieu de livraison pour demander un devis.',
 '/products/led-channel-letters/':'Lettres boîtiers lumineuses LED sur mesure, avec face éclairée et contours nets. Comparez les matériaux, les dimensions et les conditions de pose.',
 '/products/backlit-letters/':'Lettres rétroéclairées LED sur mesure : un halo lumineux souligne le relief de votre logo sur un mur d’accueil, une façade ou une entrée.',
 '/products/metal-letters/':'Lettres métalliques en relief sur mesure, en inox ou aluminium. Comparez les finitions, l’épaisseur et les modes de fixation pour votre enseigne.',
 '/products/acrylic-letters/':'Lettres et logos en plexiglas sur mesure : couleur, découpe et relief pour murs d’accueil, espaces de vente et signalétique intérieure.',
 '/products/lightbox-neon/':'Caissons lumineux LED et enseignes effet néon LED sur mesure pour façades, vitrines et restaurants. Comparez les deux types d’éclairage.',
 '/products/specialty-signs/':'Enseignes spéciales sur mesure : typographies particulières, matériaux combinés, lettres à ampoules et structures étudiées selon vos plans.'
};
export function localizedItem(item,locale='en') {
 if(item&&['ms','th','de','fr'].includes(locale)){
  const isThai=locale==='th',isGerman=locale==='de',isFrench=locale==='fr',source=isThai?thaiPublicCopy:isGerman?germanPublicCopy:isFrench?frenchPublicCopy:publicCopy,data=source.site,p=data.products[item.slug]||data.products[item.product],project=!!(item.type==='project'||item.product);
  if(p&&!project)return {...item,title:p.title,intro:p.intro,seoTitle:isFrench?frenchProductSeoTitles[item.slug]||p.title:isGerman?p.title+' nach Maß':isThai?p.title:p.title+' Tempahan Khas',seoDescription:p.intro,cardDescription:p.effect,imageAlt:p.title+(isFrench?' – exemple de design':isGerman?' – Designbeispiel':isThai?' — ภาพแนวคิดการออกแบบ':' — inspirasi reka bentuk')};
  if(project){const title=(isThai?thProjects:isGerman?deProjects:isFrench?frProjects:msProjects)[item.slug]||p?.title||(isFrench?'Enseigne sur mesure':isGerman?'Individuelles Werbeschild':isThai?'ป้ายสั่งทำตามแบบ':'Papan tanda khas'),intro=source.detail.cases[item.slug]||(isFrench?'Référence de matériaux et de fabrication ; les spécifications finales sont confirmées pour chaque projet.':isGerman?'Referenz für Material und Fertigung; die endgültige Ausführung wird für jedes Projekt bestätigt.':isThai?'ข้อมูลอ้างอิงด้านวัสดุ โครงสร้าง และการผลิต โดยยืนยันรายละเอียดจริงตามโครงการ':'Rujukan bahan, struktur dan pembuatan. Spesifikasi sebenar disahkan mengikut projek.');return {...item,title,intro,seoTitle:title,seoDescription:intro,imageAlt:title+' · '+(isFrench?(item.imageKind==='concept'?'visuel conceptuel généré par IA':'référence de fabrication'):isGerman?(item.imageKind==='concept'?'Designbeispiel':'Fertigungsreferenz'):isThai?(item.imageKind==='concept'?'แนวคิดการออกแบบ':'ข้อมูลอ้างอิงการผลิต'):(item.imageKind==='concept'?'inspirasi reka bentuk':'rujukan pembuatan'))};}
  const meta=data.pages['/'+item.slug+'/']||data.pages['/landing/'+item.slug+'/'];return meta?{...item,title:meta[0],intro:meta[1],seoTitle:meta[0],seoDescription:meta[1]}:item;
 }
 if(!item||locale!=='zh')return item;
 if(item.type==='product'||chineseProducts[item.slug]&&!item.product){const p=chineseProducts[item.slug];if(p)return {...item,title:p.title,intro:p.intro,seoTitle:p.title+'定制',seoDescription:p.intro,cardDescription:p.effect,imageAlt:p.title+' · 标识效果展示'};}
 if(item.type==='project'||item.product){const p=chineseProducts[item.product];return {...item,title:projects[item.slug]||((p?.title||'定制标识')+' · '+chineseSpace(item.setting)),intro:(p?.effect||'定制材料与造型')+'，应用于'+chineseSpace(item.setting)+'。了解设计方向、制作方式与现场安装要点。',seoTitle:projects[item.slug]||p?.title,seoDescription:(p?.intro||'定制商业标识的设计与工艺参考。'),imageAlt:(projects[item.slug]||p?.title)+' · '+(item.imageKind==='concept'?'设计灵感效果图':'制作工艺参考')};}
 const meta=zh.pages['/'+item.slug+'/']||zh.pages['/landing/'+item.slug+'/'];return meta?{...item,title:meta[0],intro:meta[1],seoTitle:meta[0],seoDescription:meta[1]}:item;
}
export function localeMetadata(path,item,policy,locale='en') {
 if(['ms','th','de','fr'].includes(locale)){const data=(locale==='th'?thaiPublicCopy:locale==='de'?germanPublicCopy:locale==='fr'?frenchPublicCopy:publicCopy).site,localized=localizedItem(item,locale),fixed=data.pages[path];return {title:(locale==='fr'&&frenchSeoPageTitles[path])||localized?.seoTitle||localized?.title||data.policies[policy?.route]||fixed?.[0]||(locale==='fr'?'Page introuvable':locale==='de'?'Seite nicht gefunden':locale==='th'?'ไม่พบหน้าเว็บ':'Halaman tidak ditemui'),description:(locale==='fr'&&frenchSeoDescriptions[path])||localized?.seoDescription||localized?.intro||fixed?.[1]||(locale==='fr'?'Enseignes sur mesure par Custom Sign Forge.':locale==='de'?'Individuelle Werbeschilder von Custom Sign Forge.':locale==='th'?'ข้อมูลป้ายธุรกิจสั่งทำจาก Custom Sign Forge':'Maklumat papan tanda komersial Custom Sign Forge.')};}
 if(locale!=='zh')return null;
 const localized=localizedItem(item,locale),fixed=zh.pages[path];
 return {title:localized?.seoTitle||localized?.title||zh.policies[policy?.route]||fixed?.[0]||'页面未找到',description:localized?.seoDescription||localized?.intro||fixed?.[1]||'Custom Sign Forge 商业标识信息。'};
}
