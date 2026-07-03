const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');
const { success, asyncHandler } = require('./utils/response');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/health', asyncHandler(async (req, res) => {
  await db.query('SELECT 1');
  success(res, { database: 'connected' });
}));

app.use('/api/licenses', require('./modules/licenses/license.routes'));

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use((req, res) => res.status(404).json({ success: false, message: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'License server error' });
});

module.exports = app;
