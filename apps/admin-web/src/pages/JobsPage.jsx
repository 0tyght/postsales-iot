import {useCallback,useEffect,useMemo,useState} from 'react';
import FormInput from '../components/FormInput';
import StatusBadge from '../components/StatusBadge';
import useLookups from '../hooks/useLookups';
import {api,apiBlob,fmtDateTime} from '../services/api';

const statusOptions=[
 {value:'',label:'ทั้งหมด'},
 {value:'created',label:'รอเริ่มงาน'},
 {value:'in_progress',label:'กำลังทำ'},
 {value:'completed',label:'เสร็จแล้ว'},
 {value:'cancelled',label:'ยกเลิก'},
];
const evidenceLabels={before:'ก่อนทำ',during:'ระหว่างทำ',after:'หลังทำ',result:'ผลทดสอบ',other:'อื่น ๆ'};
const resultLabels={success:'สำเร็จ',partial:'สำเร็จบางส่วน',failed:'ไม่สำเร็จ',pass:'ผ่าน',fail:'ไม่ผ่าน'};
const localDateTime=value=>value?String(value).replace(' ','T').slice(0,16):'';

function EvidenceImage({jobId,item,onOpen}){
 const[src,setSrc]=useState('');
 useEffect(()=>{let active=true,url='';apiBlob(`/jobs/${jobId}/evidence/${item.evidence_id}/file`).then(blob=>{url=URL.createObjectURL(blob);if(active)setSrc(url)}).catch(()=>{});return()=>{active=false;if(url)URL.revokeObjectURL(url)}},[jobId,item.evidence_id]);
 return <button className="evidence-thumb" onClick={()=>src&&onOpen(src,item)} disabled={!src}>{src?<img src={src} alt={item.original_name}/>:<span>กำลังโหลด...</span>}<small>{evidenceLabels[item.evidence_type]||'หลักฐาน'}</small></button>;
}

function JobDetail({jobId,onClose,onChanged}){
 const[job,setJob]=useState(null),[error,setError]=useState(''),[lightbox,setLightbox]=useState(null);
 const load=useCallback(async()=>{try{setJob(await api(`/jobs/${jobId}`));setError('')}catch(e){setError(e.message)}},[jobId]);
 useEffect(()=>{const initial=setTimeout(load,0),timer=setInterval(load,5000);return()=>{clearTimeout(initial);clearInterval(timer)}},[load]);
 const timeline=[['สร้างงาน',job?.created_at,true],['เริ่มงาน',job?.started_at,Boolean(job?.started_at)],['เสร็จงาน',job?.completed_at,job?.job_status==='completed']];
 return <div className="modal-backdrop job-detail-backdrop" onMouseDown={onClose}><article className="job-detail-drawer" onMouseDown={e=>e.stopPropagation()}>
  <header className="job-detail-head"><div><span className="eyebrow">รายละเอียดงาน #{jobId}</span><h2>{job?`${job.customer_name} · ${job.site_name}`:'กำลังโหลด...'}</h2></div><button className="close-button" onClick={onClose}>×</button></header>
  {error&&<div className="alert error">{error}</div>}{!job?<div className="loading">กำลังโหลดรายละเอียด...</div>:<div className="job-detail-body">
   <div className="detail-status"><StatusBadge value={job.job_type}/><StatusBadge value={job.job_status}/><span className="live-dot">อัปเดตอัตโนมัติ</span></div>
   <div className="detail-info-grid"><div><small>ลูกค้า</small><strong>{job.customer_name}</strong><span>{job.customer_phone||'ไม่มีเบอร์โทร'}</span></div><div><small>ช่างผู้รับผิดชอบ</small><strong>{job.technician_name||'ยังไม่มอบหมาย'}</strong><span>นัดหมาย {fmtDateTime(job.scheduled_at)}</span></div><div className="wide"><small>สถานที่</small><strong>{job.site_name}</strong><span>{job.site_address||'-'}</span></div></div>
   <section className="detail-section"><h3>ความคืบหน้า</h3><div className="job-timeline">{timeline.map(([label,time,done])=><div className={done?'done':''} key={label}><i>{done?'✓':''}</i><span><strong>{label}</strong><small>{time?fmtDateTime(time):'ยังไม่ถึงขั้นตอนนี้'}</small></span></div>)}</div></section>
   {(job.symptom_detail||job.job_note)&&<section className="detail-section"><h3>ข้อมูลหน้างาน</h3>{job.symptom_detail&&<p><b>อาการที่แจ้ง:</b> {job.symptom_detail}</p>}{job.job_note&&<p><b>หมายเหตุ:</b> {job.job_note}</p>}</section>}
   <section className="detail-section"><div className="section-heading"><h3>รูปหลักฐาน</h3><span>{job.evidence.length} รูป</span></div>{job.evidence.length?<div className="evidence-gallery">{job.evidence.map(item=><EvidenceImage key={item.evidence_id} jobId={jobId} item={item} onOpen={(src,data)=>setLightbox({src,data})}/>)}</div>:<div className="empty-evidence">ช่างยังไม่ได้อัปโหลดรูป</div>}</section>
   <section className="detail-section"><h3>ผลการปฏิบัติงาน</h3>{job.job_type==='installation'?<div className="result-grid"><div><small>ผลติดตั้ง</small><strong>{resultLabels[job.installation_result]||job.installation_result||'ยังไม่บันทึก'}</strong></div><div><small>ผลทดสอบ</small><strong>{resultLabels[job.test_result]||job.test_result||'ยังไม่บันทึก'}</strong></div></div>:<p>{job.repair_summary||'ช่างยังไม่ได้สรุปการซ่อม'}</p>}{job.result_summary&&<p>{job.result_summary}</p>}</section>
  </div>}
  <footer className="job-detail-footer"><button className="btn" onClick={()=>{onClose();onChanged(job)}}>แก้ไข/มอบหมายงาน</button><button className="btn primary" onClick={load}>รีเฟรชตอนนี้</button></footer>
 </article>{lightbox&&<div className="lightbox" onMouseDown={e=>e.stopPropagation()} onClick={()=>setLightbox(null)}><button>×</button><img src={lightbox.src} alt={lightbox.data.original_name}/><div>{evidenceLabels[lightbox.data.evidence_type]} · {lightbox.data.original_name}</div></div>}</div>;
}

