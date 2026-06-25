import {useState} from 'react';
import {api} from '../services/api';

export default function LoginPage({onLogin}){
 const[form,setForm]=useState({username:'',password:''});
 const[error,setError]=useState('');
 const[loading,setLoading]=useState(false);

 const submit=async event=>{
  event.preventDefault();
  setLoading(true);
  setError('');
  try{
   const data=await api('/auth/login',{method:'POST',body:JSON.stringify(form)});
   localStorage.setItem('portal_token',data.token);
   localStorage.setItem('portal_user',JSON.stringify(data.user));
   onLogin(data.user);
  }catch(x){
   setError(x.message);
  }finally{
   setLoading(false);
  }
 };

 return <div className="login-page">
  <div className="login-panel">
   <div className="login-mark app-logo-mark" aria-label="THIC logo"></div>
   <h1>Post-Sales IoT</h1>
   <p>เข้าสู่ระบบเพื่อดูแลลูกค้า งานซ่อม งานติดตั้ง และสถานะหน้างานในที่เดียว</p>

   {error&&<div className="alert error">{error}</div>}

   <form onSubmit={submit}>
    <label>
     ชื่อผู้ใช้
     <input autoFocus autoComplete="username" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required/>
    </label>
    <label>
     รหัสผ่าน
     <input type="password" autoComplete="current-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/>
    </label>
    <button className="btn primary full" disabled={loading}>{loading?'กำลังเข้าสู่ระบบ...':'เข้าสู่ระบบ'}</button>
   </form>

   <div className="login-helper">
    <span>ระบบจะแยกหน้าการใช้งานจากบัญชีที่เข้าสู่ระบบ</span>
   </div>
  </div>

  <div className="login-visual">
   <div>
    <span>ระบบดูแลหลังการขาย IoT</span>
    <h2>เห็นงานทั้งหมด<br/>ตั้งแต่รับเคสจนปิดงาน</h2>
    <p>ผู้ดูแลระบบติดตามสถานะงานแบบใกล้เรียลไทม์ ช่างบันทึกงานและรูปจากหน้างาน ลูกค้าและอุปกรณ์ถูกผูกไว้เป็นระบบเดียวกัน</p>
    <div className="login-benefits">
     <b>ติดตามสถานะงาน</b>
     <b>ดูรูปหน้างาน</b>
     <b>จัดการอุปกรณ์</b>
    </div>
   </div>
  </div>
 </div>;
}
