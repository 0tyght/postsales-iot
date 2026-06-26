USE postsales_iot;

UPDATE line_message_templates
SET template_body='ขอบคุณคุณ {{customer_name}} ที่ใช้บริการของเรามา {{days_in_service}} วันแล้วครับ

ตอนนี้จุดติดตั้ง {{site_name}} ใช้งานเป็นอย่างไรบ้าง มีปัญหาอะไรให้เราช่วยดูแลไหมครับ

ถ้ามีปัญหา พิมพ์ “มีปัญหา” หรือโทรแจ้งได้ที่ {{support_phone}}
ถ้าไม่มีปัญหา พิมพ์ “ไม่มีปัญหา” ได้เลยครับ',
    variables='customer_name,site_name,days_in_service,support_phone,service_start_date,service_end_date,next_service_contact_date'
WHERE template_key='service_reminder';

INSERT INTO line_message_templates (template_key,template_name,template_group,template_body,variables) VALUES
('service_has_problem','ลูกค้าตอบว่ามีปัญหา','service','ขอบคุณที่แจ้งให้เราทราบครับ

รบกวนโทรแจ้งรายละเอียดเพิ่มเติมได้ที่ {{support_phone}} หรือพิมพ์ “แจ้งปัญหา” ตามด้วยอาการในแชตนี้ เช่น “แจ้งปัญหา กล้องไม่ออนไลน์”

ทีมงานจะรีบตรวจสอบและดูแลให้ครับ','support_phone'),
('service_no_problem','ลูกค้าตอบว่าไม่มีปัญหา','service','ขอบคุณมากครับที่อัปเดตให้เรา

ดีใจที่ระบบยังใช้งานได้ปกติ ทีมงานจะคอยดูแลตามรอบ service ถัดไป หากมีปัญหาระหว่างนี้สามารถติดต่อเราได้ทุกเมื่อครับ','')
ON DUPLICATE KEY UPDATE
  template_name=VALUES(template_name),
  template_group=VALUES(template_group),
  template_body=VALUES(template_body),
  variables=VALUES(variables);

UPDATE line_message_templates
SET template_body='หากต้องการให้ทีมงานช่วยดูแลเพิ่มเติม สามารถโทรแจ้งได้ที่ {{support_phone}} หรือพิมพ์ “แจ้งปัญหา” ตามด้วยรายละเอียดอาการในแชตนี้ได้เลยครับ',
    variables='support_phone'
WHERE template_key='contact_staff';
