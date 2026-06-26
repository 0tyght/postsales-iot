USE postsales_iot;

CREATE TABLE IF NOT EXISTS line_message_templates (
  template_key VARCHAR(80) PRIMARY KEY,
  template_name VARCHAR(150) NOT NULL,
  template_group VARCHAR(80) NOT NULL,
  template_body TEXT NOT NULL,
  variables TEXT,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO line_message_templates (template_key, template_name, template_group, template_body, variables) VALUES
('follow_unbound','ข้อความต้อนรับเมื่อลูกค้าเพิ่มเพื่อน','registration','ขอบคุณที่เพิ่มเพื่อน {{company_name}}\n\nกรุณาส่งรหัสลงทะเบียนที่ได้รับจากช่าง เช่น {{sample_code}} เพื่อผูก LINE กับข้อมูลลูกค้าของคุณ','company_name,sample_code'),
('bind_success','ผูก LINE สำเร็จ','registration','ผูก LINE สำเร็จ\nลูกค้า: {{customer_name}}\n\n{{help_text}}','customer_name,help_text'),
('bind_not_found','ไม่พบรหัสลงทะเบียน','registration','ไม่พบข้อมูลลูกค้าสำหรับรหัสนี้ กรุณาตรวจสอบรหัสอีกครั้ง หรือขอรหัสใหม่จากช่าง','bind_code'),
('bind_used','LINE ถูกผูกกับลูกค้ารายอื่นแล้ว','registration','LINE นี้ผูกกับลูกค้า {{customer_name}} อยู่แล้ว หากต้องการเปลี่ยน กรุณาติดต่อเจ้าหน้าที่','customer_name'),
('help','วิธีใช้งาน LINE','help','สวัสดี{{customer_name}}\n\nแจ้งปัญหา: พิมพ์ “แจ้งปัญหา” ตามด้วยอาการ\nดูสถานะ: พิมพ์ “สถานะ”\nหากมีหลายจุดติดตั้ง ให้พิมพ์ “#รหัสจุดติดตั้ง อาการ”','customer_name'),
('unbound_help','ยังไม่ได้ผูก LINE','help','ยังไม่พบข้อมูลลูกค้าที่ผูกกับ LINE นี้\nกรุณาขอรหัส TYTC จากช่าง แล้วส่งรหัสกลับมาในแชตนี้',''),
('unsupported_message','ข้อความที่ระบบยังไม่รองรับ','fallback','ตอนนี้ระบบรับข้อความตัวอักษรก่อนนะครับ หากต้องการแจ้งปัญหา กรุณาพิมพ์รายละเอียดอาการเป็นข้อความ',''),
('contact_staff','ติดต่อเจ้าหน้าที่','support','เจ้าหน้าที่ได้รับข้อความของคุณแล้ว\nหากต้องการแจ้งปัญหา ให้กด “แจ้งปัญหา” แล้วพิมพ์อาการต่อท้ายได้เลย',''),
('status_empty','ไม่มีเคสค้าง','status','ยังไม่มีเคสบริการในระบบ',''),
('status_line','บรรทัดสถานะเคส','status','เคส #{{case_id}}: {{status}}{{technician_text}}','case_id,status,technician_text'),
('select_site','ให้เลือกรหัสจุดติดตั้ง','problem','กรุณาเลือกจุดติดตั้ง แล้วพิมพ์ “#รหัส อาการ”\n{{site_list}}','site_list'),
('no_active_site','ไม่มีจุดติดตั้งที่เปิดใช้งาน','problem','บัญชีของคุณยังไม่มีจุดติดตั้งที่เปิดใช้งาน กรุณาติดต่อเจ้าหน้าที่',''),
('symptom_too_short','รายละเอียดปัญหาสั้นเกินไป','problem','กรุณาระบุอาการหรือปัญหาให้ละเอียดขึ้นเล็กน้อย',''),
('problem_received','รับแจ้งปัญหาแล้ว','problem','{{received_text}}\nเลขเคส #{{case_id}}\nจุดติดตั้ง: {{site_name}}\nเจ้าหน้าที่จะตรวจสอบและอัปเดตสถานะให้ทราบครับ','received_text,case_id,site_name'),
('service_reminder','แจ้งเตือนรอบ service','service','สวัสดีคุณ {{customer_name}}\n\nถึงรอบติดตามบริการของจุดติดตั้ง {{site_name}} แล้วครับ\nช่วงนี้ระบบใช้งานเป็นอย่างไรบ้าง หากพบปัญหาสามารถตอบกลับในแชตนี้ได้เลย','customer_name,site_name,service_end_date,next_service_contact_date'),
('service_thank_you','ขอบคุณหลังติดตาม service','service','ขอบคุณสำหรับข้อมูลครับ ทีมงานจะบันทึกการติดตามรอบ service ของ {{site_name}} ไว้ในระบบ','site_name'),
('job_completed_thank_you','ขอบคุณหลังปิดงาน','job','งาน {{job_type}} ของจุดติดตั้ง {{site_name}} เสร็จเรียบร้อยแล้ว\nขอบคุณที่ใช้บริการครับ','job_type,site_name'),
('fallback','ระบบไม่เข้าใจข้อความ','fallback','ขออภัยครับ ระบบยังไม่เข้าใจข้อความนี้\nพิมพ์ “วิธีใช้” เพื่อดูเมนูการใช้งานได้เลย','')
ON DUPLICATE KEY UPDATE
  template_name=VALUES(template_name),
  template_group=VALUES(template_group),
  template_body=IF(template_body LIKE '%??%', VALUES(template_body), template_body),
  variables=VALUES(variables);
