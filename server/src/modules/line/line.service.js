const crypto=require('crypto');
const repo=require('./line.repository');

const LINE_API='https://api.line.me/v2/bot/message';
const COMPANY_NAME=process.env.COMPANY_NAME||'Post-Sales IoT';
const SUPPORT_PHONE=process.env.SUPPORT_PHONE||process.env.COMPANY_PHONE||'เบอร์โทรบริษัท';
const TEAM_LINE_TOKEN=process.env.LINE_TECH_CHANNEL_ACCESS_TOKEN||process.env.LINE_TEAM_CHANNEL_ACCESS_TOKEN||'';
const TEAM_LINE_TARGET=process.env.LINE_TECH_TARGET_ID||process.env.LINE_TEAM_TARGET_ID||process.env.LINE_TECH_GROUP_ID||process.env.LINE_TEAM_GROUP_ID||'';

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
const sendWithToken=async(token,path,body)=>{
  if(!token)throw Object.assign(new Error('ยังไม่ได้ตั้งค่า Channel Access Token ของ LINE ทีมช่าง'),{status:503});
  const response=await fetch(`${LINE_API}/${path}`,{
    method:'POST',
    headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
    body:JSON.stringify(body),
  });
  if(!response.ok)throw Object.assign(new Error(`LINE ทีมช่างตอบกลับ ${response.status}: ${await response.text()}`),{status:502});
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
  ],
};
const problemFollowupMenu={
  items:[
    {type:'action',action:{type:'message',label:'แจ้งปัญหา',text:'แจ้งปัญหา '}},
    {type:'action',action:{type:'message',label:'ติดต่อเจ้าหน้าที่',text:'ติดต่อเจ้าหน้าที่'}},
  ],
};
const reportStartMenu={
  items:[
    {type:'action',action:{type:'message',label:'แจ้งซ่อมตอนนี้',text:'แจ้งปัญหา'}},
    {type:'action',action:{type:'message',label:'ติดต่อเจ้าหน้าที่',text:'ติดต่อเจ้าหน้าที่'}},
  ],
};
const issueTypes=['ใช้งานไม่ได้','สัญญาณหาย','ภาพ/เสียงผิดปกติ','ไฟไม่เข้า','แจ้งเตือนผิดปกติ','อื่นๆ'];
const deviceLabel=device=>`${device.brand?`${device.brand} `:''}${device.model_name} ${device.serial_number}`.trim();
const shortLabel=text=>String(text||'').slice(0,20);
const quickMessageItems=items=>({items:items.slice(0,13).map(item=>({type:'action',action:{type:'message',label:shortLabel(item.label),text:item.text}}))});
const appointmentMenu={
  items:[
    {type:'action',action:{type:'datetimepicker',label:'เลือกวันเวลา',data:'repair:appointment:pick',mode:'datetime'}},
    {type:'action',action:{type:'message',label:'วันนี้ช่วงบ่าย',text:'นัด:วันนี้ช่วงบ่าย'}},
    {type:'action',action:{type:'message',label:'พรุ่งนี้ช่วงเช้า',text:'นัด:พรุ่งนี้ช่วงเช้า'}},
    {type:'action',action:{type:'message',label:'ยังไม่สะดวกนัด',text:'นัด:ยังไม่สะดวกนัด'}},
  ],
};
const detailMenu={items:[{type:'action',action:{type:'message',label:'ไม่มีรายละเอียดเพิ่ม',text:'ข้ามรายละเอียด'}}]};

const textMessage=(text,menu=false)=>({
  type:'text',
  text:String(text||'').slice(0,5000),
  ...(menu?{quickReply:menu===true?quickMenu:menu}:{}),
});
const serviceCareButtons=()=>({
  type:'template',
  altText:'กรุณาเลือกสถานะการใช้งาน',
  template:{
    type:'buttons',
    title:'สถานะการใช้งาน',
    text:'ตอนนี้ระบบใช้งานเป็นอย่างไรบ้างครับ',
    actions:[
      {type:'message',label:'มีปัญหา',text:'มีปัญหา'},
      {type:'message',label:'ไม่มีปัญหา',text:'ไม่มีปัญหา'},
    ],
  },
});

exports.replyText=(replyToken,text,withMenu=false)=>send('reply',{replyToken,messages:[textMessage(text,withMenu)]});
exports.replyMenu=(replyToken,text,menu=true)=>exports.replyText(replyToken,text,menu);
exports.pushText=(to,text,menu=false)=>send('push',{to,messages:[textMessage(text,menu)]});
const pushServiceCare=async(to,text)=>send('push',{to,messages:[textMessage(text,serviceCareMenu),serviceCareButtons()]});
exports.teamConfigured=()=>Boolean(TEAM_LINE_TOKEN&&TEAM_LINE_TARGET);
exports.pushTeamText=async text=>{
  if(!exports.teamConfigured())return {sent:false,skipped:true,reason:'ยังไม่ได้ตั้งค่า LINE ทีมช่าง'};
  await sendWithToken(TEAM_LINE_TOKEN,'push',{to:TEAM_LINE_TARGET,messages:[textMessage(text)]});
  return {sent:true,to:TEAM_LINE_TARGET};
};

