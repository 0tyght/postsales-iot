import {useState} from 'react';

const APK_URL='https://github.com/0tyght/postsales-iot/releases/download/technician-latest/postsales-iot-technician.apk';
const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
const detectPlatform=()=>{
 const agent=window.navigator.userAgent.toLowerCase();
 if(agent.includes('android'))return 'android';
 if(/iphone|ipad|ipod/.test(agent)||(window.navigator.platform==='MacIntel'&&window.navigator.maxTouchPoints>1))return 'ios';
 return 'unknown';
};

export default function InstallPrompt(){
 const[installed]=useState(isStandalone);
 const[dialog,setDialog]=useState('');
 const platform=detectPlatform();
 if(installed)return null;

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
   <div><strong>ใช้งานเหมือนแอปบนโทรศัพท์</strong><small>{platform==='android'?'ดาวน์โหลด APK รุ่นล่าสุด':platform==='ios'?'เพิ่มแอปไว้บนหน้าจอโฮม':'รองรับทั้ง Android และ iPhone'}</small></div>
   <button type="button" onClick={start}>{platform==='android'?'ดาวน์โหลด APK':platform==='ios'?'วิธีติดตั้ง':'ใช้แบบแอป'}</button>
  </div>
  {dialog&&<div className="install-guide-backdrop" onClick={()=>setDialog('')}>
   <div className="install-guide" role="dialog" aria-modal="true" onClick={event=>event.stopPropagation()}>
    <button className="install-guide-close" onClick={()=>setDialog('')} aria-label="ปิด">×</button>
    {dialog==='choose'?<>
     <div className="install-guide-icon">PS</div><h2>เลือกโทรศัพท์ของคุณ</h2><p>ระบบตรวจชนิดเครื่องไม่ได้ กรุณาเลือกเพื่อดูวิธีที่ถูกต้อง</p>
     <div className="platform-choices"><button onClick={()=>choose('android')}><span>🤖</span><b>Android</b><small>ดาวน์โหลด APK</small></button><button onClick={()=>choose('ios')}><span>●</span><b>iPhone</b><small>ดูวิธีเพิ่มแอป</small></button></div>
    </>:<>
     <div className="install-guide-icon">PS</div><h2>เพิ่มแอปบน iPhone</h2><p>ทำเพียงครั้งเดียว จากนั้นเปิดแอปจากหน้าจอโฮมได้เลย</p>
     <div className="ios-install-steps">
      <div><span className="ios-step-picture share-picture"><i>↑</i></span><b>1. แตะปุ่มแชร์</b><small>ปุ่มรูปสี่เหลี่ยมมีลูกศรชี้ขึ้น</small></div>
      <div><span className="ios-step-picture menu-picture"><i>＋</i><em>เพิ่มไปยังหน้าจอโฮม</em></span><b>2. เลือกเพิ่มไปยังหน้าจอโฮม</b><small>เลื่อนเมนูลงหากยังไม่พบ</small></div>
      <div><span className="ios-step-picture add-picture"><i>PS</i><em>เพิ่ม</em></span><b>3. กดเพิ่ม</b><small>ไอคอนแอปจะปรากฏบนหน้าจอโฮม</small></div>
     </div>
     <button className="btn primary full" onClick={()=>setDialog('')}>เข้าใจแล้ว</button>
    </>}
   </div>
  </div>}
 </>;
}
