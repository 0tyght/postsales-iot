const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.LICENSE_DB_HOST || '127.0.0.1',
  port: Number(process.env.LICENSE_DB_PORT || 3306),
  user: process.env.LICENSE_DB_USER || 'root',
  password: process.env.LICENSE_DB_PASSWORD || '',
  database: process.env.LICENSE_DB_NAME || 'postsales_license',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
  charset: 'utf8mb4',
});

module.exports = pool;
