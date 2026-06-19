const r=require('express').Router(),c=require('./customer-sites.controller'),{asyncHandler:a}=require('../../utils/response.util');
r.get('/',a(c.list));r.get('/service-reminders',a(c.reminders));r.post('/',a(c.create));r.post('/:id/mark-contacted',a(c.markContacted));r.put('/:id',a(c.update));r.delete('/:id',a(c.remove));module.exports=r;
