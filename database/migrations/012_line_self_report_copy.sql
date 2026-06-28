USE postsales_iot;

UPDATE line_message_templates SET template_body='สวัสดี{{customer_name}}

คุณสามารถใช้งานผ่านเมนูด้านล่างได้เลยครับ
• แจ้งปัญหา: ระบบจะให้เลือกจุดติดตั้ง อุปกรณ์ ประเภทปัญหา และวันเวลานัดหมาย
• ดูสถานะ: ตรวจสอบเคสล่าสุด
• ติดต่อเจ้าหน้าที่: ดูเบอร์ติดต่อหรือช่องทางแจ้งรายละเอียดเพิ่มเติม'
WHERE template_key='help';

UPDATE line_message_templates SET template_body='ตอนนี้ระบบรับข้อความตัวอักษรก่อนนะครับ
หากต้องการแจ้งซ่อม กรุณากดเมนู “แจ้งปัญหา” ด้านล่างได้เลย'
WHERE template_key='unsupported_message';

UPDATE line_message_templates SET template_body='หากต้องการให้ทีมงานช่วยดูแลเพิ่มเติม สามารถโทรแจ้งได้ที่ {{support_phone}}

หรือกด “แจ้งปัญหา” เพื่อสร้างเคสและนัดหมายผ่าน LINE ได้เลยครับ'
WHERE template_key='contact_staff';

UPDATE line_message_templates SET template_body='กรุณาเลือกจุดติดตั้งที่ต้องการแจ้งซ่อมจากปุ่มด้านล่างครับ

{{site_list}}'
WHERE template_key='select_site';

UPDATE line_message_templates SET template_body='{{received_text}}
เลขเคส: #{{case_id}}
จุดติดตั้ง: {{site_name}}

ทีมงานได้รับข้อมูลแล้ว และจะติดต่อกลับตามวันเวลาที่แจ้งไว้หรือเร็วที่สุดครับ ขอบคุณที่แจ้งข้อมูลให้เราดูแล'
WHERE template_key='problem_received';

UPDATE line_message_templates SET template_body='ขอบคุณที่แจ้งให้เราทราบครับ

กด “แจ้งซ่อมตอนนี้” เพื่อเลือกอุปกรณ์ ประเภทปัญหา และวันเวลานัดหมายผ่าน LINE ได้เลย
หรือต้องการคุยกับเจ้าหน้าที่ โทร {{support_phone}}

ทีมงานจะรีบตรวจสอบและดูแลให้ครับ'
WHERE template_key='service_has_problem';
