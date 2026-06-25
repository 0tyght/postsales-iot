import {useEffect,useMemo,useState} from 'react';
import {api} from '../services/api';

const asset=name=>`${import.meta.env.BASE_URL}${name}`;
const groupLabels={registration:'ลงทะเบียน',help:'วิธีใช้',problem:'แจ้งปัญหา',status:'สถานะเคส',service:'รอบ service',job:'งานบริการ',support:'ติดต่อเจ้าหน้าที่',fallback:'ข้อความสำรอง'};

export default function LineSettingsPage(){
 const[status,setStatus]=useState(null),[customers,setCustomers]=useState([]),[templates,setTemplates]=useState([]),[activeGroup,setActiveGroup]=useState('registration'),[editing,setEditing]=useState(null),[form,setForm]=useState({customer_id:'',text:''}),[message,setMessage]=useState(''),[error,setError]=useState(''),[sending,setSending]=useState(false);
 const load=()=>Promise.all([api('/line/status'),api('/customers'),api('/line/templates')]).then(([s,c,t])=>{setStatus(s);setCustomers(c.filter(x=>x.line_user_id));setTemplates(t)}).catch(e=>setError(e.message));
 useEffect(()=>{load()},[]);
 const groups=useMemo(()=>[...new Set(templates.map(x=>x.template_group))], [templates]);
 const visible=templates.filter(x=>x.template_group===activeGroup);
 const send=async e=>{e.preventDefault();setSending(true);setError('');setMessage('');try{await api('/line/push',{method:'POST',body:JSON.stringify(form)});setMessage('ส่งข้อความ LINE แล้ว');setForm({...form,text:''})}catch(x){setError(x.message)}finally{setSending(false)}};
 const saveTemplate=async e=>{e.preventDefault();setSending(true);setError('');setMessage('');try{await api(`/line/templates/${editing.template_key}`,{method:'PUT',body:JSON.stringify(editing)});setMessage('บันทึกข้อความ LINE แล้ว');setEditing(null);await load()}catch(x){setError(x.message)}finally{setSending(false)}};
 return <section>
  <div className="page-head"><div><h1>LINE ลูกค้า</h1><p>ตั้งค่า Webhook, QR เพิ่มเพื่อน, ส่งข้อความ และแก้รูปแบบข้อความอัตโนมัติที่ระบบใช้ตอบลูกค้า</p></div></div>
  {error&&<div className="alert error">{error}</div>}{message&&<div className="alert success">{message}</div>}
  <div className="dashboard-grid line-settings-grid">
   <div className="panel">
    <h2>สถานะ LINE Official Account</h2>
    <div className="metric-row"><span>Channel Secret</span><strong>{status?.channel_secret?'พร้อม':'ยังไม่ตั้งค่า'}</strong></div>
    <div className="metric-row"><span>Channel Access Token</span><strong>{status?.access_token?'พร้อม':'ยังไม่ตั้งค่า'}</strong></div>
    <p className="muted">Webhook URL ที่ต้องตั้งใน LINE Developers</p>
    <code>{status?.webhook_url||'ยังไม่ได้ตั้งค่า LINE Webhook URL'}</code>
    <div className={`webhook-health ${status?.webhook_health?.connected_to_this_server?'ok':'bad'}`}>
     <b>{status?.webhook_health?.connected_to_this_server?'Webhook พร้อมใช้งาน':'Webhook ยังไม่เข้าระบบนี้'}</b>
     <span>{status?.webhook_health?.message||'กำลังตรวจสอบสถานะ webhook...'}</span>
     {status?.webhook_health?.response_preview&&<small>ตอบกลับ: {status.webhook_health.response_preview}</small>}
    </div>
    <div className="line-admin-qr"><img src={asset('line-add-friend-qr.jpg')} alt="QR code เพิ่มเพื่อน LINE Official Account"/><span>QR เพิ่มเพื่อน LINE Official Account ใช้ QR เดียวกันทุกคน แล้วแยกตัวลูกค้าด้วยรหัส TYTC</span></div>
    <div className="workflow-note"><b>ขั้นตอนใช้งานจริง</b><ol><li>ช่างหรือแอดมินเพิ่มลูกค้า</li><li>ระบบสร้างรหัส เช่น TYTC0005</li><li>ลูกค้าเพิ่มเพื่อน LINE OA และส่งรหัสในแชต</li><li>ระบบผูก LINE User ID เข้ากับลูกค้าอัตโนมัติ</li></ol></div>
   </div>
   <div className="panel">
    <h2>ส่งข้อความหาลูกค้า</h2>
    <form onSubmit={send}>
     <label className="form-field">ลูกค้าที่ผูก LINE แล้ว<select value={form.customer_id} onChange={e=>setForm({...form,customer_id:e.target.value})} required><option value="">-- เลือกลูกค้า --</option>{customers.map(x=><option key={x.customer_id} value={x.customer_id}>{x.customer_name}</option>)}</select></label>
     <label className="form-field">ข้อความ<textarea rows="5" value={form.text} onChange={e=>setForm({...form,text:e.target.value})} required placeholder="เช่น แจ้งนัดหมาย แจ้งสถานะงาน หรือข้อความติดตาม"/></label>
     <div className="modal-actions"><button className="btn primary" disabled={sending||!status?.configured}>{sending?'กำลังส่ง...':'ส่งข้อความ LINE'}</button></div>
    </form>
    <p className="muted">ลูกค้าที่ผูก LINE แล้ว {customers.length} ราย</p>
   </div>
  </div>

  <div className="panel line-template-panel">
   <div className="section-heading"><div><h2>ข้อความอัตโนมัติ</h2><p>แก้คำตอบใน LINE ได้จากหน้านี้ ใช้ตัวแปรรูปแบบ <code>{'{{customer_name}}'}</code> เพื่อแทนค่าจริงจากระบบ</p></div></div>
   <div className="template-tabs">{groups.map(group=><button key={group} className={activeGroup===group?'active':''} onClick={()=>setActiveGroup(group)}>{groupLabels[group]||group}</button>)}</div>
   <div className="template-list">{visible.map(item=><article className="template-card" key={item.template_key}>
    <div><small>{item.template_key}</small><h3>{item.template_name}</h3><p>{item.template_body}</p>{item.variables&&<span>ตัวแปร: {item.variables}</span>}</div>
    <button className="btn ghost" onClick={()=>setEditing({...item})}>แก้ข้อความ</button>
   </article>)}</div>
  </div>

  {editing&&<div className="modal-backdrop"><form className="modal line-template-modal" onSubmit={saveTemplate}>
   <div className="modal-head"><div><h2>{editing.template_name}</h2><p>{editing.template_key}</p></div><button type="button" className="close-button" onClick={()=>setEditing(null)}>×</button></div>
   <label className="form-field">ชื่อข้อความ<input value={editing.template_name} onChange={e=>setEditing({...editing,template_name:e.target.value})} required/></label>
   <label className="form-field">กลุ่มข้อความ<select value={editing.template_group} onChange={e=>setEditing({...editing,template_group:e.target.value})}>{Object.entries(groupLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
   <label className="form-field">รูปแบบข้อความ<textarea rows="9" value={editing.template_body} onChange={e=>setEditing({...editing,template_body:e.target.value})} required/></label>
   <label className="form-field">ตัวแปรที่ใช้ได้<input value={editing.variables||''} onChange={e=>setEditing({...editing,variables:e.target.value})} placeholder="customer_name, site_name, case_id"/></label>
   <label className="check-row"><input type="checkbox" checked={Boolean(editing.is_active)} onChange={e=>setEditing({...editing,is_active:e.target.checked?1:0})}/> เปิดใช้งานข้อความนี้</label>
   <div className="modal-actions"><button type="button" className="btn ghost" onClick={()=>setEditing(null)}>ยกเลิก</button><button className="btn primary" disabled={sending}>{sending?'กำลังบันทึก...':'บันทึกข้อความ'}</button></div>
  </form></div>}
 </section>;
}
