import {useState} from 'react';
import JobStatusButton from '../components/JobStatusButton';

export default function ProblemCasesPage({problems,onClaim}){
 const[filter,setFilter]=useState('open'),[claiming,setClaiming]=useState(null),[error,setError]=useState('');
 const visible=problems.filter(item=>filter==='all'||item.problem_status===filter);
 const claim=async item=>{if(!confirm(`รับเคส #${item.problem_id} ของ ${item.customer_name} ใช่ไหม?`))return;setClaiming(item.problem_id);setError('');try{await onClaim(item.problem_id)}catch(x){setError(x.message)}finally{setClaiming(null)}};
 return <>
  <div className="page-title"><div><h1>เคสรอรับงาน</h1><p>เคสคือเรื่องที่ลูกค้าแจ้งเข้ามา เมื่อกดรับ ระบบจะสร้างเป็นงานซ่อมของฉัน</p></div></div>
  {error&&<div className="alert error">{error}</div>}
  <div className="tabs"><button className={filter==='open'?'active':''} onClick={()=>setFilter('open')}>รอรับเคส</button><button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>ทั้งหมด</button></div>
  <div className="case-list">{visible.map(item=><article className="case-card" key={item.problem_id}>
   <div className="case-card-head"><div><span>เคส #{item.problem_id}</span><h2>{item.customer_name}</h2></div><JobStatusButton value={item.problem_status}/></div>
   <p className="case-site">📍 {item.site_name}</p><p>{item.symptom_detail}</p>
   <div className="case-meta"><span>รับแจ้ง {item.reported_at?new Date(String(item.reported_at).replace(' ','T')).toLocaleString('th-TH'):'-'}</span>{item.technician_name&&<span>ผู้รับผิดชอบ: {item.technician_name}</span>}</div>
   {item.problem_status==='open'?<button className="primary full" disabled={claiming===item.problem_id} onClick={()=>claim(item)}>{claiming===item.problem_id?'กำลังสร้างงานซ่อม...':'รับเป็นงานซ่อม'}</button>:item.job_id&&<div className="case-linked">สร้างเป็นงานซ่อมแล้ว · งาน #{item.job_id}</div>}
  </article>)}{!visible.length&&<div className="empty">ไม่มีเคสในรายการนี้</div>}</div>
 </>;
}
