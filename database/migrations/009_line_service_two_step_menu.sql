USE postsales_iot;

UPDATE line_message_templates
SET template_body='ขอบคุณคุณ {{customer_name}} ที่ใช้บริการของเรามา {{days_in_service}} แล้วครับ

ตอนนี้จุดติดตั้ง {{site_name}} ใช้งานเป็นอย่างไรบ้าง มีปัญหาอะไรให้เราช่วยดูแลไหมครับ

กรุณาเลือกคำตอบด้านล่างครับ'
WHERE template_key='service_reminder';

UPDATE line_message_templates
SET template_body='ขอบคุณที่แจ้งให้เราทราบครับ

คุณสามารถแจ้งรายละเอียดเพิ่มเติมได้ 2 วิธี:
1) โทรหาเจ้าหน้าที่ที่ {{support_phone}}
2) กด “แจ้งปัญหา” แล้วพิมพ์อาการในแชตนี้ เช่น “แจ้งปัญหา กล้องไม่ออนไลน์”

ทีมงานจะรีบตรวจสอบและดูแลให้ครับ'
WHERE template_key='service_has_problem';
