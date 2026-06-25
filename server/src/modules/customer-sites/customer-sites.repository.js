const db=require('../../config/db');
exports.list=async()=> (await db.query(
 `SELECT s.*,c.customer_name,c.phone customer_phone,c.email customer_email,COUNT(d.device_id) device_count
  FROM customer_sites s JOIN customers c ON c.customer_id=s.customer_id
  LEFT JOIN device_units d ON d.site_id=s.site_id GROUP BY s.site_id ORDER BY s.site_id DESC`
))[0];
exports.create=async d=>(await db.query(
 `INSERT INTO customer_sites (customer_id,site_name,site_address,site_status,service_start_date,service_end_date,
 service_interval_days,last_service_contact_date,next_service_contact_date,note) VALUES (?,?,?,?,?,?,?,?,?,?)`,
 [d.customer_id,d.site_name,d.site_address||null,d.site_status||'active',d.service_start_date||null,d.service_end_date||null,
 d.service_interval_days||30,d.last_service_contact_date||null,d.next_service_contact_date||null,d.note||null]
))[0].insertId;
exports.update=async(id,d)=>db.query(
 `UPDATE customer_sites SET customer_id=?,site_name=?,site_address=?,site_status=?,service_start_date=?,service_end_date=?,
 service_interval_days=?,last_service_contact_date=?,next_service_contact_date=?,note=? WHERE site_id=?`,
 [d.customer_id,d.site_name,d.site_address||null,d.site_status||'active',d.service_start_date||null,d.service_end_date||null,
 d.service_interval_days||30,d.last_service_contact_date||null,d.next_service_contact_date||null,d.note||null,id]
);
exports.remove=async id=>db.query('DELETE FROM customer_sites WHERE site_id=?',[id]);
exports.reminders=async()=> (await db.query(
 `SELECT s.*,c.customer_name,c.phone,c.email,c.line_user_id,
  DATEDIFF(s.service_end_date,CURDATE()) days_until_service_end,
  DATEDIFF(s.next_service_contact_date,CURDATE()) days_until_contact
  FROM customer_sites s JOIN customers c ON c.customer_id=s.customer_id
  WHERE s.site_status='active'
  ORDER BY
   CASE WHEN s.service_end_date IS NULL THEN 1 ELSE 0 END,
   s.service_end_date,
   s.next_service_contact_date`
))[0];
exports.markContacted=async id=>db.query(
 `UPDATE customer_sites SET last_service_contact_date=CURDATE(),
  next_service_contact_date=DATE_ADD(CURDATE(),INTERVAL service_interval_days DAY)
  WHERE site_id=?`,[id]
);
