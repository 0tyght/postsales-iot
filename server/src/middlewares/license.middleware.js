const licenseClient = require('../services/licenseClient.service');

const writeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const exemptPrefixes = [
  '/api/auth',
  '/api/system',
  '/api/line/status',
  '/api/line/templates',
  '/api/health',
  '/linebot',
];

module.exports = async (req, res, next) => {
  if (!licenseClient.required()) return next();
  if (!writeMethods.has(req.method)) return next();
  if (exemptPrefixes.some(prefix => req.path.startsWith(prefix))) return next();

  const state = await licenseClient.checkRemote();
  if (state.allowed) return next();

  return res.status(402).json({
    success: false,
    message: 'License หมดอายุหรือยังไม่ได้เปิดใช้งาน จึงไม่สามารถสร้างหรือแก้ไขข้อมูลใหม่ได้',
    data: {
      license_status: state.status,
      reason: state.reason,
      expires_at: state.expires_at,
    },
  });
};
