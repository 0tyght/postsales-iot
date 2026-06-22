USE postsales_iot;

CREATE TABLE IF NOT EXISTS job_evidence (
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
