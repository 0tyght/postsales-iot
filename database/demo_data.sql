USE postsales_iot;

-- ชุดข้อมูลสำหรับทดสอบ UX หน้าแอดมิน รันซ้ำได้โดยไม่เพิ่ม Serial Number ซ้ำ
INSERT INTO customers (customer_name,line_user_id,phone,email,address) VALUES
('บริษัท นอร์ทเทิร์นฟู้ด จำกัด','UDEMO-C001','0812341001','it@northern-food.demo','อ.เมือง จ.เชียงใหม่'),
('โรงแรมริเวอร์ไซด์','UDEMO-C002','0812341002','engineer@riverside.demo','อ.เมือง จ.พิษณุโลก'),
('คลินิกสุขใจ','UDEMO-C003','0812341003','admin@sukjai.demo','อ.เมือง จ.นครสวรรค์'),
('บริษัท กรีนฟาร์ม จำกัด','UDEMO-C004','0812341004','ops@greenfarm.demo','อ.วังทอง จ.พิษณุโลก')
ON DUPLICATE KEY UPDATE customer_name=VALUES(customer_name),phone=VALUES(phone),email=VALUES(email),address=VALUES(address);

SET @c1=(SELECT customer_id FROM customers WHERE line_user_id='UDEMO-C001');
SET @c2=(SELECT customer_id FROM customers WHERE line_user_id='UDEMO-C002');
SET @c3=(SELECT customer_id FROM customers WHERE line_user_id='UDEMO-C003');
SET @c4=(SELECT customer_id FROM customers WHERE line_user_id='UDEMO-C004');

INSERT INTO customer_sites (customer_id,site_name,site_address,site_status,service_start_date,service_end_date,service_interval_days,next_service_contact_date,note)
SELECT @c1,'โรงงานเชียงใหม่','นิคมอุตสาหกรรมภาคเหนือ จ.เชียงใหม่','active','2025-07-01','2028-06-30',30,CURDATE()+INTERVAL 3 DAY,'ติดต่อฝ่ายซ่อมบำรุงก่อนเข้าพื้นที่'
WHERE NOT EXISTS (SELECT 1 FROM customer_sites WHERE customer_id=@c1 AND site_name='โรงงานเชียงใหม่');
INSERT INTO customer_sites (customer_id,site_name,site_address,site_status,service_start_date,service_end_date,service_interval_days,next_service_contact_date,note)
SELECT @c1,'คลังสินค้าลำพูน','อ.เมือง จ.ลำพูน','active','2025-09-15','2028-09-14',45,CURDATE()-INTERVAL 2 DAY,'พื้นที่ควบคุมอุณหภูมิ'
WHERE NOT EXISTS (SELECT 1 FROM customer_sites WHERE customer_id=@c1 AND site_name='คลังสินค้าลำพูน');
INSERT INTO customer_sites (customer_id,site_name,site_address,site_status,service_start_date,service_end_date,service_interval_days,next_service_contact_date,note)
SELECT @c2,'อาคารโรงแรมหลัก','ถนนริมแม่น้ำน่าน จ.พิษณุโลก','active','2026-01-10','2029-01-09',30,CURDATE()+INTERVAL 12 DAY,'เข้าพื้นที่ผ่านห้องวิศวกรรม'
WHERE NOT EXISTS (SELECT 1 FROM customer_sites WHERE customer_id=@c2 AND site_name='อาคารโรงแรมหลัก');
INSERT INTO customer_sites (customer_id,site_name,site_address,site_status,service_start_date,service_end_date,service_interval_days,next_service_contact_date,note)
SELECT @c3,'คลินิกสาขาเมือง','อ.เมือง จ.นครสวรรค์','active','2025-11-01','2027-10-31',60,CURDATE()+INTERVAL 25 DAY,'หลีกเลี่ยงช่วงตรวจคนไข้'
WHERE NOT EXISTS (SELECT 1 FROM customer_sites WHERE customer_id=@c3 AND site_name='คลินิกสาขาเมือง');
INSERT INTO customer_sites (customer_id,site_name,site_address,site_status,service_start_date,service_end_date,service_interval_days,next_service_contact_date,note)
SELECT @c4,'โรงเรือนเกษตรอัจฉริยะ','อ.วังทอง จ.พิษณุโลก','active','2026-02-01','2029-01-31',30,CURDATE()+INTERVAL 5 DAY,'สัญญาณโทรศัพท์บางจุดไม่เสถียร'
WHERE NOT EXISTS (SELECT 1 FROM customer_sites WHERE customer_id=@c4 AND site_name='โรงเรือนเกษตรอัจฉริยะ');

