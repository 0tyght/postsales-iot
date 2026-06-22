import {useState} from 'react';
import {api} from '../services/api';

export default function InstallationResultPage({job,models,onReload}){
 const[device,setDevice]=useState({model_id:'',serial_number:'',warranty_end_date:''});
 const[result,setResult]=useState({installation_result:job.installation_result||'',install_location_detail:job.install_location_detail||'',test_result:job.test_result||'',test_detail:job.test_detail||'',installation_note:job.installation_note||'',result_summary:job.result_summary||''});
 const[error,setError]=useState('');
 const installed=job.devices.filter(item=>item.installation_job_id===job.job_id),editable=job.job_status!=='completed';
 const add=async event=>{event.preventDefault();setError('');try{await api('/devices/units',{method:'POST',body:JSON.stringify({...device,site_id:job.site_id,installation_job_id:job.job_id,device_status:'active'})});setDevice({model_id:'',serial_number:'',warranty_end_date:''});await onReload()}catch(x){setError(x.message)}};
 const save=async()=>{setError('');try{await api(`/jobs/${job.job_id}/result`,{method:'PUT',body:JSON.stringify(result)});await onReload()}catch(x){setError(x.message)}};
 return <>
  <section className="work-card">
   <div className="section-title"><span className={installed.length?'done':'todo'}>{installed.length?'✓':'1'}</span><div><h3>อุปกรณ์ที่ติดตั้ง</h3><p>{installed.length} ชิ้นในงานนี้</p></div></div>
   {installed.map(item=><div className="device-row" key={item.device_id}><div><b>{item.model_name}</b><small>SN: {item.serial_number}</small></div><span>ใช้งาน</span></div>)}
   {editable&&<form className="inline-form" onSubmit={add}>{error&&<div className="alert error full-grid">{error}</div>}<label>รุ่นอุปกรณ์<select required value={device.model_id} onChange={e=>setDevice({...device,model_id:e.target.value})}><option value="">-- เลือกรุ่น --</option>{models.map(model=><option value={model.model_id} key={model.model_id}>{model.brand} {model.model_name}</option>)}</select></label><label>Serial Number<input required value={device.serial_number} onChange={e=>setDevice({...device,serial_number:e.target.value})}/></label><label>วันหมดประกัน<input type="date" value={device.warranty_end_date} onChange={e=>setDevice({...device,warranty_end_date:e.target.value})}/></label><button className="secondary add">+ เพิ่มอุปกรณ์</button></form>}
  </section>
  <section className="work-card">
   <div className="section-title"><span className={result.installation_result&&result.test_result?'done':'todo'}>{result.installation_result&&result.test_result?'✓':'2'}</span><div><h3>ผลติดตั้งและทดสอบ</h3><p>บันทึกก่อนปิดงาน</p></div></div>
   <div className="form-grid"><label>ผลติดตั้ง<select disabled={!editable} value={result.installation_result} onChange={e=>setResult({...result,installation_result:e.target.value})}><option value="">-- เลือก --</option><option value="success">สำเร็จ</option><option value="failed">ไม่สำเร็จ</option></select></label><label>ผลทดสอบ<select disabled={!editable} value={result.test_result} onChange={e=>setResult({...result,test_result:e.target.value})}><option value="">-- เลือก --</option><option value="pass">ผ่าน</option><option value="fail">ไม่ผ่าน</option></select></label><label className="wide">ตำแหน่งติดตั้ง<textarea disabled={!editable} value={result.install_location_detail} onChange={e=>setResult({...result,install_location_detail:e.target.value})}/></label><label className="wide">รายละเอียดทดสอบ<textarea disabled={!editable} value={result.test_detail} onChange={e=>setResult({...result,test_detail:e.target.value})}/></label><label className="wide">สรุปงาน<textarea disabled={!editable} value={result.result_summary} onChange={e=>setResult({...result,result_summary:e.target.value})}/></label></div>
   {editable&&<button className="secondary full" onClick={save}>บันทึกผล</button>}
  </section>
 </>;
}
