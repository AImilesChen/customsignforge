import {ClientLabelControl} from './EnquiryLabels.jsx';
import {enquiryContact} from '../lib/enquiry-contact.mjs';
import {projectValue} from '../lib/enquiry-project.mjs';

export function EnquiryContact({record}){
 const c=enquiryContact(record);
 return <section className="admin-panel admin-contact-summary" aria-label="客户联系资料"><h3>客户联系资料</h3><dl>
  <div><dt>询价语言</dt><dd>{record.details.locale==='ms'?'马来语':record.details.locale==='zh'?'简体中文':record.details.locale==='en'?'English':'英文 / 旧记录'}</dd></div><div><dt>联系人姓名</dt><dd>{c.name||'未填写（旧记录可能未收集）'}</dd></div>
  <div><dt>公司 / 店铺名称</dt><dd>{c.company||'未填写'}</dd></div>
  <div><dt>邮箱</dt><dd>{c.emailURL?<a href={c.emailURL}>{c.email}</a>:c.email||'旧记录未收集邮箱'}</dd></div>
  <div><dt>{c.method}号码</dt><dd>{c.phoneURL?<a href={c.phoneURL} target={c.method==='WhatsApp'?'_blank':undefined} rel="noreferrer">{c.phone}</a>:c.phone||'旧记录未收集号码'}{c.phone&&<small>客户填写，未经短信验证</small>}</dd></div>
  {record.details.businessWebsite&&<div><dt>公司网站 / 社交主页</dt><dd>{record.details.businessWebsite}</dd></div>}
  {c.manual&&<div><dt>人工补录联系方式</dt><dd>{c.manual}</dd></div>}
 </dl></section>;
}

export function EnquiryTable({items,open,records,stages,quality,checked=[],setChecked=()=>{},disabled=false,trash=false,move=()=>{},saveLabels=async()=>{}}){
 return <div className="admin-table-wrap"><table className="admin-table admin-enquiry-table"><thead><tr><th><input type="checkbox" aria-label="选择本页全部询价" disabled={disabled||!items.length} checked={!!items.length&&checked.length===items.length} onChange={e=>setChecked(e.target.checked?items.map(r=>r.id):[])}/></th><th>咨询编号 / 提交时间</th><th>客户姓名与公司</th><th>客户联系方式</th><th>项目需求</th><th>客户标记</th><th>来源</th></tr></thead><tbody>{items.map(r=>{
  const c=enquiryContact(r),d=r.details;
  return <tr key={r.id}><td><input type="checkbox" aria-label={'选择询价 '+r.reference} disabled={disabled} checked={checked.includes(r.id)} onChange={e=>setChecked(e.target.checked?[...checked,r.id]:checked.filter(id=>id!==r.id))}/></td><td><button className="inline-link" onClick={()=>open(r)}>{r.reference}</button><div className="small">{r.created_at} UTC</div><button className="button secondary" onClick={()=>open(r)}>查看完整询价</button><button className="admin-archive-action" disabled={disabled} onClick={()=>move([r],!trash)}>{trash?'恢复询价':'移入回收站'}</button></td>
   <td><strong>{c.name||'姓名未填写'}</strong><div>{c.company||'公司未填写'}</div>{d.role&&<div className="small">{projectValue('role',d.role)}</div>}</td>
   <td className="admin-enquiry-contact"><span>邮箱</span><div>{c.emailURL?<a href={c.emailURL}>{c.email}</a>:c.email||'旧记录未收集'}</div><span>{c.method}</span><div>{c.phoneURL?<a href={c.phoneURL} target={c.method==='WhatsApp'?'_blank':undefined} rel="noreferrer">{c.phone}</a>:c.phone||'旧记录未收集'}</div>{c.manual&&<div>补录：{c.manual}</div>}</td>
   <td>{d.style}<div>{[d.country,d.city].filter(Boolean).join(' · ')}</div>{d.quantity&&<div>数量：{projectValue('quantity',d.quantity)}</div>}{d.dimensionsStatus==='approximate'&&<div>{d.width} × {d.height} {d.dimensionUnit}</div>}{d.deliveryWindow&&<div>{projectValue('deliveryWindow',d.deliveryWindow)}</div>}{d.targetDate&&<div>目标日期：{d.targetDate}</div>}{d.budget&&<div>预算：{d.budget}</div>}</td>
   <td><ClientLabelControl record={r} save={saveLabels} disabled={disabled}/><details className="client-followup-details"><summary>详细跟进</summary><div>{d.acquisition?.entryMode==='manual'&&r.record_status==='web_recorded'?'人工补录，待核实':records[r.record_status]}</div><div>{stages[r.business_stage]}</div><div>{quality[r.quality]}</div></details></td><td>{d.source?.utm_source||'直接访问或未知'}<div className="small">{d.locale==='ms'?'马来语':d.locale==='zh'?'简体中文':d.locale==='en'?'English':'英文 / 旧记录'}</div></td>
   </tr>;
 })}</tbody></table></div>;
}
