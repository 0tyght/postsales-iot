const fs=require('fs/promises');
const path=require('path');
const crypto=require('crypto');
const root=path.resolve(__dirname,'../../uploads/jobs');
const extensions={'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp'};

exports.save=async(jobId,file)=>{
 const dir=path.join(root,String(jobId));await fs.mkdir(dir,{recursive:true});
 const name=`${Date.now()}-${crypto.randomBytes(12).toString('hex')}${extensions[file.mimetype]}`;
 const absolute=path.join(dir,name);await fs.writeFile(absolute,file.buffer);
 return {storageKey:`${jobId}/${name}`,absolute};
};
exports.absolute=storageKey=>{const target=path.resolve(root,storageKey);if(!target.startsWith(root+path.sep))throw Object.assign(new Error('เส้นทางไฟล์ไม่ถูกต้อง'),{status:400});return target;};
exports.remove=async storageKey=>fs.unlink(exports.absolute(storageKey)).catch(e=>{if(e.code!=='ENOENT')throw e});
