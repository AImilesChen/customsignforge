export const PROJECT_SETTINGS=['Office','Storefront','Hospitality','Dining','Other'];
export const isFabrication=work=>['sample','supplier_reference'].includes(work.imageKind);
export const projectLabel=work=>({sample:'Fabrication Sample',supplier_reference:'Fabrication Sample',client_project:'Client Project',finished_product:'Finished Sign'}[work.imageKind]||'Design Concept');
export const filterProjects=(works,{application='All',style='All'}={})=>works.filter(w=>!isFabrication(w)&&(application==='All'||(w.setting||w.type)===application)&&(style==='All'||(w.productSlug||w.product)===style));
export const projectQuoteParams=work=>({entry:'/projects/'+work.slug+'/',cta:'project',project:work.slug,...((work.productSlug||typeof work.product==='string'&&work.product)?{style:work.productSlug||work.product}:{})});
