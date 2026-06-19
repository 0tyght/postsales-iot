const db=require('../../config/db');
exports.models=async()=> (await db.query('SELECT * FROM device_models ORDER BY model_id DESC'))[0];
exports.createModel=async d=>(await db.query('INSERT INTO device_models (model_name,brand,description,specification) VALUES (?,?,?,?)',[d.model_name,d.brand||null,d.description||null,d.specification||null]))[0].insertId;
exports.updateModel=async(id,d)=>db.query('UPDATE device_models SET model_name=?,brand=?,description=?,specification=? WHERE model_id=?',[d.model_name,d.brand||null,d.description||null,d.specification||null,id]);
exports.removeModel=async id=>db.query('DELETE FROM device_models WHERE model_id=?',[id]);
exports.units=async()=> (await db.query(
 `SELECT d.*,m.model_name,m.brand,s.site_name,c.phone customer_phone
  FROM device_units d JOIN device_models m ON m.model_id=d.model_id
  JOIN customer_sites s ON s.site_id=d.site_id JOIN customers c ON c.customer_id=s.customer_id
  ORDER BY d.device_id DESC`
))[0];
exports.createUnit=async d=>(await db.query(
 'INSERT INTO device_units (model_id,site_id,installation_job_id,serial_number,device_status,warranty_end_date) VALUES (?,?,?,?,?,?)',
 [d.model_id,d.site_id,d.installation_job_id||null,d.serial_number,d.device_status||'active',d.warranty_end_date||null]
))[0].insertId;
exports.updateUnit=async(id,d)=>db.query(
 'UPDATE device_units SET model_id=?,site_id=?,installation_job_id=?,serial_number=?,device_status=?,warranty_end_date=? WHERE device_id=?',
 [d.model_id,d.site_id,d.installation_job_id||null,d.serial_number,d.device_status||'active',d.warranty_end_date||null,id]
);
exports.removeUnit=async id=>db.query('DELETE FROM device_units WHERE device_id=?',[id]);
exports.warrantyAlerts=async()=> (await db.query(
 `SELECT d.*,m.model_name,m.brand,s.site_name,DATEDIFF(d.warranty_end_date,CURDATE()) days_remaining
  FROM device_units d JOIN device_models m ON m.model_id=d.model_id JOIN customer_sites s ON s.site_id=d.site_id
  WHERE d.warranty_end_date IS NOT NULL ORDER BY d.warranty_end_date`
))[0];
