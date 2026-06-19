const s=require('./customers.service'); const {success}=require('../../utils/response.util');
exports.list=async(q,r)=>success(r,await s.list());
exports.create=async(q,r)=>success(r,{customer_id:await s.create(q.body)},'เพิ่มลูกค้าแล้ว',201);
exports.update=async(q,r)=>{await s.update(q.params.id,q.body);success(r,null,'แก้ไขลูกค้าแล้ว');};
exports.remove=async(q,r)=>{await s.remove(q.params.id);success(r,null,'ลบลูกค้าแล้ว');};
