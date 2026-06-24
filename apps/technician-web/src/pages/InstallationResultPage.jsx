import {useState} from 'react';
import {api} from '../services/api';

const emptyDevice={model_id:'',serial_number:'',purchase_date:'',warranty_years:1};
const dateValue=value=>value?String(value).slice(0,10):'';
const deviceName=item=>`${item.brand?`${item.brand} `:''}${item.model_name||'อุปกรณ์'} · SN: ${item.serial_number}`;

function InstalledDeviceRow({item,job,models,editable,onReload,onError}){
 const[editing,setEditing]=useState(false);
 const[saving,setSaving]=useState(false);
 const[form,setForm]=useState({
  model_id:item.model_id||'',
  serial_number:item.serial_number||'',
  purchase_date:dateValue(item.purchase_date),
  warranty_years:item.warranty_years||1,
  device_status:item.device_status||'active',
 });

 const save=async event=>{
  event.preventDefault();
  setSaving(true);
  onError('');
  try{
   await api(`/devices/units/${item.device_id}`,{
    method:'PUT',
    body:JSON.stringify({...form,site_id:job.site_id,installation_job_id:job.job_id}),
   });
   setEditing(false);
   await onReload();
  }catch(x){
   onError(x.message);
  }finally{
   setSaving(false);
  }
 };

 if(editing){
  return <form className="device-editor" onSubmit={save}>
   <div className="editor-title">
    <b>แก้ไขอุปกรณ์ที่ติดตั้ง</b>
    <button type="button" onClick={()=>setEditing(false)}>×</button>
   </div>
   <div className="form-grid">
    <label>รุ่นอุปกรณ์
     <select required value={form.model_id} onChange={e=>setForm({...form,model_id:e.target.value})}>
      <option value="">-- เลือกรุ่น --</option>
      {models.map(model=><option value={model.model_id} key={model.model_id}>{model.brand} {model.model_name}</option>)}
     </select>
    </label>
    <label>Serial Number<input required value={form.serial_number} onChange={e=>setForm({...form,serial_number:e.target.value})}/></label>
    <label>วันที่ซื้อ<input required type="date" value={form.purchase_date} onChange={e=>setForm({...form,purchase_date:e.target.value})}/></label>
    <label>ระยะประกันสินค้า (ปี)<input required type="number" min="1" value={form.warranty_years} onChange={e=>setForm({...form,warranty_years:e.target.value})}/></label>
    <label>สถานะ
     <select value={form.device_status} onChange={e=>setForm({...form,device_status:e.target.value})}>
      <option value="active">ใช้งานอยู่</option>
      <option value="inactive">เลิกใช้งาน</option>
     </select>
    </label>
   </div>
   <div className="editor-actions">
    <button type="button" className="secondary" onClick={()=>setEditing(false)}>ยกเลิก</button>
    <button className="primary" disabled={saving}>{saving?'กำลังบันทึก...':'บันทึกอุปกรณ์'}</button>
   </div>
  </form>;
 }

 return <div className="device-row device-row-editable">
  <div>
   <b>{deviceName(item)}</b>
   {item.purchase_date&&<small>ซื้อเมื่อ {new Date(item.purchase_date).toLocaleDateString('th-TH')} · ประกัน {item.warranty_years||'-'} ปี</small>}
   {item.warranty_end_date&&<small>หมดประกัน {new Date(item.warranty_end_date).toLocaleDateString('th-TH')}</small>}
  </div>
  <div className="device-actions">
   <span>{item.device_status==='active'?'ใช้งานอยู่':item.device_status}</span>
   {editable&&<button type="button" onClick={()=>setEditing(true)}>แก้ไข</button>}
  </div>
 </div>;
}

