const r=require('express').Router(),c=require('./problems.controller'),role=require('../../middlewares/role.middleware'),{asyncHandler:a}=require('../../utils/response.util');
r.get('/',role('admin','technician'),a(c.list));
r.post('/',role('admin'),a(c.create));
r.post('/:id/claim',role('technician'),a(c.claim));
r.put('/:id',role('admin'),a(c.update));
r.delete('/:id',role('admin'),a(c.remove));
module.exports=r;
