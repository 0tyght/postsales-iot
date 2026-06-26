const lineService=require('../modules/line/line.service');

const intervalMinutes=Number(process.env.LINE_SERVICE_REMINDER_INTERVAL_MINUTES||60);
const enabled=String(process.env.LINE_SERVICE_REMINDER_AUTO||'true').toLowerCase()!=='false';

let timer;
let running=false;

const run=async()=>{
  if(!enabled||running)return;
  running=true;
  try{
    const result=await lineService.sendDueServiceReminders(Number(process.env.LINE_SERVICE_REMINDER_LIMIT||20));
    if(result.sent){
      console.log(`LINE service reminders sent: ${result.sent}/${result.total}`);
    }
    if(result.errors?.length){
      console.warn('LINE service reminder errors:',JSON.stringify(result.errors));
    }
  }catch(error){
    console.warn('LINE service reminder scheduler failed:',error.message);
  }finally{
    running=false;
  }
};

exports.start=()=>{
  if(!enabled){
    console.log('LINE service reminder scheduler is disabled');
    return;
  }
  run();
  timer=setInterval(run,Math.max(5,intervalMinutes)*60*1000);
  console.log(`LINE service reminder scheduler started (${Math.max(5,intervalMinutes)} min)`);
};

exports.stop=()=>{if(timer)clearInterval(timer);};
