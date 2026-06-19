USE postsales_iot;

-- Local test accounts: admin/admin123 and technician01/tech123
INSERT INTO users (full_name, username, password, phone, role) VALUES
('ผู้ดูแลระบบ', 'admin', '$2b$12$zWqsJYAhjzL8eKEHr32W..uOfcXd0zUZvglPzmLfM0CeX/nTxzrli', '0800000001', 'admin'),
('ช่างทดสอบ', 'technician01', '$2b$12$qtcmwLuYrFJOYDkcWRSS8OGX9Hu3Q2FLRQZIJX1zo.nP27A5.zgBG', '0800000002', 'technician');

INSERT INTO customers (customer_name, line_user_id, phone, email, address) VALUES
('สมชาย ใจดี', 'Uxxxxxxxxxxxxxxxx', '0899999999', 'customer@example.com', 'พิษณุโลก');

INSERT INTO customer_sites
  (customer_id, site_name, site_address, service_start_date, service_end_date,
   service_interval_days, next_service_contact_date, note)
VALUES
  (1, 'บ้านหลัง A', 'ต.ท่าโพธิ์ อ.เมือง จ.พิษณุโลก', '2026-01-01', '2028-12-31',
   30, '2026-07-01', 'เซอร์วิส 3 ปี ติดต่อทุก 1 เดือน');

INSERT INTO device_models (model_name, brand, description, specification) VALUES
('IoT Gateway V1', 'INSYSC', 'กล่อง IoT Gateway สำหรับติดตั้งที่บ้านลูกค้า',
 'รองรับการเชื่อมต่ออินเทอร์เน็ตและเซนเซอร์');

INSERT INTO jobs (site_id, technician_id, job_status, result_summary, created_by, started_at, completed_at)
VALUES (1, 2, 'completed', 'ติดตั้งและทดสอบเรียบร้อย', 1, NOW(), NOW());

INSERT INTO installation_jobs
  (job_id, installation_result, install_location_detail, test_result, test_detail, installation_note)
VALUES (1, 'success', 'ห้องควบคุม', 'pass', 'เชื่อมต่อระบบสำเร็จ', 'ติดตั้งเรียบร้อย');

INSERT INTO device_units
  (model_id, site_id, installation_job_id, serial_number, device_status, warranty_end_date)
VALUES (1, 1, 1, 'IOT-GW-0001', 'active', '2027-01-01');
