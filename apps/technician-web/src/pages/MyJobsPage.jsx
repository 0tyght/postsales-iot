import {useState} from 'react';
import JobCard from '../components/JobCard';

export default function MyJobsPage({jobs,onOpen,onCreate}){
 const[tab,setTab]=useState('active');
 const visible=jobs.filter(job=>tab==='active'?['created','in_progress'].includes(job.job_status):job.job_status===tab);
 return <>
  <div className="page-title"><div><h1>งานของฉัน</h1><p>งานที่ฉันรับผิดชอบ กดเข้าไปเพื่อเริ่มงาน บันทึกอุปกรณ์ แนบรูป และปิดงาน</p></div><button className="primary compact" onClick={onCreate}>+ งานติดตั้งใหม่</button></div>
  <div className="tabs">
   <button className={tab==='active'?'active':''} onClick={()=>setTab('active')}>งานปัจจุบัน</button>
   <button className={tab==='completed'?'active':''} onClick={()=>setTab('completed')}>ปิดงานแล้ว</button>
   <button className={tab==='cancelled'?'active':''} onClick={()=>setTab('cancelled')}>ยกเลิก</button>
  </div>
  <div className="job-list">{visible.map(job=><JobCard key={job.job_id} job={job} onOpen={onOpen}/>)}{!visible.length&&<div className="empty">ไม่มีงานในหมวดนี้</div>}</div>
 </>;
}
