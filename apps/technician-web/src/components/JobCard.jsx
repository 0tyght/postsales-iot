import {labels} from '../constants';
import JobStatusButton from './JobStatusButton';

export default function JobCard({job,onOpen}){
 return <button className="job-card" onClick={()=>onOpen(job.job_id)}>
  <div className="job-top">
   <span className={`type ${job.job_type}`}>{labels[job.job_type]}</span>
   <JobStatusButton value={job.job_status}/>
  </div>
  <h2>{job.customer_name}</h2>
  <p>📍 {job.site_name}</p>
  <small>{job.scheduled_at?new Date(job.scheduled_at).toLocaleString('th-TH'):'ยังไม่กำหนดวัน'} · งาน #{job.job_id}</small>
  {job.symptom_detail&&<div className="problem">อาการ: {job.symptom_detail}</div>}
 </button>;
}
