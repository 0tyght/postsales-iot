const service=require('./line.service');
const {success}=require('../../utils/response.util');

exports.webhook=async(req,res)=>{
  if(!service.verifySignature(req.rawBody,req.get('x-line-signature'))){
    return res.status(401).json({success:false,message:'ลายเซ็น LINE ไม่ถูกต้อง'});
  }
  await Promise.all((req.body.events||[]).map(service.handleEvent));
  res.status(200).json({success:true});
};

exports.status=async(req,res)=>success(res,{
  configured:service.configured(),
  webhook_path:'/linebot/webhook.php',
  webhook_url:service.webhookUrl(),
  webhook_health:await service.webhookHealth(),
  channel_secret:Boolean(process.env.LINE_CHANNEL_SECRET),
  access_token:Boolean(process.env.LINE_CHANNEL_ACCESS_TOKEN),
});

exports.bindInfo=async(req,res)=>success(res,await service.bindInfo(req.params.customerId));
exports.push=async(req,res)=>success(res,await service.push(req.body),'ส่งข้อความ LINE แล้ว');
exports.templates=async(req,res)=>success(res,await service.templates());
exports.updateTemplate=async(req,res)=>success(res,await service.updateTemplate(req.params.key,req.body),'บันทึกข้อความ LINE แล้ว');
exports.sendServiceReminder=async(req,res)=>success(res,await service.sendServiceReminder(req.body.site_id),'ส่งข้อความติดตามรอบ service แล้ว');
