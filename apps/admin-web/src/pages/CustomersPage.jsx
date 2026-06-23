import ResourcePage from '../components/ResourcePage';import{fmtDate}from'../services/api';
const canDeleteCustomer=row=>Number(row.site_count||0)===0&&Number(row.device_count||0)===0;
export default function CustomersPage(){return <ResourcePage title="ลูกค้า" description="ข้อมูลผู้ติดต่อหลัก ใช้ผูกกับจุดติดตั้ง งานบริการ และ LINE ของลูกค้า" createLabel="เพิ่มลูกค้า" modalTitle="ลูกค้า" endpoint="/customers" idKey="customer_id" allowDelete canDelete={canDeleteCustomer} deleteBlockedMessage="ลูกค้ารายนี้มีจุดติดตั้งหรืออุปกรณ์ผูกอยู่ จึงลบไม่ได้เพื่อรักษาประวัติงาน ให้แก้ไขข้อมูลหรือปิดใช้งานจุดติดตั้งแทน" columns={[
 {key:'customer_name',label:'ลูกค้า',render:r=><div className="customer-cell"><strong>{r.customer_name}</strong><small>เพิ่มเมื่อ {fmtDate(r.created_at)}</small></div>},
 {key:'contact',label:'ข้อมูลติดต่อ',render:r=><div className="contact-cell"><span>{r.phone||'-'}</span><small>{r.email||'ไม่มีอีเมล'}</small></div>},
 {key:'line_user_id',label:'LINE',render:r=><span className={`line-state ${r.line_user_id?'linked':'unlinked'}`}>{r.line_user_id?'ผูกแล้ว':'ยังไม่ผูก'}</span>},
 {key:'usage',label:'ข้อมูลที่ผูกอยู่',render:r=><div className="linked-summary"><span>{r.site_count||0} จุดติดตั้ง</span><span>{r.device_count||0} อุปกรณ์</span></div>},
 {key:'address',label:'ที่อยู่ติดต่อ',render:r=>r.address||'-'},
]} fields={[{name:'customer_name',label:'ชื่อ-นามสกุล / ชื่อบริษัท',required:true},{name:'phone',label:'โทรศัพท์',required:true},{name:'email',label:'อีเมล',type:'email'},{name:'line_user_id',label:'รหัส LINE ของลูกค้า',placeholder:'โดยปกติระบบจะเติมให้อัตโนมัติเมื่อลูกค้าลงทะเบียนผ่าน LINE',help:'กรอกเองเฉพาะกรณีมีรหัส LINE ที่ยืนยันแล้ว'},{name:'address',label:'ที่อยู่ติดต่อของลูกค้า',type:'textarea'}]}/>}