INSERT INTO device_models (model_name,brand,description,specification)
SELECT 'Smart Gateway G2','INSYSC','เกตเวย์หลักสำหรับรวมข้อมูลเซนเซอร์','Ethernet, Wi-Fi, 4G, Modbus' WHERE NOT EXISTS (SELECT 1 FROM device_models WHERE model_name='Smart Gateway G2');
INSERT INTO device_models (model_name,brand,description,specification)
SELECT 'Air Quality Sensor AQ-100','SensePro','ตรวจวัดคุณภาพอากาศภายในอาคาร','PM2.5, CO2, TVOC' WHERE NOT EXISTS (SELECT 1 FROM device_models WHERE model_name='Air Quality Sensor AQ-100');
INSERT INTO device_models (model_name,brand,description,specification)
SELECT 'Temperature Sensor TH-20','SensePro','ตรวจวัดอุณหภูมิและความชื้น','-20 ถึง 80°C, LoRaWAN' WHERE NOT EXISTS (SELECT 1 FROM device_models WHERE model_name='Temperature Sensor TH-20');
INSERT INTO device_models (model_name,brand,description,specification)
SELECT 'Water Leak Sensor WL-10','SafeHome','ตรวจจับน้ำรั่วซึม','Battery, Zigbee' WHERE NOT EXISTS (SELECT 1 FROM device_models WHERE model_name='Water Leak Sensor WL-10');
INSERT INTO device_models (model_name,brand,description,specification)
SELECT 'Smart Energy Meter EM-3P','PowerTrack','มิเตอร์พลังงานไฟฟ้า 3 เฟส','Modbus RS485, 100A' WHERE NOT EXISTS (SELECT 1 FROM device_models WHERE model_name='Smart Energy Meter EM-3P');
INSERT INTO device_models (model_name,brand,description,specification)
SELECT 'Door Contact DC-01','SafeHome','ตรวจจับสถานะประตู','Battery, LoRaWAN' WHERE NOT EXISTS (SELECT 1 FROM device_models WHERE model_name='Door Contact DC-01');
INSERT INTO device_models (model_name,brand,description,specification)
SELECT 'Industrial 4G Router R40','NetLink','เราเตอร์สำหรับพื้นที่หน้างาน','Dual SIM, VPN, DIN Rail' WHERE NOT EXISTS (SELECT 1 FROM device_models WHERE model_name='Industrial 4G Router R40');
INSERT INTO device_models (model_name,brand,description,specification)
SELECT 'Relay Controller RC-8','INSYSC','ควบคุมอุปกรณ์ไฟฟ้า 8 ช่อง','8 Relay, Modbus TCP' WHERE NOT EXISTS (SELECT 1 FROM device_models WHERE model_name='Relay Controller RC-8');

