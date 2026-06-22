import {useEffect,useState} from 'react';
import {apiBlob} from '../services/api';

export default function UploadImage({jobId,item,editable,onRemove}){
 const[src,setSrc]=useState(''),[open,setOpen]=useState(false);
 useEffect(()=>{
  let active=true,url='';
  apiBlob(`/jobs/${jobId}/evidence/${item.evidence_id}/file`).then(blob=>{url=URL.createObjectURL(blob);if(active)setSrc(url)}).catch(()=>{});
  return()=>{active=false;if(url)URL.revokeObjectURL(url)};
 },[jobId,item.evidence_id]);
 const typeLabel={before:'ก่อนทำ',during:'ระหว่างทำ',after:'หลังทำ',result:'ผลทดสอบ',other:'อื่น ๆ'}[item.evidence_type];
 return <>
  <div className="evidence-photo">
   <button className="evidence-preview" onClick={()=>src&&setOpen(true)}>{src?<img src={src} alt={item.original_name}/>:<span>📷</span>}</button>
   <div><b>{typeLabel}</b><small>{item.original_name}</small></div>
   {editable&&<button className="danger-action" onClick={()=>onRemove(item.evidence_id)}>ลบ</button>}
  </div>
  {open&&<div className="photo-viewer" onClick={()=>setOpen(false)}><button>×</button><img src={src} alt={item.original_name}/></div>}
 </>;
}
