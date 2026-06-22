import {useState} from 'react';
import {api} from '../services/api';
import CreateCustomerSite from './CreateCustomerSite';

export default function CreateInstallationJob({sites,onClose,onDone}){
 const[form,setForm]=useState({site_id:'',scheduled_at:'',job_note:''}),[extraSites,setExtraSites]=useState([]),[addingSite,setAddingSite]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const availableSites=[...sites,...extraSites].filter(site=>site.site_status==='active');
 const submit=async event=>{event.preventDefault();setBusy(true);setError('');try{await api('/jobs',{method:'POST',body:JSON.stringify({...form,job_type:'installation',job_status:'created'})});onDone()}catch(x){setError(x.message)}finally{setBusy(false)}};
 const siteCreated=site=>{setExtraSites(current=>[...current,site]);setForm(current=>({...current,site_id:String(site.site_id)}));setAddingSite(false)};
 return <div className="backdrop"><form className="sheet" onSubmit={submit}>
  <div className="sheet-head"><h2>สร้างงานติดตั้ง</h2><button type="button" className="icon" onClick={onClose}>×</button></div>
  <p>เลือกจุดติดตั้งเดิม หรือเพิ่มลูกค้าและจุดติดตั้งใหม่ก่อนสร้างงาน</p>{error&&<div className="alert error">{error}</div>}
  <label>ลูกค้า / จุดติดตั้ง<select required value={form.site_id} onChange={e=>setForm({...form,site_id:e.target.value})}><option value="">-- เลือกจุดติดตั้ง --</option>{availableSites.map(site=><option value={site.site_id} key={site.site_id}>{site.customer_name} — {site.site_name}</option>)}</select></label>
  <button type="button" className="secondary full new-site-button" onClick={()=>setAddingSite(true)}>+ เพิ่มลูกค้าหรือจุดติดตั้งใหม่</button>
  <label>วันเวลานัดหมาย<input type="datetime-local" value={form.scheduled_at} onChange={e=>setForm({...form,scheduled_at:e.target.value})}/></label>
  <label>หมายเหตุ<textarea rows="3" value={form.job_note} onChange={e=>setForm({...form,job_note:e.target.value})}/></label>
  <button className="primary full" disabled={busy}>{busy?'กำลังบันทึก...':'สร้างงานติดตั้ง'}</button>
 </form>{addingSite&&<CreateCustomerSite onClose={()=>setAddingSite(false)} onCreated={siteCreated}/>}</div>;
}
