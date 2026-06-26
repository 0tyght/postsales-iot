const db=require('../../config/db');
exports.list=async actor=> (await db.query(
 `SELECT j.*,s.site_name,c.customer_name,c.phone customer_phone,u.full_name technician_name,
  (SELECT COUNT(*) FROM job_evidence e WHERE e.job_id=j.job_id) evidence_count,
  (SELECT MAX(e.created_at) FROM job_evidence e WHERE e.job_id=j.job_id) latest_evidence_at,
  CASE WHEN i.job_id IS NOT NULL THEN 'installation' WHEN r.job_id IS NOT NULL THEN 'repair' ELSE 'general' END job_type,
  i.installation_result,i.test_result,r.repair_summary,p.problem_id,p.symptom_detail
  FROM jobs j JOIN customer_sites s ON s.site_id=j.site_id JOIN customers c ON c.customer_id=s.customer_id
  LEFT JOIN users u ON u.user_id=j.technician_id LEFT JOIN installation_jobs i ON i.job_id=j.job_id
  LEFT JOIN repair_jobs r ON r.job_id=j.job_id LEFT JOIN problem_reports p ON p.job_id=j.job_id
  WHERE (?='admin' OR j.technician_id=? OR j.created_by=?) ORDER BY j.job_id DESC`,[actor.role,actor.user_id,actor.user_id]
))[0];
exports.notificationContext=async id=>(await db.query(
 `SELECT j.job_id,j.job_status,j.scheduled_at,s.site_name,c.customer_name,c.line_user_id,u.full_name technician_name,
  CASE WHEN i.job_id IS NOT NULL THEN 'installation' WHEN r.job_id IS NOT NULL THEN 'repair' ELSE 'general' END job_type
  FROM jobs j JOIN customer_sites s ON s.site_id=j.site_id JOIN customers c ON c.customer_id=s.customer_id
  LEFT JOIN users u ON u.user_id=j.technician_id LEFT JOIN installation_jobs i ON i.job_id=j.job_id
  LEFT JOIN repair_jobs r ON r.job_id=j.job_id WHERE j.job_id=?`,[id]
))[0][0];
exports.evidenceKeys=async id=>(await db.query('SELECT storage_key FROM job_evidence WHERE job_id=?',[id]))[0].map(x=>x.storage_key);
exports.create=async(d,userId)=>{const cn=await db.getConnection();try{await cn.beginTransaction();let siteId=d.site_id;
 if(d.job_type==='repair'){if(!d.problem_id){const e=new Error('งานบริการต้องสร้างจากเคสบริการ');e.status=400;throw e;}const[[problem]]=await cn.query('SELECT site_id,job_id,problem_status FROM problem_reports WHERE problem_id=? FOR UPDATE',[d.problem_id]);if(!problem){const e=new Error('ไม่พบเคสบริการ');e.status=404;throw e;}if(problem.job_id||problem.problem_status!=='open'){const e=new Error('เคสนี้ถูกรับหรือปิดไปแล้ว กรุณารีเฟรชรายการ');e.status=409;throw e;}siteId=problem.site_id;}
 if(d.job_type==='installation'){const[[siteUsage]]=await cn.query('SELECT (SELECT COUNT(*) FROM jobs WHERE site_id=?) job_count,(SELECT COUNT(*) FROM device_units WHERE site_id=?) device_count',[siteId,siteId]);if(Number(siteUsage.job_count)>0||Number(siteUsage.device_count)>0){const e=new Error('งานติดตั้งใหม่ต้องใช้จุดติดตั้งใหม่เท่านั้น หากเป็นจุดเดิมให้สร้างเคสบริการเพิ่ม/ถอด/เปลี่ยนอุปกรณ์');e.status=409;throw e;}}
 const [x]=await cn.query(
 `INSERT INTO jobs (site_id,technician_id,job_status,scheduled_at,job_note,result_summary,started_at,completed_at,created_by)
 VALUES (?,?,?,?,?,?,?,?,?)`,[siteId,d.technician_id||null,d.job_status||'created',d.scheduled_at||null,d.job_note||null,d.result_summary||null,d.started_at||null,d.completed_at||null,userId]);
 if(d.job_type==='installation')await cn.query('INSERT INTO installation_jobs (job_id) VALUES (?)',[x.insertId]);
 if(d.job_type==='repair')await cn.query('INSERT INTO repair_jobs (job_id,repair_summary,repair_note) VALUES (?,?,?)',[x.insertId,d.repair_summary||null,d.repair_note||null]);
 if(d.problem_id)await cn.query("UPDATE problem_reports SET job_id=?,problem_status='assigned' WHERE problem_id=?",[x.insertId,d.problem_id]);await cn.commit();return x.insertId;}catch(e){await cn.rollback();throw e;}finally{cn.release();}};
exports.update=async(id,d,actor)=>{const cn=await db.getConnection();try{await cn.beginTransaction();const[result]=await cn.query(
 `UPDATE jobs SET site_id=?,technician_id=?,job_status=?,scheduled_at=?,job_note=?,result_summary=?,started_at=?,completed_at=?
  WHERE job_id=? AND (?='admin' OR technician_id=? OR created_by=?)`,
 [d.site_id,d.technician_id||null,d.job_status,d.scheduled_at||null,d.job_note||null,d.result_summary||null,d.started_at||null,d.completed_at||null,id,actor.role,actor.user_id,actor.user_id]
 );if(!result.affectedRows){const e=new Error('ไม่พบงานหรือไม่มีสิทธิ์แก้ไขงานนี้');e.status=403;throw e;}const status=d.job_status==='completed'?'resolved':d.job_status==='cancelled'?'cancelled':'assigned';await cn.query('UPDATE problem_reports SET problem_status=? WHERE job_id=?',[status,id]);await cn.commit();}catch(e){await cn.rollback();throw e;}finally{cn.release();}};
exports.remove=async id=>{const cn=await db.getConnection();try{await cn.beginTransaction();await cn.query("UPDATE problem_reports SET job_id=NULL,problem_status='open' WHERE job_id=?",[id]);await cn.query('DELETE FROM jobs WHERE job_id=?',[id]);await cn.commit();}catch(e){await cn.rollback();throw e;}finally{cn.release();}};
