import ResourcePage from '../components/ResourcePage';

export default function DeviceModelsPage(){
 return <ResourcePage
  title="โมเดล"
  description="ข้อมูลกลางของรุ่นและสเปก ใช้เลือกเมื่อลงทะเบียนอุปกรณ์"
  createLabel="เพิ่มโมเดล"
  modalTitle="โมเดล"
  endpoint="/devices/models"
  idKey="model_id"
  columns={[
   {key:'model_name',label:'ชื่อโมเดล'},
   {key:'brand',label:'ยี่ห้อ'},
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
