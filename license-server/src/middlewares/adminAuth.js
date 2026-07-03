module.exports = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.headers['x-admin-token'];
  if (!process.env.LICENSE_ADMIN_TOKEN || token !== process.env.LICENSE_ADMIN_TOKEN) {
    return res.status(401).json({ success: false, message: 'Unauthorized license admin' });
  }
  next();
};
