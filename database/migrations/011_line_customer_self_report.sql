USE postsales_iot;

ALTER TABLE problem_reports
  ADD COLUMN reported_device_id INT NULL AFTER job_id,
  ADD COLUMN issue_type VARCHAR(80) NULL AFTER reported_device_id,
  ADD COLUMN preferred_appointment_at DATETIME NULL AFTER symptom_detail,
  ADD COLUMN preferred_appointment_note VARCHAR(255) NULL AFTER preferred_appointment_at,
  ADD CONSTRAINT fk_problem_reports_device FOREIGN KEY (reported_device_id)
    REFERENCES device_units(device_id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS line_report_sessions (
  line_user_id VARCHAR(120) PRIMARY KEY,
  customer_id INT NOT NULL,
  step VARCHAR(40) NOT NULL,
  data_json TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  expires_at DATETIME,
  CONSTRAINT fk_line_report_sessions_customer FOREIGN KEY (customer_id)
    REFERENCES customers(customer_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
