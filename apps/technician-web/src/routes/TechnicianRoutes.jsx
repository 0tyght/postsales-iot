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
  <nav className="technician-primary-nav"><button className={section==='jobs'?'active':''} onClick={()=>setSection('jobs')}>งานของฉัน</button><button className={section==='cases'?'active':''} onClick={()=>setSection('cases')}>เคสทั้งหมด {openCount>0&&<span>{openCount}</span>}</button></nav>
  {section==='jobs'?<MyJobsPage jobs={jobs} onOpen={onOpen} onCreate={onCreate}/>:<ProblemCasesPage problems={problems} onClaim={claim}/>}
 </>;
}
