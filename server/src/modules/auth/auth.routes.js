const router = require('express').Router();
const controller = require('./auth.controller');
const auth = require('../../middlewares/auth.middleware');
const { asyncHandler } = require('../../utils/response.util');

router.post('/login', asyncHandler(controller.login));
router.get('/me', auth, controller.me);

module.exports = router;
