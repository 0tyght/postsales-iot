const service = require('./license.service');
const { success } = require('../../utils/response');

exports.list = async (req, res) => success(res, await service.list());
exports.create = async (req, res) => success(res, await service.create(req.body), 'license created', 201);
exports.update = async (req, res) => success(res, await service.update(req.params.id, req.body), 'license updated');
exports.check = async (req, res) => success(res, await service.check(req.body, req.ip), 'license checked');
