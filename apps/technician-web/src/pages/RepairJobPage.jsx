import {useState} from 'react';
import ProblemDevicesPage from './ProblemDevicesPage';
import {api} from '../services/api';

export default function RepairJobPage({job,onReload}){
 const[result,setResult]=useState({repair_summary:job.repair_summary||'',repair_note:job.repair_note||'',result_summary:job.result_summary||''});
 const[error,setError]=useState(''),[saved,setSaved]=useState(''),editable=job.job_status==='in_progress';
 const save=async()=>{setError('');setSaved('');try{await api(`/jobs/${job.job_id}/result`,{method:'PUT',body:JSON.stringify(result)});setSaved('บันทึกผลการซ่อมแล้ว');await onReload()}catch(x){setError(x.message)}};
 return <>
  {error&&<div className="alert error">{error}</div>}
  <ProblemDevicesPage job={job} onReload={onReload} onError={setError}/>
  <section className="work-card">
   <div className="section-title"><span className={result.repair_summary?'done':'todo'}>{result.repair_summary?'✓':'2'}</span><div><h3>สรุปการซ่อม</h3><p>ผลที่ลูกค้าและผู้ประสานงานต้องทราบ</p></div></div>
   {saved&&<div className="alert success">{saved}</div>}
   <div className="form-grid"><label className="wide">สรุปการซ่อม *<textarea disabled={!editable} rows="4" value={result.repair_summary} onChange={e=>setResult({...result,repair_summary:e.target.value})}/></label><label className="wide">ผลรวมและคำแนะนำลูกค้า<textarea disabled={!editable} rows="3" value={result.result_summary} onChange={e=>setResult({...result,result_summary:e.target.value})}/></label><label className="wide">หมายเหตุภายในสำหรับทีมช่าง<textarea disabled={!editable} rows="3" value={result.repair_note} onChange={e=>setResult({...result,repair_note:e.target.value})}/></label></div>
   {editable&&<button className="secondary full" disabled={!result.repair_summary.trim()} onClick={save}>บันทึกผลการซ่อม</button>}
  </section>
 </>;
}
