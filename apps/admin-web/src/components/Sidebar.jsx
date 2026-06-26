const groups=[
 {label:'ภาพรวม',items:[['dashboard','⌂','แดชบอร์ด']]},
 {label:'ข้อมูลลูกค้า',items:[['customers','○','ลูกค้า'],['sites','◇','จุดติดตั้ง']]},
 {label:'ทะเบียนอุปกรณ์',items:[['models','▦','โมเดล'],['devices','▣','อุปกรณ์']]},
 {label:'งานบริการ',items:[['problems','!','เคสบริการ'],['jobs','✓','งานติดตั้งและบริการ']]},
 {label:'ติดตามหลังการขาย',items:[['service','↻','ระยะดูแล'],['warranty','◷','ประกันอุปกรณ์']]},
 {label:'ตั้งค่าระบบ',items:[['line','L','LINE Messaging API'],['users','♙','ผู้ใช้งาน']]},
];
export default function Sidebar({active,onNavigate,open}){
 return <aside className={`sidebar ${open?'open':''}`}>
  <div className="brand"><span className="app-logo-mark" aria-label="THIC logo"></span><div>Post-Sales<small>IoT Support</small></div></div>
  <nav className="sidebar-menu">{groups.map(group=><div className="nav-section" key={group.label}><small>{group.label}</small>{group.items.map(([id,icon,label])=><button key={id} className={active===id?'active':''} onClick={()=>onNavigate(id)}><i>{icon}</i><span>{label}</span></button>)}</div>)}</nav>
 </aside>;
}
