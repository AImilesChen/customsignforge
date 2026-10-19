// Keep image provenance in the content records; display the useful visual detail.
export const DESIGN_NOTE='Design concepts for inspiration. Details are tailored to your project.';
const generic=/^(?:design concept|appearance study|material study|illustrative imagery|illustrative installation|illustration|design reference|detail reference|not a custom sign forge client project)$/i;
export function displayCaption(text,fallback='Design inspiration'){
 const concise=String(text||'').replace(/\bAI-generated\s+(?:design concept|appearance study|material study|illustration|detail reference|detail)\b(?:;\s*dimensions are illustrative)?/gi,'').split(/\s*[·—]\s*/).map(part=>part.trim()).filter(part=>part&&!generic.test(part));
 const detail=concise.length>1?concise.filter(part=>!/^fabrication sample$/i.test(part)):concise;
 return detail.join(' · ')||fallback;
}
