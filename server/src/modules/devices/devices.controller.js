const s=require('./devices.service'),{success}=require('../../utils/response.util');
exports.models=async(q,r)=>success(r,await s.models());exports.units=async(q,r)=>success(r,await s.units());exports.warranty=async(q,r)=>success(r,await s.warrantyAlerts());
exports.createModel=async(q,r)=>success(r,{model_id:await s.createModel(q.body)},'เพิ่มรุ่นอุปกรณ์แล้ว',201);
exports.updateModel=async(q,r)=>{await s.updateModel(q.params.id,q.body);success(r,null,'แก้ไขรุ่นอุปกรณ์แล้ว');};
exports.removeModel=async(q,r)=>{await s.removeModel(q.params.id);success(r,null,'ลบรุ่นอุปกรณ์แล้ว');};
exports.createUnit=async(q,r)=>success(r,{device_id:await s.createUnit(q.body)},'เพิ่มอุปกรณ์แล้ว',201);
exports.updateUnit=async(q,r)=>{await s.updateUnit(q.params.id,q.body);success(r,null,'แก้ไขอุปกรณ์แล้ว');};
exports.removeUnit=async(q,r)=>{await s.removeUnit(q.params.id);success(r,null,'ลบอุปกรณ์แล้ว');};
