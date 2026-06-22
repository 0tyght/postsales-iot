const db=require('../../config/db');
exports.list=async actor=> (await db.query(
 `SELECT p.*,s.site_name,c.customer_name,c.phone customer_phone,u.full_name recorded_by_name,j.job_status,tu.full_name technician_name
  FROM problem_reports p JOIN customer_sites s ON s.site_id=p.site_id JOIN customers c ON c.customer_id=s.customer_id
  LEFT JOIN users u ON u.user_id=p.recorded_by LEFT JOIN jobs j ON j.job_id=p.job_id LEFT JOIN users tu ON tu.user_id=j.technician_id
  WHERE (?='admin' OR p.problem_status='open' OR j.technician_id=?)
  ORDER BY p.reported_at DESC,p.problem_id DESC`,[actor.role,actor.user_id]
))[0];
exports.create=async(d,userId)=>(await db.query(
 `INSERT INTO problem_reports (site_id,symptom_detail,problem_status,reported_at,recorded_by,source_type,contact_channel)
 VALUES (?,?,?,?,?,?,?)`,[d.site_id,d.symptom_detail,'open',d.reported_at||new Date(),userId,d.source_type,d.contact_channel]
))[0].insertId;
exports.update=async(id,d)=>db.query(
 `UPDATE problem_reports SET site_id=?,symptom_detail=?,problem_status=?,reported_at=?,source_type=?,contact_channel=? WHERE problem_id=?`,
 [d.site_id,d.symptom_detail,d.problem_status||'open',d.reported_at,d.source_type,d.contact_channel,id]
);
exports.remove=async id=>(await db.query('DELETE FROM problem_reports WHERE problem_id=? AND job_id IS NULL',[id]))[0].affectedRows;
