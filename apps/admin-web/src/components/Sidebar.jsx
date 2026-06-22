const groups=[
 {label:'ภาพรวม',items:[['dashboard','⌂','แดชบอร์ด']]},
 {label:'ข้อมูลลูกค้า',items:[['customers','○','ลูกค้า'],['sites','◇','จุดติดตั้ง']]},
 {label:'ทะเบียนอุปกรณ์',items:[['models','▦','รุ่นอุปกรณ์'],['devices','▣','อุปกรณ์จริง']]},
 {label:'งานบริการ',items:[['problems','!','เคสปัญหา'],['jobs','✓','งานติดตั้งและซ่อม']]},
 {label:'ติดตามหลังการขาย',items:[['service','↻','รอบเซอร์วิส'],['warranty','◷','ประกันอุปกรณ์']]},
 {label:'ตั้งค่าระบบ',items:[['line','L','LINE Messaging API'],['users','♙','ผู้ใช้งาน']]},
];
export default function Sidebar({active,onNavigate,open}){return <aside className={`sidebar ${open?'open':''}`}><div className="brand"><span>PS</span><div>Post-Sales<small>IoT Support</small></div></div><nav>{groups.map(group=><div className="nav-section" key={group.label}><small>{group.label}</small>{group.items.map(([id,icon,label])=><button key={id} className={active===id?'active':''} onClick={()=>onNavigate(id)}><i>{icon}</i><span>{label}</span></button>)}</div>)}</nav></aside>}
