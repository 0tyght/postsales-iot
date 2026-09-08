import {useCallback,useEffect,useId,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {ScanSession,validateSerial} from '../../../shared/serial-scanner/session.mjs';
import './SerialScanner.css';

function CameraDialog({onAccept,onClose}){
 const dialog=useRef(null),video=useRef(null);
 const titleId=useId();
 const[value,setValue]=useState('');
 const[error,setError]=useState('');
 const[reading,setReading]=useState(true);
 useEffect(()=>{
  const element=dialog.current;
  const previous=document.activeElement;
  const session=new ScanSession();
  let timer;
  element.showModal();
  const stop=()=>session.stop();
  const hidden=()=>{if(document.hidden){stop();onClose();}};
  document.addEventListener('visibilitychange',hidden);
  (async()=>{
   try{
    if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia)throw new Error('กรุณาเปิดผ่าน HTTPS และใช้เบราว์เซอร์ที่รองรับกล้อง หรือพิมพ์เลขเอง');
    const {BrowserMultiFormatReader}=await import('@zxing/browser');
    if(session.stopped)return;
    const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}}});
    if(!session.attachStream(stream))return;
    const reader=new BrowserMultiFormatReader(undefined,{delayBetweenScanAttempts:300,delayBetweenScanSuccess:1000});
    timer=setTimeout(()=>{stop();setReading(false);setError('ยังอ่านไม่พบภายใน 60 วินาที ปิดแล้วลองสแกนใหม่ หรือพิมพ์เลขเอง');},60000);
    session.attachControls(await reader.decodeFromStream(stream,video.current,(result,_error,controls)=>{
     if(!result||session.stopped)return;
     controls.stop();session.stop();clearTimeout(timer);
     const text=result.getText().trim();
     setValue(text);setError(validateSerial(text));setReading(false);
    }));
   }catch(e){
    stop();clearTimeout(timer);
    if(!element.isConnected||!element.open)return;
    setReading(false);
    setError(e.name==='NotAllowedError'?'ไม่ได้รับอนุญาตใช้กล้อง กรุณาอนุญาตในเบราว์เซอร์ หรือพิมพ์เลขเอง':e.name==='NotFoundError'?'ไม่พบกล้องบนอุปกรณ์นี้ กรุณาพิมพ์เลขเอง':e.name==='NotReadableError'?'กล้องถูกใช้งานอยู่ กรุณาปิดแอปที่ใช้กล้องแล้วลองใหม่':e.message||'เปิดกล้องไม่ได้ กรุณาพิมพ์เลขเอง');
   }
  })();
  return()=>{clearTimeout(timer);stop();document.removeEventListener('visibilitychange',hidden);element.close();previous?.focus();};
 },[onClose]);
 return createPortal(<dialog ref={dialog} className="serial-scanner-dialog" aria-labelledby={titleId}
  onCancel={event=>{event.preventDefault();event.stopPropagation();onClose();}} onKeyDown={event=>event.stopPropagation()}>
  <h2 id={titleId}>สแกน Serial Number</h2>
  <p>เล็งบาร์โค้ดหรือ QR บนฉลาก ตรวจว่าเป็นเลขซีเรียล ไม่ใช่รหัสสินค้า</p>
  <video ref={video} autoPlay muted playsInline hidden={!reading} />
  {reading&&<p role="status">กำลังอ่าน… ถือกล้องให้นิ่งและให้ฉลากอยู่ในแสงสว่าง</p>}
  {!reading&&<label>ตรวจสอบ / แก้ไขหมายเลข<input value={value} onChange={event=>{setValue(event.target.value);setError(validateSerial(event.target.value));}} autoComplete="off" /></label>}
  {error&&<p role="alert">{error}</p>}
  <small>อ่านภาพบนอุปกรณ์ของคุณ ไม่อัปโหลดภาพกล้องไปเซิร์ฟเวอร์</small>
  <div className="serial-scanner-actions">
   <button type="button" onClick={onClose}>ยกเลิก / กรอกเอง</button>
   <button type="button" disabled={reading||Boolean(validateSerial(value))} onClick={()=>onAccept(value.trim())}>ใช้หมายเลขนี้</button>
  </div>
 </dialog>,document.body);
}
export default function SerialScanButton({onScan}){
 const[open,setOpen]=useState(false);
 // Stable callback avoids restarting the camera when the preview value changes.
 const close=useCallback(()=>setOpen(false),[]);
 return <><button type="button" className="serial-scan-button" onClick={event=>{event.preventDefault();setOpen(true);}}>สแกนบาร์โค้ด / QR</button>
 {open&&<CameraDialog onClose={close} onAccept={value=>{onScan(value);setOpen(false);}}/>}</>;
}
