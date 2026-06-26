const db=require('../../config/db');

const defaultTemplates=[
  ['follow_unbound','ข้อความต้อนรับเมื่อลูกค้าเพิ่มเพื่อน','registration','สวัสดีครับ ขอบคุณที่เพิ่มเพื่อน {{company_name}}\n\nเพื่อให้เราดูแลข้อมูลของคุณได้ถูกต้อง กรุณาส่งรหัสยืนยันที่ได้รับจากช่าง เช่น {{sample_code}} ในแชตนี้ครับ','company_name,sample_code'],
  ['bind_success','ผูก LINE สำเร็จ','registration','ผูก LINE สำเร็จแล้วครับ\nลูกค้า: {{customer_name}}\n\nจากนี้คุณสามารถแจ้งปัญหา ตรวจสอบสถานะ และรับข้อความติดตามรอบดูแลผ่าน LINE นี้ได้เลย\n\n{{help_text}}','customer_name,help_text'],
  ['bind_not_found','ไม่พบรหัสลงทะเบียน','registration','ขออภัยครับ ไม่พบข้อมูลลูกค้าจากรหัสนี้\nกรุณาตรวจสอบรหัสอีกครั้ง หรือขอรหัสใหม่จากช่างผู้ดูแลครับ','bind_code'],
  ['bind_used','LINE ถูกผูกกับลูกค้ารายอื่นแล้ว','registration','LINE นี้ผูกกับลูกค้า {{customer_name}} อยู่แล้วครับ\nหากต้องการเปลี่ยนบัญชี LINE กรุณาติดต่อเจ้าหน้าที่เพื่อยืนยันตัวตนก่อนดำเนินการ','customer_name'],
  ['help','วิธีใช้งาน LINE','help','สวัสดี{{customer_name}}\n\nคุณสามารถใช้งานผ่านเมนูด้านล่างได้เลยครับ\n• แจ้งปัญหา: กด “แจ้งปัญหา” แล้วพิมพ์อาการที่พบ\n• ดูสถานะ: กด “ดูสถานะ” เพื่อตรวจสอบเคสล่าสุด\n• ติดต่อเจ้าหน้าที่: ดูเบอร์ติดต่อหรือช่องทางแจ้งรายละเอียดเพิ่มเติม','customer_name'],
  ['unbound_help','ยังไม่ได้ผูก LINE','help','ยังไม่พบข้อมูลลูกค้าที่ผูกกับ LINE นี้ครับ\nกรุณาขอรหัสยืนยันจากช่าง เช่น TYTC0001 แล้วส่งรหัสกลับมาในแชตนี้ เพื่อเริ่มใช้งานครับ',''],
  ['unsupported_message','ข้อความที่ระบบยังไม่รองรับ','fallback','ตอนนี้ระบบรับข้อความตัวอักษรก่อนนะครับ\nหากต้องการแจ้งปัญหา กรุณาพิมพ์รายละเอียดอาการ หรือกดเมนู “แจ้งปัญหา” ด้านล่างได้เลย',''],
  ['contact_staff','ติดต่อเจ้าหน้าที่','support','หากต้องการให้ทีมงานช่วยดูแลเพิ่มเติม สามารถโทรแจ้งได้ที่ {{support_phone}}\n\nหรือกด “แจ้งปัญหา” แล้วพิมพ์รายละเอียดอาการในแชตนี้ได้เลยครับ','support_phone'],
  ['status_empty','ไม่มีเคสค้าง','status','ขณะนี้ยังไม่มีเคสปัญหาค้างอยู่ในระบบครับ\nหากพบปัญหาใหม่ สามารถกด “แจ้งปัญหา” ได้เลย',''],
  ['status_line','บรรทัดสถานะเคส','status','เคส #{{case_id}}: {{status}}{{technician_text}}','case_id,status,technician_text'],
  ['select_site','ให้เลือกรหัสจุดติดตั้ง','problem','กรุณาเลือกจุดติดตั้งที่ต้องการแจ้งปัญหา แล้วพิมพ์ตามรูปแบบนี้ครับ\n“#รหัส อาการที่พบ”\n\n{{site_list}}','site_list'],
  ['no_active_site','ไม่มีจุดติดตั้งที่เปิดใช้งาน','problem','บัญชีของคุณยังไม่มีจุดติดตั้งที่เปิดใช้งานในระบบครับ\nกรุณาติดต่อเจ้าหน้าที่เพื่อให้ช่วยตรวจสอบข้อมูล',''],
  ['symptom_too_short','รายละเอียดปัญหาสั้นเกินไป','problem','รบกวนแจ้งอาการเพิ่มเติมอีกเล็กน้อยครับ เช่น อุปกรณ์ไหนมีปัญหา เกิดตั้งแต่เมื่อไหร่ หรือมีไฟแจ้งเตือนอะไรขึ้นบ้าง',''],
  ['problem_received','รับแจ้งปัญหาแล้ว','problem','{{received_text}}\nเลขเคส: #{{case_id}}\nจุดติดตั้ง: {{site_name}}\n\nทีมงานจะตรวจสอบและอัปเดตสถานะให้ทราบครับ ขอบคุณที่แจ้งข้อมูลให้เราดูแล','received_text,case_id,site_name'],
  ['service_reminder','แจ้งเตือนรอบ service','service','ขอบคุณคุณ {{customer_name}} ที่ใช้บริการของเรามา {{days_in_service}} วันแล้วครับ\n\nตอนนี้จุดติดตั้ง {{site_name}} ใช้งานเป็นอย่างไรบ้าง มีปัญหาอะไรให้เราช่วยดูแลไหมครับ\n\nกรุณาเลือกคำตอบจากเมนูด้านล่างได้เลยครับ\n• มีปัญหา\n• ไม่มีปัญหา\n\nหากต้องการโทรแจ้ง สามารถติดต่อได้ที่ {{support_phone}}','customer_name,site_name,days_in_service,support_phone,service_start_date,service_end_date,next_service_contact_date'],
  ['service_has_problem','ลูกค้าตอบว่ามีปัญหา','service','ขอบคุณที่แจ้งให้เราทราบครับ\n\nหากสะดวก รบกวนโทรแจ้งรายละเอียดเพิ่มเติมได้ที่ {{support_phone}}\nหรือกด “แจ้งปัญหา” แล้วพิมพ์อาการในแชตนี้ เช่น “แจ้งปัญหา กล้องไม่ออนไลน์”\n\nทีมงานจะรีบตรวจสอบและดูแลให้ครับ','support_phone'],
  ['service_no_problem','ลูกค้าตอบว่าไม่มีปัญหา','service','ขอบคุณมากครับที่อัปเดตให้เรา\n\nดีใจที่ระบบยังใช้งานได้ปกติ ทีมงานจะบันทึกผลการติดตามรอบนี้ไว้ และจะคอยดูแลตามรอบ service ถัดไปครับ',''],
  ['service_thank_you','ขอบคุณหลังติดตาม service','service','ขอบคุณสำหรับข้อมูลครับ ทีมงานบันทึกการติดตามรอบ service ของ {{site_name}} ไว้เรียบร้อยแล้ว','site_name'],
  ['job_completed_thank_you','ขอบคุณหลังปิดงาน','job','งาน {{job_type}} ของจุดติดตั้ง {{site_name}} ดำเนินการเสร็จเรียบร้อยแล้วครับ\n\nขอบคุณที่ไว้วางใจให้เราดูแล หากพบปัญหาเพิ่มเติมสามารถแจ้งผ่าน LINE นี้ได้ตลอดครับ','job_type,site_name'],
  ['fallback','ระบบไม่เข้าใจข้อความ','fallback','ขออภัยครับ ระบบยังไม่เข้าใจข้อความนี้\nกรุณาเลือกเมนูด้านล่าง หรือพิมพ์ “วิธีใช้” เพื่อดูวิธีใช้งานครับ',''],
];

