const s=require('./customer-sites.service'),{success}=require('../../utils/response.util');
exports.list=async(q,r)=>success(r,await s.list());exports.reminders=async(q,r)=>success(r,await s.reminders());
exports.create=async(q,r)=>success(r,{site_id:await s.create(q.body)},'เพิ่มจุดติดตั้งแล้ว',201);
exports.update=async(q,r)=>{await s.update(q.params.id,q.body);success(r,null,'แก้ไขจุดติดตั้งแล้ว');};
exports.remove=async(q,r)=>{await s.remove(q.params.id);success(r,null,'ลบจุดติดตั้งแล้ว');};
exports.markContacted=async(q,r)=>{await s.markContacted(q.params.id);success(r,null,'บันทึกการติดต่อลูกค้าแล้ว');};
