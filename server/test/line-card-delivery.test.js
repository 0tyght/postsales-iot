const test=require('node:test');
const assert=require('node:assert/strict');
const repoPath=require.resolve('../src/modules/line/line.repository');
require.cache[repoPath]={id:repoPath,filename:repoPath,loaded:true,exports:{
 systemSettingsMap:async()=>({line_customer_channel_access_token:'test-only-not-real'}),
 templatesMap:async()=>({service_reminder:'ขอบคุณคุณ {{customer_name}} ใช้บริการมา {{days_in_service}} แล้ว'}),
 serviceSite:async()=>({site_id:1,site_name:'บ้านตัวอย่าง',customer_name:'ทดสอบ',line_user_id:'U_TEST',days_in_service:120}),
}};
const service=require('../src/modules/line/line.service');
test('reply delivery uses one Flex card and retains buttons',async()=>{
 const old=global.fetch;let body;
 global.fetch=async(_url,request)=>{body=JSON.parse(request.body);return {ok:true};};
 try{await service.replyMenu('fake-token','ทดสอบเมนู');assert.equal(body.messages.length,1);assert.equal(body.messages[0].type,'flex');assert.equal(body.messages[0].contents.footer.contents.length,4);}finally{global.fetch=old;}
});
test('scheduled care delivery uses one card with days and exactly two choices, not duplicate messages',async()=>{
 const old=global.fetch;let body;
 global.fetch=async(_url,request)=>{body=JSON.parse(request.body);return {ok:true};};
 try{await service.sendServiceReminder(1);assert.equal(body.messages.length,1);const card=body.messages[0];assert.equal(card.type,'flex');assert.match(JSON.stringify(card),/120/);assert.deepEqual(card.contents.footer.contents.map(x=>x.action.text),['มีปัญหา','ไม่มีปัญหา']);}finally{global.fetch=old;}
});
