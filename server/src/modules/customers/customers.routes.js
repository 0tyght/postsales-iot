const r=require('express').Router(),c=require('./customers.controller'),role=require('../../middlewares/role.middleware'),{asyncHandler:a}=require('../../utils/response.util');
r.get('/',a(c.list));r.post('/',role('admin','technician'),a(c.create));r.put('/:id',role('admin'),a(c.update));r.delete('/:id',role('admin'),a(c.remove));module.exports=r;
