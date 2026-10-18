export function structuredData({base,path,title,description,settings,item,found=true}){
 if(!found)return null;
 const org={'@type':'Organization','@id':base+'/#organization',name:'Custom Sign Forge',url:base+'/',logo:base+'/brand/horizontal-graphite.svg'};
 if(settings.operatorName)org.legalName=settings.operatorName;if(settings.email)org.email=settings.email;
 if(settings.whatsapp)org.contactPoint={'@type':'ContactPoint',contactType:'sales',telephone:'+'+settings.whatsapp,availableLanguage:['English']};
 const graph=[org,{'@type':'WebSite','@id':base+'/#website',url:base+'/',name:'Custom Sign Forge',publisher:{'@id':org['@id']},inLanguage:'en'},{'@type':'WebPage','@id':base+path+'#webpage',url:base+path,name:title,description,isPartOf:{'@id':base+'/#website'},inLanguage:'en'}];
 if(path!=='/'){const items=[{name:'Home',url:base+'/'}];if(path.startsWith('/products/'))items.push({name:'Products',url:base+'/products/'});else if(path.startsWith('/projects/'))items.push({name:'Projects',url:base+'/projects/'});if(items.at(-1).url!==base+path)items.push({name:item?.title||title.replace(/ \| Custom Sign Forge$/,''),url:base+path});graph.push({'@type':'BreadcrumbList',itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,item:item.url}))});}
 if(item?.type==='product')graph.push({'@type':'Product','@id':base+path+'#product',name:item.title,description:item.intro,url:base+path,...(item.image?{image:base+item.image}:{}),brand:{'@type':'Brand',name:'Custom Sign Forge'}});
 return {'@context':'https://schema.org','@graph':graph};
}
export const serializeStructuredData=data=>JSON.stringify(data).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
