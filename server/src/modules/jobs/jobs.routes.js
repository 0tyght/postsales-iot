const r=require('express').Router(),c=require('./jobs.controller'),w=require('./job-workflow.controller'),upload=require('../../middlewares/upload.middleware'),role=require('../../middlewares/role.middleware'),{asyncHandler:a}=require('../../utils/response.util');
r.get('/',a(c.list));r.post('/',role('admin','technician'),a(c.create));
r.get('/:id',role('admin','technician'),a(w.detail));r.post('/:id/start',role('admin','technician'),a(w.start));r.put('/:id/result',role('admin','technician'),a(w.result));
r.post('/:id/problem-devices',role('admin','technician'),a(w.addProblemDevice));r.delete('/:id/problem-devices/:itemId',role('admin','technician'),a(w.removeProblemDevice));
r.post('/:id/evidence',role('admin','technician'),upload.array('photos',10),a(w.upload));r.get('/:id/evidence/:evidenceId/file',role('admin','technician'),a(w.file));r.delete('/:id/evidence/:evidenceId',role('admin','technician'),a(w.removeEvidence));
r.post('/:id/complete',role('admin','technician'),a(w.complete));r.put('/:id',role('admin','technician'),a(c.update));r.delete('/:id',role('admin'),a(c.remove));module.exports=r;