function AddInventoryDeviceDialog({models,onClose,onCreated,onError}){
 const[form,setForm]=useState(emptyDevice);
 const[busy,setBusy]=useState(false);
 const submit=async event=>{
  event.preventDefault();
  setBusy(true);
  onError('');
  try{
   const data=await api('/devices/units',{
    method:'POST',
    body:JSON.stringify({...form,site_id:null,installation_job_id:null,device_status:'active'}),
   });
   onCreated(data.device_id);
  }catch(x){
   onError(x.message);
  }finally{
   setBusy(false);
  }
 };

 return <div className="backdrop nested-backdrop">
  <form className="sheet inventory-device-sheet" onSubmit={submit}>
   <div className="sheet-head">
    <h2>เพิ่มอุปกรณ์จริงเข้าคลัง</h2>
    <button type="button" className="icon" onClick={onClose}>×</button>
   </div>
   <p>ใช้กรณีอุปกรณ์ที่นำมาติดตั้งยังไม่ถูกลงทะเบียนไว้ในระบบ รุ่นอุปกรณ์ให้เพิ่มจากเมนูรุ่นอุปกรณ์แยกต่างหาก</p>
   <div className="form-grid">
    <label>รุ่นอุปกรณ์
     <select required value={form.model_id} onChange={e=>setForm({...form,model_id:e.target.value})}>
      <option value="">-- เลือกรุ่น --</option>
      {models.map(model=><option value={model.model_id} key={model.model_id}>{model.brand} {model.model_name}</option>)}
     </select>
    </label>
    <label>Serial Number<input required value={form.serial_number} onChange={e=>setForm({...form,serial_number:e.target.value})}/></label>
    <label>วันที่ซื้อ<input required type="date" value={form.purchase_date} onChange={e=>setForm({...form,purchase_date:e.target.value})}/></label>
    <label>ระยะประกันสินค้า (ปี)<input required type="number" min="1" value={form.warranty_years} onChange={e=>setForm({...form,warranty_years:e.target.value})}/></label>
   </div>
   <div className="editor-actions">
    <button type="button" className="secondary" onClick={onClose}>ยกเลิก</button>
    <button className="primary" disabled={busy}>{busy?'กำลังเพิ่ม...':'เพิ่มเข้าคลัง'}</button>
   </div>
  </form>
 </div>;
}

