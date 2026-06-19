const db=require('../../config/db');
exports.list=async()=> (await db.query(
 `SELECT j.*,s.site_name,c.customer_name,c.phone customer_phone,u.full_name technician_name,
  CASE WHEN i.job_id IS NOT NULL THEN 'installation' WHEN r.job_id IS NOT NULL THEN 'repair' ELSE 'general' END job_type,
  i.installation_result,i.test_result,r.repair_summary,p.problem_id,p.symptom_detail
  FROM jobs j JOIN customer_sites s ON s.site_id=j.site_id JOIN customers c ON c.customer_id=s.customer_id
  LEFT JOIN users u ON u.user_id=j.technician_id LEFT JOIN installation_jobs i ON i.job_id=j.job_id
  LEFT JOIN repair_jobs r ON r.job_id=j.job_id LEFT JOIN problem_reports p ON p.job_id=j.job_id ORDER BY j.job_id DESC`
))[0];
exports.create=async(d,userId)=>{const cn=await db.getConnection();try{await cn.beginTransaction();let siteId=d.site_id;
 if(d.job_type==='repair'){if(!d.problem_id){const e=new Error('งานซ่อมต้องสร้างจากเคสปัญหา');e.status=400;throw e;}const[[problem]]=await cn.query('SELECT site_id,job_id FROM problem_reports WHERE problem_id=? FOR UPDATE',[d.problem_id]);if(!problem){const e=new Error('ไม่พบเคสปัญหา');e.status=404;throw e;}if(problem.job_id){const e=new Error('เคสนี้มีงานที่รับผิดชอบแล้ว');e.status=409;throw e;}siteId=problem.site_id;}
 const [x]=await cn.query(
 `INSERT INTO jobs (site_id,technician_id,job_status,scheduled_at,job_note,result_summary,started_at,completed_at,created_by)
 VALUES (?,?,?,?,?,?,?,?,?)`,[siteId,d.technician_id||null,d.job_status||'created',d.scheduled_at||null,d.job_note||null,d.result_summary||null,d.started_at||null,d.completed_at||null,userId]);
 if(d.job_type==='installation')await cn.query('INSERT INTO installation_jobs (job_id) VALUES (?)',[x.insertId]);
 if(d.job_type==='repair')await cn.query('INSERT INTO repair_jobs (job_id,repair_summary,repair_note) VALUES (?,?,?)',[x.insertId,d.repair_summary||null,d.repair_note||null]);
 if(d.problem_id)await cn.query("UPDATE problem_reports SET job_id=?,problem_status='assigned' WHERE problem_id=?",[x.insertId,d.problem_id]);await cn.commit();return x.insertId;}catch(e){await cn.rollback();throw e;}finally{cn.release();}};
exports.update=async(id,d)=>{const cn=await db.getConnection();try{await cn.beginTransaction();await cn.query(
 `UPDATE jobs SET site_id=?,technician_id=?,job_status=?,scheduled_at=?,job_note=?,result_summary=?,started_at=?,completed_at=? WHERE job_id=?`,
 [d.site_id,d.technician_id||null,d.job_status,d.scheduled_at||null,d.job_note||null,d.result_summary||null,d.started_at||null,d.completed_at||null,id]
 );const status=d.job_status==='completed'?'resolved':d.job_status==='cancelled'?'cancelled':'assigned';await cn.query('UPDATE problem_reports SET problem_status=? WHERE job_id=?',[status,id]);await cn.commit();}catch(e){await cn.rollback();throw e;}finally{cn.release();}};
exports.remove=async id=>{const cn=await db.getConnection();try{await cn.beginTransaction();await cn.query("UPDATE problem_reports SET job_id=NULL,problem_status='open' WHERE job_id=?",[id]);await cn.query('DELETE FROM jobs WHERE job_id=?',[id]);await cn.commit();}catch(e){await cn.rollback();throw e;}finally{cn.release();}};