SET @s1=(SELECT site_id FROM customer_sites WHERE customer_id=@c1 AND site_name='โรงงานเชียงใหม่');
SET @s2=(SELECT site_id FROM customer_sites WHERE customer_id=@c1 AND site_name='คลังสินค้าลำพูน');
SET @s3=(SELECT site_id FROM customer_sites WHERE customer_id=@c2 AND site_name='อาคารโรงแรมหลัก');
SET @s4=(SELECT site_id FROM customer_sites WHERE customer_id=@c3 AND site_name='คลินิกสาขาเมือง');
SET @s5=(SELECT site_id FROM customer_sites WHERE customer_id=@c4 AND site_name='โรงเรือนเกษตรอัจฉริยะ');
SET @gw=(SELECT model_id FROM device_models WHERE model_name='Smart Gateway G2' LIMIT 1);
SET @aq=(SELECT model_id FROM device_models WHERE model_name='Air Quality Sensor AQ-100' LIMIT 1);
SET @th=(SELECT model_id FROM device_models WHERE model_name='Temperature Sensor TH-20' LIMIT 1);
SET @wl=(SELECT model_id FROM device_models WHERE model_name='Water Leak Sensor WL-10' LIMIT 1);
SET @em=(SELECT model_id FROM device_models WHERE model_name='Smart Energy Meter EM-3P' LIMIT 1);
SET @dc=(SELECT model_id FROM device_models WHERE model_name='Door Contact DC-01' LIMIT 1);
SET @rt=(SELECT model_id FROM device_models WHERE model_name='Industrial 4G Router R40' LIMIT 1);
SET @rc=(SELECT model_id FROM device_models WHERE model_name='Relay Controller RC-8' LIMIT 1);

INSERT INTO device_units (model_id,site_id,serial_number,device_status,warranty_end_date) VALUES
(@gw,@s1,'DEMO-GW-1001','active','2027-07-01'),(@em,@s1,'DEMO-EM-1001','active','2027-07-01'),
(@em,@s1,'DEMO-EM-1002','active','2027-07-01'),(@th,@s1,'DEMO-TH-1001','active','2026-07-15'),
(@th,@s1,'DEMO-TH-1002','active','2026-08-15'),(@rc,@s1,'DEMO-RC-1001','active','2027-06-30'),
(@gw,@s2,'DEMO-GW-2001','active','2027-09-15'),(@th,@s2,'DEMO-TH-2001','active','2026-06-30'),
(@th,@s2,'DEMO-TH-2002','active','2026-06-30'),(@th,@s2,'DEMO-TH-2003','inactive','2025-12-31'),
(@dc,@s2,'DEMO-DC-2001','active','2027-01-15'),(@dc,@s2,'DEMO-DC-2002','active','2027-01-15'),
(@gw,@s3,'DEMO-GW-3001','active','2028-01-10'),(@aq,@s3,'DEMO-AQ-3001','active','2027-01-10'),
(@aq,@s3,'DEMO-AQ-3002','active','2027-01-10'),(@wl,@s3,'DEMO-WL-3001','active','2026-07-05'),
(@wl,@s3,'DEMO-WL-3002','active','2026-07-05'),(@em,@s3,'DEMO-EM-3001','active','2028-01-10'),
(@gw,@s4,'DEMO-GW-4001','active','2027-11-01'),(@aq,@s4,'DEMO-AQ-4001','active','2026-11-01'),
(@aq,@s4,'DEMO-AQ-4002','active','2026-11-01'),(@rt,@s4,'DEMO-RT-4001','active','2027-05-01'),
(@gw,@s5,'DEMO-GW-5001','active','2028-02-01'),(@th,@s5,'DEMO-TH-5001','active','2027-02-01'),
(@th,@s5,'DEMO-TH-5002','active','2027-02-01'),(@wl,@s5,'DEMO-WL-5001','active','2026-06-25'),
(@rc,@s5,'DEMO-RC-5001','active','2027-02-01'),(@rt,@s5,'DEMO-RT-5001','active','2027-02-01')
ON DUPLICATE KEY UPDATE model_id=VALUES(model_id),site_id=VALUES(site_id),device_status=VALUES(device_status),warranty_end_date=VALUES(warranty_end_date);
