const test=require('node:test');
const assert=require('node:assert/strict');
const repoPath=require.resolve('../src/modules/devices/devices.repository');
require.cache[repoPath]={id:repoPath,filename:repoPath,loaded:true,exports:{createModel:data=>data,updateModel:(_id,data)=>data}};
const service=require('../src/modules/devices/devices.service');
test('model category is stored separately and trimmed without changing the model code',()=>{
 const result=service.createModel({device_type:' กล้องวงจรปิด ',model_name:'DS-001'});
 assert.equal(result.device_type,'กล้องวงจรปิด');assert.equal(result.model_name,'DS-001');
});
test('invalid categories are rejected before repository writes',()=>{
 for(const device_type of ['', ' ', 'x'.repeat(81),123])assert.throws(()=>service.createModel({model_name:'ABC',device_type}),/ประเภทอุปกรณ์/);
});
test('legacy clients do not infer or overwrite an existing category',()=>{
 const result=service.updateModel(1,{model_name:'NVR-123'});assert.equal(result.device_type,undefined);
});
