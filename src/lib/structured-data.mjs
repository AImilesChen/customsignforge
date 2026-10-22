import {basePath,localePath,htmlLanguage} from './locale.mjs';
const breadcrumbLabels={
 en:['Home','Products','Projects'],zh:['首页','产品中心','设计展示'],ms:['Utama','Produk','Idea reka bentuk'],
 th:['หน้าแรก','สินค้า','แนวคิดงานออกแบบ'],de:['Startseite','Produkte','Referenzen'],fr:['Accueil','Produits','Inspirations'],
 ko:['홈','제품','디자인 사례'],'pt-br':['Início','Produtos','Projetos'],ar:['الرئيسية','المنتجات','المشاريع'],
 es:['Inicio','Productos','Proyectos']
};
export function structuredData({base,path,title,description,settings,item,found=true,locale='en'}){
 if(!found)return null;
 const org={'@type':'Organization','@id':base+'/#organization',name:'Custom Sign Forge',url:base+'/',logo:base+'/brand/horizontal-graphite.svg'};
 if(settings.operatorName)org.legalName=settings.operatorName;if(settings.email)org.email=settings.email;
 if(settings.whatsapp)org.contactPoint={'@type':'ContactPoint',contactType:'sales',telephone:'+'+settings.whatsapp,availableLanguage:['English','Chinese']};
 const graph=[org,{'@type':'WebSite','@id':base+'/#website',url:base+'/',name:'Custom Sign Forge',publisher:{'@id':org['@id']},inLanguage:htmlLanguage(locale)},{'@type':'WebPage','@id':base+path+'#webpage',url:base+path,name:title,description,isPartOf:{'@id':base+'/#website'},inLanguage:htmlLanguage(locale)}];
 if(basePath(path)!=='/'){const [home,products,projects]=breadcrumbLabels[locale]||breadcrumbLabels.en;const items=[{name:home,url:base+localePath('/',locale)}];if(basePath(path).startsWith('/products/'))items.push({name:products,url:base+localePath('/products/',locale)});else if(basePath(path).startsWith('/projects/'))items.push({name:projects,url:base+localePath('/projects/',locale)});if(items.at(-1).url!==base+path)items.push({name:item?.title||title.replace(/ \| Custom Sign Forge$/,''),url:base+path});graph.push({'@type':'BreadcrumbList',itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,item:item.url}))});}
 if(item?.type==='product')graph.push({'@type':'Product','@id':base+path+'#product',name:item.title,description:item.intro,url:base+path,...(item.image?{image:base+item.image}:{}),brand:{'@type':'Brand',name:'Custom Sign Forge'}});
 return {'@context':'https://schema.org','@graph':graph};
}
export const serializeStructuredData=data=>JSON.stringify(data).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
