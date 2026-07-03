const router = require('express').Router();
const controller = require('./system.controller');
const { asyncHandler } = require('../../utils/response.util');

router.get('/status', asyncHandler(controller.status));
router.get('/settings', asyncHandler(controller.settings));
router.put('/settings', asyncHandler(controller.updateSettings));
router.post('/license/refresh', asyncHandler(controller.refreshLicense));

module.exports = router;
