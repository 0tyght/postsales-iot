const router = require('express').Router();
const controller = require('./license.controller');
const adminAuth = require('../../middlewares/adminAuth');
const { asyncHandler } = require('../../utils/response');

router.post('/check', asyncHandler(controller.check));
router.get('/', adminAuth, asyncHandler(controller.list));
router.post('/', adminAuth, asyncHandler(controller.create));
router.put('/:id', adminAuth, asyncHandler(controller.update));

module.exports = router;
