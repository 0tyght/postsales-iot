CREATE TABLE IF NOT EXISTS system_settings (
  setting_key VARCHAR(120) PRIMARY KEY,
  setting_value TEXT,
  setting_group VARCHAR(80) NOT NULL DEFAULT 'general',
  is_secret TINYINT(1) NOT NULL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO system_settings (setting_key, setting_value, setting_group, is_secret) VALUES
('deployment_mode', 'local_customer_domain', 'deployment', 0),
('tunnel_provider', 'cloudflare', 'deployment', 0),
('public_app_url', '', 'deployment', 0),
('company_domain', '', 'deployment', 0),
('license_status', 'not_configured', 'license', 0),
('license_allowed', '0', 'license', 0),
('license_reason', '', 'license', 0),
('license_plan', '', 'license', 0),
('license_expires_at', '', 'license', 0),
('license_checked_at', '', 'license', 0),
('license_server_url', '', 'license', 0)
ON DUPLICATE KEY UPDATE setting_key = setting_key;
