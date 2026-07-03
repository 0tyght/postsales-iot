# Post-Sales IoT License Server

License Server คือระบบกลางของผู้ขาย ใช้สร้างและควบคุม License สำหรับลูกค้าที่ติดตั้ง `Post-Sales IoT Local Server Edition`

## หน้าที่หลัก

- สร้าง License Key ให้ลูกค้า
- กำหนดแพ็กเกจ รายเดือน/รายปี และวันหมดอายุ
- จำกัดจำนวนผู้ใช้ ช่าง ลูกค้า และพื้นที่เก็บรูป
- ให้ Server ของลูกค้าเช็กสถานะ License
- รองรับสถานะ `active`, `trial`, `offline_grace`, `expired`, `suspended`, `cancelled`

## ติดตั้งฐานข้อมูล

นำเข้าไฟล์:

```text
license-server/database/create_license_database.sql
```

## ตั้งค่า `.env`

คัดลอกจาก `.env.example`

```env
PORT=5100
LICENSE_DB_HOST=127.0.0.1
LICENSE_DB_PORT=3306
LICENSE_DB_USER=root
LICENSE_DB_PASSWORD=
LICENSE_DB_NAME=postsales_license
LICENSE_ADMIN_TOKEN=change_me
LICENSE_SIGNING_SECRET=change_me
```

## รัน

```powershell
cd license-server
npm.cmd install
npm.cmd run dev
```

## หน้า Super Admin

เปิด:

```text
http://localhost:5100/admin
```

ใส่ `LICENSE_ADMIN_TOKEN` เพื่อจัดการ License ผ่านหน้าเว็บ

ทำได้:

- ดูรายการ License
- สร้าง License ใหม่
- คัดลอก License Key
- ต่ออายุ
- ระงับหรือยกเลิก
- แก้แพ็กเกจและ Limit

## API สำคัญ

ตรวจสุขภาพ:

```http
GET /health
```

สร้าง License:

```http
POST /api/licenses
Authorization: Bearer <LICENSE_ADMIN_TOKEN>
Content-Type: application/json
```

Customer Server เช็ก License:

```http
POST /api/licenses/check
Content-Type: application/json
```

ตัวอย่าง:

```json
{
  "license_key": "TYT-PSIOT-XXXX-XXXX-XXXX-XXXX",
  "machine_id": "customer-machine-id",
  "app_version": "0.1.0",
  "public_url": "https://service.customer.com"
}
```

ผลลัพธ์สำคัญ:

- `allowed: true` ใช้งานต่อได้
- `allowed: false` ห้ามสร้างหรือแก้ไขข้อมูลใหม่
- `status` แสดงสถานะ License ปัจจุบัน
