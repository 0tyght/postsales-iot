const crypto = require('crypto');
const db = require('../../config/db');

const makeLicenseKey = () => {
  const raw = crypto.randomBytes(12).toString('hex').toUpperCase();
  return `TYT-PSIOT-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`;
};

exports.makeLicenseKey = makeLicenseKey;

exports.list = async () => {
  const [rows] = await db.query(`
    SELECT l.*, c.company_name, c.domain_name, c.contact_name, c.contact_phone, c.contact_email
    FROM licenses l
    JOIN license_customers c ON c.customer_id = l.customer_id
    ORDER BY l.updated_at DESC
  `);
  return rows;
};

exports.createCustomer = async (payload) => {
  const [result] = await db.query(
    `INSERT INTO license_customers (company_name, contact_name, contact_phone, contact_email, domain_name)
     VALUES (?, ?, ?, ?, ?)`,
    [payload.company_name, payload.contact_name || null, payload.contact_phone || null, payload.contact_email || null, payload.domain_name || null]
  );
  return result.insertId;
};

exports.createLicense = async (customerId, payload) => {
  const licenseKey = payload.license_key || makeLicenseKey();
  const [result] = await db.query(
    `INSERT INTO licenses
      (customer_id, license_key, plan_code, status, billing_cycle, starts_at, expires_at,
       max_users, max_technicians, max_customers, max_storage_gb, grace_days, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      customerId,
      licenseKey,
      payload.plan_code || 'local-business',
      payload.status || 'trial',
      payload.billing_cycle || 'monthly',
      payload.starts_at || new Date().toISOString().slice(0, 10),
      payload.expires_at || null,
      payload.max_users || 10,
      payload.max_technicians || 5,
      payload.max_customers || 500,
      payload.max_storage_gb || 20,
      payload.grace_days || 7,
      payload.notes || null,
    ]
  );
  return { license_id: result.insertId, license_key: licenseKey };
};

exports.findByKey = async (licenseKey) => {
  const [rows] = await db.query(`
    SELECT l.*, c.company_name, c.domain_name, c.status customer_status
    FROM licenses l
    JOIN license_customers c ON c.customer_id = l.customer_id
    WHERE l.license_key = ?
    LIMIT 1
  `, [licenseKey]);
  return rows[0] || null;
};

exports.update = async (licenseId, payload) => {
  const allowed = ['plan_code', 'status', 'billing_cycle', 'starts_at', 'expires_at', 'max_users', 'max_technicians', 'max_customers', 'max_storage_gb', 'grace_days', 'notes'];
  const fields = allowed.filter(key => Object.prototype.hasOwnProperty.call(payload, key));
  if (!fields.length) return exports.get(licenseId);
  const sql = `UPDATE licenses SET ${fields.map(key => `${key} = ?`).join(', ')} WHERE license_id = ?`;
  await db.query(sql, [...fields.map(key => payload[key] === undefined ? null : payload[key]), licenseId]);
  return exports.get(licenseId);
};

exports.get = async (licenseId) => {
  const [rows] = await db.query(`
    SELECT l.*, c.company_name, c.domain_name, c.contact_name, c.contact_phone, c.contact_email
    FROM licenses l
    JOIN license_customers c ON c.customer_id = l.customer_id
    WHERE l.license_id = ?
  `, [licenseId]);
  return rows[0] || null;
};

exports.recordCheckin = async (licenseId, payload, statusResult, ip) => {
  await db.query(
    `INSERT INTO license_checkins (license_id, machine_id, app_version, public_url, ip_address, status_result)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [licenseId, payload.machine_id || null, payload.app_version || null, payload.public_url || null, ip || null, statusResult]
  );
};
