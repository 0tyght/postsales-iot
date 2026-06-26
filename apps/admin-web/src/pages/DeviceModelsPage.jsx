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
   {key:'model_name',label:'ชื่อโมเดล'},
   {key:'brand',label:'ยี่ห้อ'},
   {key:'device_count',label:'อุปกรณ์จริง',render:r=>`${r.device_count||0} ชิ้น`},
   {key:'description',label:'รายละเอียด'},
   {key:'specification',label:'สเปก'},
  ]}
  fields={[
   {name:'model_name',label:'ชื่อโมเดล',required:true},
   {name:'brand',label:'ยี่ห้อ'},
   {name:'description',label:'รายละเอียดการใช้งาน',type:'textarea',fullWidth:true},
   {name:'specification',label:'ข้อมูลจำเพาะ',type:'textarea',fullWidth:true},
  ]}
 />;
}
