import {useState} from 'react';
import JobDetailPage from '../pages/JobDetailPage';
import MyJobsPage from '../pages/MyJobsPage';
import ProblemCasesPage from '../pages/ProblemCasesPage';
import DevicesPage from '../pages/DevicesPage';

export default function TechnicianRoutes({jobs,problems,models,devices,selected,onOpen,onBack,onCreate,onChanged,onClaim}){
 const[section,setSection]=useState('jobs');
 if(selected)return <JobDetailPage id={selected} models={models} onBack={onBack} onChanged={onChanged}/>;
 const claim=async problemId=>{await onClaim(problemId);setSection('jobs')};
 const openCount=problems.filter(item=>item.problem_status==='open').length;
 const stockCount=devices.filter(item=>!item.site_id&&!item.installation_job_id).length;
 return <>
  <nav className="technician-primary-nav" aria-label="เมนูงานช่าง">
   <button className={section==='jobs'?'active':''} onClick={()=>setSection('jobs')}><b>งานของฉัน</b><small>งานที่รับแล้ว</small></button>
   <button className={section==='cases'?'active':''} onClick={()=>setSection('cases')}><b>เคสรอรับ {openCount>0&&<span>{openCount}</span>}</b><small>รับแล้วจะเป็นงานซ่อม</small></button>
   <button className={section==='devices'?'active':''} onClick={()=>setSection('devices')}><b>อุปกรณ์ {stockCount>0&&<span>{stockCount}</span>}</b><small>เพิ่มของเข้าคลังก่อนติดตั้ง</small></button>
  </nav>
  {section==='jobs'
   ?<MyJobsPage jobs={jobs} onOpen={onOpen} onCreate={onCreate}/>
   :section==='cases'
    ?<ProblemCasesPage problems={problems} onClaim={claim}/>
    :<DevicesPage devices={devices} models={models} onChanged={onChanged}/>}
 </>;
}
