const test=require('node:test');
const assert=require('node:assert/strict');
const {LineCards}=require('../src/modules/line/line.cards');
const cards=new LineCards();
const menu=labels=>({items:labels.map(label=>({type:'action',action:{type:'message',label,text:label}}))});
test('device choice shows full category, model and serial above a compact button',()=>{
 const fullLabel='กล้องวงจรปิด · Hikvision DS-001 · SN 000123';
 const card=cards.message('เลือกอุปกรณ์',{items:[{type:'action',fullLabel,action:{type:'message',label:'กล้องวงจรปิด',text:'เลือกอุปกรณ์ #1'}}]});
 assert.equal(card.contents.footer.contents[0].text,fullLabel);
 assert.equal(card.contents.footer.contents[1].action.text,'เลือกอุปกรณ์ #1');
 assert.equal(JSON.stringify(card).includes('fullLabel'),false);
});
test('normal replies become readable Flex cards with notification text',()=>{
 const card=cards.message('ขอบคุณคุณสมชาย\nใช้งานมา 120 วันแล้ว');
 assert.equal(card.type,'flex');assert.match(card.altText,/120 วัน/);
 assert.equal(card.contents.body.contents[0].wrap,true);
 assert.match(card.contents.body.contents[0].text,/สมชาย/);
});
test('service care has only the two requested choices',()=>{
 const card=cards.message('มีปัญหาไหมครับ',menu(['มีปัญหา','ไม่มีปัญหา']),{phone:'0812345678'});
 assert.deepEqual(card.contents.footer.contents.map(x=>x.action.text),['มีปัญหา','ไม่มีปัญหา']);
 assert.equal(card.contents.footer.contents.length,2);
});
test('valid contact phone becomes a one-tap call, placeholder never becomes a broken link',()=>{
 assert.equal(cards.message('ติดต่อเรา',menu(['ติดต่อเจ้าหน้าที่']),{phone:'081-234-5678'}).contents.footer.contents[0].action.uri,'tel:0812345678');
 assert.equal(cards.message('ติดต่อเรา',menu(['ติดต่อเจ้าหน้าที่']),{phone:'เบอร์โทรบริษัท'}).contents.footer.contents[0].action.type,'message');
});
test('many choices remain available in a carousel with at most four buttons per card',()=>{
 const labels=Array.from({length:14},(_,i)=>'อุปกรณ์ '+i);const card=cards.message('เลือกอุปกรณ์',menu(labels));
 assert.equal(card.contents.type,'carousel');
 assert.deepEqual(card.contents.contents.flatMap(b=>b.footer.contents.map(x=>x.action.text)),labels);
 assert.ok(card.contents.contents.every(b=>b.footer.contents.length<=4));
});
test('datetime picker payload is preserved',()=>{
 const action={type:'datetimepicker',label:'เลือกวันเวลา',data:'repair:appointment:pick',mode:'datetime'};
 assert.deepEqual(cards.message('เลือกเวลา',{items:[{type:'action',action}]}).contents.footer.contents[0].action,action);
});
test('long editable templates retain content and obey safe payload limits',()=>{
 const text='ก'.repeat(5000);const card=cards.message(text);
 assert.equal(card.contents.body.contents.map(x=>x.text).join(''),text);
 assert.ok(Buffer.byteLength(JSON.stringify(card.contents))<30000);
 assert.ok(Array.from(card.altText).length<=400);
});
