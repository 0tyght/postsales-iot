import {useEffect,useState} from 'react';
import {labels} from '../constants';
import JobStatusButton from '../components/JobStatusButton';
import InstallationResultPage from './InstallationResultPage';
import RepairJobPage from './RepairJobPage';
import UploadEvidencePage from './UploadEvidencePage';
import {api} from '../services/api';

export default function JobDetailPage({id,models,onBack,onChanged}){
 const[job,setJob]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const load=async()=>{try{setJob(await api(`/jobs/${id}`));setError('')}catch(x){setError(x.message)}};
 useEffect(()=>{let active=true;api(`/jobs/${id}`).then(data=>{if(active)setJob(data)}).catch(x=>{if(active)setError(x.message)});return()=>{active=false}},[id]);
 const action=async path=>{setBusy(true);setError('');try{await api(`/jobs/${id}/${path}`,{method:'POST'});await load();await onChanged()}catch(x){setError(x.message)}finally{setBusy(false)}};
 if(!job)return <div className="loading">{error||'กำลังโหลดงาน...'}</div>;
 return <>
  <button className="back" onClick={onBack}>‹ กลับไปงานของฉัน</button>
  <div className="detail-hero"><div><span className={`type ${job.job_type}`}>{labels[job.job_type]}</span><h1>{job.customer_name}</h1><p>📍 {job.site_name}</p></div><JobStatusButton value={job.job_status}/></div>
  <div className="job-facts"><div><small>เลขที่งาน</small><b>#{job.job_id}</b></div><div><small>กำหนดเข้าหน้างาน</small><b>{job.scheduled_at?new Date(job.scheduled_at).toLocaleString('th-TH'):'ยังไม่กำหนด'}</b></div><div><small>เริ่มงานจริง</small><b>{job.started_at?new Date(job.started_at).toLocaleString('th-TH'):'ยังไม่เริ่ม'}</b></div><div><small>เสร็จงาน</small><b>{job.completed_at?new Date(job.completed_at).toLocaleString('th-TH'):'ยังไม่เสร็จ'}</b></div></div>
  <div className="contact-card"><div><b>{job.customer_phone||'ไม่มีเบอร์โทร'}</b><small>{job.site_address||'ไม่มีที่อยู่'}</small></div>{job.customer_phone&&<a href={`tel:${job.customer_phone}`}>โทรหาลูกค้า</a>}</div>
  {job.job_note&&<div className="info-card"><b>รายละเอียดจากผู้ประสานงาน</b><p>{job.job_note}</p></div>}
  {job.symptom_detail&&<div className="alert problem-box"><b>อาการที่ลูกค้าแจ้ง</b><p>{job.symptom_detail}</p></div>}
  {error&&<div className="alert error">{error}</div>}
  {job.job_status==='created'?<div className="start-card"><h2>พร้อมเริ่มงานหรือยัง?</h2><p>ตรวจสอบลูกค้า สถานที่ และรายละเอียดงานก่อน เมื่อถึงหน้างานแล้วจึงกดเริ่มงาน</p><button className="primary full" disabled={busy} onClick={()=>action('start')}>เริ่มงาน</button></div>
  :job.job_status==='cancelled'?<div className="cancelled-card"><b>งานนี้ถูกยกเลิก</b><p>ดูรายละเอียดได้ แต่ไม่สามารถบันทึกหรือแก้ไขข้อมูลหน้างาน</p></div>
  :<>{job.job_type==='installation'?<InstallationResultPage job={job} models={models} onReload={load} onModelsChanged={onChanged}/>:<RepairJobPage job={job} onReload={load}/>}<UploadEvidencePage job={job} onReload={load}/>{job.job_status==='in_progress'&&<div className="complete-bar"><div><b>ตรวจข้อมูลให้ครบก่อนปิดงาน</b><small>ปิดแล้วจะแก้ไขจากหน้าช่างไม่ได้</small></div><button className="primary" disabled={busy} onClick={()=>action('complete')}>ปิดงาน</button></div>}{job.job_status==='completed'&&<div className="success-card">✓ งานนี้ปิดเรียบร้อยแล้ว</div>}</>}
 </>;
}
