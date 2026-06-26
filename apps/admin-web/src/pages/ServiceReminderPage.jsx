import {useEffect,useState} from 'react';
import DataTable from '../components/DataTable';
import {api,fmtDate} from '../services/api';

const daysText=value=>{
 if(value===null||value===undefined)return '-';
 const days=Number(value);
 if(days===0)return 'วันนี้';
 if(days<0)return `-${Math.abs(days)} วัน`;
 return `${days} วัน`;
};

export default function ServiceReminderPage(){
 const[rows,setRows]=useState([]),[error,setError]=useState(''),[message,setMessage]=useState(''),[loading,setLoading]=useState(true),[view,setView]=useState('active'),[search,setSearch]=useState('');
 const load=()=>api('/customer-sites/service-reminders').then(setRows).catch(e=>setError(e.message)).finally(()=>setLoading(false));
 useEffect(()=>{load()},[]);

 const mark=async row=>{
  if(!confirm(`ยืนยันว่าติดตามลูกค้า ${row.customer_name} แล้ว?`))return;
  try{
   await api(`/customer-sites/${row.site_id}/mark-contacted`,{method:'POST'});
   setMessage('บันทึกการติดตามแล้ว');
   await load();
  }catch(e){setError(e.message)}
 };

 const sendLine=async row=>{
  if(!confirm(`ส่ง LINE ถามอาการถึง ${row.customer_name}?`))return;
  try{
   await api('/line/service-reminder',{method:'POST',body:JSON.stringify({site_id:row.site_id})});
   setMessage('ส่ง LINE ถามอาการแล้ว');
  }catch(e){setError(e.message)}
 };

 const visible=rows.filter(row=>{
  const keyword=`${row.customer_name} ${row.site_name} ${row.phone||''}`.toLowerCase();
  const matchesSearch=!search||keyword.includes(search.toLowerCase());
  const days=row.days_until_service_end,contact=row.days_until_contact;
  const matchesView=view==='all'||(view==='active'&&(days===null||days===undefined||days>=0))||(view==='expiring'&&days!==null&&days!==undefined&&days>=0&&days<=30)||(view==='expired'&&days!==null&&days!==undefined&&days<0)||(view==='contact_due'&&contact!==null&&contact!==undefined&&contact<=0);
  return matchesSearch&&matchesView;
 });

 return <section className="service-page">
  <div className="page-head"><div><h1>ระยะดูแล</h1><p>จุดติดตั้งที่ยังอยู่ในระยะดูแลของเรา แยกจากประกันอุปกรณ์ และส่ง LINE ถามอาการตามรอบ service ได้</p></div></div>
  {error&&<div className="alert error">{error}</div>}{message&&<div className="alert success">{message}</div>}
  <div className="table-tools"><div className="table-filters"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ค้นหาลูกค้า จุดติดตั้ง หรือเบอร์โทร..."/><select value={view} onChange={e=>setView(e.target.value)}><option value="active">อยู่ในระยะดูแล</option><option value="expiring">ใกล้หมด 30 วัน</option><option value="expired">หมดระยะดูแล</option><option value="contact_due">ถึงรอบติดตาม</option><option value="all">ทั้งหมด</option></select></div><span>{visible.length} รายการ</span></div>
  {loading?<div className="loading">กำลังโหลดข้อมูล...</div>:<DataTable
   idKey="site_id"
   rows={visible}
   columns={[
    {key:'customer_name',label:'ลูกค้า'},
    {key:'site_name',label:'จุดติดตั้ง'},
    {key:'phone',label:'โทรศัพท์'},
    {key:'service_start_date',label:'เริ่ม',render:row=>fmtDate(row.service_start_date)},
    {key:'service_end_date',label:'สิ้นสุด',render:row=>fmtDate(row.service_end_date)},
    {key:'days_until_service_end',label:'เหลือ',render:row=>daysText(row.days_until_service_end)},
    {key:'next_service_contact_date',label:'ติดตาม',render:row=>fmtDate(row.next_service_contact_date)},
    {key:'days_until_contact',label:'อีก',render:row=>daysText(row.days_until_contact)},
   ]}
   rowActions={[
    {key:'line',label:'ส่ง LINE',show:row=>Boolean(row.line_user_id),onClick:sendLine},
    {key:'mark',label:'บันทึกแล้ว',show:row=>Boolean(row.next_service_contact_date),onClick:mark},
   ]}
  />}
 </section>;
}
