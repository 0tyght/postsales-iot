import {useState} from 'react';
import {api} from '../services/api';

const methodLabels={repair:'ซ่อม/ตั้งค่า',replace:'เปลี่ยนอุปกรณ์',add:'เพิ่มอุปกรณ์',remove:'ถอดอุปกรณ์'};
const deviceName=device=>`${device.brand?`${device.brand} `:''}${device.model_name} · ${device.serial_number}`;

export default function DeviceRepairForm({job,item,onReload,onError}){
 const[editing,setEditing]=useState(false),[saving,setSaving]=useState(false);
 const[form,setForm]=useState({...item,replacement_device_id:item.replacement_device_id||''});
 const editable=job.job_status==='in_progress';
 const installed=job.devices;
 const stock=job.available_devices||[];
 const deviceOptions=form.repair_method==='add'?stock:installed;
 const replacementOptions=stock.filter(device=>String(device.device_id)!==String(form.device_id));
 const patch=value=>setForm(current=>({...current,...value}));
 const save=async()=>{setSaving(true);try{await api(`/jobs/${job.job_id}/problem-devices/${item.problem_device_id}`,{method:'PUT',body:JSON.stringify(form)});setEditing(false);await onReload()}catch(x){onError(x.message)}finally{setSaving(false)}};
 const remove=async()=>{if(!confirm(`ลบรายการ ${methodLabels[item.repair_method]||'อุปกรณ์'} ${item.serial_number} ใช่ไหม?`))return;try{await api(`/jobs/${job.job_id}/problem-devices/${item.problem_device_id}`,{method:'DELETE'});await onReload()}catch(x){onError(x.message)}};
 if(editing)return <div className="repair-editor">
  <div className="editor-title"><b>แก้ไขรายการอุปกรณ์</b><button onClick={()=>setEditing(false)}>×</button></div>
  <div className="form-grid">
   <label>ประเภทงานอุปกรณ์
    <select value={form.repair_method} onChange={e=>patch({repair_method:e.target.value,device_id:'',replacement_device_id:''})}>
     <option value="repair">ซ่อม/ตั้งค่าอุปกรณ์เดิม</option>
     <option value="replace">เปลี่ยนอุปกรณ์เดิม</option>
     <option value="add">เพิ่มอุปกรณ์ใหม่ในจุดติดตั้งเดิม</option>
     <option value="remove">ถอด/ลดอุปกรณ์จากจุดติดตั้งเดิม</option>
    </select>
   </label>
   <label>{form.repair_method==='add'?'อุปกรณ์จากคลัง':'อุปกรณ์ในจุดติดตั้ง'}
    <select required value={form.device_id} onChange={e=>patch({device_id:e.target.value})}>
     <option value="">-- เลือกอุปกรณ์ --</option>
     {deviceOptions.map(device=><option value={device.device_id} key={device.device_id}>{deviceName(device)}</option>)}
    </select>
   </label>
   {form.repair_method==='replace'&&<label className="wide">อุปกรณ์ทดแทนจากคลัง
    <select required value={form.replacement_device_id} onChange={e=>patch({replacement_device_id:e.target.value})}>
     <option value="">-- เลือกอุปกรณ์ทดแทน --</option>
     {replacementOptions.map(device=><option value={device.device_id} key={device.device_id}>{deviceName(device)}</option>)}
    </select>
   </label>}
   <label className="wide">อาการ/เหตุผลที่ตรวจพบ<textarea required value={form.device_problem_detail||''} onChange={e=>patch({device_problem_detail:e.target.value})}/></label>
   <label className="wide">สิ่งที่ดำเนินการ<textarea required value={form.device_action_detail||''} onChange={e=>patch({device_action_detail:e.target.value})}/></label>
  </div>
  <div className="editor-actions"><button className="secondary" onClick={()=>setEditing(false)}>ยกเลิก</button><button className="primary" disabled={saving} onClick={save}>{saving?'กำลังบันทึก...':'บันทึกการแก้ไข'}</button></div>
 </div>;
 return <div className="repair-record">
  <div className="repair-record-head"><div><b>{item.model_name}</b><small>SN: {item.serial_number}</small></div><span>{methodLabels[item.repair_method]||item.repair_method}</span></div>
  <dl>
   <div><dt>อาการ/เหตุผล</dt><dd>{item.device_problem_detail||'-'}</dd></div>
   <div><dt>การดำเนินการ</dt><dd>{item.device_action_detail||'-'}</dd></div>
   {item.repair_method==='replace'&&<div><dt>อุปกรณ์ทดแทน</dt><dd>{item.replacement_model_name?`${item.replacement_model_name} · `:''}{item.replacement_serial||'-'}</dd></div>}
  </dl>
  {editable&&<div className="record-actions"><button onClick={()=>setEditing(true)}>แก้ไขรายละเอียด</button><button className="danger-action" onClick={remove}>ลบ</button></div>}
 </div>;
}
