USE postsales_iot;

UPDATE line_message_templates
SET template_body='ขอบคุณคุณ {{customer_name}} ที่ใช้บริการของเรามา {{days_in_service}} แล้วครับ

ตอนนี้จุดติดตั้ง {{site_name}} ใช้งานเป็นอย่างไรบ้าง มีปัญหาอะไรให้เราช่วยดูแลไหมครับ

กรุณากดเลือกจากปุ่มด้านล่างได้เลยครับ
หากต้องการโทรแจ้ง สามารถติดต่อได้ที่ {{support_phone}}'
WHERE template_key='service_reminder';
