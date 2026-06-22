import {useEffect,useState} from 'react';

const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
const isIos=()=>/iphone|ipad|ipod/i.test(window.navigator.userAgent);

export default function InstallPrompt(){
 const[installEvent,setInstallEvent]=useState(null);
 const[installed,setInstalled]=useState(isStandalone);
 const[showGuide,setShowGuide]=useState(false);

 useEffect(()=>{
  const ready=event=>{event.preventDefault();setInstallEvent(event)};
  const complete=()=>{setInstalled(true);setInstallEvent(null)};
  window.addEventListener('beforeinstallprompt',ready);
  window.addEventListener('appinstalled',complete);
  return()=>{window.removeEventListener('beforeinstallprompt',ready);window.removeEventListener('appinstalled',complete)};
 },[]);

 if(installed)return null;
 const install=async()=>{
  if(!installEvent){setShowGuide(true);return}
  await installEvent.prompt();
  const choice=await installEvent.userChoice;
  if(choice.outcome==='accepted')setInstalled(true);
  setInstallEvent(null);
 };

 return <>
  <div className="install-card">
   <div><strong>ใช้งานเหมือนแอปบนโทรศัพท์</strong><small>ติดตั้งครั้งเดียว แล้วเปิดจากหน้าหลักได้ทันที</small></div>
   <button type="button" onClick={install}>ติดตั้งแอป</button>
  </div>
  {showGuide&&<div className="install-guide-backdrop" onClick={()=>setShowGuide(false)}>
   <div className="install-guide" role="dialog" aria-modal="true" onClick={event=>event.stopPropagation()}>
    <button className="install-guide-close" onClick={()=>setShowGuide(false)} aria-label="ปิด">×</button>
    <div className="install-guide-icon">PS</div>
    <h2>{isIos()?'ติดตั้งบน iPhone':'ติดตั้งบนหน้าหลัก'}</h2>
    {isIos()?<ol><li>แตะปุ่ม <b>แชร์</b> ในเบราว์เซอร์</li><li>เลือก <b>เพิ่มไปยังหน้าจอโฮม</b></li><li>กด <b>เพิ่ม</b></li></ol>:<p>เปิดเมนูของเบราว์เซอร์ แล้วเลือก <b>ติดตั้งแอป</b> หรือ <b>เพิ่มไปยังหน้าจอหลัก</b></p>}
    <button className="btn primary full" onClick={()=>setShowGuide(false)}>เข้าใจแล้ว</button>
   </div>
  </div>}
 </>;
}
