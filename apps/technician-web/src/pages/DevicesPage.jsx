import {useMemo,useState} from 'react';
import {api} from '../services/api';

const emptyDevice={model_id:'',serial_number:'',purchase_date:'',warranty_years:1};
const dateText=value=>value?new Date(value).toLocaleDateString('th-TH'):'-';
const modelName=(models,id)=>{
 const model=models.find(item=>String(item.model_id)===String(id));
 return model?`${model.brand?`${model.brand} `:''}${model.model_name}`:'-';
};

export default function DevicesPage({devices,models,onChanged}){
 const[form,setForm]=useState(emptyDevice);
 const[creating,setCreating]=useState(false);
 const[error,setError]=useState('');
 const[filter,setFilter]=useState('stock');
 const[search,setSearch]=useState('');

 const visible=useMemo(()=>devices.filter(item=>{
  const inStock=!item.site_id&&!item.installation_job_id;
  const matchFilter=filter==='all'||(filter==='stock'?inStock:!inStock);
  const text=[item.serial_number,item.model_name,item.brand,item.customer_name,item.site_name].join(' ').toLowerCase();
  return matchFilter&&(!search||text.includes(search.toLowerCase()));
 }),[devices,filter,search]);

 const submit=async event=>{
  event.preventDefault();
  setCreating(true);
  setError('');
  try{
   await api('/devices/units',{
    method:'POST',
    body:JSON.stringify({...form,site_id:null,installation_job_id:null,device_status:'active'}),
   });
   setForm(emptyDevice);
   await onChanged();
  }catch(x){
   setError(x.message);
  }finally{
   setCreating(false);
  }
 };

 return <>
  <div className="page-title">
   <div>
    <h1>อุปกรณ์</h1>
    <p>เพิ่มอุปกรณ์เข้าคลังก่อนสร้างงานติดตั้ง แล้วค่อยเลือกไปติดตั้งในหน้างาน</p>
   </div>
  </div>
  {error&&<div className="alert error">{error}</div>}
  <section className="work-card inventory-create-card">
   <div className="section-title">
    <span className="todo">+</span>
    <div><h3>เพิ่มอุปกรณ์</h3><p>กรอกของจริงเป็นรายชิ้น เช่น Serial Number วันที่ซื้อ และระยะประกัน</p></div>
   </div>
   <form className="form-grid" onSubmit={submit}>
    <label>โมเดล
     <select required value={form.model_id} onChange={e=>setForm({...form,model_id:e.target.value})}>
      <option value="">-- เลือกโมเดล --</option>
      {models.map(model=><option value={model.model_id} key={model.model_id}>{model.brand} {model.model_name}</option>)}
     </select>
    </label>
    <label>Serial Number<input required value={form.serial_number} onChange={e=>setForm({...form,serial_number:e.target.value})}/></label>
    <label>วันที่ซื้อ<input required type="date" value={form.purchase_date} onChange={e=>setForm({...form,purchase_date:e.target.value})}/></label>
    <label>ระยะประกันสินค้า (ปี)<input required min="1" type="number" value={form.warranty_years} onChange={e=>setForm({...form,warranty_years:e.target.value})}/></label>
    <button className="primary full" disabled={creating}>{creating?'กำลังเพิ่มอุปกรณ์...':'เพิ่มอุปกรณ์เข้าคลัง'}</button>
   </form>
  </section>
  <section className="work-card inventory-list-card">
   <div className="section-title">
    <span className="done">{visible.length}</span>
    <div><h3>รายการอุปกรณ์</h3><p>ดูอุปกรณ์ที่อยู่ในคลังและอุปกรณ์ที่ถูกติดตั้งแล้ว</p></div>
   </div>
   <div className="inventory-toolbar">
    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ค้นหา Serial, โมเดล, ลูกค้า..."/>
    <select value={filter} onChange={e=>setFilter(e.target.value)}>
     <option value="stock">อยู่ในคลัง / ยังไม่ติดตั้ง</option>
     <option value="installed">ติดตั้งแล้ว</option>
     <option value="all">ทั้งหมด</option>
    </select>
   </div>
   <div className="inventory-list">
    {visible.map(item=><article className="inventory-item" key={item.device_id}>
     <div>
      <b>{item.brand?`${item.brand} `:''}{item.model_name||modelName(models,item.model_id)}</b>
      <small>SN: {item.serial_number}</small>
      <small>ซื้อ {dateText(item.purchase_date)} · ประกัน {item.warranty_years||'-'} ปี</small>
     </div>
     <span className={item.site_id?'state installed':'state stock'}>{item.site_id?`${item.customer_name||''} ${item.site_name||''}`.trim():'อยู่ในคลัง'}</span>
    </article>)}
    {!visible.length&&<div className="empty">ยังไม่มีอุปกรณ์ในรายการนี้</div>}
   </div>
  </section>
 </>;
}