let templatesReady;
exports.ensureTemplates=async()=>{
  if(templatesReady)return templatesReady;
  templatesReady=(async()=>{
    await db.query(`CREATE TABLE IF NOT EXISTS line_message_templates (
      template_key VARCHAR(80) PRIMARY KEY,
      template_name VARCHAR(150) NOT NULL,
      template_group VARCHAR(80) NOT NULL,
      template_body TEXT NOT NULL,
      variables TEXT,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
    await db.query(`INSERT INTO line_message_templates (template_key,template_name,template_group,template_body,variables)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        template_name=VALUES(template_name),
        template_group=VALUES(template_group),
        template_body=IF(template_body LIKE '%??%', VALUES(template_body), template_body),
        variables=VALUES(variables)`,[defaultTemplates]);
  })();
  return templatesReady;
};

exports.listTemplates=async()=>{
  await exports.ensureTemplates();
  const [rows]=await db.query('SELECT * FROM line_message_templates ORDER BY template_group, template_key');
  return rows;
};

exports.templatesMap=async()=>{
  const rows=await exports.listTemplates();
  return Object.fromEntries(rows.filter(x=>Number(x.is_active)!==0).map(x=>[x.template_key,x.template_body]));
};

exports.updateTemplate=async(key,data)=>{
  await exports.ensureTemplates();
  const fields=['template_name','template_group','template_body','variables','is_active'];
  const updates=[],values=[];
  for(const field of fields){
    if(data[field]!==undefined){updates.push(`${field}=?`);values.push(data[field]);}
  }
  if(!updates.length)return;
  values.push(key);
  await db.query(`UPDATE line_message_templates SET ${updates.join(', ')} WHERE template_key=?`,values);
};

exports.customerByLineId=async lineUserId=>{
  const [customers]=await db.query('SELECT * FROM customers WHERE line_user_id=?',[lineUserId]);
  if(!customers[0])return null;
  const [sites]=await db.query("SELECT site_id,site_name,site_address FROM customer_sites WHERE customer_id=? AND site_status='active' ORDER BY site_name",[customers[0].customer_id]);
  return {...customers[0],sites};
};

exports.lineIdByCustomerId=async customerId=>(await db.query('SELECT line_user_id FROM customers WHERE customer_id=?',[customerId]))[0][0]?.line_user_id;
exports.customerById=async customerId=>(await db.query('SELECT customer_id,customer_name,line_user_id FROM customers WHERE customer_id=?',[customerId]))[0][0];
exports.bindLineId=async(customerId,lineUserId)=>{
  const customer=await exports.customerById(customerId);
  if(!customer)return {ok:false,reason:'not_found'};
  const linked=await exports.customerByLineId(lineUserId);
  if(linked&&Number(linked.customer_id)!==Number(customerId))return {ok:false,reason:'used',customer:linked};
  await db.query('UPDATE customers SET line_user_id=? WHERE customer_id=?',[lineUserId,customerId]);
  return {ok:true,customer:{...customer,line_user_id:lineUserId}};
};

exports.createProblem=async(siteId,symptom)=>{
  const [recent]=await db.query(`SELECT problem_id FROM problem_reports WHERE site_id=? AND symptom_detail=?
    AND reported_at>=DATE_SUB(NOW(),INTERVAL 2 MINUTE) ORDER BY problem_id DESC LIMIT 1`,[siteId,symptom]);
  if(recent[0])return {problemId:recent[0].problem_id,duplicate:true};
  const [result]=await db.query(`INSERT INTO problem_reports
    (site_id,symptom_detail,problem_status,reported_at,recorded_by,source_type,contact_channel)
    VALUES (?,?,'open',NOW(),NULL,'line_chat','line')`,[siteId,symptom]);
  return {problemId:result.insertId,duplicate:false};
};

exports.customerStatus=async customerId=>(await db.query(`SELECT p.problem_id,p.problem_status,p.symptom_detail,p.reported_at,j.job_status,u.full_name technician_name
  FROM problem_reports p JOIN customer_sites s ON s.site_id=p.site_id
  LEFT JOIN jobs j ON j.job_id=p.job_id LEFT JOIN users u ON u.user_id=j.technician_id
  WHERE s.customer_id=? ORDER BY p.problem_id DESC LIMIT 3`,[customerId]))[0];

exports.serviceSite=async siteId=>(await db.query(`SELECT s.*,c.customer_id,c.customer_name,c.line_user_id,c.phone,
  CASE WHEN s.service_start_date IS NULL THEN NULL ELSE DATEDIFF(CURDATE(),s.service_start_date) END days_in_service
  FROM customer_sites s JOIN customers c ON c.customer_id=s.customer_id
  WHERE s.site_id=?`,[siteId]))[0][0];

exports.dueServiceSites=async(limit=20)=>(await db.query(`SELECT s.*,c.customer_id,c.customer_name,c.line_user_id,c.phone,
  CASE WHEN s.service_start_date IS NULL THEN NULL ELSE DATEDIFF(CURDATE(),s.service_start_date) END days_in_service
  FROM customer_sites s JOIN customers c ON c.customer_id=s.customer_id
  WHERE s.site_status='active'
    AND c.line_user_id IS NOT NULL
    AND s.next_service_contact_date IS NOT NULL
    AND s.next_service_contact_date<=CURDATE()
  ORDER BY s.next_service_contact_date ASC
  LIMIT ?`,[Number(limit)||20]))[0];

exports.markServiceReminderSent=async siteId=>db.query(
  `UPDATE customer_sites SET last_service_contact_date=CURDATE(),
   next_service_contact_date=DATE_ADD(CURDATE(),INTERVAL service_interval_days DAY)
   WHERE site_id=?`,[siteId]
);