function JobForm({row,lookups,onClose,onSaved}){
 const isEdit=Boolean(row?.job_id),defaults={job_type:'repair',job_status:'created'};
 const[form,setForm]=useState(()=>({...defaults,...row,scheduled_at:localDateTime(row?.scheduled_at),started_at:localDateTime(row?.started_at),completed_at:localDateTime(row?.completed_at)}));
 const[saving,setSaving]=useState(false),[error,setError]=useState('');
 const fields=[
  {name:'job_type',label:'ประเภทงาน',type:'select',required:true,hideOnEdit:true,options:[{value:'repair',label:'งานซ่อมจากเคสปัญหา'},{value:'installation',label:'งานติดตั้งครั้งแรก'}]},
  {name:'problem_id',label:'เคสปัญหา',type:'select',required:true,hideOnEdit:true,showWhen:f=>f.job_type==='repair',options:lookups.problems?.filter(x=>!x.job_id&&x.problem_status==='open').map(x=>({value:x.problem_id,label:`#${x.problem_id} · ${x.customer_name} · ${x.site_name}`}))||[]},
  {name:'site_id',label:'จุดติดตั้ง',type:'select',required:true,showWhen:f=>isEdit||f.job_type==='installation',options:lookups.sites?.filter(x=>x.site_status==='active').map(x=>({value:x.site_id,label:`${x.customer_name} · ${x.site_name}`}))||[]},
  {name:'technician_id',label:'มอบหมายให้ช่าง',type:'select',options:lookups.users?.filter(x=>x.role==='technician'&&x.status==='active').map(x=>({value:x.user_id,label:x.full_name}))||[]},
  {name:'scheduled_at',label:'กำหนดเข้าหน้างาน',type:'datetime-local'},
  {name:'job_status',label:'สถานะงาน',type:'select',hideOnCreate:true,required:true,options:statusOptions.slice(1).map(x=>({value:x.value,label:x.label}))},
  {name:'job_note',label:'รายละเอียดและคำแนะนำสำหรับช่าง',type:'textarea',fullWidth:true},
  {name:'result_summary',label:'สรุปผล',type:'textarea',fullWidth:true,hideOnCreate:true},
  {name:'started_at',label:'เริ่มงานจริง',type:'datetime-local',hideOnCreate:true},{name:'completed_at',label:'เสร็จงานจริง',type:'datetime-local',hideOnCreate:true},
 ];
 const visible=fields.filter(f=>!(isEdit&&f.hideOnEdit)&&!(!isEdit&&f.hideOnCreate)&&(!f.showWhen||f.showWhen(form)));
 const save=async e=>{e.preventDefault();setSaving(true);setError('');try{await api(isEdit?`/jobs/${row.job_id}`:'/jobs',{method:isEdit?'PUT':'POST',body:JSON.stringify(form)});onSaved()}catch(x){setError(x.message)}finally{setSaving(false)}};
 return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><h2>{isEdit?`แก้ไขงาน #${row.job_id}`:'สร้างงานใหม่'}</h2><button onClick={onClose}>×</button></div><form onSubmit={save}>{error&&<div className="alert error">{error}</div>}<div className="form-grid">{visible.map(field=><FormInput key={field.name} field={field} value={form[field.name]??''} onChange={(name,value)=>setForm(x=>({...x,[name]:value}))}/>)}</div><div className="modal-actions"><button type="button" className="btn" onClick={onClose}>ยกเลิก</button><button className="btn primary" disabled={saving}>{saving?'กำลังบันทึก...':'บันทึกงาน'}</button></div></form></div></div>;
}

