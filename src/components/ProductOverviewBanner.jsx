import React,{useEffect,useRef,useState} from 'react';
import {useLocale} from './use-locale.jsx';
import dimensions from '../data/image-sizes.json';
import responsive from '../data/image-variants.json';
import '../styles/overview-banner.css';

function BannerPhoto({photo}){
 const {locale}=useLocale(),zh=locale==='zh',node=useRef(null);
 const [stage,setStage]=useState(0),[cycle,setCycle]=useState(0);
 const variants=responsive[photo.src],size=dimensions[photo.src];
 const srcSet=variants?.variants.length?[...variants.variants,{src:photo.src,width:variants.width}].map(v=>v.src+' '+v.width+'w').join(', '):undefined;
 // If a responsive candidate fails, request the original once. A distinct URL
 // also retries when the original itself was the browser's initial selection.
 const retry=()=>{setCycle(c=>c+1);setStage(1)};
 const retrySrc=photo.src+(photo.src.includes('?')?'&':'?')+'csf_image_retry='+cycle;
 useEffect(()=>{if(node.current?.complete&&node.current.naturalWidth===0)setStage(s=>s===0?1:s)},[]);
 return <div className="overview-banner-media">
  <img key={stage===0?'responsive':'original-'+cycle} ref={node} className="overview-banner-image" src={stage===0?photo.src:retrySrc} srcSet={stage===0?srcSet:undefined} sizes="100vw" width={size?.[0]} height={size?.[1]} alt={photo.alt} loading="eager" fetchPriority="high" decoding="async" hidden={stage===2} onError={()=>{if(stage<2)setStage(current=>current===stage?stage+1:current)}}/>
  {stage===2&&<div className="overview-banner-recovery" role="status"><p>{locale==='th'?'ไม่สามารถโหลดภาพตัวอย่างได้':locale==='ms'?'Imej ruang tidak dapat dimuatkan.':zh?'场景图片暂未加载':'The scene image could not load.'}</p><button type="button" onClick={retry}>{locale==='th'?'ลองโหลดภาพอีกครั้ง':locale==='ms'?'Cuba muatkan imej':zh?'重新加载图片':'Retry image'}</button></div>}
 </div>;
}

export default function ProductOverviewBanner({photo,children,labelledBy}){
 return <section className="overview-banner overview-banner-resilient" aria-labelledby={labelledBy}>
  <BannerPhoto key={photo.src} photo={photo}/>
  <div className="overview-container overview-banner-inner"><div className="overview-banner-copy">{children}</div></div>
 </section>;
}
