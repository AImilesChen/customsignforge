export function visibleDirections(sections,products){return sections.filter(section=>products.some(product=>product.slug===section.slug))}
export function productDirectionQuote(section){return {entry:'/products/',cta:'content',style:section.slug,...(section.variant?{variant:section.variant}:{})}}
