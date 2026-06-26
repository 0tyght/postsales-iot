const crypto=require('crypto');
const repo=require('./line.repository');

const LINE_API='https://api.line.me/v2/bot/message';
const COMPANY_NAME=process.env.COMPANY_NAME||'Post-Sales IoT';
const SUPPORT_PHONE=process.env.SUPPORT_PHONE||process.env.COMPANY_PHONE||'เบอร์โทรบริษัท';

const makeCode=customerId=>`TYTC${String(customerId).padStart(4,'0').slice(-4)}`;
const verifyCode=code=>{
  const match=String(code||'').trim().toUpperCase().match(/^TYTC(\d{4})$/);
  return match?Number(match[1]):null;
};

const officialAccountId=()=>process.env.LINE_OFFICIAL_ACCOUNT_ID||process.env.LINE_OA_ID||process.env.LINE_BASIC_ID||process.env.LINE_BOT_BASIC_ID||process.env.LINE_BOT_ID||'';
const oaMessageUrl=text=>{
  const accountId=officialAccountId();
  return accountId?`https://line.me/R/oaMessage/${encodeURIComponent(accountId)}/?${encodeURIComponent(text)}`:'';
};
const webhookUrl=()=>process.env.LINE_WEBHOOK_URL||'';

exports.configured=()=>Boolean(process.env.LINE_CHANNEL_SECRET&&process.env.LINE_CHANNEL_ACCESS_TOKEN);
exports.webhookUrl=webhookUrl;

const render=(body,vars={})=>String(body||'').replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,(_,key)=>vars[key]??'');
const templates=async()=>repo.templatesMap();
const textFrom=async(key,vars={},fallback='')=>render((await templates())[key]||fallback,vars);

exports.webhookHealth=async()=>{
  const url=webhookUrl();
  if(!url)return {
    url:'',
    reachable:false,
    status:null,
    connected_to_this_server:false,
    message:'ยังไม่ได้ตั้งค่า LINE_WEBHOOK_URL',
    response_preview:'',
  };
  try{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),8000);
    const response=await fetch(url,{
      method:'POST',
      headers:{'Content-Type':'application/json','ngrok-skip-browser-warning':'true'},
      body:JSON.stringify({events:[]}),
      signal:controller.signal,
    });
    clearTimeout(timeout);
    const body=await response.text();
    const isThisServer=response.status===401&&body.includes('LINE');
    return {
      url,
      reachable:true,
      status:response.status,
      connected_to_this_server:isThisServer,
      message:isThisServer?'Webhook ชี้เข้า server ระบบนี้แล้ว':'Webhook ตอบกลับได้ แต่ยังไม่ใช่ server ระบบนี้',
      response_preview:body.slice(0,180),
    };
  }catch(error){
    return {
      url,
      reachable:false,
      status:null,
      connected_to_this_server:false,
      message:error.name==='AbortError'?'Webhook timeout':'Webhook ยังเรียกไม่สำเร็จ',
      response_preview:error.message,
    };
  }
};

exports.verifySignature=(rawBody,signature)=>{
  if(!process.env.LINE_CHANNEL_SECRET||!rawBody||!signature)return false;
  const expected=crypto.createHmac('sha256',process.env.LINE_CHANNEL_SECRET).update(rawBody).digest('base64');
  const a=Buffer.from(expected);
  const b=Buffer.from(signature);
  return a.length===b.length&&crypto.timingSafeEqual(a,b);
};

