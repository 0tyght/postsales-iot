# Post-Sales IoT Support

ระบบจัดการงานดูแลหลังการขายอุปกรณ์ IoT ประกอบด้วยเว็บแอดมิน เว็บช่าง API กลาง และฐานข้อมูล MariaDB/MySQL

## โครงสร้าง

- `apps/admin-web` — React + Vite สำหรับผู้ดูแลระบบ
- `apps/technician-web` — React + Vite สำหรับช่าง (อยู่ระหว่างพัฒนา)
- `server` — Express REST API
- `database` — SQL สำหรับสร้างฐานข้อมูล ตาราง และข้อมูลทดสอบ

## เตรียมฐานข้อมูล

เปิด MySQL จาก XAMPP แล้ว import ตามลำดับผ่าน phpMyAdmin:

1. `database/create_database.sql`
2. `database/create_tables.sql`
3. `database/seed_data.sql` (ใช้เมื่อต้องการข้อมูลทดสอบใหม่เท่านั้น)
4. `database/demo_data.sql` (ข้อมูลตัวอย่างหลายรายการสำหรับทดสอบหน้าจอ รันซ้ำได้โดยไม่สร้างข้อมูลซ้ำ)

ฐานข้อมูลเดิมที่สร้างไว้แล้ว ให้นำเข้า `database/migrations/002_job_evidence.sql` เพิ่มหนึ่งครั้ง เพื่อรองรับรูปหลักฐานหลายรูปต่อหนึ่งงาน

ข้อมูลทดสอบจาก seed: `admin / admin123` และ `technician01 / tech123`

## รัน API

ตั้งค่า `server/.env` ให้ตรงกับ MySQL ในเครื่อง แล้วรัน:

```powershell
cd C:\xampp\htdocs\postsales-iot\server
npm.cmd install
npm.cmd run dev
```

API: `http://localhost:5000/api`
Health check: `http://localhost:5000/api/health`

## เชื่อมต่อ LINE Messaging API

เพิ่มค่าจาก LINE Developers Console ใน `server/.env`:

```env
LINE_CHANNEL_SECRET=...
LINE_CHANNEL_ACCESS_TOKEN=...
```

ตั้ง Webhook URL เป็น URL สาธารณะที่ชี้มายัง `https://your-domain/api/line/webhook` (LINE ไม่สามารถเรียก `localhost` โดยตรง) แล้วเปิดใช้งาน webhook จากหน้าแอดมินสามารถตรวจสถานะและส่งข้อความทดสอบได้

เมื่อลูกค้าเพิ่มเพื่อน บอตจะแจ้ง LINE User ID ให้นำไปบันทึกในข้อมูลลูกค้า จากนั้นลูกค้าพิมพ์ `แจ้งปัญหา อาการที่พบ` หรือ `สถานะ` ได้ หากมีหลายจุดติดตั้ง บอตจะส่งรหัสให้เลือกในรูปแบบ `#รหัสไซต์ อาการที่พบ`

## รันเว็บแอดมิน

```powershell
cd C:\xampp\htdocs\postsales-iot\apps\admin-web
npm.cmd install
npm.cmd run dev
```

เว็บแอดมิน: `http://localhost:5173`

## รันแอปช่าง

```powershell
cd C:\xampp\htdocs\postsales-iot\apps\technician-web
npm.cmd install
npm.cmd run dev -- --port 5174
```

แอปช่าง: `http://localhost:5174` รูปหลักฐานในเครื่องพัฒนาจะอยู่ใต้ `server/uploads/jobs` โดยฐานข้อมูลเก็บเฉพาะ metadata และเส้นทางไฟล์ เพื่อให้ย้ายไป Object Storage ภายหลังได้

### ทดสอบแอปช่างผ่านอินเทอร์เน็ตชั่วคราว

หลังเปิด API และเว็บช่างแล้ว รัน:

```powershell
.\.tools\cloudflared.exe tunnel --url http://127.0.0.1:5174
```

นำ URL `https://...trycloudflare.com` ไปเปิดบนโทรศัพท์ หรือกรอกในช่อง Server URL ของ APK ตัว URL จะเปลี่ยนเมื่อเริ่ม tunnel ใหม่

Android project อยู่ใน `apps/technician-web/android` และ GitHub Actions `Build Technician APK` จะสร้างไฟล์ `app-debug.apk` เป็น artifact สำหรับทดสอบ

ฐานข้อมูลในเครื่องปัจจุบันใช้บัญชีทดสอบ `admin / 123456`

## ตรวจคุณภาพ

```powershell
cd C:\xampp\htdocs\postsales-iot\apps\admin-web
npm.cmd run lint
npm.cmd run build
```
