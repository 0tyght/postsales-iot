const clip=(value,max)=>Array.from(String(value??'')).slice(0,max).join('');
const textNode=(text,extra={})=>({type:'text',text,wrap:true,size:'md',color:'#253B4A',...extra});

class LineCards {
  constructor({brand='Post-Sales IoT'}={}){this.brand=brand;}
  message(text,menu=false,{title='ทีมดูแลหลังการขาย',phone=''}={}){
    const body=String(text||'ขอบคุณที่ติดต่อเราครับ').slice(0,5000);
    const actions=(menu?.items||[]).map(item=>({...item.action,label:clip(item.action.label,40)}));
    const cleanPhone=String(phone).replace(/[\s()-]/g,'');
    if(/^\+?\d{8,15}$/.test(cleanPhone)){
      for(let i=0;i<actions.length;i++)if(actions[i].type==='message'&&actions[i].text==='ติดต่อเจ้าหน้าที่'){
        actions[i]={type:'uri',label:'โทรติดต่อเจ้าหน้าที่',uri:`tel:${cleanPhone}`};
      }
    }
    // Limit each card to four clear choices. Keep all supplied choices in a carousel.
    const pages=Math.max(1,Math.ceil(actions.length/4));
    const chunks=Array.from(body);const paragraphs=[];
    for(let i=0;i<chunks.length;i+=1000)paragraphs.push(chunks.slice(i,i+1000).join(''));
    const bubbles=Array.from({length:pages},(_,index)=>({
      type:'bubble',size:'mega',
      header:{type:'box',layout:'vertical',backgroundColor:'#153B50',paddingAll:'18px',spacing:'sm',contents:[
        textNode(clip(this.brand,80),{size:'xs',color:'#C2E8E3'}),
        textNode(clip(title,100),{size:'lg',weight:'bold',color:'#FFFFFF'}),
      ]},
      body:{type:'box',layout:'vertical',paddingAll:'20px',spacing:'md',contents:[
        ...(index===0?paragraphs.map(p=>textNode(p)):[textNode('เลือกตัวเลือกที่ตรงกับข้อมูลของคุณครับ')]),
        ...(pages>1?[textNode(`ตัวเลือก ${index+1}/${pages} · เลื่อนการ์ดเพื่อดูเพิ่มเติม`,{size:'xs',color:'#657A85'})]:[]),
      ]},
      ...(actions.length?{footer:{type:'box',layout:'vertical',paddingAll:'16px',spacing:'sm',contents:actions.slice(index*4,index*4+4).flatMap((action,i)=>[
        ...(menu.items[index*4+i].fullLabel?[textNode(clip(menu.items[index*4+i].fullLabel,300),{size:'sm',weight:'bold'})]:[]),{
        type:'button',action,style:i===0&&action.text!=='ยกเลิก'?'primary':'secondary',
        ...(i===0&&action.text!=='ยกเลิก'?{color:'#087F75'}:{}),height:'md',
      }])}}:{}),
    }));
    const contents=bubbles.length===1?bubbles[0]:{type:'carousel',contents:bubbles};
    // Never send an oversized Flex payload, including unusually long administrator templates.
    if(pages>12||Buffer.byteLength(JSON.stringify(contents),'utf8')>28000){
      return {type:'text',text:body,...(menu?.items?.length?{quickReply:{items:menu.items.slice(0,13).map(({action})=>({type:'action',action}))}}:{})};
    }
    return {type:'flex',altText:clip(`${title}: ${body}`,400),contents};
  }
}
module.exports={LineCards};
