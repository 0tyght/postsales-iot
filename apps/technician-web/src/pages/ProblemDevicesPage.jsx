import {useState} from 'react';
import DeviceRepairForm from '../components/DeviceRepairForm';
import {api} from '../services/api';

const emptyItem={device_id:'',repair_method:'repair',replacement_device_id:'',device_problem_detail:'',device_action_detail:''};

export default function ProblemDevicesPage({job,onReload,onError}){
 const[item,setItem]=useState(emptyItem),editable=job.job_status==='in_progress';
 const available=job.devices.filter(device=>!job.problem_devices.some(record=>String(record.device_id)===String(device.device_id)));
 const add=async event=>{event.preventDefault();onError('');try{await api(`/jobs/${job.job_id}/problem-devices`,{method:'POST',body:JSON.stringify(item)});setItem(emptyItem);await onReload()}catch(x){onError(x.message)}};
 return <section className="work-card">
  <div className="section-title"><span className={job.problem_devices.length?'done':'todo'}>{job.problem_devices.length?'✓':'1'}</span><div><h3>อุปกรณ์ที่พบปัญหา</h3><p>บันทึกและแก้ไขได้จนกว่าจะปิดงาน</p></div></div>
  {job.problem_devices.map(record=><DeviceRepairForm key={record.problem_device_id} job={job} item={record} onReload={onReload} onError={onError}/>)}
  {editable&&<form className="inline-form repair-add-form" onSubmit={add}>
   <label>อุปกรณ์<select required value={item.device_id} onChange={e=>setItem({...item,device_id:e.target.value})}><option value="">-- เลือกอุปกรณ์ --</option>{available.map(device=><option value={device.device_id} key={device.device_id}>{device.model_name} · {device.serial_number}</option>)}</select></label>
   <label>วิธีดำเนินการ<select value={item.repair_method} onChange={e=>setItem({...item,repair_method:e.target.value,replacement_device_id:''})}><option value="repair">ซ่อม</option><option value="replace">เปลี่ยน</option></select></label>
   {item.repair_method==='replace'&&<label className="wide">อุปกรณ์ทดแทนที่ลงทะเบียนแล้ว<select required value={item.replacement_device_id} onChange={e=>setItem({...item,replacement_device_id:e.target.value})}><option value="">-- เลือกอุปกรณ์ทดแทน --</option>{job.devices.filter(device=>String(device.device_id)!==String(item.device_id)).map(device=><option value={device.device_id} key={device.device_id}>{device.model_name} · {device.serial_number}</option>)}</select></label>}
   <label className="wide">อาการที่ตรวจพบ *<textarea required rows="3" value={item.device_problem_detail} onChange={e=>setItem({...item,device_problem_detail:e.target.value})}/></label>
   <label className="wide">สิ่งที่ดำเนินการ *<textarea required rows="3" value={item.device_action_detail} onChange={e=>setItem({...item,device_action_detail:e.target.value})}/></label>
   <button className="secondary add" disabled={!available.length}>+ เพิ่มรายการซ่อม</button>
  </form>}
 </section>;
}
