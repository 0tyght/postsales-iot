const multer=require('multer');
const allowed=new Set(['image/jpeg','image/png','image/webp']);
module.exports=multer({
 storage:multer.memoryStorage(),
 limits:{fileSize:8*1024*1024,files:10},
 fileFilter:(req,file,done)=>allowed.has(file.mimetype)?done(null,true):done(Object.assign(new Error('รองรับเฉพาะรูป JPG, PNG หรือ WebP'),{status:400}))
});
