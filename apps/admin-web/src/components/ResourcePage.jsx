import {useEffect,useMemo,useState} from 'react';
import {api} from '../services/api';
import DataTable from './DataTable';
import FormInput from './FormInput';

const inputValue=(value,type)=>{
 if(!value)return '';
 if(type==='datetime-local')return String(value).replace(' ','T').slice(0,16);
 return value;
};

export default function ResourcePage({title,description,endpoint,idKey,columns,fields=[],lookups={},filters=[],readOnly=false,allowDelete=false,headerExtra,createLabel='เพิ่มข้อมูล',modalTitle='ข้อมูล',initialValues={},canDelete=()=>true,deleteBlockedMessage='รายการนี้ไม่สามารถลบได้ในสถานะปัจจุบัน',rowActions=[],onSaved}){
 const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[editing,setEditing]=useState(null),[form,setForm]=useState({}),[saving,setSaving]=useState(false),[search,setSearch]=useState(''),[filterValues,setFilterValues]=useState({}),[page,setPage]=useState(1),[pageSize,setPageSize]=useState(10);
 const resolvedFields=useMemo(()=>fields.map(f=>({...f,options:typeof f.options==='function'?f.options(lookups):f.options})),[fields,lookups]);
 const load=async()=>{setLoading(true);setError('');try{setRows(await api(endpoint));}catch(e){setError(e.message)}finally{setLoading(false)}};
 useEffect(()=>{let active=true;api(endpoint).then(data=>{if(active)setRows(data)}).catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[endpoint]);
 const open=row=>{const defaults=typeof initialValues==='function'?initialValues():initialValues;setEditing(row||{});setForm(Object.fromEntries(resolvedFields.map(f=>[f.name,inputValue(row?.[f.name]??defaults[f.name],f.type)])))};
 const isEdit=Boolean(editing?.[idKey]);
 const visibleFields=resolvedFields.filter(f=>!(isEdit&&f.hideOnEdit)&&!(!isEdit&&f.hideOnCreate)&&(!f.showWhen||f.showWhen(form,isEdit))).map(f=>({...f,required:f.required||(!isEdit&&f.requiredOnCreate)}));
 const filteredRows=rows.filter(row=>(!search||Object.values(row).some(value=>String(value??'').toLowerCase().includes(search.toLowerCase())))&&filters.every(filter=>{const selected=filterValues[filter.key];if(!selected)return true;return filter.predicate?filter.predicate(row,selected):String(row[filter.key]??'')===selected}));
 const totalPages=Math.max(1,Math.ceil(filteredRows.length/pageSize));
 const currentPage=Math.min(page,totalPages);
 const pagedRows=filteredRows.slice((currentPage-1)*pageSize,currentPage*pageSize);
 const save=async e=>{e.preventDefault();setSaving(true);setError('');try{const wasEdit=Boolean(editing?.[idKey]);const result=await api(wasEdit?`${endpoint}/${editing[idKey]}`:endpoint,{method:wasEdit?'PUT':'POST',body:JSON.stringify(form)});setEditing(null);await load();onSaved?.(result,form,wasEdit);}catch(x){setError(x.message)}finally{setSaving(false)}};
 const remove=async row=>{if(!confirm('ยืนยันการลบรายการนี้?'))return;try{await api(`${endpoint}/${row[idKey]}`,{method:'DELETE'});await load()}catch(e){setError(e.message)}};
 return <section><div className="page-head"><div><h1>{title}</h1><p>{description}</p></div><div className="head-actions">{headerExtra}{!readOnly&&<button className="btn primary" onClick={()=>open(null)}>+ {createLabel}</button>}</div></div>
 {error&&<div className="alert error">{error}</div>}<div className="table-tools"><div className="table-filters"><input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="ค้นหาชื่อ รหัส หรือข้อมูลในรายการ..."/>{filters.map(filter=><select key={filter.key} value={filterValues[filter.key]||''} onChange={e=>{setFilterValues(v=>({...v,[filter.key]:e.target.value}));setPage(1)}}><option value="">{filter.label}: ทั้งหมด</option>{filter.options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select>)}</div><div className="table-count"><select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1)}}><option value="10">10 / หน้า</option><option value="25">25 / หน้า</option><option value="50">50 / หน้า</option></select><span>{filteredRows.length} รายการ</span></div></div>{loading?<div className="loading">กำลังโหลดข้อมูล...</div>:<><DataTable columns={columns} rows={pagedRows} idKey={idKey} onEdit={readOnly?null:open} onDelete={readOnly||!allowDelete?null:(row=>canDelete(row)?remove(row):setError(deleteBlockedMessage))} rowActions={rowActions}/>{totalPages>1&&<div className="pagination"><button className="btn" disabled={currentPage===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>ก่อนหน้า</button><span>หน้า {currentPage} จาก {totalPages}</span><button className="btn" disabled={currentPage===totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>ถัดไป</button></div>}</>}
 {editing&&<div className="modal-backdrop" onMouseDown={()=>setEditing(null)}><div className="modal" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><h2>{isEdit?`แก้ไข${modalTitle}`:`${createLabel}`}</h2><button onClick={()=>setEditing(null)}>×</button></div><form onSubmit={save}><div className="form-grid">{visibleFields.map(f=><FormInput key={f.name} field={f} value={form[f.name]} onChange={(n,v)=>setForm(x=>({...x,[n]:v}))}/>)}</div><div className="modal-actions"><button type="button" className="btn" onClick={()=>setEditing(null)}>ยกเลิก</button><button className="btn primary" disabled={saving}>{saving?'กำลังบันทึก...':'บันทึก'}</button></div></form></div></div>}
 </section>;
}
