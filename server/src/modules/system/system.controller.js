const { success } = require('../../utils/response.util');
const service = require('./system.service');

exports.status = async (req, res) =>
  success(res, await service.status(), 'โหลดสถานะระบบแล้ว');

exports.settings = async (req, res) =>
  success(res, await service.settings(), 'โหลดการตั้งค่าระบบแล้ว');

exports.updateSettings = async (req, res) =>
  success(res, await service.updateSettings(req.body), 'บันทึกการตั้งค่าระบบแล้ว');

exports.refreshLicense = async (req, res) =>
  success(res, await service.refreshLicense(), 'ตรวจสอบ License แล้ว');
