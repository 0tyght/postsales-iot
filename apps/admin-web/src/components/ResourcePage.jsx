import {useEffect,useMemo,useState} from 'react';
import {api} from '../services/api';
import DataTable from './DataTable';
import FormInput from './FormInput';

const inputValue=(value,type)=>{
 if(!value)return '';
 if(type==='datetime-local')return String(value).replace(' ','T').slice(0,16);
 return value;
};

export default function ResourcePage({title,description,endpoint,idKey,columns,fields=[],lookups={},readOnly=false,allowDelete=false,headerExtra,createLabel='เพิ่มข้อมูล',modalTitle='ข้อมูล',initialValues={},canDelete=()=>true,rowActions=[]}){
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[editing,setEditing]=useState(null),[form,setForm]=useState({}),[saving,setSaving]=useState(false),[search,setSearch]=useState('');
 const resolvedFields=useMemo(()=>fields.map(f=>({...f,options:typeof f.options==='function'?f.options(lookups):f.options})),[fields,lookups]);
 const load=async()=>{setLoading(true);setError('');try{setRows(await api(endpoint));}catch(e){setError(e.message)}finally{setLoading(false)}};
 useEffect(()=>{let active=true;api(endpoint).then(data=>{if(active)setRows(data)}).catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[endpoint]);
 const open=row=>{const defaults=typeof initialValues==='function'?initialValues():initialValues;setEditing(row||{});setForm(Object.fromEntries(resolvedFields.map(f=>[f.name,inputValue(row?.[f.name]??defaults[f.name],f.type)])))};
 const isEdit=Boolean(editing?.[idKey]);
 const visibleFields=resolvedFields.filter(f=>!(isEdit&&f.hideOnEdit)&&!(!isEdit&&f.hideOnCreate)&&(!f.showWhen||f.showWhen(form,isEdit))).map(f=>({...f,required:f.required||(!isEdit&&f.requiredOnCreate)}));
 const filteredRows=rows.filter(row=>!search||Object.values(row).some(value=>String(value??'').toLowerCase().includes(search.toLowerCase())));
 const save=async e=>{e.preventDefault();setSaving(true);setError('');try{await api(editing?.[idKey]?`${endpoint}/${editing[idKey]}`:endpoint,{method:editing?.[idKey]?'PUT':'POST',body:JSON.stringify(form)});setEditing(null);await load();}catch(x){setError(x.message)}finally{setSaving(false)}};
 const remove=async row=>{if(!confirm('ยืนยันการลบรายการนี้?'))return;try{await api(`${endpoint}/${row[idKey]}`,{method:'DELETE'});await load()}catch(e){setError(e.message)}};
 return <section><div className="page-head"><div><h1>{title}</h1><p>{description}</p></div><div className="head-actions">{headerExtra}{!readOnly&&<button className="btn primary" onClick={()=>open(null)}>+ {createLabel}</button>}</div></div>
 {error&&<div className="alert error">{error}</div>}<div className="table-tools"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ค้นหาในรายการ..."/><span>{filteredRows.length} รายการ</span></div>{loading?<div className="loading">กำลังโหลดข้อมูล...</div>:<DataTable columns={columns} rows={filteredRows} idKey={idKey} onEdit={readOnly?null:open} onDelete={readOnly||!allowDelete?null:(row=>canDelete(row)?remove(row):setError('รายการนี้ไม่สามารถลบได้ในสถานะปัจจุบัน'))} rowActions={rowActions}/>}
 {editing&&<div className="modal-backdrop" onMouseDown={()=>setEditing(null)}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><h2>{isEdit?`แก้ไข${modalTitle}`:`${createLabel}`}</h2><button onClick={()=>setEditing(null)}>×</button></div><form onSubmit={save}><div className="form-grid">{visibleFields.map(f=><FormInput key={f.name} field={f} value={form[f.name]} onChange={(n,v)=>setForm(x=>({...x,[n]:v}))}/>)}</div><div className="modal-actions"><button type="button" className="btn" onClick={()=>setEditing(null)}>ยกเลิก</button><button className="btn primary" disabled={saving}>{saving?'กำลังบันทึก...':'บันทึก'}</button></div></form></div></div>}
 </section>;
}
