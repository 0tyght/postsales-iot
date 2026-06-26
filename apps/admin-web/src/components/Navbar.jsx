const pages={
 dashboard:['แดชบอร์ด','ภาพรวมงานและรายการที่ต้องติดตาม'],
 customers:['ลูกค้า','ข้อมูลผู้ติดต่อและช่องทางสื่อสาร'],
 sites:['จุดติดตั้ง','บ้าน/สาขาที่อยู่ในความดูแล'],
 models:['โมเดล','ข้อมูลรุ่นและสเปกมาตรฐาน'],
 devices:['อุปกรณ์','Serial และสถานะอุปกรณ์แต่ละชิ้น'],
 problems:['เคสบริการ','รับเรื่องซ่อม เพิ่ม ถอด หรือเปลี่ยนอุปกรณ์จากลูกค้า'],
 jobs:['งานติดตั้งและบริการ','ติดตามสถานะงานและรูปหน้างาน'],
 service:['ระยะดูแล','ดูว่าจุดติดตั้งไหนยังอยู่ในระยะดูแล'],
 warranty:['ประกันอุปกรณ์','ตรวจวันหมดประกันของอุปกรณ์'],
 line:['LINE Messaging API','ตั้งค่าการเชื่อมต่อและทดสอบข้อความ'],
 users:['ผู้ใช้งาน','จัดการบัญชีผู้ดูแลระบบและช่าง'],
};

export default function Navbar({active,user,onLogout,onMenu}){
 const page=pages[active]||pages.dashboard;
 return <header className="navbar">
  <div className="navbar-left">
   <button className="menu-button" onClick={onMenu} aria-label="เปิดเมนู">☰</button>
   <div className="navbar-page-title"><strong>{page[0]}</strong><small>{page[1]}</small></div>
  </div>
  <div className="navbar-user">
   <div><strong>{user?.full_name}</strong><small>{user?.role==='admin'?'ผู้ดูแลระบบ':user?.role}</small></div>
   <button className="btn" onClick={onLogout}>ออกจากระบบ</button>
  </div>
 </header>;
}
