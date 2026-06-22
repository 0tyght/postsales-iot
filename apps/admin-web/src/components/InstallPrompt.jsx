import {useState} from 'react';

const APK_URL='https://github.com/0tyght/postsales-iot/releases/download/technician-latest/postsales-iot-technician.apk';
const asset=name=>`${import.meta.env.BASE_URL}${name}`;
const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
const detectPlatform=()=>{
 const agent=window.navigator.userAgent.toLowerCase();
 if(agent.includes('android'))return 'android';
 if(/iphone|ipad|ipod/.test(agent)||(window.navigator.platform==='MacIntel'&&window.navigator.maxTouchPoints>1))return 'ios';
 if(/mobile|tablet/.test(agent)||window.navigator.maxTouchPoints>1)return 'unknown';
 return 'desktop';
};

export default function InstallPrompt(){
 const[installed]=useState(isStandalone);
 const[dialog,setDialog]=useState('');
 const platform=detectPlatform();
 if(installed||platform==='desktop')return null;

 const start=()=>{
  if(platform==='android'){window.location.assign(APK_URL);return}
  setDialog(platform==='ios'?'ios':'choose');
 };
 const choose=next=>{
  if(next==='android'){window.location.assign(APK_URL);return}
  setDialog('ios');
 };

 return <>
  <div className="install-card">
   <div><strong>ใช้งานบนแอปพลิเคชั่นโทรศัพท์</strong><small>{platform==='android'?'ดาวน์โหลด APK รุ่นล่าสุด':platform==='ios'?'เพิ่มแอปไว้บนหน้าจอโฮม':'รองรับทั้ง Android และ iOS'}</small></div>
   <button type="button" onClick={start}>{platform==='android'?'ดาวน์โหลด APK':platform==='ios'?'วิธีติดตั้ง':'ใช้แบบแอป'}</button>
  </div>
  {dialog&&<div className="install-guide-backdrop" onClick={()=>setDialog('')}>
   <div className="install-guide" role="dialog" aria-modal="true" onClick={event=>event.stopPropagation()}>
    <button className="install-guide-close" onClick={()=>setDialog('')} aria-label="ปิด">×</button>
    {dialog==='choose'?<>
     <div className="install-guide-icon">PS</div><h2>เลือกโทรศัพท์ของคุณ</h2><p>ระบบตรวจชนิดเครื่องไม่ได้ กรุณาเลือกเพื่อดูวิธีที่ถูกต้อง</p>
     <div className="platform-choices"><button onClick={()=>choose('android')}><img src={asset('platform-android.svg')} alt="Android"/><b>Android</b><small>ดาวน์โหลด APK</small></button><button onClick={()=>choose('ios')}><img src={asset('platform-ios.svg')} alt="iOS"/><b>iOS</b><small>ดูวิธีเพิ่มแอป</small></button></div>
    </>:<>
     <div className="install-guide-icon">PS</div><h2>เพิ่มแอปบน iOS</h2><div className="safari-notice"><b>เริ่มต้น: เปิดลิงก์นี้ด้วย Safari</b><span>ขั้นตอนต่อไปให้ทำภายในเบราว์เซอร์ Safari เท่านั้น</span></div>
     <div className="ios-install-steps">
      <div className="ios-guide-step"><b>1. แตะปุ่มเมนูด้านล่าง</b><small>แตะปุ่มจุดสามจุดเพื่อเปิดเมนู</small><img src={asset('ios-step-menu.png')} alt="ตำแหน่งปุ่มเมนูบน iOS"/></div>
      <div className="ios-guide-step"><b>2. แตะ แชร์</b><small>เลือกคำสั่งแชร์จากเมนู</small><img src={asset('ios-step-share.png')} alt="ตำแหน่งปุ่มแชร์บน iOS"/></div>
      <div className="ios-guide-step"><b>3. เลื่อนเมนูลงด้านล่าง</b><small>จากนั้นแตะ “เพิ่มไปยังหน้าจอโฮม” และกดเพิ่ม</small><img src={asset('ios-step-add-home.png')} alt="ตำแหน่งเพิ่มไปยังหน้าจอโฮมบน iOS"/></div>
     </div>
     <button className="btn primary full" onClick={()=>setDialog('')}>เข้าใจแล้ว</button>
    </>}
   </div>
  </div>}
 </>;
}
