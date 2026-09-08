export function validateSerial(value) {
  const text=String(value??'').trim();
  if(!text)return 'ยังไม่มีหมายเลขที่อ่านได้';
  if(text.length>150)return 'ข้อมูลยาวเกิน 150 ตัวอักษร อาจไม่ใช่เลขซีเรียล';
  if(/[\x00-\x1f\x7f]/.test(text))return 'บาร์โค้ดมีข้อมูลหลายส่วน กรุณากรอกเลขซีเรียลเอง';
  return '';
}

export class ScanSession {
  constructor(){this.stopped=false;this.stream=null;this.controls=null;}
  attachStream(stream){this.stream=stream;if(this.stopped)this.stop();return !this.stopped;}
  attachControls(controls){this.controls=controls;if(this.stopped)this.stop();}
  stop(){this.stopped=true;this.controls?.stop();this.stream?.getTracks().forEach(track=>track.stop());}
}
