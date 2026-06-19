module.exports = (err, req, res, next) => {
  console.error(err);
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'ข้อมูลซ้ำกับรายการที่มีอยู่' });
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ success: false, message: 'ไม่สามารถลบข้อมูลที่ยังถูกใช้งานอยู่' });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'เกิดข้อผิดพลาดภายในระบบ',
  });
};
