import ResourcePage from '../components/ResourcePage';

const canDeleteModel=row=>Number(row.device_count||0)===0;

export default function DeviceModelsPage(){
 return <ResourcePage
  title="โมเดล"
  description="ข้อมูลกลางของรุ่นและสเปก ใช้เลือกเมื่อเพิ่มอุปกรณ์จริง"
  createLabel="เพิ่มโมเดล"
  modalTitle="โมเดล"
  endpoint="/devices/models"
  idKey="model_id"
  allowDelete
  canDelete={canDeleteModel}
  deleteBlockedMessage="ลบโมเดลไม่ได้ เพราะมีอุปกรณ์จริงที่ใช้โมเดลนี้อยู่"
  columns={[
   {key:'device_type',label:'ประเภทอุปกรณ์',render:r=>r.device_type||'ยังไม่ระบุประเภท'},
   {key:'model_name',label:'ชื่อโมเดล'},
   {key:'brand',label:'ยี่ห้อ'},
   {key:'device_count',label:'อุปกรณ์จริง',render:r=>`${r.device_count||0} ชิ้น`},
   {key:'description',label:'รายละเอียด'},
   {key:'specification',label:'สเปก'},
  ]}
  fields={[
   {name:'device_type',label:'ประเภทอุปกรณ์',required:true,placeholder:'เช่น กล้องวงจรปิด, สวิตช์, NVR, HDD',help:'ระบุประเภทที่ลูกค้าเข้าใจได้ จะแสดงคู่กับรุ่นบนเว็บและ LINE'},
   {name:'model_name',label:'ชื่อโมเดล',required:true},
   {name:'brand',label:'ยี่ห้อ'},
   {name:'description',label:'รายละเอียดการใช้งาน',type:'textarea',fullWidth:true},
   {name:'specification',label:'ข้อมูลจำเพาะ',type:'textarea',fullWidth:true},
  ]}
 />;
}
