exports.success = (res, data, message = 'success', status = 200) =>
  res.status(status).json({ success: true, message, data });

exports.asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
