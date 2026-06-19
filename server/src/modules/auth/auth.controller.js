const service = require('./auth.service');
const { success } = require('../../utils/response.util');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
  }
  success(res, await service.login(username, password), 'เข้าสู่ระบบสำเร็จ');
};

exports.me = async (req, res) => success(res, req.user);
