const normalise=value=>(value||'').replace(/\r\n?/g,'\n').trim();
export function aboutPresentation(page,content,defaults){
 const title=page?.title&&!defaults.knownTitles.includes(page.title)?page.title:content.title;
 const intro=page?.intro&&!defaults.knownIntros.includes(page.intro)?page.intro:content.intro;
 const knownImages=new Set(defaults.knownImages.map(src=>src.replace(/\.png$/,'.webp')));
 const image=page?.image?.replace(/\.png$/,'.webp');
 const hero=image&&!knownImages.has(image)?{src:image,alt:page.imageAlt||content.hero.alt,caption:page.imageKind==='concept'?'Design concept · Illustrative imagery':'Fabrication reference'}:content.hero;
 const knownPhotos=new Set([...defaults.knownGallery,...Object.values(content).filter(v=>v?.src).map(v=>v.src),...content.capabilities.map(v=>v.src)]);
 return {title,intro,hero,customBody:!!page?.body&&!defaults.knownBodies.some(value=>normalise(value)===normalise(page.body)),extra:(page?.gallery||[]).filter(item=>!knownPhotos.has(item.src))};
}
