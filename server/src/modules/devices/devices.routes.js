const r=require('express').Router(),c=require('./devices.controller'),{asyncHandler:a}=require('../../utils/response.util');
r.get('/models',a(c.models));r.post('/models',a(c.createModel));r.put('/models/:id',a(c.updateModel));r.delete('/models/:id',a(c.removeModel));
r.get('/units',a(c.units));r.post('/units',a(c.createUnit));r.put('/units/:id',a(c.updateUnit));r.delete('/units/:id',a(c.removeUnit));r.get('/warranty-alerts',a(c.warranty));module.exports=r;
