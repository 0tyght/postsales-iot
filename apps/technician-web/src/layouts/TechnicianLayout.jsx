export default function TechnicianLayout({user,onLogout,children}){
 return <div className="app technician-app-frame">
  <header className="technician-topbar">
   <div className="technician-brand"><b>Post-Sales IoT</b><small>{user.full_name}</small></div>
   <button onClick={onLogout}>ออกจากระบบ</button>
  </header>
  <main className="technician-workspace">{children}</main>
 </div>;
}
