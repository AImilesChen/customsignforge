import {useRef,useState} from 'react';
import {CaretDownIcon} from '@phosphor-icons/react';
import {useSite} from '../site-context.jsx';
import {Button,Link,TextLink,Eyebrow,CTA} from '../shared.jsx';
import Image from '../Image.jsx';
import HomeHero from './HomeHero.jsx';
import HomePhoto from './HomePhoto.jsx';
import ProductOverviewBanner from '../ProductOverviewBanner.jsx';
import presentations from '../../data/product-pages.json';
import productDetails from '../../data/zh/product-detail-content.json';
import overview from '../../data/product-overview.json';
import home from '../../data/home-content.json';
import profile from '../../data/manufacturing-profile.json';
import process from '../../data/process-content.json';
import about from '../../data/about-content.json';
import trade from '../../data/trade-content.json';
import zh from '../../data/zh/site.json';
import {chineseProducts,chineseSpace} from '../../lib/locale-content.mjs';
import {isFabrication} from '../../lib/project-library.mjs';
import {quote} from '../shared.jsx';
import '../../styles/chinese.css';
import '../../styles/chinese-products.css';
import '../../styles/chinese-about.css';
import '../../styles/chinese-product-page.css';

const note='场景效果图用于设计灵感参考；材料、结构、灯光与交付范围以确认的项目方案为准。';
const metricLabels={experience:'资深工匠从业经验',team:'生产团队',design:'设计与研发人员',equipment:'生产设备',space:'生产空间'};
const steps=[['分享需求','上传标志或参考图，告诉我们用途、数量、尺寸和交付国家。不确定的细节可以稍后讨论。'],['确认方案与报价','一起确认材料、颜色、光效、安装条件及交付范围，审核项目报价。'],['制作与检查','按确认的规格安排加工、组装和检查，关注尺寸、表面、结构与发光效果。'],['包装与交付','按约定准备保护包装和运输，并在生产前明确当地安装与供电要求。']];
function Photo({src,alt,caption,eager=false}){const [open,setOpen]=useState(false),dialog=useRef(null);return <figure className="zh-photo"><button type="button" aria-label={'放大图片：'+alt} onClick={()=>{setOpen(true);dialog.current?.showModal()}}><Image src={src} alt={alt} loading={eager?'eager':'lazy'} fetchPriority={eager?'high':'auto'} sizes="(max-width: 760px) 100vw, 50vw"/></button>{caption&&<figcaption>{caption}</figcaption>}<dialog ref={dialog} className="product-image-dialog" onClose={()=>setOpen(false)} onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close()}} aria-label={alt}><button type="button" className="product-image-close" aria-label="关闭图片" onClick={()=>dialog.current?.close()}>×</button>{open&&<><Image src={src} alt={alt} loading="eager" sizes="95vw"/><p>{caption||alt}</p></>}</dialog></figure>}
function Heading({kicker,title,text,children}){return <div className="zh-section-heading"><div><Eyebrow>{kicker}</Eyebrow><h2>{title}</h2>{text&&<p>{text}</p>}</div>{children}</div>}
function Metrics({keys=profile.homeMetrics}){return <dl className="zh-metrics">{keys.map(key=><div key={key}><dd>{profile.metrics[key].value}{key==='experience'&&<small> 年</small>}</dd><dt>{metricLabels[key]}</dt></div>)}</dl>}
function ProductGrid(){const {products}=useSite();return <div className="zh-product-grid">{products.map(p=><article key={p.slug}><Link className="zh-product-image" to={'/products/'+p.slug+'/'} aria-label={'了解'+p.title}><HomePhoto image={presentations[p.slug]?.hero.src||p.img} alt={p.title+'效果展示'} sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1000px) 45vw, 440px"/></Link><h3><Link to={'/products/'+p.slug+'/'}>{p.title}</Link></h3><p>{chineseProducts[p.slug]?.effect||p.intro}</p><TextLink to={'/products/'+p.slug+'/'}>了解产品与工艺</TextLink></article>)}</div>}
function Cards({items,descriptions={},images={}}){return <div className="design-grid">{items.map(w=><article className="design-card" key={w.slug}><Link className="design-card-image" to={'/projects/'+w.slug+'/'}><Image src={images[w.slug]||w.img} alt={w.imageAlt||w.title} loading="lazy" sizes="(max-width: 760px) 100vw, 50vw"/></Link><p className="design-meta">{isFabrication(w)?'制作与表面工艺':chineseSpace(w.setting)}</p><h3><Link to={'/projects/'+w.slug+'/'}>{w.title}</Link></h3><p>{descriptions[w.slug]||w.desc}</p><div className="design-card-actions"><TextLink to={'/projects/'+w.slug+'/'}>{isFabrication(w)?'查看制作细节':'查看设计方向'}</TextLink><Link to={quote({style:w.productSlug,project:w.slug})}>咨询类似效果</Link></div></article>)}</div>}
function Steps(){return <ol className="zh-steps">{steps.map(([title,text],i)=><li key={title}><span>0{i+1}</span><h3>{title}</h3><p>{text}</p></li>)}</ol>}
function Options({items}){return <dl className="zh-options">{items.map(([title,text])=><div key={title}><dt>{title}</dt><dd>{text}</dd></div>)}</dl>}
function Faq({items}){return <div className="faqs">{items.map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div>}
const faqs=[['没有完整图纸，可以询价吗？','可以。先提供标志、参考照片或一个想法，并说明大致尺寸、用途和交付地点。您可以选择需要尺寸建议，图纸上传也不是必填。'],['价格如何确定？','根据图形复杂度、尺寸、材料、灯光、数量及运输要求评估。项目报价中会列明确认的规格与供应范围。'],['是否包含现场安装？','现场测量、许可、电气施工和安装只有在书面约定时才包含。请提前告知当地安装商与墙面条件，我们会讨论所需图纸和支持。']];

function ChineseHome(){const [selected,setSelected]=useState(0),photo=home.team.photos[selected];return <div className="home-redesign zh-home">
 <HomeHero/>
 <section id="sign-styles" className="zh-section home-container"><Heading kicker="产品选型" title="找到适合您品牌的标识。" text="比较材料、光效与应用空间，再按您的标志定制。"><TextLink to="/products/">浏览全部产品</TextLink></Heading><ProductGrid/></section>
 <section id="sign-ideas" className="zh-soft zh-section"><div className="home-container"><Heading kicker="空间中的标识" title="让品牌与空间，相得益彰。" text="从店面门头到接待背景墙，寻找适合您的表达。"><TextLink to="/projects/">浏览更多设计展示</TextLink></Heading><div className="home-context-grid zh-home-scenes">{home.scenes.map(s=><article className={'home-scene'+(s.feature?' home-scene-feature':'')} key={s.id}><Link className="home-scene-image" to={quote({style:s.style,source:'homepage-'+s.id})} aria-label={'咨询'+chineseSpace({storefront:'Storefront',reception:'Office',hospitality:'Hospitality'}[s.id])+'标识'}><HomePhoto image={s.image} alt={chineseSpace({storefront:'Storefront',reception:'Office',hospitality:'Hospitality'}[s.id])+'标识设计灵感'} sizes={s.feature?'(max-width: 760px) calc(100vw - 40px), 760px':'(max-width: 760px) calc(100vw - 40px), 560px'}/></Link><div className="home-scene-caption"><h3>{{storefront:'让店面更醒目',reception:'留下清晰的第一印象',hospitality:'用细节呼应空间气质'}[s.id]}</h3><TextLink to={quote({style:s.style,source:'homepage-'+s.id})}>讨论类似效果</TextLink></div></article>)}</div><p className="zh-note">{note}</p></div></section>
 <section id="behind-the-sign" className="zh-section home-container zh-split"><div className="zh-team-copy"><Eyebrow>标识背后的团队</Eyebrow><h2>精工制作。<br/>为您的品牌而造。</h2><p>设计人员与制作工匠协作，将图纸、材料与灯光转化为商业空间中的品牌标识。</p><p>从切割、成型、焊接到打磨、组装与检查，我们关注每一道工序和最终呈现。</p><Metrics/><TextLink to="/about/">了解我们的团队与工艺</TextLink></div><div className="zh-team-media"><Photo src={photo.src} alt={['团队在车间制作金属字','制作人员检查标识组件','成品字检查与保护包装'][selected]} caption={['从单个字到标志细节，逐件加工与组装。','检查表面、结构和装配细节。','检查成品，并为运输做好保护。'][selected]}/><div className="zh-photo-tabs" role="group" aria-label="查看生产图片">{['车间与团队','质量检查','保护包装'].map((s,i)=><button type="button" key={s} aria-pressed={i===selected} onClick={()=>setSelected(i)}>{s}</button>)}</div></div></section>
 <section className="zh-section zh-soft"><div className="home-container"><Heading kicker="为什么选择我们" title="围绕您的项目，做好每一个细节。"/><div className="zh-advantages">{[['专业制作团队','经验丰富的工匠与设计人员协同处理图纸和制作细节。'],['按您的标志定制','尺寸、字体、比例与颜色围绕品牌和空间确定。'],['多种加工工艺','切割、成型、焊接、打磨与表面处理相互配合。'],['材料与灯光选择','讨论金属、亚克力、表面效果与不同发光方式。'],['成品检查与包装','关注尺寸、装配、灯光及运输保护。'],['清晰的项目沟通','生产前确认规格、报价、交付范围和现场条件。']].map(([title,text],i)=><article key={title}><span>0{i+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
 <section className="zh-section home-container"><Heading kicker="定制流程" title="从一个想法，到明确的制作方案。"/><Steps/><TextLink to="/how-it-works/">查看完整流程</TextLink></section>
 <section className="home-trade"><div className="home-container"><div><Eyebrow>面向标识行业客户</Eyebrow><h2>为您的下一个客户项目，提供定制加工。</h2><p>标识公司、安装商及采购团队，可提供图纸、数量与供货要求，一起讨论制作方案。</p></div><Button to="/for-sign-companies/" secondary>了解行业定制服务</Button></div></section>
 <section className="zh-section home-container zh-split"><div><Eyebrow>开始之前</Eyebrow><h2>从您已有的信息开始。</h2><p>没有完整图纸或最终尺寸，也可以先讨论需求。</p></div><Faq items={faqs}/></section><section className="home-section home-final"><div className="home-container"><Eyebrow>聊聊您的标识项目</Eyebrow><h2>让您的想法，成为下一块标识。</h2><p>分享标志、大致尺寸与交付地点，我们一起完善细节。</p><Button>获取定制报价</Button></div></section>
 </div>}

function ChineseProducts(){
 const {products}=useSite(),items=products.map(p=>({p,d:chineseProducts[p.slug]}));
 return <article className="product-overview zh-products">
  <ProductOverviewBanner photo={{...overview.hero,alt:'商业店面入口的发光标识设计灵感'}} labelledBy="zh-overview-title">
   <Eyebrow>让品牌，多一份立体表达</Eyebrow><h1 id="zh-overview-title">定制标识。<br/>为您的空间而造。</h1>
   <p>比较材料、光效与安装方式，为您的品牌找到合适方向。</p>
   <Button to={quote({entry:'/products/',cta:'content'})}>分享您的项目</Button>
  </ProductOverviewBanner>
  <div className="overview-directions">{items.map(({p,d},i)=><section id={p.slug} key={p.slug} className={'overview-direction'+(i%2?' overview-direction-reverse':'')} aria-labelledby={'zh-title-'+p.slug}>
   <div className="overview-container overview-direction-grid">
    <div className="overview-visuals"><Photo src={presentations[p.slug]?.hero.src||p.img} alt={p.title+'空间效果'} caption="设计灵感 · 点击图片放大查看"/></div>
    <div className="overview-copy"><Eyebrow>0{i+1} / {d?.effect}</Eyebrow><h2 id={'zh-title-'+p.slug}>{p.title}</h2><p className="overview-description">{p.intro}</p>
     <Options items={d?.features.slice(0,3)||[]}/>
     <ul className="overview-use-tags" aria-label="适用空间">{d?.uses.map(use=><li key={use}>{use}</li>)}</ul>
     <div className="overview-actions"><TextLink to={'/products/'+p.slug+'/'}>了解产品与展示</TextLink><TextLink to={quote({style:p.slug,entry:'/products/'})}>咨询这个类型</TextLink></div>
    </div>
   </div>
  </section>)}</div>
  <section id="compare-sign-styles" className="zh-section zh-comparison">
   <div className="overview-container">
    <div className="zh-section-heading"><div><Eyebrow>快速比较</Eyebrow><h2 id="zh-compare-title">先选效果，再确定制作细节。</h2><p>比较视觉特点与适用空间，找到合适方向，再讨论您的具体需求。</p></div></div>
    <div className="overview-table-scroll zh-comparison-table" role="region" tabIndex={0} aria-labelledby="zh-compare-title">
     <table><caption>六类标识的特点、适用方向与选型要点</caption><thead><tr><th scope="col">产品类型</th><th scope="col">视觉特点</th><th scope="col">适用方向</th><th scope="col">重点确认</th></tr></thead>
      <tbody>{items.map(({p,d})=><tr key={p.slug}><th scope="row"><Link to={'/products/'+p.slug+'/'}>{p.title}</Link></th><td>{d?.effect}</td><td>{d?.uses.join('、')}</td><td>{d?.features.at(-1)?.[1]}</td></tr>)}</tbody>
     </table>
    </div>
    <div className="zh-comparison-cards" aria-label="标识类型对比"><p className="zh-comparison-hint">点击产品类型，展开查看适用空间与选型要点。</p>
     {items.map(({p,d})=><details className="zh-compare-card" key={p.slug}><summary><span><strong>{p.title}</strong><small>{d?.effect}</small></span><CaretDownIcon size={20} aria-hidden="true"/></summary>
      <div className="zh-compare-card-body"><dl><div><dt>适用方向</dt><dd>{d?.uses.join('、')}</dd></div><div><dt>重点确认</dt><dd>{d?.features.at(-1)?.[1]}</dd></div></dl>
       <div className="overview-actions"><TextLink to={'/products/'+p.slug+'/'}>查看产品详情</TextLink><TextLink to={quote({style:p.slug,entry:'/products/'})}>咨询这个类型</TextLink></div>
      </div>
     </details>)}
    </div>
    <p className="zh-note">{note}</p>
   </div>
  </section>
  <CTA title="还不确定选择哪种效果？" text="带上您的标志、空间照片和大致尺寸，我们一起比较。"/>
 </article>;
}

function ChineseProduct({p}){
 const {works}=useSite(),d=chineseProducts[p.slug],c=presentations[p.slug],copy=productDetails.products[p.slug],examples=works.filter(w=>w.productSlug===p.slug&&!isFabrication(w)),hero=p.img&&p.img!==c?.oldHero?{src:p.img}:c?.hero;
 const unlit=['metal-letters','acrylic-letters'].includes(p.slug);
 return <article className="product-redesign zh-product-page">
  <section className="product-container zh-pdp-hero">
   <nav className="zh-pdp-breadcrumb" aria-label="面包屑导航"><Link to="/products/">全部产品</Link><span aria-hidden="true">/</span><span>{p.title}</span></nav>
   <div className="zh-pdp-hero-copy"><Eyebrow>{p.title}</Eyebrow><h1>{copy.headline}</h1><p className="zh-pdp-intro">{copy.summary}</p><div className="zh-pdp-actions"><Button to={quote({style:p.slug})}>咨询这个类型</Button><TextLink to="#product-design-gallery">查看设计展示</TextLink></div><ul className="zh-pdp-uses" aria-label="适用空间">{d?.uses.map(use=><li key={use}>{use}</li>)}</ul></div>
   <div className="zh-pdp-hero-media"><Photo src={hero?.src||p.img} alt={p.title+'整体效果'} eager caption="设计灵感 · 点击图片查看完整效果"/></div>
  </section>
  <section className="zh-section zh-soft"><div className="product-container"><Heading kicker="产品特点" title="先了解这种效果。"/><Options items={d?.features||[]}/></div></section>
  <section id="product-design-gallery" className="zh-section product-container"><Heading kicker="不同空间，不同表达" title={p.title+' · 设计展示'} text="比较不同标志、场景和表面效果，为您的项目找到方向。"/><Cards items={examples} descriptions={productDetails.cases} images={productDetails.caseImages}/><div className="zh-pdp-gallery-end"><p className="zh-note">{note}</p><TextLink to={'/projects/?style='+p.slug+'#design-library'}>继续浏览展示库</TextLink></div></section>
  <section className="zh-section zh-soft"><div className="product-container"><Heading kicker="工艺与结构示意" title={copy.detailTitle} text="近看材料、连接与灯光，了解需要确认的制作细节。"/><div className={'zh-pdp-details'+(copy.wideDetails?' zh-pdp-details-wide':'')}>{copy.details.map(photo=><article id={photo.anchor?'direction-'+photo.anchor:undefined} key={photo.src}>{photo.anchor&&<span id={photo.anchor}/>}<Photo src={photo.src} alt={p.title+' · '+photo.title+'工艺示意'}/><h3>{photo.title}</h3><p>{photo.text}</p>{photo.anchor&&<TextLink to={quote({style:p.slug,variant:photo.anchor})}>讨论这个方向</TextLink>}</article>)}</div></div></section>
  <section className="zh-section product-container"><Heading kicker="围绕您的项目定制" title="把制作条件，一起确认。"/><Options items={[
   ['标志与尺寸','提供标志或清晰参考图，讨论笔画、字距、比例及整体尺寸。'],['材料与颜色','结合使用环境和预算选材；重要颜色与表面效果在生产前确认。'],
   unlit?['结构与固定','结合字厚、重量与墙体，确认固定方式；如需配合灯光，可单独讨论。']:['灯光与供电','确定光色、供电要求、出线位置及电源检修空间。'],
   ['包装与交付','提供数量、交付城市与目标日期，在报价中明确包装和运输范围。']
  ]}/></section>
  <section className="zh-section zh-soft"><div className="product-container"><Heading kicker="开始定制" title="四步，明确下一步。"/><ol className="zh-pdp-process">{[['分享需求','标志、尺寸、数量与交付地点。'],['确认方案','材料、结构、光效与项目报价。'],['制作检查','按确认的规格加工、组装和检查。'],['包装交付','准备保护包装与约定的运输。']].map(([title,text],i)=><li key={title}><span>0{i+1}</span><h3>{title}</h3><p>{text}</p></li>)}</ol><TextLink to="/how-it-works/">了解完整定制流程</TextLink></div></section>
  <section className="zh-section product-container"><Heading kicker="常见问题" title="开始之前，您可能想知道。"/><Faq items={[...copy.faqs,faqs[0],faqs[2]]}/></section>
  <section className="zh-pdp-final"><div className="product-container"><div><h2>一起完善您的标识方案。</h2><p>分享标志、参考图与需求，我们一起讨论制作方向。</p></div><Button to={quote({style:p.slug})}>获取定制报价</Button></div></section>
 </article>
}

function ChineseProjects(){const {works,products,query}=useSite(),params=new URLSearchParams(query),[style,setStyle]=useState(products.some(p=>p.slug===params.get('style'))?params.get('style'):'All'),[space,setSpace]=useState('All'),[limit,setLimit]=useState(12);const scenes=works.filter(w=>!isFabrication(w)),samples=works.filter(isFabrication),items=scenes.filter(w=>(style==='All'||w.productSlug===style)&&(space==='All'||w.setting===space));return <article className="projects-page"><section className="projects-intro"><div className="projects-container projects-intro-grid"><div><Eyebrow>标识设计与工艺展示</Eyebrow><h1>不同品牌。<br/>各具特色的标识。</h1><p className="projects-lead">浏览发光字、立体标志与定制工艺。比较材料、光效和空间，找到适合自己的设计方向。</p><Button to="#design-library">浏览展示库</Button></div><Photo src="/assets/gallery-v2/library-hero.webp" alt="金属背光字、正面发光字和亚克力标志的组合展示" caption="光线、材料与不同可能。" eager/></div></section><section id="design-library" className="zh-section projects-container"><Heading kicker="寻找适合您的方向" title="选择一种效果，做出自己的品牌。"/><div className="projects-filter-bar"><fieldset className="projects-applications projects-product-filters"><legend>产品类型</legend><div><button type="button" aria-pressed={style==='All'} onClick={()=>{setStyle('All');setLimit(12)}}>全部类型 <span>{scenes.length}</span></button>{products.map(p=><button type="button" key={p.slug} aria-pressed={style===p.slug} onClick={()=>{setStyle(p.slug);setLimit(12)}}>{p.title} <span>{scenes.filter(w=>w.productSlug===p.slug).length}</span></button>)}</div></fieldset><label className="projects-style-select">应用空间<select value={space} onChange={e=>{setSpace(e.target.value);setLimit(12)}}><option value="All">全部空间</option>{Object.entries(zh.settings).map(([key,value])=><option key={key} value={key}>{value}</option>)}</select></label></div><div className="projects-results"><p role="status">共 {items.length} 个设计方向{items.length>limit?' · 显示前 '+limit+' 个':''}</p>{(style!=='All'||space!=='All')&&<button type="button" onClick={()=>{setStyle('All');setSpace('All');setLimit(12)}}>重置查询</button>}<a href="#fabrication-library">查看制作工艺 ↓</a></div>{items.length?<Cards items={items.slice(0,limit)}/>:<div className="projects-empty"><h3>暂无符合条件的展示</h3><p>试试其他产品类型或应用空间，也可以直接提供您自己的参考图。</p></div>}{items.length>limit&&<div className="projects-load-more"><button type="button" className="button secondary" onClick={()=>setLimit(limit+12)}>加载更多展示</button></div>}<p className="zh-note">{note}</p></section><section id="fabrication-library" className="zh-section zh-soft"><div className="projects-container"><Heading kicker="走近制作细节" title="从表面效果，看到内部结构。" text="通过制作样品比较字面、围边、叠层与灯光构造。"/><Cards items={samples}/></div></section><CTA title="已经有喜欢的方向？" text="提供标志、参考图、大致尺寸与交付地点，我们会一起评估制作方案。"/></article>}

function ChineseProject({w}){const {products,works}=useSite(),p=products.find(p=>p.slug===w.productSlug),d=chineseProducts[w.productSlug],sample=isFabrication(w),related=works.filter(v=>v.productSlug===w.productSlug&&v.slug!==w.slug&&!isFabrication(v)).slice(0,2),request=quote({style:w.productSlug,project:w.slug});return <article className="projects-page"><nav className="projects-container project-design-breadcrumb" aria-label="面包屑导航"><Link to="/projects/">设计展示</Link><span>/</span><span>{w.title}</span></nav><section className="projects-container project-design-hero"><div><Eyebrow>{sample?'制作工艺参考':'标识设计灵感'}</Eyebrow><h1>{w.title}</h1><p className="projects-lead">{w.desc}</p><Options items={[[sample?'参考类型':'应用空间',sample?'结构与表面工艺':chineseSpace(w.setting)],['产品类型',p?.title||'定制标识']]}/><Button to={request}>{sample?'讨论这个制作细节':'咨询类似效果'}</Button></div><Photo src={w.img} alt={w.imageAlt} caption={sample?'制作样品':'设计灵感效果图'} eager/></section><section className="zh-section projects-container"><Heading kicker="从视觉到制作" title={sample?'从样品细节，确定制作要求。':'让标志与使用空间协调。'} text={sample?'对照参考样品，确认订单的材料、结构与表面要求。':'将参考效果应用到您的品牌时，需要重新评估尺寸、颜色和现场条件。'}/><Options items={d?.features||[]}/></section>{w.gallery?.length>0&&<section className="zh-section zh-soft"><div className="projects-container"><Heading kicker="细节参考" title="近看材料、结构与灯光。"/><div className="zh-detail-grid">{w.gallery.map((v,i)=><Photo key={v.src} src={v.src} alt={p?.title+'工艺细节 '+(i+1)} caption="制作与效果参考"/>)}</div></div></section>}<section className="zh-section projects-container"><Heading kicker="现场准备" title="提前规划安装与维护。"/><Options items={[
 ['墙面与固定','提供正面现场照片、墙体材料和可安装尺寸，与当地安装商确认固定方式和承重条件。'],['电源与布线','发光产品需确认当地供电、出线位置、电源放置与检修通道。'],['尺寸与识别','结合观看距离、标志比例和周围照明，确认最终文字大小与安装高度。']
 ]}/><TextLink to="/shipping-installation/">查看运输与安装说明</TextLink><p className="zh-note">{sample?'样品用于讨论工艺，具体材料、尺寸和质量要求在订单中确认。':note}</p></section>{related.length>0&&<section className="zh-section zh-soft"><div className="projects-container"><Heading kicker="继续探索" title="同类型的更多设计。"/><Cards items={related}/></div></section>}<CTA title="将这个方向，变成您的品牌标识。" text="询价时会带上当前参考，便于沟通您喜欢的效果。" to={request}/></article>}

function ChineseAbout(){
 const metricUnits={experience:'年',team:'人',design:'人',equipment:'台'};
 const crafts=[
  {image:{src:'/assets/about-v3/cut-shape.webp'},title:'切割与成型',alt:'材料切割设备与加工台面的工艺示意',text:'按确认的轮廓与尺寸切割材料，关注边缘、形状与配合精度。'},
  {image:{src:'/assets/about-v3/metal-structure.webp'},title:'结构与表面',alt:'金属字折边结构与拉丝表面的工艺示意',text:'处理字壳、折边与连接细节，让结构与表面呈现符合设计要求。'},
  {image:{src:'/assets/about-v3/led-assembly.webp'},title:'灯光与组装',alt:'横版金属字 LED 排布与组装示意',text:'结合字面、字壳与灯光进行装配，检查结构配合和发光效果。'}
 ];
 return <article className="about-page zh-about">
  <section className="zh-section about-container zh-split zh-about-hero">
   <div><Eyebrow>关于 Custom Sign Forge</Eyebrow><h1>为您的品牌，<br/>制作有质感的标识。</h1><p className="lead">设计、加工与检查团队协同工作，为商业空间制作定制标识。</p><p>从您的标志、参考图或想法出发，一起确定材料、结构与灯光，把设计落实到每一处制作细节。</p><Button>讨论您的项目</Button></div>
   <Photo src={about.hero.src} alt="制作团队在车间加工金属标识组件" eager caption="生产车间 · 金属字加工与组装"/>
  </section>
  <section className="zh-about-strengths" aria-label="团队与生产实力"><div className="about-container"><dl className="zh-about-metrics">{['experience',...profile.aboutMetrics].map(key=><div key={key}><dt>{metricLabels[key]}</dt><dd>{profile.metrics[key].value}{metricUnits[key]&&<small>{metricUnits[key]}</small>}</dd></div>)}</dl></div></section>
  <section id="our-team" className="zh-section about-container zh-split zh-about-team">
   <Photo src={about.team.src} alt="设计与项目人员在工作站处理图纸和制作资料" caption="设计与研发团队 · 图纸与制作细节沟通"/>
   <div><Eyebrow>专业分工，协同制作</Eyebrow><h2>专业分工，让想法落地。</h2><p className="zh-about-team-intro">资深工匠拥有 <strong>10 年以上从业经验</strong>，与设计研发、生产和检查人员共同完成每一个项目。</p><Options items={[
    ['设计与研发','围绕您的标志、比例与使用空间，讨论材料、结构和适合的制作方式。'],
    ['加工与制作','切割、成型、焊接、打磨与装配相互配合，把确认的方案做成实物。'],
    ['检查与项目沟通','从制作细节到成品检查、包装与发货准备，保持各环节的信息衔接。']
   ]}/></div>
  </section>
  <section className="zh-section zh-soft zh-about-craft"><div className="about-container"><Heading kicker="从材料到成品" title="工艺，让设计落地。" text="通过工艺示意，了解从加工轮廓到灯光装配的关键细节。"/><div className="zh-about-craft-grid">{crafts.map(({image,title,alt,text},i)=><article key={image.src}><Photo src={image.src} alt={alt}/><div className="zh-about-craft-copy"><span className="zh-about-step" aria-hidden="true">0{i+1}</span><h3>{title}</h3><p>{text}</p></div></article>)}</div></div></section>
  <section className="zh-section about-container zh-split zh-about-quality">
   <div><Eyebrow>出厂前的细节</Eyebrow><h2>认真检查，妥善保护。</h2><Options items={[
    ['尺寸与表面','对照确认的图纸，检查文字轮廓、尺寸、表面及装配。'],
    ['结构与灯光','发光产品按约定检查灯光效果、组装与电气相关细节。'],
    ['包装与运输','结合产品结构与运输安排做好保护，关注字面、边角与装箱固定。']
   ]}/><TextLink to="/how-it-works/">了解我们的制作流程</TextLink></div>
   <div className="zh-about-quality-photos"><Photo src={about.check.src} alt="制作人员检查标识成品的表面与组件" caption="成品检查 · 表面与装配细节"/><Photo src="/assets/about-v3/protective-packing.webp" alt="金属字在木箱内使用泡棉隔离保护的包装示意" caption="装箱保护 · 包装示意"/></div>
  </section>
  <section className="zh-about-closing"><div className="about-container"><div><Eyebrow>聊聊您的标识项目</Eyebrow><h2>把您的想法，做成标识。</h2><p>分享标志、参考图或大致需求，我们一起完善制作方案。</p></div><Button>获取定制报价</Button></div></section>
 </article>
}

function ChineseProcess(){const photos=[process.brief,process.specification,process.production[0],process.packing];return <article className="process-page"><section className="zh-section process-container zh-split"><div><Eyebrow>您的定制标识，如何成型</Eyebrow><h1>从您的想法。<br/>到可制作的方案。</h1><p className="lead">您不需要一开始就准备好所有答案。从参考图与用途开始，我们逐步确认设计、报价、制作与交付细节。</p><Button>开始您的项目</Button></div><Photo src={process.hero.src} alt="标识制作流程与工艺" caption="从需求到制作" eager/></section>{steps.map(([title,text],i)=><section id={process.stages[i].id} className={'zh-section'+(i%2?' zh-soft':'')} key={title}><div className={'process-container zh-split'+(i%2?' zh-split-reverse':'')}><Photo src={photos[i].src} alt={title+'参考图片'} caption={['标志、现场照片与尺寸参考','确认设计与制作规格','按约定检查成品','包装保护与交付准备'][i]}/><div><Eyebrow>0{i+1} / 定制流程</Eyebrow><h2>{title}</h2><p>{text}</p><Options items={[
 ['您提供',[
 '标志或参考图、用途、大致尺寸、数量及交付国家。没有图纸也可以先沟通。','对方案、颜色、尺寸、安装条件及预算范围提出反馈。','按订单约定确认图纸与必要的样品、检查或审批节点。','确认收货信息、运输安排、当地安装商及现场条件。'][i]],
 ['我们处理',[
 '评估制作方向，整理缺少的信息并给出下一步建议。','讨论材料、光效、结构、供电与交付范围，并准备项目报价。','按确认的要求安排加工、组装与检查，处理制作细节。','按约定准备保护包装、装箱信息及相关交付资料。'][i]],
 ['下一步确认',[
 '确定适合项目的产品类型和需要补充的资料。','明确规格、价格、付款、生产与运输安排。','确认约定的检查项目和发货前准备。','区分生产时间与运输时间，明确安装和进口相关责任。'][i]]
 ]}/><TextLink to={i===3?'/shipping-installation/':'/get-a-quote/'}>{i===3?'查看运输与安装说明':'分享您的需求'}</TextLink></div></div></section>)}<section className="zh-section process-container"><Heading kicker="生产之前" title="重要细节，提前说清。"/><Options items={[
 ['图纸与尺寸','确认文字内容、标志、整体尺寸、比例和安装位置。'],['材料与效果','确认材料、颜色、表面、灯光方式及必要的参考样品。'],['价格与供货范围','确认报价币种、数量、包含项目、付款与生产安排。'],['安装与交付','确认固定、布线、当地要求、运输及交付职责。']
 ]}/><p className="zh-note">保存询价或收到初步报价，不代表已批准生产；以双方确认的订单与规格为准。</p></section><section className="zh-section zh-soft"><div className="process-container"><Heading kicker="常见问题" title="开始之前，先了解流程。"/><Faq items={faqs}/></div></section><CTA title="从您的想法开始。" text="提供已有资料，我们会一起澄清其余细节。"/></article>}

function ChineseTrade(){return <article className="trade-page"><section className="zh-section trade-container zh-split"><div><Eyebrow>面向标识公司与安装团队</Eyebrow><h1>您的项目。<br/>我们的制作能力。</h1><p className="lead">为标识公司、安装商和采购团队提供按图定制与工艺支持。围绕图纸、数量、材料和供货要求，讨论适合项目的方案。</p><Button to={quote({role:'sign-company',entry:'/for-sign-companies/',cta:'content'})}>获取行业项目报价</Button></div><Photo src={trade.hero.src} alt="定制标识制作与加工细节" caption="定制加工参考" eager/></section><section className="zh-section zh-soft"><div className="trade-container"><Heading kicker="我们制作的产品" title="为您的客户，制作合适的标识。"/><ProductGrid/></div></section><section className="zh-section trade-container zh-split"><Photo src="/assets/supplier/formed-metal-letters.webp" alt="金属立体字制作样品" caption="金属字制作参考"/><div><Eyebrow>围绕图纸与规格</Eyebrow><h2>把关键制作细节，提前落实。</h2><Options items={[
 ['按图评估','提供矢量图、尺寸、数量及现场要求，讨论可制作细节和结构。'],['材料与表面','选择金属、亚克力、喷涂和表面处理方向，明确色样及质量要求。'],['结构与安装支持','在订单中确认固定方式、安装模板、出线位置和所需图纸。'],['供货与运输','沟通分批供货、包装标识及交付安排，按具体项目确认范围。']
 ]}/></div></section><section className="zh-section zh-soft"><div className="trade-container"><Heading kicker="生产与沟通" title="从规格确认，到成品交付。"/><Steps/></div></section><section className="zh-section trade-container"><Heading kicker="准备询价资料" title="让报价沟通更高效。"/><Options items={[
 ['设计资料','标志、矢量文件、尺寸及关键结构要求。图纸暂时不完整也可以开始沟通。'],['安装资料','墙面、室内外使用、当地电气与安装要求。'],['采购信息','数量、交付城市、目标时间及包装要求。']
 ]}/><Faq items={faqs}/></section><CTA title="开始讨论您的下一个制作项目。" text="分享图纸、数量与交付要求，获取项目报价。" to={quote({role:'sign-company',entry:'/for-sign-companies/',cta:'content'})}/></article>}

function ChineseContact(){const {settings}=useSite();return <article className="contact-page"><section className="contact-container contact-layout"><div className="contact-project"><Eyebrow>联系 Custom Sign Forge</Eyebrow><h1>聊聊您的<br/>标识项目。</h1><p>分享您的想法，或咨询某一种产品。一个标志、大致尺寸或一张参考图，就可以开始。</p><Button>填写项目询价</Button></div><aside className="contact-channels"><h2>邮箱或 WhatsApp</h2><div className="contact-channel"><div><h3>邮箱</h3><a href={'mailto:'+settings.email}>{settings.email}</a><p>发送问题、标志或项目说明。</p></div></div><div className="contact-channel"><div><h3>WhatsApp</h3><a href={'https://wa.me/'+settings.whatsapp}>+{settings.whatsapp}</a><p>直接讨论您的标识想法与项目细节。</p></div></div></aside></section><section id="company-information" className="contact-container contact-company"><dl><div><dt>公司名称</dt><dd>{settings.operatorNameLocal||settings.operatorName}</dd></div><div><dt>公司地址</dt><dd><address>浙江省台州市路桥区金清大道46号</address></dd></div></dl></section></article>}

function ChinesePolicy({path}){const {settings}=useSite(),title=zh.policies[path],entries={
 '/privacy/':[
 ['账号与询价资料','提交询价前需用 Google 或邮箱验证码登录。我们保存已验证邮箱、账号标识以及您提交的联系人、电话或 WhatsApp、项目要求、图纸状态与可选附件，用于项目跟进。电话由客户填写，未经短信验证。客户只能查看自己账号的询价，管理权限另行限制。'],
 ['资料用途与分享','资料用于回复需求、评估项目、准备报价、协调确认的订单和提供支持。询价不会自动订阅营销信息。按项目需要向物流及技术服务提供方提供必要信息；客户图纸不会自动公开或用于宣传。'],
 ['文件与保存','上传只应包含您有权分享的图纸与资料。未提交的上传文件在 24 小时后到期，并由定期清理任务移除；已提交附件与询价关联保存。请勿提交身份证件、银行卡或无关敏感信息。账号和订单资料的保存期限及地区性披露仍需按实际业务完成审核。'],
 ['WhatsApp 与外部服务','点击 WhatsApp 会打开外部服务。准备的消息可能含项目要求、联系邮箱、号码及询价编号，您可以检查和编辑后自行发送。点击链接不会自动发消息，上传文件也不会自动发送。网站不会自动导入 WhatsApp 对话。'],
 ['统计与隐私选择','只有同意统计后才启用可选统计。自有统计按已登录客户账号去重，排除管理员及未登录访问，事件保留 90 天；事件不含姓名、邮箱、号码或询价内容。公开营销页面还可使用 GA4、Clarity 及 Shipsolo/Plausible，统计口径与账号去重报表不同。登录、账号、询价表、后台和政策页面排除这些外部统计。'],
 ['选择、权利与安全','您可以通过页脚 Cookie 设置撤回统计许可。根据适用规则，您可能享有查询、更正、删除等权利，请通过下方邮箱提出申请。退出登录不会删除账号。我们会核实身份及必要的订单保留要求；不使用 AI 评分自动决定是否接受项目。跨境处理、法律依据及地区性披露仍需审核。']
 ],
 '/cookies/':[
 ['必要的功能','网站使用必要会话与安全技术支持客户及管理员登录、验证码、防滥用和隐私选择。客户会话最长 7 天；邮箱验证码及 Google 登录状态最长 10 分钟；管理员会话最长 8 小时。退出会撤销对应会话。'],
 ['询价草稿','为便于切换语言，询价草稿仅保存在当前浏览器标签页的 sessionStorage，按登录账号隔离，最长恢复 24 小时；提交成功或退出登录后清除。草稿不会传给统计工具。已上传文件由账号权限保护。'],
 ['可选统计','同意后，自有统计按客户账号记录浏览、打开询价、成功保存和联系按钮点击，事件定期在 90 天后删除。公开页面还会加载 Google Analytics 4、Microsoft Clarity 及 Shipsolo/Plausible；Clarity 提供热图和会话录像，Plausible 不设置统计 Cookie。后台、登录、账号、询价表及政策页不加载外部统计。广告追踪保持关闭。'],
 ['设备存储与有效期','隐私选择有效 180 天。获准的首次来源信息最多使用 90 天，当前来源保存在标签页会话中。GA 的 _ga 类 Cookie 可长达 2 年；Clarity 的 _clck 最长 1 年、_clsk 最长 1 天，实际期限由服务配置决定。'],
 ['拒绝与撤回','首次提示可选择拒绝或允许统计，之后可用页脚 Cookie 设置修改。撤回会清除来源存储及相关第一方统计 Cookie，并在需要时重新加载页面以卸载已运行的外部脚本。拒绝不影响浏览、登录、询价或通过 WhatsApp 联系。历史外部数据按服务商保留设置处理。'],
 ['其他服务','Google 登录只在您选择后打开，仅请求身份和邮箱，不读取 Gmail 邮件或文件。Cloudflare Turnstile 用于登录和询价防滥用，独立于可选统计。']
 ],
 '/terms/':[
 ['网站与账号','网站用于展示定制标识并发起项目询价，不提供在线结账或自动最终价格。请使用您有权访问的邮箱登录，妥善保管账号，并在公共设备上退出。客户登录不提供管理员或其他客户资料的访问权限。'],
 ['询价与订单','提交询价、保存记录或打开 WhatsApp，不代表下单、预留产能或接受报价。规格、价格、币种、付款、生产批准及交付范围须另行确认，卖方和适用条款以订单文件为准。'],
 ['图片与规格','图片按用途展示产品、制作样品或设计灵感，不自动成为订单规格。光线、屏幕和安装环境会影响观感，重要色样、尺寸和公差应在生产前约定。'],
 ['客户提供的资料','仅提交您有权分享的标志、图纸和其他材料，说明保密或用途限制。资料仅用于评估需求与履行约定工作，不自动转让所有权，也不自动授权公开宣传。'],
 ['制作与现场要求','按订单确认材料、结构、供电、安装和当地要求。组件的认证不等于所有成品标识均取得认证。现场安装及相关许可只有书面约定时才包含。'],
 ['适用权利与联系','订单及本说明不能排除适用的强制性权利。适用法律、争议流程及其他交易条款需按实际业务审核并在订单中确认。网站说明存在待审核项目，请在订购前咨询。']
 ],
 '/cancellations-returns/':[
 ['询价与定制订单','网站询价不构成订单，也无需付款。定制产品按确认的项目规格制作，审批、生产与付款安排在下单前另行约定。'],
 ['变更与取消','如需变更或取消，请尽快联系并提供订单编号及具体要求。以书面确认结果为准；能否变更取决于实际制作阶段、约定条款与适用规则，不默认任何比例不可退。'],
 ['产品问题与运输损坏','若产品有质量问题、与约定不符或受损，请提供订单编号、说明和合理可得的照片或视频，并尽可能保留包装。疑似不安全的设备请勿通电或安装。及时反馈有助于调查，不缩短法定权利期限。'],
 ['处理与退回','根据规格与适用义务评估维修、更换、价款调整或退款等处理方式。退货前请先确认安排，网站地址不自动等于退货地址。费用承担和退款时间以适用规则与妥善约定的订单为准；具体商业退换政策仍需审核。']
 ],
 '/shipping-installation/':[
 ['目的地与时间','交付能力按产品和目的地评估，请在询价时提供国家与城市。生产时间与运输时间不同，开业或安装的固定期限需在下单前说明。'],
 ['运输与费用范围','报价和订单中确认运输安排、包含费用和相关时间。出口、进口、清关、关税、税费、保险和风险分配须明确，使用贸易术语时需注明地点和版本。'],
 ['收货检查','在合理可行时检查包装、数量和外观，发现损坏或缺件及时保留证据并联系。此建议不缩短强制性索赔权利。'],
 ['安装范围','现场测量、许可、结构施工、电气施工及安装仅在明确约定时包含。提供安装面、位置及当地安装商信息；由合格人员按适用要求与说明进行固定和接线。'],
 ['产品与当地要求','在接受订单前明确当地电气、标签、文件和审批要求。某个组件的认证不代表整件成品通用认证或适用于所有地区。无法确认时，应先澄清或调整供应范围。']
 ]};return <><section className="page-intro"><div className="container"><Eyebrow>政策与使用说明</Eyebrow><h1>{title}</h1><p className="lead">中文说明供您了解网站与项目流程。交易细节以确认的报价和订单为准。</p></div></section><section className="zh-section container zh-policy"><p className="inline-note">原有政策仍有业务及法律审核事项，本中文说明沿用待审核状态，不新增付款、保修或退换承诺。<Link to={path} locale="en">查看英文版本</Link></p>{(entries[path]||[]).map(([title,text],i)=><section key={title}><h2>{i+1}. {title}</h2><p>{text}</p></section>)}<h2>联系我们</h2><p>公司：{settings.operatorNameLocal||settings.operatorName}</p><p>地址：浙江省台州市路桥区金清大道46号</p><p>邮箱：<a href={'mailto:'+settings.email}>{settings.email}</a></p><p>WhatsApp：<a href={'https://wa.me/'+settings.whatsapp}>+{settings.whatsapp}</a></p>{path==='/cookies/'&&<p>服务商信息：<a href="https://policies.google.com/privacy">Google 隐私政策</a> · <a href="https://privacy.microsoft.com/privacystatement">Microsoft 隐私声明</a> · <a href="https://www.cloudflare.com/turnstile-privacy-policy/">Turnstile 隐私信息</a></p>}</section></>}

export default function ChinesePages(){const {path,products,works}=useSite(),p=products.find(p=>path==='/products/'+p.slug+'/'),w=works.find(w=>path==='/projects/'+w.slug+'/');if(path==='/')return <ChineseHome/>;if(path==='/products/')return <ChineseProducts/>;if(p)return <ChineseProduct p={p}/>;if(path==='/projects/')return <ChineseProjects/>;if(w)return <ChineseProject w={w}/>;if(path==='/about/')return <ChineseAbout/>;if(path==='/how-it-works/')return <ChineseProcess/>;if(path==='/for-sign-companies/')return <ChineseTrade/>;if(path==='/contact/')return <ChineseContact/>;if(zh.policies[path])return <ChinesePolicy path={path}/>;if(path.startsWith('/landing/'))return <><section className="zh-section container"><Eyebrow>定制商业标识</Eyebrow><h1>{zh.pages[path]?.[0]}</h1><p className="lead">{zh.pages[path]?.[1]}</p><Button>分享您的项目</Button></section><section className="zh-section container"><ProductGrid/></section><CTA title="讨论您的制作需求。" text="分享标志、参考图、尺寸与交付地点，我们一起明确制作方案。"/></>;return <section className="zh-section container"><Eyebrow>404</Eyebrow><h1>未找到这个页面</h1><p>请检查网址，或返回首页继续浏览。</p><Button to="/">返回首页</Button></section>}
