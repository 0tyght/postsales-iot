const r=require('./devices.repository');
Object.assign(exports,{models:r.models,createModel:r.createModel,updateModel:r.updateModel,removeModel:r.removeModel,units:r.units,removeUnit:r.removeUnit,warrantyAlerts:r.warrantyAlerts});
const fail=message=>{throw Object.assign(new Error(message),{status:400});};
const validateModel=data=>{
 if(!String(data.model_name||'').trim())fail('กรุณาระบุชื่อรุ่น');
 if(data.device_type!==undefined){
  if(typeof data.device_type!=='string'||!data.device_type.trim()||data.device_type.trim().length>80)fail('กรุณาระบุประเภทอุปกรณ์ไม่เกิน 80 ตัวอักษร');
  return {...data,device_type:data.device_type.trim()};
 }
 return data;
};
exports.createModel=data=>r.createModel(validateModel(data));
exports.updateModel=(id,data)=>r.updateModel(id,validateModel(data));
const validateUnit=async data=>{
 if(!data.model_id)fail('กรุณาเลือกโมเดลอุปกรณ์');
 if(!String(data.serial_number||'').trim())fail('กรุณาระบุ Serial Number');
 if(!data.purchase_date)fail('กรุณาระบุวันที่ซื้ออุปกรณ์');
 if(!Number.isInteger(Number(data.warranty_years))||Number(data.warranty_years)<=0)fail('ระยะเวลาประกันต้องเป็นจำนวนปีที่มากกว่า 0');
 if(!['active','inactive'].includes(data.device_status||'active'))fail('สถานะอุปกรณ์ไม่ถูกต้อง');
 if(data.installation_job_id){
  const installation=await r.installationSite(data.installation_job_id);
  if(!installation)fail('ไม่พบงานติดตั้งที่เลือก');
  if(!data.site_id||String(installation.site_id)!==String(data.site_id))fail('จุดติดตั้งของอุปกรณ์ไม่ตรงกับงานติดตั้งที่เลือก');
 }
};
exports.createUnit=async data=>{await validateUnit(data);return r.createUnit(data);};
exports.updateUnit=async(id,data)=>{await validateUnit(data);return r.updateUnit(id,data);};
