USE postsales_iot;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE problem_devices;
TRUNCATE TABLE job_evidence;
TRUNCATE TABLE problem_reports;
TRUNCATE TABLE repair_jobs;
TRUNCATE TABLE installation_jobs;
TRUNCATE TABLE device_units;
TRUNCATE TABLE jobs;
TRUNCATE TABLE device_models;
TRUNCATE TABLE customer_sites;
TRUNCATE TABLE customers;
SET FOREIGN_KEY_CHECKS = 1;

SET @admin_id=(SELECT user_id FROM users WHERE role='admin' ORDER BY user_id LIMIT 1);
SET @tech_id=(SELECT user_id FROM users WHERE role='technician' ORDER BY user_id LIMIT 1);

INSERT INTO customers (customer_name,line_user_id,phone,email,address) VALUES
('บริษัท ทีเอชไอซี ฟาร์ม จำกัด',NULL,'0812341001','ops@thicfarm.demo','เชียงใหม่'),
('โรงแรมริเวอร์ไซด์',NULL,'0812341002','engineer@riverside.demo','พิษณุโลก'),
('คลินิกสุขใจ',NULL,'0812341003','admin@sukjai.demo','นครสวรรค์'),
('บ้านคุณโบว์',NULL,'0987657654','bow@example.demo','กรุงเทพฯ');

SET @c1=(SELECT customer_id FROM customers WHERE phone='0812341001');
SET @c2=(SELECT customer_id FROM customers WHERE phone='0812341002');
SET @c3=(SELECT customer_id FROM customers WHERE phone='0812341003');
SET @c4=(SELECT customer_id FROM customers WHERE phone='0987657654');

INSERT INTO customer_sites (customer_id,site_name,site_address,site_status,service_start_date,service_end_date,service_interval_days,next_service_contact_date,note) VALUES
(@c1,'โรงเรือนเกษตรอัจฉริยะ','อ.เมือง จ.เชียงใหม่','active','2026-06-01','2027-05-31',30,CURDATE()+INTERVAL 7 DAY,'ตรวจระบบน้ำและเซนเซอร์ทุกเดือน'),
(@c1,'คลังสินค้า','อ.สารภี จ.เชียงใหม่','active','2026-04-01','2027-03-31',45,CURDATE()+INTERVAL 14 DAY,'พื้นที่ควบคุมอุณหภูมิ'),
(@c2,'อาคารโรงแรมหลัก','ริมแม่น้ำ จ.พิษณุโลก','active','2026-01-10','2027-01-09',30,CURDATE()+INTERVAL 3 DAY,'ติดต่อวิศวกรอาคารก่อนเข้าพื้นที่'),
(@c3,'คลินิกสาขาเมือง','อ.เมือง จ.นครสวรรค์','active','2026-03-15','2027-03-14',60,CURDATE()+INTERVAL 24 DAY,'เลี่ยงช่วงตรวจคนไข้'),
(@c4,'บ้านหลัง A','กรุงเทพฯ','active','2026-06-20','2027-06-19',30,CURDATE()+INTERVAL 10 DAY,'ลูกค้าทดสอบลงทะเบียน LINE');

SET @s1=(SELECT site_id FROM customer_sites WHERE customer_id=@c1 AND site_name='โรงเรือนเกษตรอัจฉริยะ');
SET @s2=(SELECT site_id FROM customer_sites WHERE customer_id=@c1 AND site_name='คลังสินค้า');
SET @s3=(SELECT site_id FROM customer_sites WHERE customer_id=@c2 AND site_name='อาคารโรงแรมหลัก');
SET @s4=(SELECT site_id FROM customer_sites WHERE customer_id=@c3 AND site_name='คลินิกสาขาเมือง');
SET @s5=(SELECT site_id FROM customer_sites WHERE customer_id=@c4 AND site_name='บ้านหลัง A');

INSERT INTO device_models (model_name,brand,description,specification) VALUES
('IoT Gateway G2','THIC','เกตเวย์หลักสำหรับรวมข้อมูลอุปกรณ์','Ethernet, Wi-Fi, 4G, Modbus'),
('Temperature Sensor T20','THIC','วัดอุณหภูมิและความชื้น','LoRaWAN, Battery'),
('Water Leak Sensor W10','THIC','ตรวจจับน้ำรั่ว','Zigbee, Battery'),
('Smart Energy Meter E3','THIC','มิเตอร์ไฟฟ้า 3 เฟส','Modbus RS485'),
('Relay Controller R8','THIC','ควบคุมรีเลย์ 8 ช่อง','Modbus TCP');

