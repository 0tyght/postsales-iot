CREATE DATABASE IF NOT EXISTS postsales_license
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE postsales_license;

CREATE TABLE IF NOT EXISTS license_customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(180) NOT NULL,
  contact_name VARCHAR(150),
  contact_phone VARCHAR(80),
  contact_email VARCHAR(180),
  domain_name VARCHAR(180),
  status ENUM('active','suspended','cancelled') NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_license_customer_domain (domain_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS licenses (
  license_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  license_key VARCHAR(80) NOT NULL UNIQUE,
  plan_code VARCHAR(80) NOT NULL DEFAULT 'local-business',
  status ENUM('active','trial','expired','suspended','cancelled') NOT NULL DEFAULT 'trial',
  billing_cycle ENUM('monthly','yearly','lifetime','manual') NOT NULL DEFAULT 'monthly',
  starts_at DATE,
  expires_at DATE,
  max_users INT NOT NULL DEFAULT 10,
  max_technicians INT NOT NULL DEFAULT 5,
  max_customers INT NOT NULL DEFAULT 500,
  max_storage_gb INT NOT NULL DEFAULT 20,
  grace_days INT NOT NULL DEFAULT 7,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_licenses_customer FOREIGN KEY (customer_id)
    REFERENCES license_customers(customer_id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_licenses_key_status (license_key, status),
  INDEX idx_licenses_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS license_checkins (
  checkin_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  license_id INT NOT NULL,
  machine_id VARCHAR(180),
  app_version VARCHAR(80),
  public_url VARCHAR(255),
  ip_address VARCHAR(80),
  status_result VARCHAR(40) NOT NULL,
  checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_license_checkins_license FOREIGN KEY (license_id)
    REFERENCES licenses(license_id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_license_checkins_license_date (license_id, checked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
