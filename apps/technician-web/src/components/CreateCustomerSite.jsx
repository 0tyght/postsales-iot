import {useEffect,useState} from 'react';
import {api} from '../services/api';

const asset=name=>`${import.meta.env.BASE_URL}${name}`;

export default function CreateCustomerSite({onClose,onCreated,submitLabel='ใช้จุดติดตั้งนี้สร้างงานต่อ',intro=''}){
 const[customers,setCustomers]=useState([]),[mode,setMode]=useState('new'),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const[form,setForm]=useState({customer_id:'',customer_name:'',phone:'',email:'',address:'',site_name:'',site_address:''});
 const[createdSite,setCreatedSite]=useState(null),[lineBind,setLineBind]=useState(null),[copied,setCopied]=useState(false);
 useEffect(()=>{api('/customers').then(setCustomers).catch(x=>setError(x.message))},[]);
 const change=(name,value)=>setForm(current=>({...current,[name]:value}));
 const copy=async text=>{try{await navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),1600)}catch{setError('คัดลอกไม่ได้ กรุณากดเลือกข้อความแล้วคัดลอกเอง')}};
 const submit=async event=>{
  event.preventDefault();setBusy(true);setError('');
  try{
   let customerId=form.customer_id,customerName=customers.find(item=>String(item.customer_id)===String(customerId))?.customer_name;
   if(mode==='new'){
    const created=await api('/customers',{method:'POST',body:JSON.stringify({customer_name:form.customer_name,phone:form.phone,email:form.email,address:form.address})});
    customerId=created.customer_id;customerName=form.customer_name;
   }
   const site=await api('/customer-sites',{method:'POST',body:JSON.stringify({customer_id:customerId,site_name:form.site_name,site_address:form.site_address,site_status:'active',service_interval_days:30})});
   const selectedSite={site_id:site.site_id,customer_id:customerId,customer_name:customerName,site_name:form.site_name,site_address:form.site_address,site_status:'active'};
   setCreatedSite(selectedSite);
   try{setLineBind(await api(`/line/bind/${customerId}`))}catch(x){setLineBind(null);setError(`บันทึกจุดติดตั้งแล้ว แต่สร้างข้อมูลผูก LINE ไม่สำเร็จ: ${x.message}`)}
  }catch(x){setError(x.message)}finally{setBusy(false)}
 };
 return <div className="backdrop nested-backdrop" onClick={onClose}><form className="sheet customer-site-sheet" onSubmit={submit} onClick={event=>event.stopPropagation()}>
  <div className="sheet-head"><h2>เพิ่มลูกค้า / จุดติดตั้ง</h2><button type="button" className="icon" onClick={onClose}>×</button></div>
  {intro&&<p className="flow-note">{intro}</p>}
  {error&&<div className="alert error">{error}</div>}
  {createdSite?<div className="line-bind-card">
   <b>ขั้นตอนถัดไป: ผูก LINE ลูกค้า</b>
   <p>ให้ลูกค้าเพิ่มเพื่อน LINE Official Account แล้วส่งรหัสสั้น ๆ นี้ ระบบจะรู้ทันทีว่า LINE นี้เป็นของลูกค้าคนนี้</p>
   {lineBind?<><div className="line-bind-qr-wrap"><img className="line-add-qr" src={asset('line-add-friend-qr.jpg')} alt="QR code เพิ่มเพื่อน LINE Official Account"/><span>ให้ลูกค้าสแกน QR นี้เพื่อเพิ่มเพื่อน แล้วส่งรหัสด้านล่างในแชต</span></div><code>{lineBind.registration_text}</code><div className="line-bind-actions"><button type="button" className="secondary" onClick={()=>copy(lineBind.registration_text)}>{copied?'คัดลอกแล้ว':'คัดลอกรหัส'}</button>{lineBind.add_friend_url&&<a className="primary link-button" href={lineBind.add_friend_url} target="_blank" rel="noreferrer">เปิด LINE</a>}</div>{!lineBind.has_official_account_link&&<small>หมายเหตุ: ยังไม่ได้ตั้งค่า LINE Official Account ID จึงยังเปิดแชตพร้อมรหัสอัตโนมัติไม่ได้ แต่ใช้รหัสนี้ให้ลูกค้าส่งใน LINE ได้</small>}</>:<p className="muted">ยังไม่มีข้อมูลผูก LINE</p>}
   <button type="button" className="primary full" onClick={()=>onCreated(createdSite)}>{submitLabel}</button>
  </div>:<>
  <div className="customer-mode"><button type="button" className={mode==='new'?'active':''} onClick={()=>setMode('new')}>ลูกค้าใหม่</button><button type="button" className={mode==='existing'?'active':''} onClick={()=>setMode('existing')}>ลูกค้าเดิม</button></div>
  {mode==='new'?<><label>ชื่อลูกค้า / บริษัท<input required value={form.customer_name} onChange={e=>change('customer_name',e.target.value)}/></label><label>เบอร์โทรลูกค้า<input required value={form.phone} onChange={e=>change('phone',e.target.value)}/></label><label>อีเมล<input type="email" value={form.email} onChange={e=>change('email',e.target.value)}/></label><label>ที่อยู่ติดต่อของลูกค้า<textarea rows="2" value={form.address} onChange={e=>change('address',e.target.value)}/></label></>:<label>เลือกลูกค้า<select required value={form.customer_id} onChange={e=>change('customer_id',e.target.value)}><option value="">-- เลือกลูกค้า --</option>{customers.map(item=><option key={item.customer_id} value={item.customer_id}>{item.customer_name} · {item.phone||'-'}</option>)}</select></label>}
  <hr/><label>ชื่อจุดติดตั้ง<input required value={form.site_name} onChange={e=>change('site_name',e.target.value)} placeholder="เช่น บ้านหลัง A, สาขาพิษณุโลก, โกดัง"/></label><label>ที่อยู่หน้างาน<textarea required rows="3" value={form.site_address} onChange={e=>change('site_address',e.target.value)}/></label>
  <button className="primary full" disabled={busy}>{busy?'กำลังบันทึก...':'บันทึกจุดติดตั้ง'}</button>
  </>}
 </form></div>;
}