export default function JobsPage(){
 const lookups=useLookups({sites:'/customer-sites',users:'/users',problems:'/problems'});
 const[rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[status,setStatus]=useState(''),[type,setType]=useState(''),[search,setSearch]=useState(''),[selected,setSelected]=useState(null),[editing,setEditing]=useState(undefined),[lastUpdated,setLastUpdated]=useState(null),[refreshing,setRefreshing]=useState(false);
 const load=useCallback(async(silent=false)=>{if(silent)setRefreshing(true);try{setRows(await api('/jobs'));setLastUpdated(new Date());setError('')}catch(e){setError(e.message)}finally{setLoading(false);setRefreshing(false)}},[]);
 useEffect(()=>{const initial=setTimeout(load,0),timer=setInterval(()=>{if(!document.hidden)load(true)},5000);return()=>{clearTimeout(initial);clearInterval(timer)}},[load]);
 const counts=useMemo(()=>Object.fromEntries(statusOptions.slice(1).map(x=>[x.value,rows.filter(r=>r.job_status===x.value).length])),[rows]);
 const filtered=rows.filter(r=>(!status||r.job_status===status)&&(!type||r.job_type===type)&&(!search||[r.job_id,r.customer_name,r.site_name,r.technician_name,r.symptom_detail].some(v=>String(v??'').toLowerCase().includes(search.toLowerCase()))));
 const formSaved=()=>{setEditing(undefined);load()};
 return <section className="jobs-monitor"><div className="page-head"><div><div className="live-heading"><h1>ติดตามงานช่าง</h1><span className="live-dot">สด</span></div><p>สถานะและรูปหน้างานอัปเดตอัตโนมัติทุก 5 วินาที</p></div><div className="head-actions"><div className="last-update">{refreshing?'กำลังอัปเดต...':lastUpdated?`ล่าสุด ${lastUpdated.toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}`:'-'}</div><button className="btn" onClick={()=>load(true)}>↻ รีเฟรช</button><button className="btn primary" onClick={()=>setEditing(null)}>+ สร้างงาน</button></div></div>
 {error&&<div className="alert error">{error}</div>}
 <div className="job-stat-grid"><button className={!status?'active':''} onClick={()=>setStatus('')}><span>งานทั้งหมด</span><strong>{rows.length}</strong></button>{statusOptions.slice(1,4).map(option=><button key={option.value} className={`${option.value} ${status===option.value?'active':''}`} onClick={()=>setStatus(option.value)}><span>{option.label}</span><strong>{counts[option.value]||0}</strong></button>)}</div>
 <div className="job-toolbar"><div className="job-search"><span>⌕</span><input placeholder="ค้นหาเลขงาน ลูกค้า สถานที่ หรือช่าง..." value={search} onChange={e=>setSearch(e.target.value)}/></div><select value={type} onChange={e=>setType(e.target.value)}><option value="">ทุกประเภทงาน</option><option value="installation">งานติดตั้ง</option><option value="repair">งานซ่อม</option></select><div className="status-tabs">{statusOptions.map(option=><button key={option.value} className={status===option.value?'active':''} onClick={()=>setStatus(option.value)}>{option.label}</button>)}</div></div>
 {loading?<div className="loading">กำลังโหลดงาน...</div>:<div className="monitor-list">{filtered.length?filtered.map(job=><article className={`monitor-card status-${job.job_status}`} key={job.job_id}><button className="monitor-main" onClick={()=>setSelected(job.job_id)}><div className="monitor-id"><span>#{job.job_id}</span><StatusBadge value={job.job_type}/></div><div className="monitor-customer"><strong>{job.customer_name}</strong><span>{job.site_name}</span>{job.symptom_detail&&<small>{job.symptom_detail}</small>}</div><div className="monitor-assignee"><small>ช่างผู้รับผิดชอบ</small><strong>{job.technician_name||'ยังไม่มอบหมาย'}</strong><span>{fmtDateTime(job.scheduled_at)}</span></div><div className="monitor-evidence"><strong>{job.evidence_count||0}</strong><span>รูปหน้างาน</span>{job.latest_evidence_at&&<small>ล่าสุด {fmtDateTime(job.latest_evidence_at)}</small>}</div><div className="monitor-state"><StatusBadge value={job.job_status}/><span>ดูรายละเอียด →</span></div></button></article>):<div className="empty-monitor"><strong>ไม่พบงานที่ค้นหา</strong><span>ลองเปลี่ยนคำค้นหาหรือตัวกรอง</span></div>}</div>}
 {selected&&<JobDetail jobId={selected} onClose={()=>setSelected(null)} onChanged={job=>{setSelected(null);setEditing(job)}}/>}{editing!==undefined&&<JobForm row={editing} lookups={lookups} onClose={()=>setEditing(undefined)} onSaved={formSaved}/>}</section>;
}
