require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../config/db');

const username = process.env.POSTSALES_ADMIN_USERNAME || process.argv[2] || 'admin';
const password = process.env.POSTSALES_ADMIN_PASSWORD || process.argv[3] || 'admin123';
const fullName = process.env.POSTSALES_ADMIN_FULL_NAME || process.argv[4] || 'ผู้ดูแลระบบ';
const phone = process.env.POSTSALES_ADMIN_PHONE || process.argv[5] || '';

(async () => {
  try {
    const hash = await bcrypt.hash(password, 12);
    await db.query(
      `INSERT INTO users (full_name, username, password, phone, role, status)
       VALUES (?, ?, ?, ?, 'admin', 'active')
       ON DUPLICATE KEY UPDATE
         full_name = VALUES(full_name),
         password = VALUES(password),
         phone = VALUES(phone),
         role = 'admin',
         status = 'active'`,
      [fullName, username, hash, phone]
    );
    console.log(`Admin user is ready: ${username}`);
    process.exit(0);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
})();
