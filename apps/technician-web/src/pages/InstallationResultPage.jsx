import {useState} from 'react';
import {api} from '../services/api';

const emptyDevice={model_id:'',serial_number:'',purchase_date:'',warranty_years:1};
const emptyModel={brand:'',model_name:'',description:'',specification:''};
const dateValue=value=>value?String(value).slice(0,10):'';

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
   <div className="editor-title"><b>แก้ไขอุปกรณ์</b><button type="button" onClick={()=>setEditing(false)}>×</button></div>
   <div className="form-grid">
    <label>รุ่นอุปกรณ์<select required value={form.model_id} onChange={e=>setForm({...form,model_id:e.target.value})}><option value="">-- เลือกรุ่น --</option>{models.map(model=><option value={model.model_id} key={model.model_id}>{model.brand} {model.model_name}</option>)}</select></label>
    <label>Serial Number<input required value={form.serial_number} onChange={e=>setForm({...form,serial_number:e.target.value})}/></label>
    <label>วันที่ซื้อ<input required type="date" value={form.purchase_date} onChange={e=>setForm({...form,purchase_date:e.target.value})}/></label>
    <label>ระยะประกัน (ปี)<input required type="number" min="1" value={form.warranty_years} onChange={e=>setForm({...form,warranty_years:e.target.value})}/></label>
    <label>สถานะ<select value={form.device_status} onChange={e=>setForm({...form,device_status:e.target.value})}><option value="active">ใช้งาน</option><option value="inactive">ปิดใช้งาน</option></select></label>
   </div>
   <div className="editor-actions"><button type="button" className="secondary" onClick={()=>setEditing(false)}>ยกเลิก</button><button className="primary" disabled={saving}>{saving?'กำลังบันทึก...':'บันทึกอุปกรณ์'}</button></div>
  </form>;
 }

 return <div className="device-row device-row-editable">
  <div><b>{item.model_name}</b><small>SN: {item.serial_number}</small>{item.purchase_date&&<small>ซื้อเมื่อ {new Date(item.purchase_date).toLocaleDateString('th-TH')} · ประกัน {item.warranty_years||'-'} ปี</small>}{item.warranty_end_date&&<small>ระบบคำนวณหมดประกัน {new Date(item.warranty_end_date).toLocaleDateString('th-TH')}</small>}</div>
  <div className="device-actions"><span>{item.device_status==='active'?'ใช้งาน':item.device_status}</span>{editable&&<button type="button" onClick={()=>setEditing(true)}>แก้ไข</button>}</div>
 </div>;
}