const help=async customer=>textFrom('help',{
  customer_name:customer?.customer_name?`คุณ ${customer.customer_name}`:'',
},`สวัสดี${customer?.customer_name?`คุณ ${customer.customer_name}`:''}

แจ้งปัญหา: พิมพ์ “แจ้งปัญหา” ตามด้วยอาการ
ดูสถานะ: พิมพ์ “สถานะ”
หากมีหลายจุดติดตั้ง ให้พิมพ์ “#รหัสจุดติดตั้ง อาการ”`);

const statusLabel={open:'รอตรวจสอบ',assigned:'รับเคสแล้ว',resolved:'ปิดเคสแล้ว',cancelled:'ยกเลิก'};
const formatThaiDateTime=value=>{
  if(!value)return '-';
  const date=value instanceof Date?value:new Date(String(value).replace(' ','T'));
  if(Number.isNaN(date.getTime()))return String(value);
  return date.toLocaleString('th-TH',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Bangkok'});
};
const toSqlDateTime=value=>{
  if(!value)return null;
  if(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value))return value.replace('T',' ').slice(0,19);
  const date=value instanceof Date?value:new Date(value);
  if(Number.isNaN(date.getTime()))return null;
  const pad=n=>String(n).padStart(2,'0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const problemTextFromData=(data,detail)=>{
  const lines=['ลูกค้าแจ้งซ่อมผ่าน LINE'];
  lines.push(`อุปกรณ์: ${data.device_label||'ไม่แน่ใจ / ให้ช่างตรวจสอบ'}`);
  lines.push(`ประเภทปัญหา: ${data.issue_type||'ไม่ระบุ'}`);
  lines.push(`นัดหมายที่สะดวก: ${data.appointment_label||'ยังไม่สะดวกนัด'}`);
  if(detail&&detail!=='ข้ามรายละเอียด')lines.push(`รายละเอียดเพิ่มเติม: ${detail}`);
  return lines.join('\n');
};

const notifyTeamNewProblem=async problemId=>{
  if(!exports.teamConfigured())return {sent:false,skipped:true};
  const item=await repo.problemNotificationContext(problemId);
  if(!item)return {sent:false,skipped:true,reason:'problem_not_found'};
  const device=item.reported_device_id?`${item.reported_device_brand||''} ${item.reported_device_model||''} · ${item.reported_device_serial||''}`.trim():'ไม่ระบุ/ไม่แน่ใจ';
  const text=[
    `มีเคสบริการใหม่ #${item.problem_id}`,
    `ลูกค้า: ${item.customer_name}`,
    `โทร: ${item.customer_phone||'-'}`,
    `จุดติดตั้ง: ${item.site_name}`,
    `อุปกรณ์: ${device}`,
    `ประเภท: ${item.issue_type||'-'}`,
    `นัดหมาย: ${item.preferred_appointment_at?formatThaiDateTime(item.preferred_appointment_at):(item.preferred_appointment_note||'-')}`,
    '',
    item.symptom_detail,
  ].join('\n');
  return exports.pushTeamText(text);
};
exports.notifyTeamNewProblem=notifyTeamNewProblem;

const askSite=async(event,lineUserId,customer)=>{
  if(!customer.sites.length)return exports.replyText(event.replyToken,await textFrom('no_active_site',{},'บัญชีของคุณยังไม่มีจุดติดตั้งที่เปิดใช้งาน'));
  if(customer.sites.length===1)return askDevice(event,lineUserId,customer,{site_id:customer.sites[0].site_id,site_name:customer.sites[0].site_name});
  await repo.saveReportSession(lineUserId,customer.customer_id,'site',{});
  return exports.replyMenu(event.replyToken,'ต้องการแจ้งซ่อมจุดติดตั้งไหนครับ',quickMessageItems(customer.sites.map(site=>({label:site.site_name,text:`เลือกจุดติดตั้ง #${site.site_id}`}))));
};

const askDevice=async(event,lineUserId,customer,data)=>{
  const devices=await repo.siteDevices(data.site_id);
  await repo.saveReportSession(lineUserId,customer.customer_id,'device',data);
  const options=[
    ...devices.map(device=>({label:deviceLabel(device),text:`เลือกอุปกรณ์ #${device.device_id}`})),
    {label:'ไม่แน่ใจ',text:'อุปกรณ์ไม่แน่ใจ'},
  ];
  return exports.replyMenu(event.replyToken,`จุดติดตั้ง: ${data.site_name}\nอุปกรณ์ชิ้นไหนมีปัญหาครับ`,quickMessageItems(options));
};

const askIssue=async(event,lineUserId,customer,data)=>{
  await repo.saveReportSession(lineUserId,customer.customer_id,'issue',data);
  return exports.replyMenu(event.replyToken,`อุปกรณ์: ${data.device_label||'ไม่แน่ใจ'}\nลักษณะปัญหาเป็นแบบไหนครับ`,quickMessageItems(issueTypes.map(label=>({label,text:`ประเภท:${label}`}))));
};

const askAppointment=async(event,lineUserId,customer,data)=>{
  await repo.saveReportSession(lineUserId,customer.customer_id,'appointment',data);
  return exports.replyMenu(event.replyToken,'สะดวกให้ช่างติดต่อ/เข้าดูหน้างานวันเวลาไหนครับ',appointmentMenu);
};

const askDetail=async(event,lineUserId,customer,data)=>{
  await repo.saveReportSession(lineUserId,customer.customer_id,'detail',data);
  return exports.replyMenu(event.replyToken,'มีรายละเอียดเพิ่มเติมไหมครับ เช่น เกิดตั้งแต่เมื่อไหร่ มีไฟสถานะอะไรขึ้น หรือพื้นที่ที่ติดตั้งอยู่ตรงไหน\nถ้าไม่มี กด “ไม่มีรายละเอียดเพิ่ม” ได้เลยครับ',detailMenu);
};

const finishReport=async(event,lineUserId,customer,data,detail)=>{
  const result=await repo.createProblem(data.site_id,{
    reported_device_id:data.device_id||null,
    issue_type:data.issue_type||null,
    preferred_appointment_at:toSqlDateTime(data.preferred_appointment_at),
    preferred_appointment_note:data.appointment_label||null,
    symptom_detail:problemTextFromData(data,detail),
  });
  await repo.clearReportSession(lineUserId);
  if(!result.duplicate)notifyTeamNewProblem(result.problemId).catch(error=>console.error(`LINE team notification failed for problem ${result.problemId}:`,error.message));
  return exports.replyMenu(event.replyToken,await textFrom('problem_received',{
    received_text:result.duplicate?'รับข้อมูลไว้แล้ว':'รับแจ้งซ่อมเรียบร้อย',
    case_id:result.problemId,
    site_name:data.site_name,
  },`${result.duplicate?'รับข้อมูลไว้แล้ว':'รับแจ้งซ่อมเรียบร้อย'}
เลขเคส #${result.problemId}
จุดติดตั้ง: ${data.site_name}`));
};

const handleReportSession=async(event,lineUserId,customer,text)=>{
  const session=await repo.getReportSession(lineUserId);
  if(!session)return false;
  const data=session.data||{};
  if(/^(ยกเลิก|cancel)$/i.test(text)){await repo.clearReportSession(lineUserId);await exports.replyMenu(event.replyToken,'ยกเลิกการแจ้งซ่อมแล้วครับ',quickMenu);return true;}
  if(session.step==='site'){
    const match=text.match(/^เลือกจุดติดตั้ง #(\d+)$/);
    const site=match?customer.sites.find(item=>Number(item.site_id)===Number(match[1])):null;
    if(!site){await exports.replyMenu(event.replyToken,'กรุณาเลือกจุดติดตั้งจากปุ่มด้านล่างครับ',quickMessageItems(customer.sites.map(item=>({label:item.site_name,text:`เลือกจุดติดตั้ง #${item.site_id}`}))));return true;}
    await askDevice(event,lineUserId,customer,{site_id:site.site_id,site_name:site.site_name});
    return true;
  }
  if(session.step==='device'){
    const match=text.match(/^เลือกอุปกรณ์ #(\d+)$/);
    if(match){
      const devices=await repo.siteDevices(data.site_id);
      const device=devices.find(item=>Number(item.device_id)===Number(match[1]));
      if(!device){await askDevice(event,lineUserId,customer,data);return true;}
      await askIssue(event,lineUserId,customer,{...data,device_id:device.device_id,device_label:deviceLabel(device)});
      return true;
    }
    if(/^อุปกรณ์ไม่แน่ใจ$/i.test(text)){await askIssue(event,lineUserId,customer,{...data,device_id:null,device_label:'ไม่แน่ใจ / ให้ช่างตรวจสอบ'});return true;}
    await askDevice(event,lineUserId,customer,data);
    return true;
  }
  if(session.step==='issue'){
    const match=text.match(/^ประเภท:(.+)$/);
    if(!match){await askIssue(event,lineUserId,customer,data);return true;}
    await askAppointment(event,lineUserId,customer,{...data,issue_type:match[1].trim()});
    return true;
  }
  if(session.step==='appointment'){
    let next={...data};
    if(text==='นัด:วันนี้ช่วงบ่าย'){
      const d=new Date();d.setHours(13,0,0,0);next={...next,preferred_appointment_at:d,appointment_label:'วันนี้ช่วงบ่าย'};
    }else if(text==='นัด:พรุ่งนี้ช่วงเช้า'){
      const d=new Date();d.setDate(d.getDate()+1);d.setHours(9,0,0,0);next={...next,preferred_appointment_at:d,appointment_label:'พรุ่งนี้ช่วงเช้า'};
    }else if(text==='นัด:ยังไม่สะดวกนัด'){
      next={...next,preferred_appointment_at:null,appointment_label:'ยังไม่สะดวกนัด'};
    }else{
      next={...next,preferred_appointment_at:null,appointment_label:text.replace(/^นัด:/,'').trim()||'ให้เจ้าหน้าที่ติดต่อกลับ'};
    }
    await askDetail(event,lineUserId,customer,next);
    return true;
  }
  if(session.step==='detail'){
    await finishReport(event,lineUserId,customer,data,text);
    return true;
  }
  return false;
};

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
  if(event.type==='postback'){
    const session=await repo.getReportSession(lineUserId);
    if(event.postback?.data==='repair:appointment:pick'&&session?.step==='appointment'){
      const datetime=event.postback.params?.datetime;
      if(!datetime)return exports.replyMenu(event.replyToken,'กรุณาเลือกวันและเวลาที่สะดวกอีกครั้งครับ',appointmentMenu);
      await askDetail(event,lineUserId,customer,{...session.data,preferred_appointment_at:datetime,appointment_label:formatThaiDateTime(datetime)});
      return;
    }
    return exports.replyMenu(event.replyToken,await help(customer));
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

  if(/^แจ้งปัญหา$/i.test(text)||/^แจ้งซ่อม$/i.test(text))return askSite(event,lineUserId,customer);
  if(await handleReportSession(event,lineUserId,customer,text))return;

  if(/^(ช่วยเหลือ|วิธีใช้|help|สวัสดี|เมนู)$/i.test(text))return exports.replyMenu(event.replyToken,await help(customer));
  if(/^(มีปัญหา|มี|พบปัญหา|มีครับ|มีค่ะ)$/i.test(text)){
    return exports.replyMenu(event.replyToken,await textFrom('service_has_problem',{support_phone:SUPPORT_PHONE},`ขอบคุณที่แจ้งให้เราทราบครับ\nกด “แจ้งซ่อมตอนนี้” เพื่อเลือกอุปกรณ์และนัดหมายวันเวลาได้เลย หรือโทร ${SUPPORT_PHONE}`),reportStartMenu);
  }
  if(/^(ไม่มีปัญหา|ไม่มี|ปกติ|ใช้งานได้ปกติ|ไม่มีครับ|ไม่มีค่ะ)$/i.test(text)){
    return exports.replyMenu(event.replyToken,await textFrom('service_no_problem',{},'ขอบคุณมากครับที่อัปเดตให้เรา ดีใจที่ระบบยังใช้งานได้ปกติครับ'),quickMenu);
  }
  if(text==='ติดต่อเจ้าหน้าที่')return exports.replyMenu(event.replyToken,await textFrom('contact_staff',{support_phone:SUPPORT_PHONE},`หากต้องการให้ทีมงานช่วยดูแลเพิ่มเติม สามารถโทรแจ้งได้ที่ ${SUPPORT_PHONE}`));

  if(text==='สถานะ'){
    const rows=await repo.customerStatus(customer.customer_id);
    if(!rows.length)return exports.replyMenu(event.replyToken,await textFrom('status_empty',{},'ยังไม่มีเคสบริการในระบบ'));
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
  if(!result.duplicate)notifyTeamNewProblem(result.problemId).catch(error=>console.error(`LINE team notification failed for problem ${result.problemId}:`,error.message));
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
  await pushServiceCare(site.line_user_id,text);
  return {sent:true,site_id:site.site_id,customer_name:site.customer_name};
};

const serviceDaysText=site=>{
  if(site.days_in_service===null||site.days_in_service===undefined)return 'ระยะหนึ่ง';
  const days=Number(site.days_in_service);
  if(!Number.isFinite(days))return 'ระยะหนึ่ง';
  return `${Math.max(0,days)} วัน`;
};

const buildServiceReminderText=async site=>textFrom('service_reminder',{
    customer_name:site.customer_name,
    site_name:site.site_name,
    days_in_service:serviceDaysText(site),
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
      await pushServiceCare(site.line_user_id,text);
      await repo.markServiceReminderSent(site.site_id);
      sent+=1;
    }catch(error){
      errors.push({site_id:site.site_id,message:error.message});
    }
  }
  return {sent,total:sites.length,errors};
};
