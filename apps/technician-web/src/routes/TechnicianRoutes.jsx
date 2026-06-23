import {useState} from 'react';
import JobDetailPage from '../pages/JobDetailPage';
import MyJobsPage from '../pages/MyJobsPage';
import ProblemCasesPage from '../pages/ProblemCasesPage';

export default function TechnicianRoutes({jobs,problems,models,selected,onOpen,onBack,onCreate,onChanged,onClaim}){
 const[section,setSection]=useState('jobs');
 if(selected)return <JobDetailPage id={selected} models={models} onBack={onBack} onChanged={onChanged}/>;
 const claim=async problemId=>{await onClaim(problemId);setSection('jobs')};
 const openCount=problems.filter(item=>item.problem_status==='open').length;
 return <>
  <nav className="technician-primary-nav" aria-label="เมนูงานช่าง">
   <button className={section==='jobs'?'active':''} onClick={()=>setSection('jobs')}><b>งานของฉัน</b><small>งานที่รับแล้ว</small></button>
   <button className={section==='cases'?'active':''} onClick={()=>setSection('cases')}><b>เคสทั้งหมด {openCount>0&&<span>{openCount}</span>}</b><small>เคสรอรับงาน</small></button>
  </nav>
  {section==='jobs'?<MyJobsPage jobs={jobs} onOpen={onOpen} onCreate={onCreate}/>:<ProblemCasesPage problems={problems} onClaim={claim}/>}
 </>;
}
