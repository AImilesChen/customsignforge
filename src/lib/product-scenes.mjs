export function selectedScene(presentations,style,id){return presentations[style]?.contexts?.find(scene=>scene.id===id)||null}
export function sceneQuoteParams(slug,scene){return {entry:'/products/'+slug+'/',cta:'product',style:slug,concept:scene.id,...(scene.projectSlug?{project:scene.projectSlug}:{}),...(scene.variant?{variant:scene.variant}:{})}}
