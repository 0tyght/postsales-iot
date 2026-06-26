import ResourcePage from '../components/ResourcePage';
import StatusBadge from '../components/StatusBadge';
import useLookups from '../hooks/useLookups';
import {fmtDate} from '../services/api';

const warrantyFilter=(row,value)=>{
 if(value==='none')return !row.warranty_end_date;
 if(!row.warranty_end_date)return false;
 const days=(new Date(row.warranty_end_date)-new Date())/86400000;
 if(value==='expired')return days<0;
 if(value==='soon')return days>=0&&days<=90;
 return days>90;
};
const canDeleteDevice=row=>!row.site_id&&!row.installation_job_id&&Number(row.problem_device_count||0)===0;

export default function DeviceUnitsPage(){
 const l=useLookups({models:'/devices/models',sites:'/customer-sites',jobs:'/jobs'});
 return <ResourcePage
  title="อุปกรณ์"
  description="คลังอุปกรณ์ตาม Serial Number เพิ่มตอนซื้อก่อน แล้วค่อยนำไปผูกกับจุดติดตั้งจากหน้างาน"
  createLabel="เพิ่มอุปกรณ์"
  modalTitle="อุปกรณ์"
  endpoint="/devices/units"
  idKey="device_id"
  allowDelete
  canDelete={canDeleteDevice}
  deleteBlockedMessage="ลบอุปกรณ์ไม่ได้ เพราะติดตั้งแล้วหรือมีประวัติงาน/เคสซ่อม ให้แก้สถานะเป็นเลิกใช้งานแทน"
  lookups={l}
  initialValues={{device_status:'active',warranty_years:1}}
  filters={[
   {key:'device_status',label:'สถานะ',options:[{value:'active',label:'ใช้งานอยู่'},{value:'inactive',label:'เลิกใช้งาน'}]},
   {key:'install_state',label:'การติดตั้ง',predicate:(row,value)=>value==='installed'?Boolean(row.site_id):!row.site_id,options:[{value:'installed',label:'ติดตั้งแล้ว'},{value:'stock',label:'อยู่ในคลัง / ยังไม่ติดตั้ง'}]},
   {key:'warranty',label:'ประกัน',predicate:warrantyFilter,options:[{value:'expired',label:'หมดประกันแล้ว'},{value:'soon',label:'หมดภายใน 90 วัน'},{value:'valid',label:'มากกว่า 90 วัน'},{value:'none',label:'ไม่ระบุ'}]},
  ]}
  columns={[
   {key:'serial_number',label:'Serial Number'},
   {key:'model_name',label:'รุ่น'},
   {key:'customer_name',label:'ลูกค้า',render:r=>r.customer_name||'ยังไม่ติดตั้ง'},
   {key:'site_name',label:'จุดติดตั้ง',render:r=>r.site_name||'อยู่ในคลัง'},
   {key:'device_status',label:'สถานะ',render:r=><StatusBadge value={r.device_status}/>},
   {key:'purchase_date',label:'วันที่ซื้อ',render:r=>fmtDate(r.purchase_date)},
   {key:'warranty_years',label:'ระยะประกัน',render:r=>r.warranty_years?`${r.warranty_years} ปี`:'-'},
   {key:'warranty_end_date',label:'หมดประกัน',render:r=>fmtDate(r.warranty_end_date)},
  ]}
  fields={[
   {name:'model_id',label:'โมเดล',type:'select',required:true,options:l=>l.models?.map(x=>({value:x.model_id,label:`${x.brand||''} ${x.model_name}`.trim()}))||[]},
   {name:'serial_number',label:'Serial Number',required:true,help:'หมายเลขต้องไม่ซ้ำกับอุปกรณ์ชิ้นอื่น'},
   {name:'purchase_date',label:'วันที่ซื้อ',type:'date',required:true},
   {name:'warranty_years',label:'ระยะเวลาประกันสินค้า (ปี)',type:'number',min:1,required:true,placeholder:'เช่น 1, 2, 3',help:'ระบบจะคำนวณวันหมดประกันให้อัตโนมัติจากวันที่ซื้อ'},
   {name:'device_status',label:'สถานะอุปกรณ์',type:'select',required:true,options:[{value:'active',label:'ใช้งานอยู่'},{value:'inactive',label:'เลิกใช้งาน / ถูกเปลี่ยนแล้ว'}]},
   {name:'site_id',label:'จุดติดตั้ง',type:'select',options:l=>l.sites?.filter(x=>x.site_status==='active').map(x=>({value:x.site_id,label:`${x.customer_name} · ${x.site_name}`}))||[],help:'เว้นว่างถ้าเป็นอุปกรณ์ที่ซื้อมาแล้วแต่ยังไม่ได้ติดตั้ง'},
   {name:'installation_job_id',label:'งานติดตั้งที่เกี่ยวข้อง',type:'select',options:l=>l.jobs?.filter(x=>x.job_type==='installation').map(x=>({value:x.job_id,label:`งาน #${x.job_id} · ${x.site_name}`}))||[],help:'โดยปกติระบบจะผูกให้อัตโนมัติจากหน้างานช่าง'},
  ]}
 />;
}
