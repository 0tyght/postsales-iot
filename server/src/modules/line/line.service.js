const crypto=require('crypto');
const repo=require('./line.repository');

const LINE_API='https://api.line.me/v2/bot/message';

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

const textMessage=(text,withMenu=false)=>({
  type:'text',
  text:text.slice(0,5000),
  ...(withMenu?{quickReply:quickMenu}:{}),
});

exports.replyText=(replyToken,text,withMenu=false)=>send('reply',{replyToken,messages:[textMessage(text,withMenu)]});
exports.replyMenu=(replyToken,text)=>exports.replyText(replyToken,text,true);
exports.pushText=(to,text)=>send('push',{to,messages:[{type:'text',text:text.slice(0,5000)}]});

const help=customer=>`สวัสดี${customer?`คุณ ${customer.customer_name}`:''}

แจ้งปัญหา: พิมพ์ “แจ้งปัญหา ตามด้วยอาการ”
ตรวจสถานะ: พิมพ์ “สถานะ”
ถ้ามีหลายจุดติดตั้ง ให้พิมพ์ “#รหัสจุดติดตั้ง อาการ”`;

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
  const lineUserId=event.source?.userId;
  if(!lineUserId||!event.replyToken)return;
  const customer=await repo.customerByLineId(lineUserId);

  if(event.type==='follow'){
    return exports.replyMenu(event.replyToken,customer?help(customer):'ขอบคุณที่เพิ่มเพื่อน\n\nกรุณาส่งรหัสลงทะเบียนที่ได้รับจากช่าง เช่น TYTC0001 เพื่อผูก LINE กับข้อมูลลูกค้าของคุณ');
  }
  if(event.type!=='message'||event.message?.type!=='text'){
    return exports.replyText(event.replyToken,'ตอนนี้ระบบรับข้อความตัวอักษรก่อนนะครับ');
  }

  const text=event.message.text.trim();
  const registration=text.match(/^(?:ลงทะเบียน\s+)?(TYTC\d{4})$/i);
  if(registration){
    const customerId=verifyCode(registration[1]);
    if(!customerId)return exports.replyText(event.replyToken,'รหัสลงทะเบียนไม่ถูกต้อง กรุณาขอรหัสใหม่จากช่าง');
    const result=await repo.bindLineId(customerId,lineUserId);
    if(!result.ok&&result.reason==='used')return exports.replyText(event.replyToken,`LINE นี้ผูกกับลูกค้า ${result.customer.customer_name} อยู่แล้ว หากต้องการเปลี่ยน กรุณาติดต่อเจ้าหน้าที่`);
    if(!result.ok)return exports.replyText(event.replyToken,'ไม่พบข้อมูลลูกค้าสำหรับรหัสนี้ กรุณาขอรหัสใหม่จากช่าง');
    return exports.replyMenu(event.replyToken,`ผูก LINE สำเร็จ\nลูกค้า: ${result.customer.customer_name}\n\n${help(result.customer)}`);
  }

  if(!customer){
    return exports.replyMenu(event.replyToken,'ยังไม่พบข้อมูลลูกค้าที่ผูกกับ LINE นี้\nกรุณาขอรหัส TYTC จากช่าง แล้วส่งรหัสกลับมาในแชตนี้');
  }

  if(/^(ช่วยเหลือ|วิธีใช้|help|สวัสดี|เมนู)$/i.test(text))return exports.replyMenu(event.replyToken,help(customer));
  if(text==='ติดต่อเจ้าหน้าที่')return exports.replyMenu(event.replyToken,'เจ้าหน้าที่ได้รับข้อความของคุณแล้ว\nหากต้องการแจ้งปัญหา ให้กด “แจ้งปัญหา” แล้วพิมพ์อาการต่อท้ายได้เลย');

  if(text==='สถานะ'){
    const rows=await repo.customerStatus(customer.customer_id);
    const message=rows.length
      ?rows.map(x=>`เคส #${x.problem_id}: ${statusLabel[x.problem_status]||x.problem_status}${x.technician_name?` (${x.technician_name})`:''}`).join('\n')
      :'ยังไม่มีเคสปัญหาในระบบ';
    return exports.replyMenu(event.replyToken,message);
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
    return exports.replyMenu(event.replyToken,help(customer));
  }

  if(!site){
    if(!customer.sites.length)return exports.replyText(event.replyToken,'บัญชีของคุณยังไม่มีจุดติดตั้งที่เปิดใช้งาน กรุณาติดต่อเจ้าหน้าที่');
    return exports.replyMenu(event.replyToken,`กรุณาเลือกจุดติดตั้ง แล้วพิมพ์ “#รหัส อาการ”\n${customer.sites.map(x=>`#${x.site_id} ${x.site_name}`).join('\n')}`);
  }
  if(symptom.length<3)return exports.replyText(event.replyToken,'กรุณาระบุอาการหรือปัญหาให้ละเอียดขึ้นเล็กน้อย');

  const result=await repo.createProblem(site.site_id,symptom);
  return exports.replyMenu(event.replyToken,`${result.duplicate?'รับข้อมูลไว้แล้ว':'รับแจ้งปัญหาเรียบร้อย'}
เลขเคส #${result.problemId}
จุดติดตั้ง: ${site.site_name}
เจ้าหน้าที่จะตรวจสอบและอัปเดตสถานะให้ทราบครับ`);
};

exports.push=async({customer_id,line_user_id,text})=>{
  const target=line_user_id||await repo.lineIdByCustomerId(customer_id);
  if(!target)throw Object.assign(new Error('ลูกค้ายังไม่ได้ผูก LINE'),{status:400});
  if(!text?.trim())throw Object.assign(new Error('กรุณาระบุข้อความ'),{status:400});
  await exports.pushText(target,text.trim());
  return {sent:true,to:target};
};
