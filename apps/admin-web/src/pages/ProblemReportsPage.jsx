import ResourcePage from '../components/ResourcePage';
import StatusBadge from '../components/StatusBadge';
import useLookups from '../hooks/useLookups';
import {fmtDateTime} from '../services/api';

const sources={line_chat:'LINE Chat',customer_call:'โทรศัพท์',service_contact:'ติดตามระยะดูแล'};
const nowLocal=()=>{const date=new Date();return new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16)};

export default function ProblemReportsPage(){
 const lookups=useLookups({sites:'/customer-sites'});
 const openJob=row=>{sessionStorage.setItem('admin_open_job_id',String(row.job_id));location.hash='/jobs'};
 return <ResourcePage
  title="เคสปัญหา"
  description="รับเรื่องจากลูกค้า ติดตามผู้รับผิดชอบ และเปิดดูงานซ่อมที่เชื่อมโยงได้ทันที"
  createLabel="รับแจ้งปัญหา"
  modalTitle="เคสปัญหา"
  endpoint="/problems"
  idKey="problem_id"
  lookups={lookups}
  initialValues={{reported_at:nowLocal(),source_type:'line_chat',contact_channel:'line',problem_status:'open'}}
  filters={[
   {key:'problem_status',label:'สถานะเคส',options:[{value:'open',label:'รอมอบหมาย'},{value:'assigned',label:'มอบหมายแล้ว'},{value:'resolved',label:'แก้ไขแล้ว'},{value:'cancelled',label:'ยกเลิก'}]},
   {key:'source_type',label:'แจ้งทางไหน',options:Object.entries(sources).map(([value,label])=>({value,label}))},
  ]}
  columns={[
   {key:'problem_id',label:'เลขเคส',render:row=>`#${row.problem_id}`},
   {key:'customer_name',label:'ลูกค้า'},
   {key:'site_name',label:'จุดติดตั้ง'},
   {key:'symptom_detail',label:'อาการที่แจ้ง'},
   {key:'source_type',label:'แจ้งทางไหน',render:row=>sources[row.source_type]||row.source_type},
   {key:'problem_status',label:'สถานะเคส',render:row=><StatusBadge value={row.problem_status}/>},
   {key:'technician_name',label:'ผู้รับผิดชอบ',render:row=>row.technician_name||'ยังไม่มอบหมาย'},
   {key:'reported_at',label:'วันที่รับแจ้ง',render:row=>fmtDateTime(row.reported_at)},
  ]}
  fields={[
   {name:'site_id',label:'ลูกค้า / จุดติดตั้ง',type:'select',required:true,options:data=>data.sites?.filter(item=>item.site_status==='active').map(item=>({value:item.site_id,label:`${item.customer_name} · ${item.site_name}`}))||[]},
   {name:'symptom_detail',label:'รายละเอียดอาการที่ลูกค้าแจ้ง',type:'textarea',required:true,fullWidth:true,placeholder:'ระบุสิ่งที่เกิดขึ้น ช่วงเวลา และผลกระทบ'},
   {name:'reported_at',label:'วันที่และเวลาที่รับแจ้ง',type:'datetime-local',required:true},
   {name:'source_type',label:'แจ้งทางไหน',type:'select',required:true,options:Object.entries(sources).map(([value,label])=>({value,label}))},
   {name:'problem_status',label:'สถานะเคส',type:'select',hideOnCreate:true,required:true,options:[{value:'open',label:'รอมอบหมายงาน'},{value:'resolved',label:'แก้ไขโดยไม่ต้องลงพื้นที่'},{value:'cancelled',label:'ยกเลิกเคส'}]},
  ]}
  rowActions={[{key:'open-job',label:row=>`ดูงาน #${row.job_id}`,show:row=>Boolean(row.job_id),onClick:openJob}]}
 />;
}
