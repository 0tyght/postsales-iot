# Post-Sales IoT Editions

โฟลเดอร์นี้แยกไฟล์สำหรับ “เราใช้เอง” ออกจาก “รุ่นขายให้ลูกค้า”

## internal-dev

ใช้สำหรับเครื่องเรา, demo, test, trycloudflare/ngrok, GitHub Pages และการพัฒนาระบบ

ห้ามนำไฟล์ env จริงของ `internal-dev` ไปให้ลูกค้า

## customer-local

ใช้สำหรับแพ็กโปรแกรมขายจริงให้ลูกค้าเอาไปลงคอมตัวเองเป็นเครื่องเซิร์ฟเวอร์

หลักการของรุ่นนี้:

- ต้องใช้โดเมนลูกค้าเอง เช่น `service.customer.com`
- ต้องออนไลน์ผ่าน Cloudflare Tunnel หรือ tunnel production ที่ตั้งค่าไว้
- LINE OA webhook ต้องใช้ URL ของโดเมนลูกค้า
- ต้องใช้ License Key ของลูกค้ารายนั้น
- ห้ามมี token หรือรหัสลับของเครื่องเรา

## กติกาสำคัญ

1. `server/.env` คือไฟล์ของเครื่องปัจจุบัน ห้าม commit และห้ามเอาไปแพ็กขาย
2. รุ่นขายใช้ template จาก `editions/customer-local/server.env.template`
3. installer จะสร้าง `.env` ใหม่จาก `installer/config.json`
4. ข้อมูลลูกค้าแต่ละรายต้องมี license และ domain ของตัวเอง
