const router = require('express').Router();
const controller = require('./users.controller');
const { asyncHandler } = require('../../utils/response.util');
router.get('/', asyncHandler(controller.list));
router.post('/', asyncHandler(controller.create));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));
module.exports = router;
