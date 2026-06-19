const API_URL=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
export async function api(path,options={}){
  const token=localStorage.getItem('admin_token');
  const response=await fetch(`${API_URL}${path}`,{
    ...options,
    headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{ }),...options.headers},
  });
  const payload=await response.json().catch(()=>({success:false,message:'เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง'}));
  if(response.status===401){localStorage.removeItem('admin_token');localStorage.removeItem('admin_user');window.dispatchEvent(new Event('auth-expired'));}
  if(!response.ok)throw new Error(payload.message||'เกิดข้อผิดพลาด');
  return payload.data;
}
export const fmtDate=v=>v?new Intl.DateTimeFormat('th-TH',{dateStyle:'medium'}).format(new Date(v)): '-';
export const fmtDateTime=v=>v?new Intl.DateTimeFormat('th-TH',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v.replace?.(' ','T')||v)): '-';
