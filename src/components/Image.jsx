import {useState,useEffect,useRef} from 'react';
import dimensions from '../data/image-sizes.json';
import responsive from '../data/image-variants.json';
export default function Image({src,alt='',...props}){
 const [broken,setBroken]=useState(false);
 const node=useRef(null);
 useEffect(()=>{setBroken(false);if(node.current?.complete&&node.current.naturalWidth===0)setBroken(true)},[src]);
 const size=dimensions[src];
 const variants=responsive[src];const srcSet=variants?.variants.length?[...variants.variants,{src,width:variants.width}].map(item=>item.src+' '+item.width+'w').join(', '):undefined;
 return <img ref={node} width={size?.[0]} height={size?.[1]} decoding="async" srcSet={broken?undefined:srcSet} sizes={srcSet?'(max-width: 700px) 100vw, (max-width: 1100px) 60vw, 800px':undefined} {...props} src={broken?'/brand/image-unavailable.svg':src} alt={broken?'Image unavailable. Contact us for product references.':alt} onError={event=>{if(!broken){setBroken(true);event.currentTarget.removeAttribute('srcset');event.currentTarget.src='/brand/image-unavailable.svg'}}}/>;
}
