import Image from '../Image.jsx';

// Both languages use the same reserved image frame; intrinsic image dimensions
// must never determine the height of a responsive homepage card.
export default function HomePhoto({image,alt,className='',sizes='(max-width: 700px) 100vw, (max-width: 1100px) 60vw, 800px',position}){
 const src=image.startsWith('/')?image:'/assets/home-v2/'+image;
 return <div className={'home-photo '+className}><Image src={src} alt={alt} loading="lazy" sizes={sizes} style={position?{objectPosition:position}:undefined}/></div>;
}
