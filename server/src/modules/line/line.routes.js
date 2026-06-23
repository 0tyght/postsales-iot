const router=require('express').Router();
const controller=require('./line.controller');
const auth=require('../../middlewares/auth.middleware');
const role=require('../../middlewares/role.middleware');
const {asyncHandler}=require('../../utils/response.util');

router.post('/webhook',asyncHandler(controller.webhook));
router.get('/status',auth,role('admin'),asyncHandler(controller.status));
router.get('/bind/:customerId',auth,role('admin','technician'),asyncHandler(controller.bindInfo));
router.post('/push',auth,role('admin'),asyncHandler(controller.push));
module.exports=router;
