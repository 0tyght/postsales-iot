import {useCallback,useEffect,useState} from 'react';
import './styles/technician.css';
import LoginPage from './pages/LoginPage';
import TechnicianLayout from './layouts/TechnicianLayout';
import TechnicianRoutes from './routes/TechnicianRoutes';
import CreateInstallationJob from './components/CreateInstallationJob';
import {api} from './services/api';

const readUser=()=>{try{return JSON.parse(localStorage.getItem('tech_user'))}catch{return null}};

export default function App({session=null,onSessionLogout}){
 const[user,setUser]=useState(()=>session||readUser());
 const[jobs,setJobs]=useState([]),[problems,setProblems]=useState([]),[sites,setSites]=useState([]),[models,setModels]=useState([]),[devices,setDevices]=useState([]);
 const[selected,setSelected]=useState(null),[creating,setCreating]=useState(false),[error,setError]=useState('');
 const load=useCallback(()=>Promise.all([api('/jobs'),api('/problems'),api('/customer-sites'),api('/devices/models'),api('/devices/units')]).then(([jobData,problemData,siteData,modelData,deviceData])=>{setJobs(jobData);setProblems(problemData);setSites(siteData);setModels(modelData);setDevices(deviceData);setError('')}).catch(x=>setError(x.message)),[]);

 useEffect(()=>{
  if(!user)return;
  load();
  const timer=setInterval(()=>{if(!document.hidden)load()},15000);
  return()=>clearInterval(timer);
 },[user,load]);

 useEffect(()=>{
  const expired=()=>{if(onSessionLogout)onSessionLogout();else setUser(null)};
  window.addEventListener('auth-expired',expired);
  return()=>window.removeEventListener('auth-expired',expired);
 },[onSessionLogout]);

 if(!user)return <LoginPage onLogin={setUser}/>;
 const logout=()=>{['portal_token','portal_user','tech_token','tech_user'].forEach(key=>localStorage.removeItem(key));if(onSessionLogout)onSessionLogout();else setUser(null)};
 return <TechnicianLayout user={user} onLogout={logout}>
  {error&&<div className="alert error">{error}</div>}
  <TechnicianRoutes jobs={jobs} problems={problems} models={models} devices={devices} selected={selected} onOpen={setSelected} onBack={()=>setSelected(null)} onCreate={()=>setCreating(true)} onChanged={load} onClaim={async problemId=>{await api(`/problems/${problemId}/claim`,{method:'POST'});await load()}}/>
  {creating&&<CreateInstallationJob sites={sites} onClose={()=>setCreating(false)} onDone={async jobId=>{setCreating(false);await load();if(jobId)setSelected(jobId)}}/>}
 </TechnicianLayout>;
}
