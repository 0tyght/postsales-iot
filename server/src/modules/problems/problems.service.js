const r=require('./problems.repository');
const jobs=require('../jobs/jobs.service');
const line=require('../line/line.service');
exports.list=r.list;
exports.create=async(data,userId)=>{
 const id=await r.create(data,userId);
 line.notifyTeamNewProblem(id).catch(error=>console.error(`LINE team notification failed for problem ${id}:`,error.message));
 return id;
};
exports.update=r.update;
exports.claim=async(id,user)=>jobs.create({job_type:'repair',problem_id:id,job_status:'created'},user);
exports.remove=async id=>{if(!(await r.remove(id))){const e=new Error('เคสที่สร้างงานแล้วห้ามลบ ให้เปลี่ยนสถานะเป็นยกเลิกแทน');e.status=409;throw e;}};
