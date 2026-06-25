import {useState} from 'react';
import {api} from '../services/api';
import CreateCustomerSite from '../components/CreateCustomerSite';

export default function CustomersPage({customers,onChanged}){
 const[search,setSearch]=useState('');
 const[adding,setAdding]=useState(false);
 const[bind,setBind]=useState(null);
 const[error,setError]=useState('');
 const[loadingId,setLoadingId]=useState(null);
 const visible=customers.filter(item=>[item.customer_name,item.phone,item.email,item.line_user_id].join(' ').toLowerCase().includes(search.toLowerCase()));

 const openBind=async customer=>{
  setLoadingId(customer.customer_id);
  setError('');
  try{setBind(await api(`/line/bind/${customer.customer_id}`));}
  catch(x){setError(x.message);}
  finally{setLoadingId(null);}
 };
 const copy=async text=>{
  try{await navigator.clipboard.writeText(text);}
  catch{setError('คัดลอกไม่ได้ กรุณาเลือกข้อความแล้วคัดลอกเอง');}
 };

 return <>
  <div className="page-title">
   <div><h1>ลูกค้า</h1><p>ดูแลข้อมูลลูกค้าและตรวจว่าลูกค้าผูก LINE กับระบบแล้วหรือยัง</p></div>
   <button className="primary compact" onClick={()=>setAdding(true)}>+ เพิ่มลูกค้า</button>
  </div>
  {error&&<div className="alert error">{error}</div>}
  <section className="work-card customer-care-card">
   <div className="inventory-toolbar customer-toolbar">
    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ค้นหาลูกค้า เบอร์โทร หรือ LINE User ID"/>
    <span className="customer-count">{visible.length} รายการ</span>
   </div>
   <div className="inventory-list">
    {visible.map(customer=><article className="inventory-item customer-item" key={customer.customer_id}>
     <div>
      <b>{customer.customer_name}</b>
      <small>{customer.phone||'ไม่มีเบอร์โทร'} · {customer.email||'ไม่มีอีเมล'}</small>
      <small>จุดติดตั้ง {customer.site_count||0} · อุปกรณ์ {customer.device_count||0}</small>
     </div>
     <div className="customer-line-actions">
      <span className={customer.line_user_id?'state installed':'state stock'}>{customer.line_user_id?'ผูก LINE แล้ว':'ยังไม่ผูก LINE'}</span>
      <button className="secondary compact" onClick={()=>openBind(customer)} disabled={loadingId===customer.customer_id}>{loadingId===customer.customer_id?'กำลังโหลด...':'รหัส LINE'}</button>
     </div>
    </article>)}
    {!visible.length&&<div className="empty">ยังไม่มีลูกค้าในรายการนี้</div>}
   </div>
  </section>
  {bind&&<div className="backdrop nested-backdrop" onClick={()=>setBind(null)}>
   <div className="sheet line-bind-sheet" onClick={e=>e.stopPropagation()}>
    <div className="sheet-head"><h2>ผูก LINE ลูกค้า</h2><button type="button" className="icon" onClick={()=>setBind(null)}>×</button></div>
    <div className="line-bind-card">
     <b>{bind.customer_name}</b>
     <p>{bind.line_user_id?'ลูกค้าคนนี้ผูก LINE แล้ว':'ให้ลูกค้าเพิ่มเพื่อน LINE Official Account แล้วส่งรหัสนี้ในแชต'}</p>
     <div className="line-bind-qr-wrap"><img className="line-add-qr" src="/line-add-friend-qr.jpg" alt="QR code เพิ่มเพื่อน LINE Official Account"/><span>ให้ลูกค้าสแกน QR นี้เพื่อเพิ่มเพื่อน แล้วส่งรหัสด้านล่างในแชต</span></div>
     <code>{bind.registration_text}</code>
     <div className="line-bind-actions">
      <button className="secondary" onClick={()=>copy(bind.registration_text)}>คัดลอกรหัส</button>
      {bind.add_friend_url&&<a className="primary link-button" href={bind.add_friend_url} target="_blank" rel="noreferrer">เปิด LINE</a>}
     </div>
     {!bind.has_official_account_link&&<small>ยังไม่ได้ตั้งค่า LINE Official Account ID จึงเปิดแชตพร้อมรหัสอัตโนมัติไม่ได้ แต่ยังคัดลอกรหัสให้ลูกค้าส่งใน LINE ได้</small>}
    </div>
   </div>
  </div>}
  {adding&&<CreateCustomerSite onClose={()=>setAdding(false)} onCreated={async()=>{setAdding(false);await onChanged();}}/>}
 </>;
}
