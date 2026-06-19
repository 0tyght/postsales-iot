import{useEffect,useState}from'react';import LoginPage from './pages/LoginPage';import AdminLayout from './layouts/AdminLayout';import AdminRoutes from './routes/AdminRoutes';import'./styles/admin.css';
const initialPage=()=>location.hash.replace('#/','')||'dashboard';
export default function App(){const[user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('admin_user'))}catch{return null}}),[page,setPage]=useState(initialPage);
 useEffect(()=>{const hash=()=>setPage(initialPage());const expired=()=>setUser(null);addEventListener('hashchange',hash);addEventListener('auth-expired',expired);return()=>{removeEventListener('hashchange',hash);removeEventListener('auth-expired',expired)}},[]);
 const navigate=id=>{location.hash=`/${id}`;setPage(id)};const logout=()=>{localStorage.removeItem('admin_token');localStorage.removeItem('admin_user');setUser(null)};
 if(!user)return <LoginPage onLogin={u=>{setUser(u);navigate('dashboard')}}/>;
 return <AdminLayout active={page} onNavigate={navigate} user={user} onLogout={logout}><AdminRoutes page={page}/></AdminLayout>}
