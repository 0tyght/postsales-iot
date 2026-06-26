import {useState} from 'react';
import {api} from '../services/api';
import CreateCustomerSite from './CreateCustomerSite';

export default function CreateInstallationJob({onClose,onDone}){
 const[error,setError]=useState('');
 const[busy,setBusy]=useState(false);

 const createJob=async site=>{
  setBusy(true);
  setError('');
  try{
   const data=await api('/jobs',{
    method:'POST',
    body:JSON.stringify({
     site_id:site.site_id,
     job_type:'installation',
     job_status:'created',
     job_note:'งานติดตั้งใหม่จากการสร้างจุดติดตั้งใหม่',
    }),
   });
   const openNow=window.confirm('สร้างงานติดตั้งใหม่แล้ว ต้องการรับงานนี้เองและเปิดหน้างานเลยไหม?');
   onDone(openNow?data.job_id:null);
  }catch(x){
   setError(x.message);
  }finally{
   setBusy(false);
  }
 };

 return <>
  {error&&<div className="alert error floating-error">{error}</div>}
  {busy&&<div className="backdrop nested-backdrop"><div className="sheet"><div className="loading">กำลังสร้างงานติดตั้งใหม่...</div></div></div>}
  <CreateCustomerSite onClose={onClose} onCreated={createJob} submitLabel="สร้างงานติดตั้งใหม่ต่อ" intro="งานติดตั้งใหม่ต้องสร้างจุดติดตั้งใหม่ก่อนเสมอ เลือกลูกค้าเดิมหรือเพิ่มลูกค้าใหม่ แล้วสร้างจุดติดตั้งใหม่สำหรับงานนี้"/>
 </>;
}
