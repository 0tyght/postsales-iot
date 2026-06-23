const r=require('./jobs.repository');
const line=require('../line/line.service');
const files=require('../../services/fileUpload.service');
exports.list=r.list;
const statusText={created:'รอเริ่มงาน',in_progress:'ช่างกำลังดำเนินงาน',completed:'ปิดงานแล้ว',cancelled:'ยกเลิกงาน'};
const notify=async context=>{if(!line.configured()||!context?.line_user_id)return;const type=context.job_type==='repair'?'งานซ่อม':'งานติดตั้ง';const technician=context.technician_name?`\nช่างผู้รับผิดชอบ: ${context.technician_name}`:'';try{await line.pushText(context.line_user_id,`อัปเดต${type} #${context.job_id}\nสถานะ: ${statusText[context.job_status]||context.job_status}\nจุดติดตั้ง: ${context.site_name}${technician}`)}catch(e){console.error(`LINE notification failed for job ${context.job_id}:`,e.message)}};
exports.create=async(data,actor)=>{if(actor.role==='technician'&&data.job_type==='repair'&&!data.problem_id){const e=new Error('งานซ่อมต้องสร้างจากการรับเคสปัญหา');e.status=403;throw e;}const id=await r.create({...data,technician_id:actor.role==='technician'?actor.user_id:data.technician_id},actor.user_id);await notify(await r.notificationContext(id));return id;};
exports.update=async(id,data,actor)=>{const before=await r.notificationContext(id);await r.update(id,data,actor);const after=await r.notificationContext(id);if(before?.job_status!==after?.job_status)await notify(after);};
exports.remove=async id=>{const keys=await r.evidenceKeys(id);await r.remove(id);await Promise.all(keys.map(key=>files.remove(key).catch(e=>console.error(`Evidence cleanup failed for ${key}:`,e.message))));};
