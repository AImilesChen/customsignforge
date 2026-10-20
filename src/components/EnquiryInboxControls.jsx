import {useEffect,useState} from 'react';
import {CLIENT_LABELS,labelName} from '../lib/enquiry-labels.mjs';
import {COUNTRIES} from '../lib/validation.mjs';
import {ROLES,DELIVERY_WINDOWS} from '../lib/enquiry-project.mjs';
export const EMPTY_ENQUIRY_FILTER={q:'',country:'',label:'',record:'',stage:'',quality:'',role:'',projectStage:'',deliveryWindow:'',source:'',style:'',from:'',to:'',offset:0,limit:25,sort:'newest',view:'active'};

export function EnquiryFilters({filter,data,apply,disabled,records,stages,quality}){
 const [draft,setDraft]=useState(filter);useEffect(()=>setDraft(filter),[filter]);
 const change=(key,value)=>setDraft(f=>({...f,[key]:value}));
 const countries=[...new Set([...COUNTRIES,...(data?.countries||[]).map(r=>r.country).filter(Boolean)])];
 const select=(key,label,values)=><label>{label}<select value={draft[key]} onChange={e=>change(key,e.target.value)}>{key!=='sort'&&<option value="">全部</option>}{values.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>;
 function recent(days){const to=new Date(),from=new Date(to);from.setUTCDate(from.getUTCDate()-days+1);setDraft({...draft,from:from.toISOString().slice(0,10),to:to.toISOString().slice(0,10)})}
 const changed=Object.keys(EMPTY_ENQUIRY_FILTER).filter(k=>k!=='offset').some(k=>String(draft[k]??'')!==String(filter[k]??''));
 const applied=[filter.q&&('关键词：'+filter.q),filter.country,filter.label&&(filter.label==='unmarked'?'未标记':labelName(filter.label)),(filter.from||filter.to)&&((filter.from||'不限')+' 至 '+(filter.to||'不限'))].filter(Boolean);
 const otherApplied=['record','stage','quality','role','projectStage','deliveryWindow','source','style'].some(k=>filter[k]);
 return <><div className="admin-inbox-tabs" aria-label="询价记录范围">{[['active','客户询价'],['trash','回收站']].map(([v,t])=><button key={v} type="button" className={filter.view===v?'is-active':''} aria-pressed={filter.view===v} disabled={disabled} onClick={()=>apply({...filter,view:v,offset:0})}>{t}</button>)}</div>
 <form className="admin-inbox-filters" onSubmit={e=>{e.preventDefault();apply({...draft,offset:0})}}><fieldset disabled={disabled}><div className="admin-query-heading"><h2>查询客户</h2><span>{applied.length||otherApplied?'当前范围：'+[...applied,...(otherApplied?['更多条件']:[])].join(' · '):'当前显示全部客户'}</span></div>
  <div className="admin-inbox-basic"><label className="admin-inbox-keyword">客户信息<input aria-label="检索客户询价" placeholder="姓名 / 公司 / 邮箱 / 电话 / 编号" value={draft.q} onChange={e=>change('q',e.target.value)}/></label>
   <label>交付国家 / 地区<select value={draft.country} onChange={e=>change('country',e.target.value)}><option value="">全部国家 / 地区</option>{countries.map(c=><option key={c} value={c}>{c}{data?.countries?.some(r=>r.country===c)?' ('+data.countries.find(r=>r.country===c).count+')':''}</option>)}</select></label>
   {select('label','客户标记',[['unmarked','未标记'],...CLIENT_LABELS])}
   <label>开始日期（UTC）<input type="date" value={draft.from} onChange={e=>change('from',e.target.value)}/></label><label>结束日期（UTC）<input type="date" value={draft.to} onChange={e=>change('to',e.target.value)}/></label>
  </div><div className="admin-inbox-options">{select('sort','提交时间',[['newest','最新在前'],['oldest','最早在前']])}<label>每页条数<select value={draft.limit} onChange={e=>change('limit',Number(e.target.value))}>{[10,25,50].map(n=><option key={n} value={n}>{n} 条</option>)}</select></label><button type="button" className="inline-link" onClick={()=>recent(7)}>近7天</button><button type="button" className="inline-link" onClick={()=>recent(30)}>近30天</button><span className="admin-query-spacer"/><button type="submit" className="button query-submit">查询</button><button type="button" className="button secondary" onClick={()=>apply({...EMPTY_ENQUIRY_FILTER,view:filter.view})}>重置</button></div>
  <details className="admin-inbox-advanced"><summary>更多查询条件</summary><div className="admin-filters">{select('record','记录状态',Object.entries(records))}{select('stage','业务阶段',Object.entries(stages))}{select('quality','客户质量',Object.entries(quality))}{select('role','客户类型',ROLES)}{select('projectStage','采购阶段',['Ready to discuss a quote','Comparing options','Exploring an idea'].map(v=>[v,v]))}{select('deliveryWindow','期望收货时段',DELIVERY_WINDOWS)}<label>产品款式<input value={draft.style} onChange={e=>change('style',e.target.value)} placeholder="例如 backlit-letters"/></label><label>访问来源<input value={draft.source} onChange={e=>change('source',e.target.value)} placeholder="例如 google"/></label></div></details>
 {changed&&<p className="admin-query-pending" role="status">条件已修改，点击“查询”后生效。</p>}</fieldset></form></>;
}

export function EnquiryPagination({data,filter,apply,disabled}){
 const size=data?.limit||25,total=data?.total||0,offset=data?.offset||0,pages=Math.max(1,Math.ceil(total/size)),page=Math.floor(offset/size)+1;
 const [jump,setJump]=useState(String(page));useEffect(()=>setJump(String(page)),[page]);
 return <div className="admin-inbox-pagination"><span>共 {total} 条{total?' · 显示 '+(offset+1)+'–'+Math.min(offset+size,total):''} · 第 {page} / {pages} 页</span><div><button type="button" className="button secondary" disabled={disabled||page===1} onClick={()=>apply({...filter,offset:0})}>首页</button><button type="button" className="button secondary" disabled={disabled||page===1} onClick={()=>apply({...filter,offset:offset-size})}>上一页</button><button type="button" className="button secondary" disabled={disabled||page===pages} onClick={()=>apply({...filter,offset:offset+size})}>下一页</button><form onSubmit={e=>{e.preventDefault();const n=Math.min(pages,Math.max(1,Number(jump)||1));apply({...filter,offset:(n-1)*size})}}><label>跳至<input type="number" min="1" max={pages} aria-label="跳转页码" value={jump} onChange={e=>setJump(e.target.value)}/></label><button className="button secondary" disabled={disabled||!total}>跳转</button></form></div></div>;
}
