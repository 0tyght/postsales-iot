const s=require('./jobs.service'),{success}=require('../../utils/response.util');
exports.list=async(q,r)=>success(r,await s.list(q.user));exports.create=async(q,r)=>success(r,{job_id:await s.create(q.body,q.user)},'สร้างงานแล้ว',201);
exports.update=async(q,r)=>{await s.update(q.params.id,q.body,q.user);success(r,null,'อัปเดตงานแล้ว');};exports.remove=async(q,r)=>{await s.remove(q.params.id);success(r,null,'ลบงานแล้ว');};