export default function InstallationResultPage({job,models,onReload,onModelsChanged}){
 const[device,setDevice]=useState(emptyDevice);
 const[extraModels,setExtraModels]=useState([]);
 const[newModel,setNewModel]=useState(emptyModel);
 const[showModelForm,setShowModelForm]=useState(false);
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
 const[modelBusy,setModelBusy]=useState(false);
 const allModels=[...extraModels,...models].filter((model,index,self)=>self.findIndex(item=>String(item.model_id)===String(model.model_id))===index);
 const installed=job.devices.filter(item=>item.installation_job_id===job.job_id);
 const editable=job.job_status!=='completed';

 const add=async event=>{
  event.preventDefault();
  setBusy(true);
  setError('');
  try{
   await api('/devices/units',{method:'POST',body:JSON.stringify({...device,site_id:job.site_id,installation_job_id:job.job_id,device_status:'active'})});
   setDevice(emptyDevice);
   await onReload();
  }catch(x){
   setError(x.message);
  }finally{
   setBusy(false);
  }
 };

 const addModel=async event=>{
  event.preventDefault();
  setModelBusy(true);
  setError('');
  try{
   const data=await api('/devices/models',{method:'POST',body:JSON.stringify(newModel)});
   const created={...newModel,model_id:data.model_id};
   setExtraModels(current=>[created,...current]);
   setDevice(current=>({...current,model_id:String(data.model_id)}));
   setNewModel(emptyModel);
   setShowModelForm(false);
   if(onModelsChanged)await onModelsChanged();
  }catch(x){
   setError(x.message);
  }finally{
   setModelBusy(false);
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

 return <>
  <section className="work-card">
   <div className="section-title"><span className={installed.length?'done':'todo'}>{installed.length?'✓':'1'}</span><div><h3>อุปกรณ์ที่ติดตั้ง</h3><p>{installed.length} ชิ้นในงานนี้ แก้ไขได้จนกว่าจะปิดงาน</p></div></div>
   {error&&<div className="alert error">{error}</div>}
   {installed.map(item=><InstalledDeviceRow key={item.device_id} item={item} job={job} models={allModels} editable={editable} onReload={onReload} onError={setError}/>)}
   {editable&&<>
    {showModelForm&&<form className="nested-form model-create-form" onSubmit={addModel}>
     <div className="editor-title"><b>เพิ่มโมเดลอุปกรณ์ใหม่</b><button type="button" onClick={()=>setShowModelForm(false)}>×</button></div>
     <div className="form-grid">
      <label>ยี่ห้อ<input value={newModel.brand} onChange={e=>setNewModel({...newModel,brand:e.target.value})} placeholder="เช่น Tuya, Aqara"/></label>
      <label>ชื่อรุ่น<input required value={newModel.model_name} onChange={e=>setNewModel({...newModel,model_name:e.target.value})} placeholder="เช่น Smart Gateway V2"/></label>
      <label className="wide">รายละเอียด<textarea rows="2" value={newModel.description} onChange={e=>setNewModel({...newModel,description:e.target.value})}/></label>
      <label className="wide">สเปก / หมายเหตุรุ่น<textarea rows="2" value={newModel.specification} onChange={e=>setNewModel({...newModel,specification:e.target.value})}/></label>
     </div>
     <div className="editor-actions"><button type="button" className="secondary" onClick={()=>setShowModelForm(false)}>ยกเลิก</button><button className="primary" disabled={modelBusy}>{modelBusy?'กำลังเพิ่ม...':'เพิ่มโมเดล'}</button></div>
    </form>}
    <form className="inline-form" onSubmit={add}>
     <label>รุ่นอุปกรณ์<select required value={device.model_id} onChange={e=>setDevice({...device,model_id:e.target.value})}><option value="">-- เลือกรุ่น --</option>{allModels.map(model=><option value={model.model_id} key={model.model_id}>{model.brand} {model.model_name}</option>)}</select></label>
     <label>Serial Number<input required value={device.serial_number} onChange={e=>setDevice({...device,serial_number:e.target.value})}/></label>
     <label>วันที่ซื้อ<input required type="date" value={device.purchase_date} onChange={e=>setDevice({...device,purchase_date:e.target.value})}/></label>
     <label>ระยะประกัน (ปี)<input required type="number" min="1" value={device.warranty_years} onChange={e=>setDevice({...device,warranty_years:e.target.value})}/></label>
     <button type="button" className="secondary add-model-button" onClick={()=>setShowModelForm(true)}>+ เพิ่มโมเดลใหม่</button>
     <button className="secondary add" disabled={busy}>{busy?'กำลังเพิ่ม...':'+ เพิ่มอุปกรณ์'}</button>
    </form>
   </>}
  </section>
  <section className="work-card">
   <div className="section-title"><span className={result.installation_result&&result.test_result?'done':'todo'}>{result.installation_result&&result.test_result?'✓':'2'}</span><div><h3>ผลติดตั้งและทดสอบ</h3><p>บันทึกก่อนปิดงาน</p></div></div>
   <div className="form-grid"><label>ผลติดตั้ง<select disabled={!editable} value={result.installation_result} onChange={e=>setResult({...result,installation_result:e.target.value})}><option value="">-- เลือก --</option><option value="success">สำเร็จ</option><option value="failed">ไม่สำเร็จ</option></select></label><label>ผลทดสอบ<select disabled={!editable} value={result.test_result} onChange={e=>setResult({...result,test_result:e.target.value})}><option value="">-- เลือก --</option><option value="pass">ผ่าน</option><option value="fail">ไม่ผ่าน</option></select></label><label className="wide">ตำแหน่งติดตั้ง<textarea disabled={!editable} value={result.install_location_detail} onChange={e=>setResult({...result,install_location_detail:e.target.value})}/></label><label className="wide">รายละเอียดทดสอบ<textarea disabled={!editable} value={result.test_detail} onChange={e=>setResult({...result,test_detail:e.target.value})}/></label><label className="wide">สรุปงาน<textarea disabled={!editable} value={result.result_summary} onChange={e=>setResult({...result,result_summary:e.target.value})}/></label></div>
   {editable&&<button className="secondary full" onClick={save}>บันทึกผล</button>}
  </section>
 </>;
}
