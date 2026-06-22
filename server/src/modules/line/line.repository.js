const db=require('../../config/db');

exports.customerByLineId=async lineUserId=>{
  const [customers]=await db.query('SELECT * FROM customers WHERE line_user_id=?',[lineUserId]);
  if(!customers[0])return null;
  const [sites]=await db.query("SELECT site_id,site_name,site_address FROM customer_sites WHERE customer_id=? AND site_status='active' ORDER BY site_name",[customers[0].customer_id]);
  return {...customers[0],sites};
};

exports.lineIdByCustomerId=async customerId=>(await db.query('SELECT line_user_id FROM customers WHERE customer_id=?',[customerId]))[0][0]?.line_user_id;

exports.createProblem=async(siteId,symptom)=>{
  const [recent]=await db.query(`SELECT problem_id FROM problem_reports WHERE site_id=? AND symptom_detail=?
    AND reported_at>=DATE_SUB(NOW(),INTERVAL 2 MINUTE) ORDER BY problem_id DESC LIMIT 1`,[siteId,symptom]);
  if(recent[0])return {problemId:recent[0].problem_id,duplicate:true};
  const [result]=await db.query(`INSERT INTO problem_reports
    (site_id,symptom_detail,problem_status,reported_at,recorded_by,source_type,contact_channel)
    VALUES (?,?,'open',NOW(),NULL,'line_chat','line')`,[siteId,symptom]);
  return {problemId:result.insertId,duplicate:false};
};

exports.customerStatus=async customerId=>(await db.query(`SELECT p.problem_id,p.problem_status,p.symptom_detail,p.reported_at,j.job_status,u.full_name technician_name
  FROM problem_reports p JOIN customer_sites s ON s.site_id=p.site_id
  LEFT JOIN jobs j ON j.job_id=p.job_id LEFT JOIN users u ON u.user_id=j.technician_id
  WHERE s.customer_id=? ORDER BY p.problem_id DESC LIMIT 3`,[customerId]))[0];
