const r=require('./customers.repository');
exports.list=r.list; exports.create=r.create; exports.update=r.update;
exports.remove=async id=>{
 const usage=await r.usage(id);
 const total=Number(usage?.site_count||0)+Number(usage?.device_count||0)+Number(usage?.job_count||0)+Number(usage?.problem_count||0);
 if(total>0){
  const e=new Error('ลูกค้ารายนี้มีจุดติดตั้ง อุปกรณ์ เคส หรืองานผูกอยู่ จึงลบไม่ได้เพื่อรักษาประวัติงาน');
  e.status=409;
  throw e;
 }
 await r.remove(id);
};
