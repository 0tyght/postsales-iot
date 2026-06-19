const db = require('../../config/db');

exports.findByUsername = async (username) => {
  const [rows] = await db.query(
    `SELECT user_id, full_name, username, password, phone, role, status
     FROM users WHERE username = ? LIMIT 1`,
    [username]
  );
  return rows[0];
};
