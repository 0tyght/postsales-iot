const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const repository = require('./auth.repository');

exports.login = async (username, password) => {
  const user = await repository.findByUsername(username);
  if (!user || user.status !== 'active' || !(await bcrypt.compare(password, user.password))) {
    const error = new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    error.status = 401;
    throw error;
  }
  const profile = {
    user_id: user.user_id,
    full_name: user.full_name,
    username: user.username,
    phone: user.phone,
    role: user.role,
  };
  return {
    token: jwt.sign(profile, process.env.JWT_SECRET, { expiresIn: '8h' }),
    user: profile,
  };
};