SET @gw=(SELECT model_id FROM device_models WHERE model_name='IoT Gateway G2');
SET @temp=(SELECT model_id FROM device_models WHERE model_name='Temperature Sensor T20');
SET @leak=(SELECT model_id FROM device_models WHERE model_name='Water Leak Sensor W10');
SET @meter=(SELECT model_id FROM device_models WHERE model_name='Smart Energy Meter E3');
SET @relay=(SELECT model_id FROM device_models WHERE model_name='Relay Controller R8');

INSERT INTO device_units (model_id,site_id,installation_job_id,serial_number,device_status,purchase_date,warranty_years,warranty_end_date) VALUES
(@gw,@s1,NULL,'THIC-GW-0001','active','2026-06-01',2,'2028-05-31'),
(@temp,@s1,NULL,'THIC-TP-0001','active','2026-06-01',1,'2027-05-31'),
(@temp,@s1,NULL,'THIC-TP-0002','active','2026-06-01',1,'2027-05-31'),
(@meter,@s2,NULL,'THIC-EM-0001','active','2026-04-01',1,'2027-03-31'),
(@gw,@s3,NULL,'THIC-GW-0002','active','2026-01-10',2,'2028-01-09'),
(@leak,@s3,NULL,'THIC-WL-0001','active','2026-01-10',1,'2027-01-09'),
(@gw,@s4,NULL,'THIC-GW-0003','active','2026-03-15',2,'2028-03-14'),
(@relay,@s4,NULL,'THIC-RY-0001','active','2026-03-15',1,'2027-03-14'),
(@gw,NULL,NULL,'THIC-GW-STOCK-01','active','2026-06-24',2,'2028-06-23'),
(@temp,NULL,NULL,'THIC-TP-STOCK-01','active','2026-06-24',1,'2027-06-23'),
(@leak,NULL,NULL,'THIC-WL-STOCK-01','active','2026-06-24',1,'2027-06-23');

INSERT INTO jobs (site_id,technician_id,job_status,scheduled_at,job_note,result_summary,created_by,started_at,completed_at) VALUES
(@s5,@tech_id,'created',NOW()+INTERVAL 1 DAY,'ติดตั้งระบบ IoT ชุดแรก',NULL,@tech_id,NULL,NULL),
(@s1,@tech_id,'in_progress',NOW()-INTERVAL 1 HOUR,'ตรวจกล้องและเซนเซอร์โรงเรือน',NULL,@admin_id,NOW()-INTERVAL 30 MINUTE,NULL),
(@s3,@tech_id,'completed',NOW()-INTERVAL 3 DAY,'เปลี่ยนเซนเซอร์น้ำรั่ว','ทดสอบแล้วใช้งานได้ปกติ',@admin_id,NOW()-INTERVAL 3 DAY,NOW()-INTERVAL 2 DAY);

SET @job_install=(SELECT job_id FROM jobs WHERE site_id=@s5 ORDER BY job_id DESC LIMIT 1);
SET @job_repair=(SELECT job_id FROM jobs WHERE site_id=@s1 AND job_status='in_progress' ORDER BY job_id DESC LIMIT 1);
SET @job_done=(SELECT job_id FROM jobs WHERE site_id=@s3 AND job_status='completed' ORDER BY job_id DESC LIMIT 1);

INSERT INTO installation_jobs (job_id) VALUES (@job_install);
INSERT INTO repair_jobs (job_id,repair_summary,repair_note) VALUES
(@job_repair,NULL,NULL),
(@job_done,'เปลี่ยนเซนเซอร์น้ำรั่ว','ลูกค้ารับทราบแล้ว');

INSERT INTO problem_reports (site_id,job_id,symptom_detail,problem_status,reported_at,recorded_by,source_type,contact_channel) VALUES
(@s1,@job_repair,'กล้องและเซนเซอร์บางจุดไม่ส่งข้อมูล','assigned',NOW()-INTERVAL 2 HOUR,@admin_id,'customer_call','phone'),
(@s3,@job_done,'เซนเซอร์น้ำรั่วแจ้งเตือนผิดพลาด','resolved',NOW()-INTERVAL 4 DAY,@admin_id,'line_chat','line'),
(@s2,NULL,'อุณหภูมิในคลังแกว่งผิดปกติ','open',NOW()-INTERVAL 30 MINUTE,@admin_id,'line_chat','line');
