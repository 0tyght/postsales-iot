const service = require('./users.service');
const { success } = require('../../utils/response.util');
exports.list = async (req, res) => success(res, await service.list());
exports.create = async (req, res) => success(res, { user_id: await service.create(req.body) }, 'เพิ่มผู้ใช้แล้ว', 201);
exports.update = async (req, res) => { await service.update(req.params.id, req.body); success(res, null, 'แก้ไขผู้ใช้แล้ว'); };
exports.remove = async (req, res) => { await service.remove(req.params.id); success(res, null, 'ลบผู้ใช้แล้ว'); };
