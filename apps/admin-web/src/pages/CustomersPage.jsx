import {useEffect,useState} from 'react';
import ResourcePage from '../components/ResourcePage';
import {api,fmtDate} from '../services/api';

const asset=name=>`${import.meta.env.BASE_URL}${name}`;
const canDeleteCustomer=row=>Number(row.site_count||0)===0&&Number(row.device_count||0)===0;

function LineBindModal({customer,onClose}){
 const[info,setInfo]=useState(null),[error,setError]=useState(''),[copied,setCopied]=useState(false);
 useEffect(()=>{api(`/line/bind/${customer.customer_id}`).then(setInfo).catch(e=>setError(e.message))},[customer.customer_id]);
 const copy=async()=>{if(!info?.bind_code)return;await navigator.clipboard?.writeText(info.bind_code);setCopied(true);setTimeout(()=>setCopied(false),1500)};
 return <div className="modal-backdrop" onMouseDown={onClose}>
  <div className="modal line-bind-modal" onMouseDown={e=>e.stopPropagation()}>
   <div className="modal-head"><div><h2>ผูก LINE ลูกค้า</h2><p>{customer.customer_name}</p></div><button onClick={onClose}>×</button></div>
   {error&&<div className="alert error">{error}</div>}
   {!info?<div className="loading">กำลังเตรียมรหัสผูก LINE...</div>:<div className="line-bind-box">
    <div className="line-bind-qr"><img src={asset('line-add-friend-qr.jpg')} alt="QR เพิ่มเพื่อน LINE Official Account"/><span>ให้ลูกค้าสแกน QR เพื่อเพิ่มเพื่อน LINE Official Account</span></div>
    <div className="bind-code-card"><small>รหัสยืนยันตัวตนของลูกค้ารายนี้</small><strong>{info.bind_code}</strong><button className="btn" onClick={copy}>{copied?'คัดลอกแล้ว':'คัดลอกรหัส'}</button></div>
    <ol className="bind-steps"><li>ให้ลูกค้าสแกน QR เพื่อเพิ่มเพื่อน</li><li>ให้ลูกค้าส่งรหัส <b>{info.bind_code}</b> ในแชต LINE</li><li>ระบบจะผูก LINE User ID เข้ากับลูกค้ารายนี้อัตโนมัติ</li></ol>
    {info.line_user_id&&<div className="alert success">ลูกค้ารายนี้ผูก LINE แล้ว</div>}
   </div>}
  </div>
 </div>;
}

export default function CustomersPage(){
 const[bindCustomer,setBindCustomer]=useState(null);
 return <>
  <ResourcePage
   title="ลูกค้า"
   description="ข้อมูลผู้ติดต่อหลัก ใช้ผูกกับจุดติดตั้ง งานบริการ และ LINE ของลูกค้า"
   createLabel="เพิ่มลูกค้า"
   modalTitle="ลูกค้า"
   endpoint="/customers"
   idKey="customer_id"
   allowDelete
   canDelete={canDeleteCustomer}
   deleteBlockedMessage="ลูกค้ารายนี้มีจุดติดตั้งหรืออุปกรณ์ผูกอยู่ จึงลบไม่ได้เพื่อรักษาประวัติงาน ให้แก้ไขข้อมูลหรือปิดใช้งานจุดติดตั้งแทน"
   onSaved={(result,form,wasEdit)=>{if(!wasEdit&&result?.customer_id)setBindCustomer({customer_id:result.customer_id,customer_name:form.customer_name})}}
   rowActions={[{key:'line',label:row=>row.line_user_id?'ดู LINE':'ผูก LINE',onClick:setBindCustomer}]}
   columns={[
    {key:'customer_name',label:'ลูกค้า',render:r=><div className="customer-cell"><strong>{r.customer_name}</strong><small>เพิ่มเมื่อ {fmtDate(r.created_at)}</small></div>},
    {key:'contact',label:'ข้อมูลติดต่อ',render:r=><div className="contact-cell"><span>{r.phone||'-'}</span><small>{r.email||'ไม่มีอีเมล'}</small></div>},
    {key:'line_user_id',label:'LINE',render:r=><span className={`line-state ${r.line_user_id?'linked':'unlinked'}`}>{r.line_user_id?'ผูกแล้ว':'ยังไม่ผูก'}</span>},
    {key:'usage',label:'ข้อมูลที่ผูกอยู่',render:r=><div className="linked-summary"><span>{r.site_count||0} จุดติดตั้ง</span><span>{r.device_count||0} อุปกรณ์</span></div>},
    {key:'address',label:'ที่อยู่ติดต่อ',render:r=>r.address||'-'},
   ]}
   fields={[
    {name:'customer_name',label:'ชื่อ-นามสกุล / ชื่อบริษัท',required:true},
    {name:'phone',label:'โทรศัพท์',required:true},
    {name:'email',label:'อีเมล',type:'email'},
    {name:'line_user_id',label:'LINE User ID',placeholder:'โดยปกติระบบจะเติมให้อัตโนมัติเมื่อลูกค้าส่งรหัส TYTC ใน LINE',help:'ไม่ต้องกรอกเอง เว้นแต่มี LINE User ID ที่ยืนยันแล้ว'},
    {name:'address',label:'ที่อยู่ติดต่อของลูกค้า',type:'textarea'},
   ]}
  />
  {bindCustomer&&<LineBindModal customer={bindCustomer} onClose={()=>setBindCustomer(null)}/>}
 </>;
}
