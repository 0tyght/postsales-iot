import {useState} from 'react';
import UploadImage from '../components/UploadImage';
import {api} from '../services/api';

export default function UploadEvidencePage({job,onReload}){
 const[files,setFiles]=useState([]),[type,setType]=useState('after'),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const editable=job.job_status==='in_progress';
 const upload=async()=>{
  if(!files.length)return;setBusy(true);setError('');
  try{const body=new FormData();body.append('evidence_type',type);[...files].forEach(file=>body.append('photos',file));await api(`/jobs/${job.job_id}/evidence`,{method:'POST',body});setFiles([]);await onReload()}
  catch(x){setError(x.message)}finally{setBusy(false)}
 };
 const remove=async id=>{if(!confirm('ลบรูปนี้ใช่ไหม?'))return;try{await api(`/jobs/${job.job_id}/evidence/${id}`,{method:'DELETE'});await onReload()}catch(x){setError(x.message)}};
 return <section className="work-card">
  <div className="section-title"><span className={job.evidence.length?'done':'todo'}>{job.evidence.length?'✓':'3'}</span><div><h3>รูปหลักฐาน</h3><p>แตะรูปเพื่อเปิดดู · อย่างน้อย 1 รูปก่อนปิดงาน</p></div></div>
  {error&&<div className="alert error">{error}</div>}
  <div className="evidence-grid">{job.evidence.map(item=><UploadImage key={item.evidence_id} jobId={job.job_id} item={item} editable={editable} onRemove={remove}/>)}</div>
  {editable&&<><div className="upload-row"><select value={type} onChange={e=>setType(e.target.value)}><option value="before">ก่อนทำ</option><option value="during">ระหว่างทำ</option><option value="after">หลังทำ</option><option value="result">ผลทดสอบ</option></select><label className="file-button">ถ่าย/เลือกรูป<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" multiple onChange={e=>setFiles(e.target.files)}/></label></div>{files.length>0&&<button className="primary full" disabled={busy} onClick={upload}>{busy?'กำลังอัปโหลด...':`อัปโหลด ${files.length} รูป`}</button>}</>}
 </section>;
}
