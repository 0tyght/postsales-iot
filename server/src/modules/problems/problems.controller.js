const s=require('./problems.service'),{success}=require('../../utils/response.util');
exports.list=async(q,r)=>success(r,await s.list(q.user));
exports.create=async(q,r)=>success(r,{problem_id:await s.create(q.body,q.user.user_id)},'บันทึกเคสบริการแล้ว',201);
exports.claim=async(q,r)=>success(r,{job_id:await s.claim(q.params.id,q.user)},'รับเคสและสร้างงานบริการแล้ว',201);
exports.update=async(q,r)=>{await s.update(q.params.id,q.body);success(r,null,'แก้ไขเคสบริการแล้ว');};
exports.remove=async(q,r)=>{await s.remove(q.params.id);success(r,null,'ลบเคสบริการแล้ว');};
