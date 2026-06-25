import {useState} from 'react';
import {api} from '../services/api';
import {clearRuntimeConfig} from '../runtime-config';

export default function LoginPage({onLogin}){
 const[form,setForm]=useState({username:'technician01',password:'',server_url:localStorage.getItem('tech_api_url')||''});
 const[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const submit=async event=>{
  event.preventDefault();setBusy(true);setError('');
  const url=form.server_url.trim().replace(/\/$/,'');
  if(url)localStorage.setItem('tech_api_url',url);else localStorage.removeItem('tech_api_url');
  clearRuntimeConfig();
  try{
   const data=await api('/auth/login',{method:'POST',body:JSON.stringify({username:form.username,password:form.password})});
   if(data.user.role!=='technician')throw new Error('หน้านี้สำหรับบัญชีช่างเท่านั้น');
   localStorage.setItem('tech_token',data.token);localStorage.setItem('tech_user',JSON.stringify(data.user));onLogin(data.user);
  }catch(x){setError(x.message)}finally{setBusy(false)}
 };
 return <main className="login"><form className="login-card" onSubmit={submit}>
  <div className="mark app-logo-mark" aria-label="THIC logo"></div><h1>Post-Sales IoT</h1><p>เปิดงาน รับเคส แนบรูป และปิดงานจากหน้างานได้ทันที</p>
  {error&&<div className="alert error">{error}</div>}
  <div className="login-tips"><b>สำหรับทีมช่าง</b><span>ปกติไม่ต้องกรอกลิงก์เซิร์ฟเวอร์ ระบบจะใช้ลิงก์ล่าสุดให้อัตโนมัติ กรอกเฉพาะกรณีที่ผู้ดูแลระบบส่งลิงก์ทดสอบให้เท่านั้น</span></div>
  <label>ลิงก์เซิร์ฟเวอร์ทดสอบ <small>เว้นว่างเมื่อใช้งานปกติ</small><input type="url" value={form.server_url} onChange={e=>setForm({...form,server_url:e.target.value})} placeholder="https://xxxx.trycloudflare.com"/></label>
  <label>ชื่อผู้ใช้<input autoFocus value={form.username} onChange={e=>setForm({...form,username:e.target.value})}/></label>
  <label>รหัสผ่าน<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
  <button className="primary" disabled={busy}>{busy?'กำลังเข้าสู่ระบบ...':'เข้าสู่ระบบ'}</button>
 </form></main>;
}
