# Post-Sales IoT Local Server Edition

เอกสารนี้คือแผนทำระบบให้ขายเป็นโปรแกรมติดตั้งในเครื่องลูกค้า โดยเครื่องลูกค้าจะกลายเป็นเซิร์ฟเวอร์จริง และใช้งานออนไลน์ผ่านโดเมนของลูกค้าเอง

## แนวคิดหลัก

ลูกค้าติดตั้งระบบลงคอม Windows เครื่องหนึ่ง เครื่องนั้นจะรัน API, Database, Web/PWA, Upload storage, Backup และ Cloudflare Tunnel เพื่อให้ทีมช่างใช้งานจากนอกสถานที่ได้

โดเมนหลักควรเป็นโดเมนของลูกค้า เช่น

```text
service.customercompany.com
```

เหตุผลที่ต้องใช้โดเมนลูกค้าเอง:

- ระบบต้องออนไลน์เพื่อให้ช่างใช้นอกสถานที่
- LINE OA webhook ต้องเป็น HTTPS public URL
- ลูกค้าดูเป็นเจ้าของระบบเอง
- รองรับการขายแบบติดตั้งในองค์กรได้จริง
- ไม่ผูกกับลิงก์ชั่วคราวแบบ trycloudflare/ngrok

## โครงสร้างระบบปลายทาง

```text
Customer Windows Server / PC
├─ Post-Sales IoT API Server
├─ Post-Sales IoT Web/PWA
├─ MariaDB / MySQL
├─ Upload Storage
├─ Backup Scheduler
├─ Cloudflare Tunnel
├─ Windows Service
└─ License Agent
       ↓
Our License Server
```

## Setup Wizard ที่ต้องมี

1. ตั้งค่าบริษัท
   - ชื่อบริษัท
   - เบอร์ติดต่อ
   - โลโก้
   - timezone

2. ตั้งค่า admin แรก
   - username
   - password
   - ชื่อผู้ดูแล

3. ตั้งค่า database
   - ใช้ database ที่ติดมากับ installer
   - หรือเชื่อม MySQL/MariaDB ที่ลูกค้ามีอยู่

4. ตั้งค่าโดเมนลูกค้า
   - โดเมน เช่น `service.customer.com`
   - ตรวจ DNS
   - ตั้ง Cloudflare Tunnel
   - สร้าง webhook URL อัตโนมัติ

5. ตั้งค่า LINE OA ลูกค้า
   - Channel Secret
   - Channel Access Token
   - Basic ID
   - Webhook URL

6. ตั้งค่า LINE ทีมช่าง
   - Channel Access Token หรือ group target id
   - ทดสอบส่งแจ้งเตือนเคสใหม่

7. ตั้งค่า License
   - License Key
   - Plan
   - วันหมดอายุ
   - จำนวนผู้ใช้/ช่าง/ลูกค้า/พื้นที่เก็บรูป

8. ตั้งค่า Backup
   - เวลา backup อัตโนมัติ
   - ตำแหน่ง backup
   - จำนวนวันที่เก็บย้อนหลัง

## License Model

ระบบในเครื่องลูกค้าจะเช็ก license กับ server กลางของเราเป็นระยะ

สถานะที่ต้องรองรับ:

- `active` ใช้งานได้
- `expiring` ใกล้หมดอายุ
- `expired` หมดอายุ
- `suspended` ระงับ
- `offline_grace` ไม่สามารถติดต่อ server license ได้ แต่ยังอยู่ในระยะผ่อนผัน

นโยบายแนะนำ:

- เช็ก license วันละครั้ง
- ถ้า offline ให้ grace period 7-14 วัน
- ถ้าหมดอายุ ให้ดูข้อมูลเก่าได้ แต่สร้างงานใหม่ไม่ได้
- ต่ออายุแล้วกลับมาใช้งานได้ทันที

## Domain / Tunnel Model

ใช้ Cloudflare Tunnel เป็นค่าเริ่มต้นสำหรับ production local server

รูปแบบ:

```text
service.customer.com
  ↓ CNAME / Cloudflare DNS
Cloudflare Tunnel
  ↓
http://127.0.0.1:5000
```

LINE webhook:

```text
https://service.customer.com/linebot/webhook.php
```

## สิ่งที่เพิ่มในระบบแล้ว

- API สถานะระบบ: `GET /api/system/status`
- API ดู settings: `GET /api/system/settings`
- API บันทึก settings: `PUT /api/system/settings`
- ตาราง `system_settings`
- migration: `database/migrations/013_local_server_commercial_edition.sql`
- config deployment กลาง: `server/src/config/deployment.js`

## งานถัดไป

1. ทำหน้า Admin > ตั้งค่าระบบ
   - แสดงโดเมน
   - แสดง LINE webhook
   - แสดงสถานะ database / LINE / license
   - ปุ่มทดสอบ LINE

2. ทำ License Server ฝั่งเรา
   - สร้าง license
   - ต่ออายุ
   - ระงับ
   - จำกัดแพ็กเกจ
   - สถานะเริ่มทำแล้วใน `license-server/`

3. ทำ Windows Service
   - API server auto start
   - Cloudflare Tunnel auto start
   - Backup scheduler

4. ทำ Installer
   - ติดตั้ง Node runtime
   - ติดตั้ง MariaDB หรือใช้ที่มีอยู่
   - import database
   - build web
   - สร้าง service

5. ทำ Updater
   - backup ก่อน update
   - migrate database
   - rollback ได้ถ้า update fail

6. ทำ Backup/Restore UI
   - backup database
   - backup uploads
   - restore จาก zip

## คำแนะนำการขาย

แพ็กเกจนี้ควรขายเป็น

- ค่า setup แรกเข้า
- ค่า license รายเดือน/รายปี
- ค่า support / update
- ค่า setup domain + LINE OA ถ้าลูกค้าให้เราจัดการ
