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

exports.configured=()=>Boolean(process.env.LINE_CHANNEL_SECRET&&process.env.LINE_CHANNEL_ACCESS_TOKEN);

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

exports.replyText=(replyToken,text)=>send('reply',{replyToken,messages:[{type:'text',text:text.slice(0,5000)}]});
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
    return exports.replyText(event.replyToken,customer?help(customer):'ขอบคุณที่เพิ่มเพื่อน\n\nกรุณาส่งรหัสลงทะเบียนที่ได้รับจากช่าง เช่น TYTC0001 เพื่อผูก LINE กับข้อมูลลูกค้าของคุณ');
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
    return exports.replyText(event.replyToken,`ผูก LINE สำเร็จ\nลูกค้า: ${result.customer.customer_name}\n\n${help(result.customer)}`);
  }

  if(!customer){
    return exports.replyText(event.replyToken,'ยังไม่พบข้อมูลลูกค้าที่ผูกกับ LINE นี้\nกรุณาขอรหัส TYTC จากช่าง แล้วส่งรหัสกลับมาในแชตนี้');
  }

  if(/^(ช่วยเหลือ|วิธีใช้|help|สวัสดี)$/i.test(text))return exports.replyText(event.replyToken,help(customer));

  if(text==='สถานะ'){
    const rows=await repo.customerStatus(customer.customer_id);
    const message=rows.length
      ?rows.map(x=>`เคส #${x.problem_id}: ${statusLabel[x.problem_status]||x.problem_status}${x.technician_name?` (${x.technician_name})`:''}`).join('\n')
      :'ยังไม่มีเคสปัญหาในระบบ';
    return exports.replyText(event.replyToken,message);
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
    return exports.replyText(event.replyToken,help(customer));
  }

  if(!site){
    if(!customer.sites.length)return exports.replyText(event.replyToken,'บัญชีของคุณยังไม่มีจุดติดตั้งที่เปิดใช้งาน กรุณาติดต่อเจ้าหน้าที่');
    return exports.replyText(event.replyToken,`กรุณาเลือกจุดติดตั้ง แล้วพิมพ์ “#รหัส อาการ”\n${customer.sites.map(x=>`#${x.site_id} ${x.site_name}`).join('\n')}`);
  }
  if(symptom.length<3)return exports.replyText(event.replyToken,'กรุณาระบุอาการหรือปัญหาให้ละเอียดขึ้นเล็กน้อย');

  const result=await repo.createProblem(site.site_id,symptom);
  return exports.replyText(event.replyToken,`${result.duplicate?'รับข้อมูลไว้แล้ว':'รับแจ้งปัญหาเรียบร้อย'}
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