const send=async(path,body)=>{
  if(!process.env.LINE_CHANNEL_ACCESS_TOKEN)throw Object.assign(new Error('ยังไม่ได้ตั้งค่า LINE_CHANNEL_ACCESS_TOKEN'),{status:503});
  const response=await fetch(`${LINE_API}/${path}`,{
    method:'POST',
    headers:{Authorization:`Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,'Content-Type':'application/json'},
    body:JSON.stringify(body),
  });
  if(!response.ok)throw Object.assign(new Error(`LINE API ตอบกลับ ${response.status}: ${await response.text()}`),{status:502});
};

const quickMenu={
  items:[
    {type:'action',action:{type:'message',label:'แจ้งปัญหา',text:'แจ้งปัญหา '}},
    {type:'action',action:{type:'message',label:'ดูสถานะ',text:'สถานะ'}},
    {type:'action',action:{type:'message',label:'วิธีใช้',text:'วิธีใช้'}},
    {type:'action',action:{type:'message',label:'ติดต่อเจ้าหน้าที่',text:'ติดต่อเจ้าหน้าที่'}},
  ],
};
const serviceCareMenu={
  items:[
    {type:'action',action:{type:'message',label:'มีปัญหา',text:'มีปัญหา'}},
    {type:'action',action:{type:'message',label:'ไม่มีปัญหา',text:'ไม่มีปัญหา'}},
    {type:'action',action:{type:'message',label:'แจ้งปัญหา',text:'แจ้งปัญหา '}},
    {type:'action',action:{type:'message',label:'ติดต่อเจ้าหน้าที่',text:'ติดต่อเจ้าหน้าที่'}},
  ],
};

const textMessage=(text,menu=false)=>({
  type:'text',
  text:String(text||'').slice(0,5000),
  ...(menu?{quickReply:menu===true?quickMenu:menu}:{}),
});

exports.replyText=(replyToken,text,withMenu=false)=>send('reply',{replyToken,messages:[textMessage(text,withMenu)]});
exports.replyMenu=(replyToken,text,menu=true)=>exports.replyText(replyToken,text,menu);
exports.pushText=(to,text,menu=false)=>send('push',{to,messages:[textMessage(text,menu)]});

const help=async customer=>textFrom('help',{
  customer_name:customer?.customer_name?`คุณ ${customer.customer_name}`:'',
},`สวัสดี${customer?.customer_name?`คุณ ${customer.customer_name}`:''}

แจ้งปัญหา: พิมพ์ “แจ้งปัญหา” ตามด้วยอาการ
ดูสถานะ: พิมพ์ “สถานะ”
หากมีหลายจุดติดตั้ง ให้พิมพ์ “#รหัสจุดติดตั้ง อาการ”`);

const statusLabel={open:'รอตรวจสอบ',assigned:'รับเคสแล้ว',resolved:'ปิดเคสแล้ว',cancelled:'ยกเลิก'};

exports.bindInfo=async customerId=>{
  const customer=await repo.customerById(customerId);
  if(!customer)throw Object.assign(new Error('ไม่พบลูกค้า'),{status:404});
  const code=makeCode(customer.customer_id);
  return {
    customer_id:customer.customer_id,
    customer_name:customer.customer_name,
    line_user_id:customer.line_user_id,
    bind_code:code,
    registration_text:code,
    add_friend_url:oaMessageUrl(code),
    configured:exports.configured(),
    has_official_account_link:Boolean(officialAccountId()),
  };
};

exports.handleEvent=async event=>{
  await repo.ensureTemplates();
  const lineUserId=event.source?.userId;
  if(!lineUserId||!event.replyToken)return;
  const customer=await repo.customerByLineId(lineUserId);

  if(event.type==='follow'){
    const message=customer
      ?await help(customer)
      :await textFrom('follow_unbound',{company_name:COMPANY_NAME,sample_code:'TYTC0001'},'ขอบคุณที่เพิ่มเพื่อน\n\nกรุณาส่งรหัสลงทะเบียน เช่น TYTC0001');
    return exports.replyMenu(event.replyToken,message);
  }
  if(event.type!=='message'||event.message?.type!=='text'){
    return exports.replyText(event.replyToken,await textFrom('unsupported_message',{},'ตอนนี้ระบบรับข้อความตัวอักษรก่อนนะครับ'));
  }

  const text=event.message.text.trim();
  const registration=text.match(/^(?:ลงทะเบียน\s+)?(TYTC\d{4})$/i);
  if(registration){
    const customerId=verifyCode(registration[1]);
    if(!customerId)return exports.replyText(event.replyToken,await textFrom('bind_not_found',{bind_code:registration[1]},'รหัสลงทะเบียนไม่ถูกต้อง'));
    const result=await repo.bindLineId(customerId,lineUserId);
    if(!result.ok&&result.reason==='used')return exports.replyText(event.replyToken,await textFrom('bind_used',{customer_name:result.customer.customer_name},'LINE นี้ผูกกับลูกค้ารายอื่นอยู่แล้ว'));
    if(!result.ok)return exports.replyText(event.replyToken,await textFrom('bind_not_found',{bind_code:registration[1]},'ไม่พบข้อมูลลูกค้าสำหรับรหัสนี้'));
    return exports.replyMenu(event.replyToken,await textFrom('bind_success',{
      customer_name:result.customer.customer_name,
      help_text:await help(result.customer),
    },`ผูก LINE สำเร็จ\nลูกค้า: ${result.customer.customer_name}`));
  }

  if(!customer){
    return exports.replyMenu(event.replyToken,await textFrom('unbound_help',{},'กรุณาขอรหัส TYTC จากช่าง แล้วส่งรหัสกลับมาในแชตนี้'));
  }

  if(/^(ช่วยเหลือ|วิธีใช้|help|สวัสดี|เมนู)$/i.test(text))return exports.replyMenu(event.replyToken,await help(customer));
  if(/^(มีปัญหา|มี|พบปัญหา|มีครับ|มีค่ะ)$/i.test(text)){
    return exports.replyMenu(event.replyToken,await textFrom('service_has_problem',{support_phone:SUPPORT_PHONE},`ขอบคุณที่แจ้งให้เราทราบครับ\nรบกวนโทรแจ้งรายละเอียดเพิ่มเติมได้ที่ ${SUPPORT_PHONE} หรือพิมพ์ “แจ้งปัญหา” ตามด้วยอาการในแชตนี้ได้เลยครับ`),quickMenu);
  }
  if(/^(ไม่มีปัญหา|ไม่มี|ปกติ|ใช้งานได้ปกติ|ไม่มีครับ|ไม่มีค่ะ)$/i.test(text)){
    return exports.replyMenu(event.replyToken,await textFrom('service_no_problem',{},'ขอบคุณมากครับที่อัปเดตให้เรา ดีใจที่ระบบยังใช้งานได้ปกติครับ'),quickMenu);
  }
  if(text==='ติดต่อเจ้าหน้าที่')return exports.replyMenu(event.replyToken,await textFrom('contact_staff',{support_phone:SUPPORT_PHONE},`หากต้องการให้ทีมงานช่วยดูแลเพิ่มเติม สามารถโทรแจ้งได้ที่ ${SUPPORT_PHONE}`));

  if(text==='สถานะ'){
    const rows=await repo.customerStatus(customer.customer_id);
    if(!rows.length)return exports.replyMenu(event.replyToken,await textFrom('status_empty',{},'ยังไม่มีเคสปัญหาในระบบ'));
    const lines=await Promise.all(rows.map(x=>textFrom('status_line',{
      case_id:x.problem_id,
      status:statusLabel[x.problem_status]||x.problem_status,
      technician_text:x.technician_name?` (${x.technician_name})`:'',
    },`เคส #${x.problem_id}: ${statusLabel[x.problem_status]||x.problem_status}${x.technician_name?` (${x.technician_name})`:''}`)));
    return exports.replyMenu(event.replyToken,lines.join('\n'));
  }

  const selected=text.match(/^#(\d+)\s+(.+)/s);
  let symptom=text.replace(/^แจ้งปัญหา\s*/,'').trim();
  let site;
  if(selected){
    site=customer.sites.find(x=>x.site_id===Number(selected[1]));
    symptom=selected[2].trim();
  }else if(text.startsWith('แจ้งปัญหา')&&customer.sites.length===1){
    site=customer.sites[0];
  }else if(!text.startsWith('แจ้งปัญหา')){
    return exports.replyMenu(event.replyToken,await textFrom('fallback',{},await help(customer)));
  }

  if(!site){
    if(!customer.sites.length)return exports.replyText(event.replyToken,await textFrom('no_active_site',{},'บัญชีของคุณยังไม่มีจุดติดตั้งที่เปิดใช้งาน'));
    return exports.replyMenu(event.replyToken,await textFrom('select_site',{
      site_list:customer.sites.map(x=>`#${x.site_id} ${x.site_name}`).join('\n'),
    },`กรุณาเลือกจุดติดตั้ง\n${customer.sites.map(x=>`#${x.site_id} ${x.site_name}`).join('\n')}`));
  }
  if(symptom.length<3)return exports.replyText(event.replyToken,await textFrom('symptom_too_short',{},'กรุณาระบุอาการหรือปัญหาให้ละเอียดขึ้นเล็กน้อย'));

  const result=await repo.createProblem(site.site_id,symptom);
  return exports.replyMenu(event.replyToken,await textFrom('problem_received',{
    received_text:result.duplicate?'รับข้อมูลไว้แล้ว':'รับแจ้งปัญหาเรียบร้อย',
    case_id:result.problemId,
    site_name:site.site_name,
  },`${result.duplicate?'รับข้อมูลไว้แล้ว':'รับแจ้งปัญหาเรียบร้อย'}
เลขเคส #${result.problemId}
จุดติดตั้ง: ${site.site_name}`));
};

exports.push=async({customer_id,line_user_id,text})=>{
  const target=line_user_id||await repo.lineIdByCustomerId(customer_id);
  if(!target)throw Object.assign(new Error('ลูกค้ายังไม่ได้ผูก LINE'),{status:400});
  if(!text?.trim())throw Object.assign(new Error('กรุณาระบุข้อความ'),{status:400});
  await exports.pushText(target,text.trim(),quickMenu);
  return {sent:true,to:target};
};

exports.templates=()=>repo.listTemplates();
exports.updateTemplate=async(key,data)=>{
  await repo.updateTemplate(key,data);
  return {updated:true};
};

exports.sendServiceReminder=async siteId=>{
  const site=await repo.serviceSite(siteId);
  if(!site)throw Object.assign(new Error('ไม่พบจุดติดตั้ง'),{status:404});
  if(!site.line_user_id)throw Object.assign(new Error('ลูกค้ายังไม่ได้ผูก LINE'),{status:400});
  const text=await buildServiceReminderText(site);
  await exports.pushText(site.line_user_id,text,serviceCareMenu);
  return {sent:true,site_id:site.site_id,customer_name:site.customer_name};
};

const buildServiceReminderText=async site=>textFrom('service_reminder',{
    customer_name:site.customer_name,
    site_name:site.site_name,
    days_in_service:site.days_in_service??'-',
    support_phone:SUPPORT_PHONE,
    service_start_date:site.service_start_date||'',
    service_end_date:site.service_end_date||'',
    next_service_contact_date:site.next_service_contact_date||'',
  });

exports.sendDueServiceReminders=async(limit=20)=>{
  if(!exports.configured())return {sent:0,skipped:true,reason:'LINE is not configured'};
  const sites=await repo.dueServiceSites(limit);
  let sent=0;
  const errors=[];
  for(const site of sites){
    try{
      const text=await buildServiceReminderText(site);
      await exports.pushText(site.line_user_id,text,serviceCareMenu);
      await repo.markServiceReminderSent(site.site_id);
      sent+=1;
    }catch(error){
      errors.push({site_id:site.site_id,message:error.message});
    }
  }
  return {sent,total:sites.length,errors};
};
