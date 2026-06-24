const db=require('../../config/db');
const warrantyEnd=(purchaseDate,years)=>{
  if(!purchaseDate||!years)return null;
 const [year,month,day]=String(purchaseDate).slice(0,10).split('-').map(Number);
  const count=Number(years);
 if(!year||!month||!day||!Number.isFinite(count)||count<=0)return null;
 const date=new Date(Date.UTC(year+count,month-1,day));
 date.setUTCDate(date.getUTCDate()-1);
  return date.toISOString().slice(0,10);
};
const optionalId=value=>value===undefined||value===null||value===''?null:value;
exports.models=async()=> (await db.query('SELECT * FROM device_models ORDER BY model_id DESC'))[0];
exports.createModel=async d=>(await db.query('INSERT INTO device_models (model_name,brand,description,specification) VALUES (?,?,?,?)',[d.model_name,d.brand||null,d.description||null,d.specification||null]))[0].insertId;
exports.updateModel=async(id,d)=>db.query('UPDATE device_models SET model_name=?,brand=?,description=?,specification=? WHERE model_id=?',[d.model_name,d.brand||null,d.description||null,d.specification||null,id]);
exports.removeModel=async id=>db.query('DELETE FROM device_models WHERE model_id=?',[id]);
exports.units=async()=> (await db.query(
 `SELECT d.*,m.model_name,m.brand,s.site_name,c.customer_name,c.phone customer_phone
  FROM device_units d JOIN device_models m ON m.model_id=d.model_id
  LEFT JOIN customer_sites s ON s.site_id=d.site_id LEFT JOIN customers c ON c.customer_id=s.customer_id
  ORDER BY d.device_id DESC`
))[0];
exports.createUnit=async d=>(await db.query(
 'INSERT INTO device_units (model_id,site_id,installation_job_id,serial_number,device_status,purchase_date,warranty_years,warranty_end_date) VALUES (?,?,?,?,?,?,?,?)',
 [d.model_id,optionalId(d.site_id),optionalId(d.installation_job_id),d.serial_number,d.device_status||'active',d.purchase_date||null,d.warranty_years||null,warrantyEnd(d.purchase_date,d.warranty_years)]
))[0].insertId;
exports.updateUnit=async(id,d)=>db.query(
 'UPDATE device_units SET model_id=?,site_id=?,installation_job_id=?,serial_number=?,device_status=?,purchase_date=?,warranty_years=?,warranty_end_date=? WHERE device_id=?',
 [d.model_id,optionalId(d.site_id),optionalId(d.installation_job_id),d.serial_number,d.device_status||'active',d.purchase_date||null,d.warranty_years||null,warrantyEnd(d.purchase_date,d.warranty_years),id]
);
exports.removeUnit=async id=>db.query('DELETE FROM device_units WHERE device_id=?',[id]);
exports.warrantyAlerts=async()=> (await db.query(
 `SELECT d.*,m.model_name,m.brand,s.site_name,c.customer_name,DATEDIFF(d.warranty_end_date,CURDATE()) days_remaining
  FROM device_units d JOIN device_models m ON m.model_id=d.model_id LEFT JOIN customer_sites s ON s.site_id=d.site_id
  LEFT JOIN customers c ON c.customer_id=s.customer_id
  WHERE d.warranty_end_date IS NOT NULL ORDER BY d.warranty_end_date`
))[0];
