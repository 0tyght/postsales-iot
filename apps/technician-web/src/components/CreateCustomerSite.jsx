import {useEffect,useState} from 'react';
import {api} from '../services/api';

export default function CreateCustomerSite({onClose,onCreated}){
 const[customers,setCustomers]=useState([]),[mode,setMode]=useState('new'),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const[form,setForm]=useState({customer_id:'',customer_name:'',phone:'',email:'',address:'',site_name:'',site_address:''});
 useEffect(()=>{api('/customers').then(setCustomers).catch(x=>setError(x.message))},[]);
 const change=(name,value)=>setForm(current=>({...current,[name]:value}));
 const submit=async event=>{
  event.preventDefault();setBusy(true);setError('');
  try{
   let customerId=form.customer_id,customerName=customers.find(item=>String(item.customer_id)===String(customerId))?.customer_name;
   if(mode==='new'){
    const created=await api('/customers',{method:'POST',body:JSON.stringify({customer_name:form.customer_name,phone:form.phone,email:form.email,address:form.address})});
    customerId=created.customer_id;customerName=form.customer_name;
   }
   const site=await api('/customer-sites',{method:'POST',body:JSON.stringify({customer_id:customerId,site_name:form.site_name,site_address:form.site_address,site_status:'active',service_interval_days:30})});
   onCreated({site_id:site.site_id,customer_id:customerId,customer_name:customerName,site_name:form.site_name,site_address:form.site_address,site_status:'active'});
  }catch(x){setError(x.message)}finally{setBusy(false)}
 };
 return <div className="backdrop nested-backdrop" onClick={onClose}><form className="sheet customer-site-sheet" onSubmit={submit} onClick={event=>event.stopPropagation()}>
  <div className="sheet-head"><h2>เพิ่มลูกค้าและจุดติดตั้ง</h2><button type="button" className="icon" onClick={onClose}>×</button></div>
  {error&&<div className="alert error">{error}</div>}
  <div className="customer-mode"><button type="button" className={mode==='new'?'active':''} onClick={()=>setMode('new')}>ลูกค้าใหม่</button><button type="button" className={mode==='existing'?'active':''} onClick={()=>setMode('existing')}>ลูกค้าเดิม</button></div>
  {mode==='new'?<><label>ชื่อลูกค้า / บริษัท<input required value={form.customer_name} onChange={e=>change('customer_name',e.target.value)}/></label><label>เบอร์โทร<input required value={form.phone} onChange={e=>change('phone',e.target.value)}/></label><label>อีเมล<input type="email" value={form.email} onChange={e=>change('email',e.target.value)}/></label><label>ที่อยู่สำหรับติดต่อ<textarea rows="2" value={form.address} onChange={e=>change('address',e.target.value)}/></label></>:<label>เลือกลูกค้า<select required value={form.customer_id} onChange={e=>change('customer_id',e.target.value)}><option value="">-- เลือกลูกค้า --</option>{customers.map(item=><option key={item.customer_id} value={item.customer_id}>{item.customer_name} · {item.phone||'-'}</option>)}</select></label>}
  <hr/><label>ชื่อจุดติดตั้ง<input required value={form.site_name} onChange={e=>change('site_name',e.target.value)} placeholder="เช่น บ้าน, สาขา, โกดัง"/></label><label>ที่อยู่หน้างาน<textarea required rows="3" value={form.site_address} onChange={e=>change('site_address',e.target.value)}/></label>
  <button className="primary full" disabled={busy}>{busy?'กำลังบันทึก...':'บันทึกและเลือกจุดติดตั้งนี้'}</button>
 </form></div>;
}
