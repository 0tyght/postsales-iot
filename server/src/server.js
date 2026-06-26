require('dotenv').config();
const app=require('./app');
const db=require('./config/db');
const lineServiceScheduler=require('./services/lineServiceScheduler.service');
const port=Number(process.env.PORT||5000);

(async()=>{
  try{
    await db.query('SELECT 1');
    app.listen(port,()=>{
      console.log(`Post-Sales API running at http://localhost:${port}`);
      lineServiceScheduler.start();
    });
  }catch(error){
    console.error('Database connection failed:',error.message);
    process.exit(1);
  }
})();
