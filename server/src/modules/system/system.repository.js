const db = require('../../config/db');

const ensureSystemSettingsTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS system_settings (
      setting_key VARCHAR(120) PRIMARY KEY,
      setting_value TEXT,
      setting_group VARCHAR(80) NOT NULL DEFAULT 'general',
      is_secret TINYINT(1) NOT NULL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

exports.findAll = async () => {
  await ensureSystemSettingsTable();
  const [rows] = await db.query(
    `SELECT setting_key, setting_value, setting_group, is_secret, updated_at
     FROM system_settings
     ORDER BY setting_group, setting_key`
  );
  return rows;
};

exports.upsertMany = async (items = []) => {
  await ensureSystemSettingsTable();
  if (!items.length) return [];
  await db.query(
    `INSERT INTO system_settings (setting_key, setting_value, setting_group, is_secret)
     VALUES ?
     ON DUPLICATE KEY UPDATE
       setting_value = VALUES(setting_value),
       setting_group = VALUES(setting_group),
       is_secret = VALUES(is_secret),
       updated_at = CURRENT_TIMESTAMP`,
    [items.map((item) => [
      item.setting_key,
      item.setting_value ?? '',
      item.setting_group || 'general',
      item.is_secret ? 1 : 0,
    ])]
  );
  return exports.findAll();
};
