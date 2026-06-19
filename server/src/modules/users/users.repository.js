const db = require('../../config/db');

exports.list = async () => {
  const [rows] = await db.query(
    `SELECT user_id, full_name, username, phone, role, status, created_at, updated_at
     FROM users ORDER BY full_name`
  );
  return rows;
};

exports.create = async (data) => {
  const [result] = await db.query(
    `INSERT INTO users (full_name, username, password, phone, role, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.full_name, data.username, data.password, data.phone || null, data.role, data.status || 'active']
  );
  return result.insertId;
};

exports.update = async (id, data) => {
  const fields = ['full_name = ?', 'username = ?', 'phone = ?', 'role = ?', 'status = ?'];
  const values = [data.full_name, data.username, data.phone || null, data.role, data.status || 'active'];
  if (data.password) { fields.push('password = ?'); values.push(data.password); }
  values.push(id);
  await db.query(`UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`, values);
};

exports.remove = async (id) => db.query('DELETE FROM users WHERE user_id = ?', [id]);
