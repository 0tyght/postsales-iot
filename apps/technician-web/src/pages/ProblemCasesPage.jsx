import {useState} from 'react';
import JobStatusButton from '../components/JobStatusButton';
import {api} from '../services/api';

const serviceTypes=[
 {value:'repair',label:'ตรวจซ่อม / แก้ปัญหา',prefix:'ตรวจซ่อม'},
 {value:'add_device',label:'เพิ่มอุปกรณ์ในจุดติดตั้งเดิม',prefix:'เพิ่มอุปกรณ์'},
 {value:'remove_device',label:'ถอด / ลดอุปกรณ์ในจุดติดตั้งเดิม',prefix:'ถอดอุปกรณ์'},
 {value:'replace_device',label:'เปลี่ยนอุปกรณ์',prefix:'เปลี่ยนอุปกรณ์'},
];
const nowLocal=()=>{const date=new Date();return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16)};

function CreateServiceCase({sites,onClose,onCreated}){
 const[form,setForm]=useState({site_id:'',service_type:'add_device',detail:'',reported_at:nowLocal()});
 const[busy,setBusy]=useState(false),[error,setError]=useState('');
 const submit=async event=>{
  event.preventDefault();
  const type=serviceTypes.find(item=>item.value===form.service_type);
  setBusy(true);setError('');
  try{
   await api('/problems',{method:'POST',body:JSON.stringify({
    site_id:form.site_id,
    symptom_detail:`${type.prefix}: ${form.detail}`,
    reported_at:form.reported_at,
    source_type:'service_contact',
    contact_channel:'technician_app',
    problem_status:'open',
   })});
   onCreated();
  }catch(x){setError(x.message)}finally{setBusy(false)}
 };
 return <div className="backdrop nested-backdrop" onClick={onClose}>
  <form className="sheet service-case-sheet" onSubmit={submit} onClick={e=>e.stopPropagation()}>
   <div className="sheet-head"><h2>สร้างเคสบริการ</h2><button type="button" className="icon" onClick={onClose}>×</button></div>
   <p className="flow-note">ใช้สำหรับจุดติดตั้งเดิม เช่น เพิ่มอุปกรณ์ ถอดอุปกรณ์ เปลี่ยนอุปกรณ์ หรือซ่อม ระบบจะสร้างเป็นเคสให้ช่างรับงานต่อ</p>
   {error&&<div className="alert error">{error}</div>}
   <label>ลูกค้า / จุดติดตั้งเดิม
    <select required value={form.site_id} onChange={e=>setForm({...form,site_id:e.target.value})}>
     <option value="">-- เลือกจุดติดตั้งเดิม --</option>
     {sites.filter(site=>site.site_status==='active').map(site=><option value={site.site_id} key={site.site_id}>{site.customer_name} · {site.site_name}</option>)}
    </select>
   </label>
   <label>ประเภทเคส
    <select value={form.service_type} onChange={e=>setForm({...form,service_type:e.target.value})}>
     {serviceTypes.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}
    </select>
   </label>
   <label>รายละเอียดที่ต้องทำ
    <textarea required rows="4" value={form.detail} onChange={e=>setForm({...form,detail:e.target.value})} placeholder="เช่น เพิ่มกล้อง 2 ตัวที่โกดัง / ถอดเซนเซอร์ตัวเดิม / กล้องไม่ออนไลน์"/>
   </label>
   <label>วันที่รับเรื่อง
    <input type="datetime-local" required value={form.reported_at} onChange={e=>setForm({...form,reported_at:e.target.value})}/>
   </label>
   <button className="primary full" disabled={busy}>{busy?'กำลังสร้างเคส...':'สร้างเคสบริการ'}</button>
  </form>
 </div>;
}

export default function ProblemCasesPage({problems,sites,onClaim,onCreated}){
 const[filter,setFilter]=useState('open'),[claiming,setClaiming]=useState(null),[creating,setCreating]=useState(false),[error,setError]=useState('');
 const visible=problems.filter(item=>filter==='all'||item.problem_status===filter);
 const claim=async item=>{if(!confirm(`รับเคส #${item.problem_id} ของ ${item.customer_name} ใช่ไหม?`))return;setClaiming(item.problem_id);setError('');try{await onClaim(item.problem_id)}catch(x){setError(x.message)}finally{setClaiming(null)}};
 const caseType=item=>{
  const detail=String(item.symptom_detail||'');
  if(detail.startsWith('เพิ่มอุปกรณ์'))return 'เพิ่มอุปกรณ์';
  if(detail.startsWith('ถอดอุปกรณ์'))return 'ถอดอุปกรณ์';
  if(detail.startsWith('เปลี่ยนอุปกรณ์'))return 'เปลี่ยนอุปกรณ์';
  return 'ตรวจซ่อม';
 };
 return <>
  <div className="page-title"><div><h1>เคสรอรับงาน</h1><p>เคสคือเรื่องบริการของจุดติดตั้งเดิม รับเคสแล้วระบบจะสร้างเป็นงานของฉัน เช่น ซ่อม เพิ่มอุปกรณ์ ถอดอุปกรณ์ หรือเปลี่ยนอุปกรณ์</p></div><button className="primary compact" onClick={()=>setCreating(true)}>+ สร้างเคสบริการ</button></div>
  {error&&<div className="alert error">{error}</div>}
  <div className="tabs"><button className={filter==='open'?'active':''} onClick={()=>setFilter('open')}>รอรับเคส</button><button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>ทั้งหมด</button></div>
  <div className="case-list">{visible.map(item=><article className="case-card" key={item.problem_id}>
   <div className="case-card-head"><div><span>เคส #{item.problem_id} · {caseType(item)}</span><h2>{item.customer_name}</h2></div><JobStatusButton value={item.problem_status}/></div>
   <p className="case-site">📍 {item.site_name}</p><p>{item.symptom_detail}</p>
   <div className="case-meta"><span>รับแจ้ง {item.reported_at?new Date(String(item.reported_at).replace(' ','T')).toLocaleString('th-TH'):'-'}</span>{item.technician_name&&<span>ผู้รับผิดชอบ: {item.technician_name}</span>}</div>
   {item.problem_status==='open'?<button className="primary full" disabled={claiming===item.problem_id} onClick={()=>claim(item)}>{claiming===item.problem_id?'กำลังสร้างงาน...':'รับเคสเป็นงานของฉัน'}</button>:item.job_id&&<div className="case-linked">สร้างเป็นงานบริการแล้ว · งาน #{item.job_id}</div>}
  </article>)}{!visible.length&&<div className="empty">ไม่มีเคสในรายการนี้</div>}</div>
  {creating&&<CreateServiceCase sites={sites} onClose={()=>setCreating(false)} onCreated={async()=>{setCreating(false);await onCreated?.()}}/>}
 </>;
}
