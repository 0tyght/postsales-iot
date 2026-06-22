export default function TechnicianLayout({user,onLogout,children}){
 return <div className="app">
  <header>
   <div><b>Post-Sales IoT</b><small>{user.full_name}</small></div>
   <button onClick={onLogout}>ออกจากระบบ</button>
  </header>
  <main>{children}</main>
 </div>;
}
