USE postsales_iot;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS problem_devices;
DROP TABLE IF EXISTS job_evidence;
DROP TABLE IF EXISTS problem_reports;
DROP TABLE IF EXISTS device_units;
DROP TABLE IF EXISTS repair_jobs;
DROP TABLE IF EXISTS installation_jobs;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS device_models;
DROP TABLE IF EXISTS customer_sites;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('admin','technician') NOT NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE customers (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(150) NOT NULL,
  line_user_id VARCHAR(150) UNIQUE,
  phone VARCHAR(20),
  email VARCHAR(150),
  address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE customer_sites (
  site_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  site_name VARCHAR(150) NOT NULL,
  site_address TEXT,
  site_status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  service_start_date DATE,
  service_end_date DATE,
  service_interval_days INT DEFAULT 30,
  last_service_contact_date DATE,
  next_service_contact_date DATE,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_customer_sites_customer FOREIGN KEY (customer_id)
    REFERENCES customers(customer_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE device_models (
  model_id INT AUTO_INCREMENT PRIMARY KEY,
  model_name VARCHAR(150) NOT NULL,
  brand VARCHAR(100),
  description TEXT,
  specification TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE jobs (
  job_id INT AUTO_INCREMENT PRIMARY KEY,
  site_id INT NOT NULL,
  technician_id INT,
  job_status ENUM('created','in_progress','completed','cancelled') NOT NULL DEFAULT 'created',
  scheduled_at DATETIME,
  job_note TEXT,
  result_summary TEXT,
  evidence_file_path VARCHAR(255),
  started_at DATETIME,
  completed_at DATETIME,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_jobs_site FOREIGN KEY (site_id)
    REFERENCES customer_sites(site_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_jobs_technician FOREIGN KEY (technician_id)
    REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_jobs_created_by FOREIGN KEY (created_by)
    REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE installation_jobs (
  job_id INT PRIMARY KEY,
  installation_result ENUM('success','failed'),
  install_location_detail TEXT,
  test_result ENUM('pass','fail'),
  test_detail TEXT,
  installation_note TEXT,
  CONSTRAINT fk_installation_jobs_job FOREIGN KEY (job_id)
    REFERENCES jobs(job_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE repair_jobs (
  job_id INT PRIMARY KEY,
  repair_summary TEXT,
  repair_note TEXT,
  CONSTRAINT fk_repair_jobs_job FOREIGN KEY (job_id)
    REFERENCES jobs(job_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE device_units (
  device_id INT AUTO_INCREMENT PRIMARY KEY,
  model_id INT NOT NULL,
  site_id INT NOT NULL,
  installation_job_id INT,
  serial_number VARCHAR(150) NOT NULL UNIQUE,
  device_status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  purchase_date DATE,
  warranty_years INT,
  warranty_end_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_device_units_model FOREIGN KEY (model_id)
    REFERENCES device_models(model_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_device_units_site FOREIGN KEY (site_id)
    REFERENCES customer_sites(site_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_device_units_installation_job FOREIGN KEY (installation_job_id)
    REFERENCES installation_jobs(job_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE problem_reports (
  problem_id INT AUTO_INCREMENT PRIMARY KEY,
  site_id INT NOT NULL,
  job_id INT UNIQUE,
  symptom_detail TEXT NOT NULL,
  problem_status ENUM('open','assigned','resolved','cancelled') NOT NULL DEFAULT 'open',
  reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  recorded_by INT,
  source_type ENUM('service_contact','customer_call','line_chat') NOT NULL,
  contact_channel ENUM('phone','line','dashboard') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_problem_reports_site FOREIGN KEY (site_id)
    REFERENCES customer_sites(site_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_problem_reports_job FOREIGN KEY (job_id)
    REFERENCES jobs(job_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_problem_reports_recorded_by FOREIGN KEY (recorded_by)
    REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE job_evidence (
  evidence_id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  evidence_type ENUM('before','during','after','result','other') NOT NULL DEFAULT 'other',
  storage_key VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INT UNSIGNED NOT NULL,
  uploaded_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_job_evidence_job FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_job_evidence_user FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_job_evidence_job (job_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE problem_devices (
  problem_device_id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  device_id INT NOT NULL,
  repair_method ENUM('repair','replace') NOT NULL,
  replacement_device_id INT,
  device_problem_detail TEXT,
  device_action_detail TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_problem_devices_repair_job FOREIGN KEY (job_id)
    REFERENCES repair_jobs(job_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_problem_devices_device FOREIGN KEY (device_id)
    REFERENCES device_units(device_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_problem_devices_replacement_device FOREIGN KEY (replacement_device_id)
    REFERENCES device_units(device_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT chk_replacement_device CHECK (
    (repair_method = 'replace' AND replacement_device_id IS NOT NULL)
    OR repair_method = 'repair'
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
