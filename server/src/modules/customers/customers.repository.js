const db = require('../../config/db');
exports.list = async () => (await db.query(
  `SELECT c.*, COUNT(DISTINCT s.site_id) site_count, COUNT(DISTINCT d.device_id) device_count
   FROM customers c LEFT JOIN customer_sites s ON s.customer_id=c.customer_id
   LEFT JOIN device_units d ON d.site_id=s.site_id GROUP BY c.customer_id ORDER BY c.customer_id DESC`
))[0];
exports.create = async (d) => (await db.query(
  'INSERT INTO customers (customer_name,line_user_id,phone,email,address) VALUES (?,?,?,?,?)',
  [d.customer_name,d.line_user_id||null,d.phone||null,d.email||null,d.address||null]
))[0].insertId;
exports.update = async (id,d) => db.query(
  'UPDATE customers SET customer_name=?,line_user_id=?,phone=?,email=?,address=? WHERE customer_id=?',
  [d.customer_name,d.line_user_id||null,d.phone||null,d.email||null,d.address||null,id]
);
exports.usage = async (id) => (await db.query(
  `SELECT
    (SELECT COUNT(*) FROM customer_sites WHERE customer_id=?) site_count,
    (SELECT COUNT(*) FROM device_units d JOIN customer_sites s ON s.site_id=d.site_id WHERE s.customer_id=?) device_count,
    (SELECT COUNT(*) FROM jobs j JOIN customer_sites s ON s.site_id=j.site_id WHERE s.customer_id=?) job_count,
    (SELECT COUNT(*) FROM problem_reports p JOIN customer_sites s ON s.site_id=p.site_id WHERE s.customer_id=?) problem_count`,
  [id,id,id,id]
))[0][0];
exports.remove = async (id) => db.query('DELETE FROM customers WHERE customer_id=?',[id]);
