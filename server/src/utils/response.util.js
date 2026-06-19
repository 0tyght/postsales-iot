const success = (res, data, message = 'สำเร็จ', status = 200) =>
  res.status(status).json({ success: true, message, data });

const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

module.exports = { success, asyncHandler };
