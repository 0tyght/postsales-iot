const bcrypt = require('bcrypt');
const repository = require('./users.repository');

exports.list = repository.list;
exports.create = async (data) => {
  if (!data.password || data.password.length < 6) {
    const error = new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
    error.status = 400;
    throw error;
  }
  return repository.create({ ...data, password: await bcrypt.hash(data.password, 12) });
};
exports.update = async (id, data) => repository.update(id, {
  ...data,
  password: data.password ? await bcrypt.hash(data.password, 12) : undefined,
});
exports.remove = repository.remove;
