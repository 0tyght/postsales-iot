import{lazy,Suspense,useEffect,useState}from'react';
import LoginPage from './pages/LoginPage';
import AdminLayout from './layouts/AdminLayout';
import AdminRoutes from './routes/AdminRoutes';
import InstallPrompt from './components/InstallPrompt';
import'./styles/admin.css';

const TechnicianApp=lazy(()=>import('../../technician-web/src/App.jsx'));
const savedUser=()=>{for(const key of ['portal_user','admin_user','tech_user']){try{const user=JSON.parse(localStorage.getItem(key));if(user)return user}catch{continue}}return null};
const initialPage=()=>location.hash.replace('#/','')||'dashboard';

export default function App(){
 const[user,setUser]=useState(savedUser),[page,setPage]=useState(initialPage);
 useEffect(()=>{const hash=()=>setPage(initialPage());const expired=()=>setUser(null);addEventListener('hashchange',hash);addEventListener('auth-expired',expired);return()=>{removeEventListener('hashchange',hash);removeEventListener('auth-expired',expired)}},[]);
 const navigate=id=>{location.hash=`/${id}`;setPage(id)};
 const clearHash=()=>history.replaceState(null,'',location.pathname+location.search);
 const logout=()=>{['portal_token','portal_user','admin_token','admin_user','tech_token','tech_user'].forEach(key=>localStorage.removeItem(key));setUser(null);clearHash()};
 const loggedIn=nextUser=>{setUser(nextUser);if(nextUser.role==='admin')navigate('dashboard');else clearHash()};
 if(!user)return <><LoginPage onLogin={loggedIn}/><InstallPrompt/></>;
 if(user.role==='technician')return <Suspense fallback={<div className="portal-loading">กำลังเปิดพื้นที่ทำงานช่าง...</div>}><TechnicianApp session={user} onSessionLogout={logout}/></Suspense>;
 if(user.role!=='admin'){logout();return null}
 return <AdminLayout active={page} onNavigate={navigate} user={user} onLogout={logout}><AdminRoutes page={page}/></AdminLayout>;
}
