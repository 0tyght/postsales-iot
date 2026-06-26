USE postsales_iot;

UPDATE line_message_templates SET template_body='สวัสดีครับ ขอบคุณที่เพิ่มเพื่อน {{company_name}}

เพื่อให้เราดูแลข้อมูลของคุณได้ถูกต้อง กรุณาส่งรหัสยืนยันที่ได้รับจากช่าง เช่น {{sample_code}} ในแชตนี้ครับ'
WHERE template_key='follow_unbound';

UPDATE line_message_templates SET template_body='ผูก LINE สำเร็จแล้วครับ
ลูกค้า: {{customer_name}}

จากนี้คุณสามารถแจ้งปัญหา ตรวจสอบสถานะ และรับข้อความติดตามรอบดูแลผ่าน LINE นี้ได้เลย

{{help_text}}'
WHERE template_key='bind_success';

UPDATE line_message_templates SET template_body='ขออภัยครับ ไม่พบข้อมูลลูกค้าจากรหัสนี้
กรุณาตรวจสอบรหัสอีกครั้ง หรือขอรหัสใหม่จากช่างผู้ดูแลครับ'
WHERE template_key='bind_not_found';

UPDATE line_message_templates SET template_body='LINE นี้ผูกกับลูกค้า {{customer_name}} อยู่แล้วครับ
หากต้องการเปลี่ยนบัญชี LINE กรุณาติดต่อเจ้าหน้าที่เพื่อยืนยันตัวตนก่อนดำเนินการ'
WHERE template_key='bind_used';

UPDATE line_message_templates SET template_body='สวัสดี{{customer_name}}

คุณสามารถใช้งานผ่านเมนูด้านล่างได้เลยครับ
• แจ้งปัญหา: กด “แจ้งปัญหา” แล้วพิมพ์อาการที่พบ
• ดูสถานะ: กด “ดูสถานะ” เพื่อตรวจสอบเคสล่าสุด
• ติดต่อเจ้าหน้าที่: ดูเบอร์ติดต่อหรือช่องทางแจ้งรายละเอียดเพิ่มเติม'
WHERE template_key='help';

UPDATE line_message_templates SET template_body='ยังไม่พบข้อมูลลูกค้าที่ผูกกับ LINE นี้ครับ
กรุณาขอรหัสยืนยันจากช่าง เช่น TYTC0001 แล้วส่งรหัสกลับมาในแชตนี้ เพื่อเริ่มใช้งานครับ'
WHERE template_key='unbound_help';

UPDATE line_message_templates SET template_body='ตอนนี้ระบบรับข้อความตัวอักษรก่อนนะครับ
หากต้องการแจ้งปัญหา กรุณาพิมพ์รายละเอียดอาการ หรือกดเมนู “แจ้งปัญหา” ด้านล่างได้เลย'
WHERE template_key='unsupported_message';

UPDATE line_message_templates SET template_body='หากต้องการให้ทีมงานช่วยดูแลเพิ่มเติม สามารถโทรแจ้งได้ที่ {{support_phone}}

หรือกด “แจ้งปัญหา” แล้วพิมพ์รายละเอียดอาการในแชตนี้ได้เลยครับ',
variables='support_phone'
WHERE template_key='contact_staff';

UPDATE line_message_templates SET template_body='ขณะนี้ยังไม่มีเคสปัญหาค้างอยู่ในระบบครับ
หากพบปัญหาใหม่ สามารถกด “แจ้งปัญหา” ได้เลย'
WHERE template_key='status_empty';

UPDATE line_message_templates SET template_body='กรุณาเลือกจุดติดตั้งที่ต้องการแจ้งปัญหา แล้วพิมพ์ตามรูปแบบนี้ครับ
“#รหัส อาการที่พบ”

{{site_list}}'
WHERE template_key='select_site';

UPDATE line_message_templates SET template_body='บัญชีของคุณยังไม่มีจุดติดตั้งที่เปิดใช้งานในระบบครับ
กรุณาติดต่อเจ้าหน้าที่เพื่อให้ช่วยตรวจสอบข้อมูล'
WHERE template_key='no_active_site';

UPDATE line_message_templates SET template_body='รบกวนแจ้งอาการเพิ่มเติมอีกเล็กน้อยครับ เช่น อุปกรณ์ไหนมีปัญหา เกิดตั้งแต่เมื่อไหร่ หรือมีไฟแจ้งเตือนอะไรขึ้นบ้าง'
WHERE template_key='symptom_too_short';

UPDATE line_message_templates SET template_body='{{received_text}}
เลขเคส: #{{case_id}}
จุดติดตั้ง: {{site_name}}

ทีมงานจะตรวจสอบและอัปเดตสถานะให้ทราบครับ ขอบคุณที่แจ้งข้อมูลให้เราดูแล'
WHERE template_key='problem_received';

UPDATE line_message_templates SET template_body='ขอบคุณคุณ {{customer_name}} ที่ใช้บริการของเรามา {{days_in_service}} วันแล้วครับ

ตอนนี้จุดติดตั้ง {{site_name}} ใช้งานเป็นอย่างไรบ้าง มีปัญหาอะไรให้เราช่วยดูแลไหมครับ

กรุณาเลือกคำตอบจากเมนูด้านล่างได้เลยครับ
• มีปัญหา
• ไม่มีปัญหา

หากต้องการโทรแจ้ง สามารถติดต่อได้ที่ {{support_phone}}'
WHERE template_key='service_reminder';

UPDATE line_message_templates SET template_body='ขอบคุณที่แจ้งให้เราทราบครับ

หากสะดวก รบกวนโทรแจ้งรายละเอียดเพิ่มเติมได้ที่ {{support_phone}}
หรือกด “แจ้งปัญหา” แล้วพิมพ์อาการในแชตนี้ เช่น “แจ้งปัญหา กล้องไม่ออนไลน์”

ทีมงานจะรีบตรวจสอบและดูแลให้ครับ'
WHERE template_key='service_has_problem';

UPDATE line_message_templates SET template_body='ขอบคุณมากครับที่อัปเดตให้เรา

ดีใจที่ระบบยังใช้งานได้ปกติ ทีมงานจะบันทึกผลการติดตามรอบนี้ไว้ และจะคอยดูแลตามรอบ service ถัดไปครับ'
WHERE template_key='service_no_problem';

UPDATE line_message_templates SET template_body='ขอบคุณสำหรับข้อมูลครับ ทีมงานบันทึกการติดตามรอบ service ของ {{site_name}} ไว้เรียบร้อยแล้ว'
WHERE template_key='service_thank_you';

UPDATE line_message_templates SET template_body='งาน {{job_type}} ของจุดติดตั้ง {{site_name}} ดำเนินการเสร็จเรียบร้อยแล้วครับ

ขอบคุณที่ไว้วางใจให้เราดูแล หากพบปัญหาเพิ่มเติมสามารถแจ้งผ่าน LINE นี้ได้ตลอดครับ'
WHERE template_key='job_completed_thank_you';

UPDATE line_message_templates SET template_body='ขออภัยครับ ระบบยังไม่เข้าใจข้อความนี้
กรุณาเลือกเมนูด้านล่าง หรือพิมพ์ “วิธีใช้” เพื่อดูวิธีใช้งานครับ'
WHERE template_key='fallback';
