import {getApiBase} from '../runtime-config';

export const getToken=()=>localStorage.getItem('portal_token')||localStorage.getItem('tech_token');

const expireSession=()=>{
 ['portal_token','portal_user','tech_token','tech_user'].forEach(key=>localStorage.removeItem(key));
 window.dispatchEvent(new Event('auth-expired'));
};

const request=async(path,options={},forceConfig=false)=>{
 const isForm=options.body instanceof FormData;
 return fetch(`${await getApiBase(forceConfig)}${path}`,{
  ...options,
  headers:{
   ...(isForm?{}:{'Content-Type':'application/json'}),
   ...(getToken()?{Authorization:`Bearer ${getToken()}`}:{ }),
   ...options.headers,
  },
 });
};

const fetchWithRetry=async(path,options={})=>{
 try{return await request(path,options)}
 catch{try{return await request(path,options,true)}catch{throw new Error('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง')}}
};

export async function api(path,options={}){
 const response=await fetchWithRetry(path,options);
 const payload=await response.json().catch(()=>({message:'เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง'}));
 if(response.status===401)expireSession();
 if(!response.ok)throw new Error(payload.message||'ไม่สามารถดำเนินการได้');
 return payload.data;
}

export async function apiBlob(path){
 const response=await fetchWithRetry(path);
 if(response.status===401)expireSession();
 if(!response.ok)throw new Error('ไม่สามารถโหลดรูปภาพได้');
 return response.blob();
}
