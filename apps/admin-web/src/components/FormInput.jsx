export default function FormInput({field,value,onChange}){
 const common={id:field.name,name:field.name,value:value??'',required:field.required,onChange:e=>onChange(field.name,e.target.value)};
 return <label className="form-field"><span>{field.label}{field.required&&' *'}</span>
  {field.type==='select'?<select {...common}><option value="">-- เลือก --</option>{(field.options||[]).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>
  :field.type==='textarea'?<textarea {...common} rows="3" placeholder={field.placeholder}/>
  :<input {...common} type={field.type||'text'} placeholder={field.placeholder}/>}</label>;
}
