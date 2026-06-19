USE postsales_iot;

ALTER TABLE customers
  ADD COLUMN customer_name VARCHAR(150) NULL AFTER customer_id;
UPDATE customers SET customer_name = CONCAT('ลูกค้า #', customer_id)
WHERE customer_name IS NULL OR customer_name = '';
ALTER TABLE customers
  MODIFY customer_name VARCHAR(150) NOT NULL;

ALTER TABLE customer_sites
  ADD COLUMN site_status ENUM('active','inactive') NOT NULL DEFAULT 'active' AFTER site_address;

ALTER TABLE jobs
  ADD COLUMN scheduled_at DATETIME NULL AFTER job_status,
  ADD COLUMN job_note TEXT NULL AFTER scheduled_at;

ALTER TABLE problem_reports
  ADD COLUMN problem_status ENUM('open','assigned','resolved','cancelled')
  NOT NULL DEFAULT 'open' AFTER symptom_detail;

UPDATE problem_reports p
LEFT JOIN jobs j ON j.job_id = p.job_id
SET p.problem_status = CASE
  WHEN j.job_status = 'completed' THEN 'resolved'
  WHEN p.job_id IS NOT NULL THEN 'assigned'
  ELSE 'open'
END;
