import {useState} from 'react';
import DeviceRepairForm from '../components/DeviceRepairForm';
import {api} from '../services/api';

const emptyItem={device_id:'',repair_method:'repair',replacement_device_id:'',device_problem_detail:'',device_action_detail:''};
const methodLabels={repair:'ซ่อม/ตั้งค่า',replace:'เปลี่ยนอุปกรณ์',add:'เพิ่มอุปกรณ์',remove:'ถอดอุปกรณ์'};
const deviceName=device=>`${device.brand?`${device.brand} `:''}${device.model_name} · ${device.serial_number}`;

export default function ProblemDevicesPage({job,onReload,onError}){
 const[item,setItem]=useState(emptyItem),editable=job.job_status==='in_progress';
 const usedIds=job.problem_devices.map(record=>String(record.device_id));
 const installed=job.devices.filter(device=>!usedIds.includes(String(device.device_id)));
 const stock=job.available_devices||[];
 const isAdd=item.repair_method==='add';
 const deviceOptions=isAdd?stock:installed;
 const replacementOptions=stock.filter(device=>String(device.device_id)!==String(item.device_id));
 const patch=value=>setItem(current=>({...current,...value}));
 const add=async event=>{
  event.preventDefault();
  onError('');
  try{
   await api(`/jobs/${job.job_id}/problem-devices`,{method:'POST',body:JSON.stringify(item)});
   setItem(emptyItem);
   await onReload();
  }catch(x){onError(x.message)}
 };
 const detailLabel=isAdd?'เหตุผลที่เพิ่มอุปกรณ์ *':item.repair_method==='remove'?'เหตุผลที่ถอดอุปกรณ์ *':'อาการ/เหตุผลที่ตรวจพบ *';
 return <section className="work-card">
  <div className="section-title"><span className={job.problem_devices.length?'done':'todo'}>{job.problem_devices.length?'✓':'1'}</span><div><h3>รายการอุปกรณ์ในเคส</h3><p>เพิ่มรายการที่ต้องดำเนินการในจุดติดตั้งเดิม เช่น ซ่อม เปลี่ยน เพิ่ม หรือถอดอุปกรณ์</p></div></div>
  {job.problem_devices.map(record=><DeviceRepairForm key={record.problem_device_id} job={job} item={record} onReload={onReload} onError={onError}/>)}
  {editable&&<form className="inline-form repair-add-form" onSubmit={add}>
   <label>ประเภทงานอุปกรณ์
    <select value={item.repair_method} onChange={e=>patch({repair_method:e.target.value,device_id:'',replacement_device_id:''})}>
     <option value="repair">ซ่อม/ตั้งค่าอุปกรณ์เดิม</option>
     <option value="replace">เปลี่ยนอุปกรณ์เดิม</option>
     <option value="add">เพิ่มอุปกรณ์ใหม่ในจุดติดตั้งเดิม</option>
     <option value="remove">ถอด/ลดอุปกรณ์จากจุดติดตั้งเดิม</option>
    </select>
   </label>
   <label>{isAdd?'อุปกรณ์จากคลัง':'อุปกรณ์ในจุดติดตั้ง'}
    <select required value={item.device_id} onChange={e=>patch({device_id:e.target.value})}>
     <option value="">-- เลือกอุปกรณ์ --</option>
     {deviceOptions.map(device=><option value={device.device_id} key={device.device_id}>{deviceName(device)}</option>)}
    </select>
    <small>{isAdd?`${stock.length} ชิ้นในคลังที่พร้อมติดตั้ง`:`${installed.length} ชิ้นในจุดติดตั้งที่ยังไม่อยู่ในรายการเคส`}</small>
   </label>
   {item.repair_method==='replace'&&<label className="wide">อุปกรณ์ทดแทนจากคลัง
    <select required value={item.replacement_device_id} onChange={e=>patch({replacement_device_id:e.target.value})}>
     <option value="">-- เลือกอุปกรณ์ทดแทน --</option>
     {replacementOptions.map(device=><option value={device.device_id} key={device.device_id}>{deviceName(device)}</option>)}
    </select>
   </label>}
   <label className="wide">{detailLabel}<textarea required rows="3" value={item.device_problem_detail} onChange={e=>patch({device_problem_detail:e.target.value})} placeholder={isAdd?'เช่น เพิ่มกล้องที่ประตูหลัง 1 ตัว':'เช่น กล้องไม่ออนไลน์ / ลูกค้าขอถอดอุปกรณ์'}/></label>
   <label className="wide">สิ่งที่ดำเนินการ *<textarea required rows="3" value={item.device_action_detail} onChange={e=>patch({device_action_detail:e.target.value})} placeholder="เช่น ติดตั้งและทดสอบแล้ว / ถอดอุปกรณ์และแจ้งลูกค้าแล้ว"/></label>
   <button className="secondary add" disabled={!deviceOptions.length}>+ เพิ่มรายการ{methodLabels[item.repair_method]}</button>
  </form>}
 </section>;
}
