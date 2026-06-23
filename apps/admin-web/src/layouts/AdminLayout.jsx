import {useState} from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function AdminLayout({active,onNavigate,user,onLogout,children}){
 const[open,setOpen]=useState(false);
 const nav=id=>{onNavigate(id);setOpen(false)};
 return <div className="admin-shell ux-admin-frame">
  <Sidebar active={active} onNavigate={nav} open={open}/>
  {open&&<div className="sidebar-overlay" onClick={()=>setOpen(false)}/>}
  <div className="main-shell">
   <Navbar active={active} user={user} onLogout={onLogout} onMenu={()=>setOpen(!open)}/>
   <main className="admin-content-frame">
    <div className="admin-content-inner">{children}</div>
   </main>
  </div>
 </div>;
}
