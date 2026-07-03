require('dotenv').config();
const app = require('./app');
const db = require('./config/db');

const port = Number(process.env.PORT || 5100);

(async () => {
  try {
    await db.query('SELECT 1');
    app.listen(port, () => console.log(`Post-Sales License Server running at http://localhost:${port}`));
  } catch (error) {
    console.error('License database connection failed:', error.message);
    process.exit(1);
  }
})();
