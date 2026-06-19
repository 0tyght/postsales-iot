const express=require('express');
const cors=require('cors');
const db=require('./config/db');
const auth=require('./middlewares/auth.middleware');
const role=require('./middlewares/role.middleware');
const errorHandler=require('./middlewares/error.middleware');
const {asyncHandler,success}=require('./utils/response.util');

const app=express();
app.use(cors({origin:true,credentials:true}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/api/health',asyncHandler(async(req,res)=>{await db.query('SELECT 1');success(res,{database:'connected'}); }));
app.use('/api/auth',require('./modules/auth/auth.routes'));
app.use('/api',auth,role('admin'));
app.get('/api/dashboard',asyncHandler(async(req,res)=>{
  const [[counts],[jobs],[service],[warranty],[recent]] = await Promise.all([
    db.query(`SELECT (SELECT COUNT(*) FROM customers) customers,(SELECT COUNT(*) FROM customer_sites WHERE site_status='active') sites,
      (SELECT COUNT(*) FROM device_units WHERE device_status='active') devices,
      (SELECT COUNT(*) FROM problem_reports WHERE problem_status IN ('open','assigned')) problems`),
    db.query(`SELECT job_status,COUNT(*) total FROM jobs GROUP BY job_status`),
    db.query(`SELECT COUNT(*) due FROM customer_sites WHERE next_service_contact_date<=DATE_ADD(CURDATE(),INTERVAL 30 DAY)`),
    db.query(`SELECT COUNT(*) due FROM device_units WHERE warranty_end_date<=DATE_ADD(CURDATE(),INTERVAL 60 DAY)`),
    db.query(`SELECT p.problem_id,p.symptom_detail,p.problem_status,p.reported_at,s.site_name,c.customer_name,j.job_status
      FROM problem_reports p JOIN customer_sites s ON s.site_id=p.site_id JOIN customers c ON c.customer_id=s.customer_id LEFT JOIN jobs j ON j.job_id=p.job_id
      ORDER BY p.reported_at DESC LIMIT 5`)
  ]);
  success(res,{...counts[0],jobs,service_due:service[0].due,warranty_due:warranty[0].due,recent_problems:recent});
}));
app.use('/api/users',require('./modules/users/users.routes'));
app.use('/api/customers',require('./modules/customers/customers.routes'));
app.use('/api/customer-sites',require('./modules/customer-sites/customer-sites.routes'));
app.use('/api/devices',require('./modules/devices/devices.routes'));
app.use('/api/jobs',require('./modules/jobs/jobs.routes'));
app.use('/api/problems',require('./modules/problems/problems.routes'));
app.use((req,res)=>res.status(404).json({success:false,message:'ไม่พบ API ที่เรียก'}));
app.use(errorHandler);
module.exports=app;
