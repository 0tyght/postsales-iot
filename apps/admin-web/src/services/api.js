import {getApiBase} from '../runtime-config';
const token=()=>localStorage.getItem('portal_token')||localStorage.getItem('admin_token');
const expireSession=()=>{['portal_token','portal_user','admin_token','admin_user'].forEach(key=>localStorage.removeItem(key));window.dispatchEvent(new Event('auth-expired'))};

export async function api(path,options={}){
 const response=await fetch(`${await getApiBase()}${path}`,{...options,headers:{'Content-Type':'application/json',...(token()?{Authorization:`Bearer ${token()}`}:{ }),...options.headers}});
 const payload=await response.json().catch(()=>({success:false,message:'เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง'}));
 if(response.status===401)expireSession();
 if(!response.ok)throw new Error(payload.message||'เกิดข้อผิดพลาด');
 return payload.data;
}

export async function apiBlob(path){
 const response=await fetch(`${await getApiBase()}${path}`,{headers:token()?{Authorization:`Bearer ${token()}`}:{}});
 if(response.status===401)expireSession();
 if(!response.ok)throw new Error('ไม่สามารถโหลดรูปภาพได้');
 return response.blob();
}

export const fmtDate=value=>value?new Intl.DateTimeFormat('th-TH',{dateStyle:'medium'}).format(new Date(value)):'-';
export const fmtDateTime=value=>value?new Intl.DateTimeFormat('th-TH',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value.replace?.(' ','T')||value)):'-';