export default function InstallationResultPage({job,models,onReload}){
 const[selectedDeviceId,setSelectedDeviceId]=useState('');
 const[addingDevice,setAddingDevice]=useState(false);
 const[result,setResult]=useState({
  installation_result:job.installation_result||'',
  install_location_detail:job.install_location_detail||'',
  test_result:job.test_result||'',
  test_detail:job.test_detail||'',
  installation_note:job.installation_note||'',
  result_summary:job.result_summary||'',
 });
 const[error,setError]=useState('');
 const[busy,setBusy]=useState(false);
 const installed=job.devices.filter(item=>item.installation_job_id===job.job_id);
 const availableDevices=job.available_devices||[];
 const editable=job.job_status!=='completed';

 const attach=async event=>{
  event.preventDefault();
  const picked=availableDevices.find(item=>String(item.device_id)===String(selectedDeviceId));
  if(!picked){setError('กรุณาเลือกอุปกรณ์จริงจากคลังก่อน');return;}
  setBusy(true);
  setError('');
  try{
   await api(`/devices/units/${picked.device_id}`,{
    method:'PUT',
    body:JSON.stringify({
     model_id:picked.model_id,
     serial_number:picked.serial_number,
     purchase_date:dateValue(picked.purchase_date),
     warranty_years:picked.warranty_years||1,
     device_status:picked.device_status||'active',
     site_id:job.site_id,
     installation_job_id:job.job_id,
    }),
   });
   setSelectedDeviceId('');
   await onReload();
  }catch(x){
   setError(x.message);
  }finally{
   setBusy(false);
  }
 };

 const save=async()=>{
  setError('');
  try{
   await api(`/jobs/${job.job_id}/result`,{method:'PUT',body:JSON.stringify(result)});
   await onReload();
  }catch(x){
   setError(x.message);
  }
 };

 const createdDevice=async deviceId=>{
  setAddingDevice(false);
  await onReload();
  setSelectedDeviceId(String(deviceId));
 };

 return <>
  <section className="work-card">
   <div className="section-title">
    <span className={installed.length?'done':'todo'}>{installed.length?'✓':'1'}</span>
    <div><h3>อุปกรณ์ที่ติดตั้ง</h3><p>{installed.length} ชิ้นในงานนี้ เลือกจากอุปกรณ์จริงในคลังที่ยังไม่ได้ติดตั้ง</p></div>
   </div>
   {error&&<div className="alert error">{error}</div>}
   {installed.map(item=><InstalledDeviceRow key={item.device_id} item={item} job={job} models={models} editable={editable} onReload={onReload} onError={setError}/>)}
   {editable&&<form className="inline-form install-device-picker" onSubmit={attach}>
    <label className="wide">เลือกอุปกรณ์จริงที่ยังไม่ได้ติดตั้ง
     <select value={selectedDeviceId} onChange={e=>setSelectedDeviceId(e.target.value)}>
      <option value="">-- เลือกจากคลังอุปกรณ์ --</option>
      {availableDevices.map(item=><option value={item.device_id} key={item.device_id}>{deviceName(item)}</option>)}
     </select>
     <small>{availableDevices.length?`มีอุปกรณ์พร้อมติดตั้ง ${availableDevices.length} ชิ้น`:'ยังไม่มีอุปกรณ์ในคลังที่พร้อมติดตั้ง'}</small>
    </label>
    <button type="button" className="secondary add-model-button" onClick={()=>setAddingDevice(true)}>+ เพิ่มอุปกรณ์จริง</button>
    <button className="secondary add" disabled={busy||!selectedDeviceId}>{busy?'กำลังผูกอุปกรณ์...':'+ ติดตั้งอุปกรณ์ที่เลือก'}</button>
   </form>}
  </section>

  <section className="work-card">
   <div className="section-title">
    <span className={result.installation_result&&result.test_result?'done':'todo'}>{result.installation_result&&result.test_result?'✓':'2'}</span>
    <div><h3>ผลติดตั้งและทดสอบ</h3><p>บันทึกผลก่อนปิดงาน</p></div>
   </div>
   <div className="form-grid">
    <label>ผลติดตั้ง
     <select disabled={!editable} value={result.installation_result} onChange={e=>setResult({...result,installation_result:e.target.value})}>
      <option value="">-- เลือก --</option>
      <option value="success">สำเร็จ</option>
      <option value="failed">ไม่สำเร็จ</option>
     </select>
    </label>
    <label>ผลทดสอบ
     <select disabled={!editable} value={result.test_result} onChange={e=>setResult({...result,test_result:e.target.value})}>
      <option value="">-- เลือก --</option>
      <option value="pass">ผ่าน</option>
      <option value="fail">ไม่ผ่าน</option>
     </select>
    </label>
    <label className="wide">ตำแหน่งติดตั้ง<textarea disabled={!editable} value={result.install_location_detail} onChange={e=>setResult({...result,install_location_detail:e.target.value})}/></label>
    <label className="wide">รายละเอียดทดสอบ<textarea disabled={!editable} value={result.test_detail} onChange={e=>setResult({...result,test_detail:e.target.value})}/></label>
    <label className="wide">สรุปงาน<textarea disabled={!editable} value={result.result_summary} onChange={e=>setResult({...result,result_summary:e.target.value})}/></label>
   </div>
   {editable&&<button className="secondary full" onClick={save}>บันทึกผล</button>}
  </section>
  {addingDevice&&<AddInventoryDeviceDialog models={models} onClose={()=>setAddingDevice(false)} onCreated={createdDevice} onError={setError}/>}
 </>;
}
