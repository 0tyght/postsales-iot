const test=require('node:test');
const assert=require('node:assert/strict');

const repoPath=require.resolve('../src/modules/line/line.repository');
const servicePath=require.resolve('../src/modules/line/line.service');

const replies=[];
require.cache[repoPath]={
  id:repoPath,
  filename:repoPath,
  loaded:true,
  exports:{
    ensureTemplates:async()=>{},
    systemSettingsMap:async()=>({}),
    templatesMap:async()=>({
      unbound_help:'ยังไม่พบข้อมูลลูกค้าที่ผูกกับ LINE นี้ กรุณาส่งรหัส TYTC0001',
      contact_staff:'ติดต่อเจ้าหน้าที่ได้ที่ {{support_phone}}',
    }),
    customerByLineId:async()=>null,
  },
};
delete require.cache[servicePath];
const service=require(servicePath);
service.replyText=async(replyToken,text,menu)=>{
  replies.push({replyToken,text,menu});
};

const userSource={type:'user',userId:'U_NOT_BOUND'};
const assertUnboundReply=replyToken=>{
  const reply=replies.find(item=>item.replyToken===replyToken);
  assert.ok(reply,'ต้องตอบกลับ event');
  assert.match(reply.text,/ยังไม่พบข้อมูลลูกค้า/);
  assert.deepEqual(reply.menu.items.map(item=>item.action.label),['ติดต่อเจ้าหน้าที่']);
};

test('unbound LINE user receives registration help for a text message',async()=>{
  await service.handleEvent({type:'message',replyToken:'text',source:userSource,message:{type:'text',text:'สวัสดี'}});
  assertUnboundReply('text');
});

test('unbound LINE user receives registration help for a non-text message',async()=>{
  await service.handleEvent({type:'message',replyToken:'image',source:userSource,message:{type:'image',id:'1'}});
  assertUnboundReply('image');
});

test('unbound LINE user receives registration help for a postback',async()=>{
  await service.handleEvent({type:'postback',replyToken:'postback',source:userSource,postback:{data:'unknown'}});
  assertUnboundReply('postback');
});

test('event without a userId still receives registration help',async()=>{
  await service.handleEvent({type:'message',replyToken:'no-user-id',source:{type:'group',groupId:'G1'},message:{type:'text',text:'สวัสดี'}});
  assertUnboundReply('no-user-id');
});

test('unbound LINE user can request staff contact information',async()=>{
  await service.handleEvent({type:'message',replyToken:'contact',source:userSource,message:{type:'text',text:'ติดต่อเจ้าหน้าที่'}});
  const reply=replies.find(item=>item.replyToken==='contact');
  assert.ok(reply);
  assert.match(reply.text,/ติดต่อเจ้าหน้าที่/);
});
