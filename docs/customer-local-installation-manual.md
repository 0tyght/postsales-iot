# คู่มือการติดตั้งและดูแลระบบ Post-Sales IoT Local Server Edition

เอกสารฉบับนี้ใช้สำหรับติดตั้งระบบ Post-Sales IoT รุ่นขายให้ลูกค้านำไปรันบนเครื่อง Windows ของลูกค้าเอง โดยเครื่องนั้นจะทำหน้าที่เป็น Server กลางขององค์กรลูกค้า รองรับการใช้งานผ่านเว็บ/PWA, ทีมช่างนอกสถานที่, LINE OA, การเก็บรูปหลักฐาน, การสำรองข้อมูล และการควบคุม License รายเดือนหรือรายปีจากฝั่งผู้ขายระบบ

## 1. ภาพรวมระบบ

Post-Sales IoT Local Server Edition คือระบบดูแลหลังการขายสำหรับธุรกิจที่มีงานติดตั้งอุปกรณ์ งานซ่อม งานบริการตามรอบ และต้องการรวมข้อมูลลูกค้า จุดติดตั้ง อุปกรณ์จริง งานช่าง รูปหลักฐาน และการสื่อสารผ่าน LINE OA ไว้ในระบบเดียว

รูปแบบการติดตั้งรุ่นนี้คือ ลูกค้าติดตั้งระบบลงในคอมพิวเตอร์หรือเครื่อง Server ภายในองค์กรของลูกค้าเอง แต่ระบบยังออนไลน์ผ่านโดเมนของลูกค้า เพื่อให้ช่างภาคสนามใช้งานจากภายนอกสถานที่ได้ และให้ LINE OA ส่ง Webhook เข้าระบบได้อย่างถูกต้อง

โครงสร้างหลัก:

```text
ผู้ใช้งาน / PWA / LINE OA
        |
        | HTTPS ผ่านโดเมนลูกค้า
        v
Cloudflare Tunnel / Public Domain
        |
        v
Post-Sales IoT API Server บนเครื่องลูกค้า
        |
        +-- Web/PWA
        +-- MySQL / MariaDB
        +-- Upload Storage
        +-- Backup Folder
        +-- License Check ไปยัง License Server ของผู้ขาย
```

## 2. บทบาทผู้ใช้งาน

ระบบแบ่งผู้ใช้งานหลักเป็น 4 กลุ่ม

1. ผู้ขายระบบ
   - สร้างตัวติดตั้งให้ลูกค้า
   - ออก License รายเดือนหรือรายปี
   - ให้คำแนะนำการตั้งค่าโดเมน, LINE OA และ Cloudflare Tunnel
   - ดูแลการอัปเดตเวอร์ชันและ Support

2. ผู้ดูแลระบบของลูกค้า
   - เข้าหน้าแอดมิน
   - จัดการผู้ใช้ ลูกค้า จุดติดตั้ง อุปกรณ์ งานบริการ และข้อความ LINE
   - ตรวจสอบสถานะ Server, License, Webhook และ Backup

3. ช่าง
   - รับงาน
   - สร้างงานติดตั้งจากหน้างาน
   - เพิ่มลูกค้า จุดติดตั้ง อุปกรณ์ และโมเดลอุปกรณ์
   - บันทึกรูปหลักฐานและปิดงาน

4. ลูกค้า
   - เพิ่มเพื่อน LINE OA
   - ส่งรหัสผูกบัญชี เช่น TYTC0005
   - แจ้งปัญหาและรับข้อความบริการผ่าน LINE

## 3. สิ่งที่ต้องเตรียมก่อนติดตั้ง

### 3.1 เครื่องสำหรับติดตั้ง

แนะนำขั้นต่ำ:

| รายการ | ขั้นต่ำ | แนะนำ |
|---|---:|---:|
| ระบบปฏิบัติการ | Windows 10 / Windows 11 | Windows 11 Pro หรือ Windows Server |
| CPU | 2 Core | 4 Core ขึ้นไป |
| RAM | 4 GB | 8 GB ขึ้นไป |
| Storage | 50 GB | 100 GB ขึ้นไป หรือมากกว่าตามจำนวนรูป |
| Internet | ต้องออนไลน์ | ควรเป็นเน็ตที่เสถียร |

หมายเหตุ: ถ้าลูกค้ามีการแนบรูปจำนวนมาก ควรวางแผนพื้นที่เก็บรูปและพื้นที่ Backup เพิ่มตั้งแต่แรก

### 3.2 โปรแกรมที่ต้องมีในเครื่องลูกค้า

1. Node.js LTS
2. MySQL หรือ MariaDB
3. Cloudflared สำหรับ Cloudflare Tunnel
4. NSSM สำหรับติดตั้ง Windows Service
5. Browser เช่น Chrome หรือ Edge

ในช่วงทดสอบ สามารถรันแบบ Manual ก่อนได้ ถ้ายังไม่ได้ติดตั้ง Cloudflared หรือ NSSM

### 3.3 ข้อมูลที่ต้องขอจากลูกค้า

| ข้อมูล | ใช้ทำอะไร |
|---|---|
| ชื่อบริษัท | แสดงในระบบและใช้ใน License |
| เบอร์ติดต่อหลัก | ใช้ในข้อความ LINE และข้อมูล Support |
| โดเมนหรือ Subdomain | ใช้เปิดระบบออนไลน์ เช่น service.customer.com |
| สิทธิ์ DNS หรือ Cloudflare Account | ใช้ชี้โดเมนเข้าระบบ |
| LINE OA Channel Secret | ใช้ตรวจสอบ Webhook |
| LINE OA Channel Access Token | ใช้ส่งข้อความหาลูกค้า |
| LINE Basic ID | ใช้ทำ QR เพิ่มเพื่อน |
| รายชื่อผู้ดูแลระบบคนแรก | ใช้สร้างบัญชี admin |
| License Key | ใช้เปิดสิทธิ์การใช้งาน |

## 4. รูปแบบโดเมนที่รองรับ

### 4.1 ใช้โดเมนลูกค้าเอง

เหมาะสำหรับการใช้งานจริงที่สุด เช่น:

```text
https://service.customercompany.com
```

ข้อดี:

- ชื่อเว็บดูเป็นของลูกค้าเอง
- ใช้กับ LINE OA Webhook ได้จริง
- ช่างใช้งานจากนอกสถานที่ได้
- ไม่ต้องเปลี่ยนลิงก์บ่อย
- เหมาะกับการขายเป็นระบบจริง

### 4.2 ใช้โดเมนชั่วคราว

เหมาะสำหรับ Demo หรือทดสอบ เช่น:

```text
https://xxxx.trycloudflare.com
```

ข้อจำกัด:

- ลิงก์อาจเปลี่ยนเมื่อรันใหม่
- ไม่เหมาะกับการใช้งานระยะยาว
- LINE Webhook ต้องแก้ทุกครั้งที่ลิงก์เปลี่ยน

สำหรับลูกค้าที่ใช้งานจริง แนะนำให้ใช้โดเมนลูกค้าเองเท่านั้น

## 5. ไฟล์ที่เกี่ยวข้อง

| ไฟล์ / โฟลเดอร์ | หน้าที่ |
|---|---|
| `release/PostSales-IoT-Setup.exe` | ตัวติดตั้ง Windows สำหรับส่งให้ลูกค้า |
| `release/customer-local` | ชุดไฟล์ระบบสำหรับลูกค้า |
| `installer/config.example.json` | ตัวอย่างไฟล์ตั้งค่าก่อนติดตั้ง |
| `installer/scripts/install-local-server.ps1` | สคริปต์ติดตั้งหลัก |
| `installer/scripts/start-postsales-server.ps1` | สคริปต์รัน Server แบบ Manual |
| `installer/scripts/install-cloudflare-tunnel.ps1` | สคริปต์ติดตั้ง Cloudflare Tunnel |
| `installer/scripts/install-windows-service.ps1` | สคริปต์ติดตั้ง Windows Service |
| `installer/scripts/backup.ps1` | สคริปต์สำรองข้อมูล |
| `installer/scripts/restore.ps1` | สคริปต์กู้คืนข้อมูล |
| `editions/customer-local/server.env.template` | Template สำหรับสร้าง `.env` ของลูกค้า |
| `license-server` | ระบบกลางของผู้ขายสำหรับจัดการ License |

## 6. ขั้นตอนการเตรียมแพ็กก่อนส่งลูกค้า

ให้ผู้ขายระบบรันคำสั่งจากโฟลเดอร์โปรเจกต์:

```powershell
cd C:\xampp\htdocs\postsales-iot
npm.cmd run build
powershell -ExecutionPolicy Bypass -File .\installer\scripts\package-customer-edition.ps1
powershell -ExecutionPolicy Bypass -File .\installer\scripts\build-windows-installer.ps1
```

ผลลัพธ์ที่ต้องได้:

```text
release\PostSales-IoT-Setup.exe
release\customer-local
```

ก่อนส่งลูกค้า ให้ตรวจสอบว่าไม่มีไฟล์ลับติดไปด้วย:

```powershell
Test-Path .\release\customer-local\server\.env
```

ค่าที่ถูกต้องควรเป็น:

```text
False
```

## 7. การสร้าง License ให้ลูกค้า

License ถูกสร้างจาก License Server ของผู้ขายระบบ

### 7.1 เปิด License Server

```powershell
cd C:\xampp\htdocs\postsales-iot\license-server
npm.cmd install
npm.cmd run dev
```

เปิดหน้า Super Admin:

```text
http://localhost:5100/admin
```

จากนั้นใส่ `LICENSE_ADMIN_TOKEN` ตามที่ตั้งไว้ใน `.env`

### 7.2 ข้อมูล License ที่ต้องกำหนด

| รายการ | คำอธิบาย |
|---|---|
| Company Name | ชื่อบริษัทลูกค้า |
| Contact Name | ผู้ประสานงาน |
| Contact Phone | เบอร์ติดต่อ |
| Domain Name | โดเมนที่ลูกค้าใช้ |
| Plan Code | แพ็กเกจ เช่น local-business |
| Billing Cycle | monthly หรือ yearly |
| Starts At | วันที่เริ่มใช้งาน |
| Expires At | วันหมดอายุ |
| Max Users | จำนวนผู้ใช้สูงสุด |
| Max Technicians | จำนวนช่างสูงสุด |
| Max Customers | จำนวนลูกค้าสูงสุด |
| Max Storage GB | พื้นที่เก็บรูปสูงสุด |

### 7.3 พฤติกรรมเมื่อ License หมดอายุ

ระบบลูกค้ายังควรเปิดดูข้อมูลเดิมได้ แต่ไม่ควรสร้างหรือแก้ไขข้อมูลใหม่ จนกว่าจะต่ออายุ License

สถานะที่รองรับ:

- `active` ใช้งานได้ปกติ
- `trial` อยู่ในช่วงทดลอง
- `offline_grace` ติดต่อ License Server ไม่ได้ชั่วคราว แต่ยังอยู่ในช่วงผ่อนผัน
- `expired` หมดอายุ
- `suspended` ถูกระงับ
- `cancelled` ยกเลิกแล้ว

## 8. การติดตั้งบนเครื่องลูกค้า

### 8.1 ติดตั้งผ่านไฟล์ Setup

ให้ลูกค้าเปิดไฟล์:

```text
PostSales-IoT-Setup.exe
```

แนะนำให้คลิกขวาแล้วเลือก Run as administrator

ตำแหน่งติดตั้งเริ่มต้น:

```text
C:\PostSalesIoT
```

หลังติดตั้ง ระบบจะมีไฟล์และสคริปต์อยู่ใน:

```text
C:\PostSalesIoT
```

### 8.2 ตั้งค่า config

คัดลอกไฟล์ตัวอย่าง:

```powershell
copy C:\PostSalesIoT\installer\config.example.json C:\PostSalesIoT\installer\config.json
notepad C:\PostSalesIoT\installer\config.json
```

ตัวอย่างค่าที่ต้องแก้:

```json
{
  "company": {
    "name": "Customer Company",
    "supportPhone": "02-000-0000"
  },
  "domain": {
    "publicUrl": "https://service.customercompany.com"
  },
  "license": {
    "licenseKey": "TYT-PSIOT-XXXX-XXXX-XXXX-XXXX",
    "licenseServerUrl": "https://license.yourcompany.com"
  }
}
```

### 8.3 ติดตั้งระบบด้วยสคริปต์

```powershell
cd C:\PostSalesIoT
.\installer\install-customer-local.bat
```

ถ้ายังไม่ต้องการติดตั้ง Windows Service ให้ใช้:

```powershell
.\installer\install-customer-local-no-service.bat
```

### 8.4 รัน Server แบบ Manual

```powershell
powershell -ExecutionPolicy Bypass -File C:\PostSalesIoT\installer\scripts\start-postsales-server.ps1 -InstallDir C:\PostSalesIoT
```

เมื่อ Server ทำงาน ควรเห็น URL ประมาณนี้:

```text
Portal: https://service.customercompany.com
API:    https://service.customercompany.com/api
LINE:   https://service.customercompany.com/linebot/webhook.php
```

## 9. การตั้งค่า Cloudflare Tunnel

Cloudflare Tunnel ทำให้เครื่องลูกค้าเปิดให้ใช้งานจากภายนอกได้โดยไม่ต้อง Forward Port Router

### 9.1 สิ่งที่ต้องมี

1. Cloudflare Account
2. โดเมนของลูกค้าอยู่บน Cloudflare หรือสามารถตั้ง DNS ไป Cloudflare ได้
3. `cloudflared.exe`
4. สิทธิ์ผู้ดูแลเครื่อง

### 9.2 แนวทางตั้งค่า

โดเมน:

```text
service.customercompany.com
```

ชี้เข้ามาที่:

```text
http://127.0.0.1:5000
```

Webhook LINE:

```text
https://service.customercompany.com/linebot/webhook.php
```

### 9.3 ติดตั้ง Tunnel ด้วยสคริปต์

```powershell
powershell -ExecutionPolicy Bypass -File C:\PostSalesIoT\installer\scripts\install-cloudflare-tunnel.ps1 -ConfigPath C:\PostSalesIoT\installer\config.json -CloudflaredPath C:\PostSalesIoT\installer\tools\cloudflared.exe
```

ถ้า Tunnel ใช้งานไม่ได้ ให้ตรวจสอบ:

- โดเมนชี้ถูกหรือไม่
- Cloudflare login แล้วหรือยัง
- Tunnel route ไป port 5000 หรือไม่
- Firewall บล็อกโปรแกรมหรือไม่
- Server ภายในรันอยู่หรือไม่

## 10. การตั้งค่า LINE OA

### 10.1 ค่าที่ต้องใช้

| ค่า | ใช้ทำอะไร |
|---|---|
| Channel Secret | ตรวจสอบ signature ของ LINE Webhook |
| Channel Access Token | ส่งข้อความหาลูกค้า |
| Basic ID | ใช้ทำ QR เพิ่มเพื่อน |
| Webhook URL | จุดรับข้อความจาก LINE |

Webhook URL ต้องเป็น:

```text
https://service.customercompany.com/linebot/webhook.php
```

### 10.2 ขั้นตอนใน LINE Developers

1. เปิด LINE Developers Console
2. เลือก Provider และ Channel ของ LINE OA
3. ไปที่ Messaging API
4. ใส่ Webhook URL
5. เปิด Use webhook
6. ปิด Auto-reply ที่ชนกับระบบ หากต้องการให้ระบบตอบเอง
7. ทดสอบ Verify Webhook

### 10.3 การผูกบัญชีลูกค้า

เมื่อลูกค้าเพิ่มเพื่อน LINE OA แล้ว ให้ส่งรหัสผูกบัญชี เช่น:

```text
TYTC0005
```

ระบบจะนำ LINE User ID ไปผูกกับลูกค้าในฐานข้อมูล เพื่อให้ส่งข้อความได้ถูกคน

### 10.4 ข้อความอัตโนมัติ

ข้อความ LINE ควรแก้ผ่านหน้า Admin ไม่ควรแก้ในโค้ดโดยตรง โดยข้อความที่ควรมี ได้แก่:

- ข้อความต้อนรับเมื่อเพิ่มเพื่อน
- ข้อความผูก LINE สำเร็จ
- ข้อความไม่พบรหัสผูกบัญชี
- ข้อความถามอาการตามรอบ Service
- ข้อความขอบคุณเมื่อลูกค้าแจ้งว่าไม่มีปัญหา
- ข้อความแจ้งช่องทางติดต่อเมื่อมีปัญหา
- ข้อความแจ้งสถานะเคส
- ข้อความแจ้งทีมช่างเมื่อมีเคสใหม่

## 11. การตั้งค่าทีมช่างผ่าน LINE

ระบบสามารถเชื่อม LINE OA หรือ LINE กลุ่มสำหรับทีมช่าง เพื่อแจ้งเตือนเมื่อมีเคสใหม่เข้ามา

ข้อมูลที่ต้องใช้:

- Team Channel Access Token หรือ Channel สำหรับทีมช่าง
- Team Target ID หรือ Group ID
- รูปแบบข้อความแจ้งเตือน

ตัวอย่างข้อความแจ้งเตือนทีมช่าง:

```text
มีเคสปัญหาใหม่
ลูกค้า: บริษัทตัวอย่าง
จุดติดตั้ง: อาคาร A
อุปกรณ์: IoT Gateway
อาการ: อินเทอร์เน็ตหลุดบ่อย
กรุณาเข้าระบบเพื่อรับงาน
```

## 12. การตรวจสอบหลังติดตั้ง

หลังติดตั้งเสร็จ ให้ตรวจสอบตามลำดับนี้

### 12.1 ตรวจหน้าเว็บ

เปิด:

```text
https://service.customercompany.com
```

ควรเห็นหน้า Login ของ Post-Sales IoT

### 12.2 ตรวจ API

เปิด:

```text
https://service.customercompany.com/api/health
```

ควรได้ผลลัพธ์ว่า Server ทำงานอยู่

### 12.3 ตรวจ License

เข้า Admin > ตั้งค่าระบบ แล้วตรวจว่า License เป็น `active` หรือ `trial`

### 12.4 ตรวจ LINE

1. เพิ่มเพื่อน LINE OA
2. ส่งรหัสผูกบัญชี
3. ระบบต้องตอบกลับ
4. Admin ต้องเห็น LINE User ID ผูกกับลูกค้าคนนั้น

### 12.5 ตรวจ Upload รูป

ให้ช่างลองเปิดงานและแนบรูปอย่างน้อย 1 รูป จากนั้นตรวจว่า:

- รูปเปิดดูได้จากหน้า Admin
- ไฟล์อยู่ในโฟลเดอร์ Upload ของเครื่อง Server
- รูปไม่ถูกส่งขึ้น Git

## 13. การใช้งานหลังติดตั้ง

### 13.1 แอดมิน

แอดมินควรเริ่มจาก:

1. สร้างผู้ใช้และบัญชีช่าง
2. ตรวจค่า LINE OA
3. ตรวจค่า License
4. เพิ่มลูกค้าหรือให้ช่างเพิ่มจากหน้างาน
5. ตรวจงานติดตั้ง งานซ่อม และสถานะงานทั้งหมด

### 13.2 ช่าง

ช่างใช้งานผ่าน PWA บนโทรศัพท์ได้ โดยเปิด URL แล้วเพิ่มลงหน้าหลัก

งานหลักของช่าง:

- รับเคส
- สร้างงานติดตั้งใหม่จากข้อมูลจริงหน้างาน
- เพิ่มลูกค้าใหม่
- เพิ่มจุดติดตั้งใหม่
- เพิ่มโมเดลอุปกรณ์
- เพิ่มอุปกรณ์จริง
- แนบรูปหลักฐาน
- ปิดงาน

### 13.3 ลูกค้า

ลูกค้าใช้งานผ่าน LINE OA:

- เพิ่มเพื่อน
- ส่งรหัสผูกบัญชี
- แจ้งปัญหา
- ตอบข้อความถามรอบ Service
- รับสถานะงาน

## 14. Backup และ Restore

### 14.1 Backup

รัน:

```powershell
powershell -ExecutionPolicy Bypass -File C:\PostSalesIoT\installer\scripts\backup.ps1 -ConfigPath C:\PostSalesIoT\installer\config.json
```

ข้อมูลที่ควรสำรอง:

- Database
- Upload images
- `.env`
- `config.json`

ควรตั้ง Backup อย่างน้อยวันละครั้ง และเก็บย้อนหลังตามความเหมาะสม เช่น 7 วัน, 30 วัน หรือ 90 วัน

### 14.2 Restore

รัน:

```powershell
powershell -ExecutionPolicy Bypass -File C:\PostSalesIoT\installer\scripts\restore.ps1 -ConfigPath C:\PostSalesIoT\installer\config.json
```

ก่อน Restore ควร:

1. หยุด Server
2. สำรองข้อมูลชุดปัจจุบันอีกครั้ง
3. Restore Database
4. Restore Upload images
5. เปิด Server
6. ตรวจ Login, รูป และงานล่าสุด

## 15. การอัปเดตระบบ

แนวทางอัปเดตที่ปลอดภัย:

1. แจ้งลูกค้าล่วงหน้า
2. Backup ก่อนอัปเดต
3. หยุด Windows Service
4. คัดลอกไฟล์ระบบรุ่นใหม่
5. รัน database migrations
6. รัน `npm install --omit=dev` ถ้ามี dependency ใหม่
7. เปิด Service
8. ตรวจระบบหลังอัปเดต

ห้ามอัปเดตทับโดยไม่ Backup โดยเฉพาะระบบที่มีรูปและงานจริงแล้ว

## 16. ความปลอดภัย

ข้อควรทำ:

- เปลี่ยนรหัส admin หลังติดตั้งทันที
- ใช้รหัสผ่านที่เดายาก
- อย่าส่ง `.env` ผ่านช่องทางสาธารณะ
- จำกัดสิทธิ์เข้าเครื่อง Server
- ใช้ HTTPS เท่านั้น
- สำรองข้อมูลสม่ำเสมอ
- เก็บ License Admin Token เป็นความลับ
- ไม่ Commit token, password, Channel Access Token หรือไฟล์ `.env` ขึ้น Git

## 17. Troubleshooting

### 17.1 เข้าเว็บไม่ได้

ตรวจสอบ:

1. Server รันอยู่หรือไม่
2. Port 5000 ถูกใช้หรือไม่
3. Cloudflare Tunnel online หรือไม่
4. โดเมนชี้ถูกหรือไม่
5. Firewall บล็อกหรือไม่

### 17.2 Login แล้วขึ้นเชื่อมต่อ Server ไม่ได้

ตรวจสอบ:

- `runtime-config.json` ชี้ API ถูกหรือไม่
- API `/api/health` เปิดได้หรือไม่
- Tunnel ส่งไป port 5000 หรือไม่
- Server `.env` ตั้ง `PUBLIC_APP_URL` ถูกหรือไม่

### 17.3 LINE ไม่ตอบ

ตรวจสอบ:

- Webhook URL ถูกหรือไม่
- Use webhook เปิดอยู่หรือไม่
- Channel Secret ถูกหรือไม่
- Channel Access Token ถูกหรือหมดอายุหรือไม่
- Server เข้าถึงจากอินเทอร์เน็ตได้หรือไม่

### 17.4 รูปไม่ขึ้น

ตรวจสอบ:

- Upload folder มีไฟล์จริงหรือไม่
- API static file path ถูกหรือไม่
- สิทธิ์อ่านไฟล์ของ Windows ถูกหรือไม่
- URL รูปใช้ public domain หรือ localhost ผิดเครื่องหรือไม่

### 17.5 License ใช้งานไม่ได้

ตรวจสอบ:

- License Key ถูกหรือไม่
- License Server online หรือไม่
- วันหมดอายุถูกหรือไม่
- Domain ใน License ตรงกับโดเมนลูกค้าหรือไม่
- เครื่องลูกค้าออกอินเทอร์เน็ตไปหา License Server ได้หรือไม่

### 17.6 MySQL เปิดไม่ได้

ตรวจสอบ:

- Port 3306 ถูกใช้โดยโปรแกรมอื่นหรือไม่
- XAMPP หรือ MySQL Service ชนกันหรือไม่
- Database crash จากการปิดเครื่องผิดวิธีหรือไม่
- มีพื้นที่ Disk เหลือหรือไม่

## 18. Checklist ส่งมอบลูกค้า

ก่อนส่งมอบงาน ให้ตรวจทุกข้อ:

- [ ] เปิดเว็บผ่านโดเมนลูกค้าได้
- [ ] Login admin ได้
- [ ] สร้างช่างได้
- [ ] สร้างลูกค้าได้
- [ ] สร้างจุดติดตั้งได้
- [ ] เพิ่มโมเดลอุปกรณ์ได้
- [ ] เพิ่มอุปกรณ์จริงได้
- [ ] สร้างงานติดตั้งได้
- [ ] ช่างรับงานได้
- [ ] แนบรูปได้
- [ ] Admin เปิดดูรูปได้
- [ ] LINE OA เพิ่มเพื่อนได้
- [ ] ผูก LINE ด้วยรหัส TYTC ได้
- [ ] ลูกค้าแจ้งปัญหาผ่าน LINE ได้
- [ ] ทีมช่างได้รับแจ้งเตือนเคสใหม่
- [ ] License เป็น active หรือ trial
- [ ] Backup สำเร็จ
- [ ] Restore ทดสอบในเครื่องสำรองแล้วอย่างน้อย 1 ครั้ง
- [ ] ลูกค้าได้รับ URL, username, password เริ่มต้น และคู่มือใช้งาน

## 19. Appendix: ตัวอย่าง config.json

```json
{
  "company": {
    "name": "Customer Company",
    "supportPhone": "02-000-0000"
  },
  "admin": {
    "username": "admin",
    "password": "change-this-password",
    "fullName": "ผู้ดูแลระบบ",
    "phone": "0800000000"
  },
  "domain": {
    "mode": "customer_domain",
    "publicUrl": "https://service.customercompany.com",
    "cloudflareTunnelName": "postsales-iot-customer"
  },
  "server": {
    "port": 5000,
    "installDir": "C:\\PostSalesIoT",
    "uploadDir": "C:\\PostSalesIoT\\uploads",
    "backupDir": "C:\\PostSalesIoT\\backups",
    "jwtSecret": "",
    "nodeExe": "node",
    "npmCmd": "npm.cmd",
    "mysqlExe": "mysql.exe"
  },
  "database": {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "",
    "name": "postsales_iot"
  },
  "line": {
    "customerChannelSecret": "",
    "customerChannelAccessToken": "",
    "customerBasicId": "",
    "teamChannelAccessToken": "",
    "teamTargetId": ""
  },
  "license": {
    "licenseKey": "",
    "licenseServerUrl": "https://license.yourcompany.com",
    "plan": "local-business",
    "expiresAt": ""
  }
}
```

## 20. Appendix: คำสั่งที่ใช้บ่อย

Build installer:

```powershell
powershell -ExecutionPolicy Bypass -File .\installer\scripts\build-windows-installer.ps1
```

Start customer server:

```powershell
powershell -ExecutionPolicy Bypass -File C:\PostSalesIoT\installer\scripts\start-postsales-server.ps1 -InstallDir C:\PostSalesIoT
```

Backup:

```powershell
powershell -ExecutionPolicy Bypass -File C:\PostSalesIoT\installer\scripts\backup.ps1 -ConfigPath C:\PostSalesIoT\installer\config.json
```

Open License Server:

```powershell
cd C:\xampp\htdocs\postsales-iot\license-server
npm.cmd run dev
```

## 21. ข้อแนะนำในการขายและดูแลหลังขาย

แพ็กเกจนี้ควรขายเป็น:

1. ค่า Setup แรกเข้า
2. ค่า License รายเดือนหรือรายปี
3. ค่า Support และ Update
4. ค่า Setup โดเมนและ LINE OA หากลูกค้าให้เราจัดการ

แนวทางดูแลลูกค้าหลังขาย:

- ตรวจ License ทุกเดือน
- ตรวจ Backup อย่างน้อยเดือนละครั้ง
- ตรวจพื้นที่เก็บรูป
- ตรวจ LINE Webhook หลังมีการเปลี่ยนโดเมนหรือ Token
- แจ้งลูกค้าก่อนอัปเดตระบบ
- เก็บบันทึกเวอร์ชันที่ติดตั้งให้ลูกค้าแต่ละราย

## 22. สรุป

รุ่น Local Server Edition ทำให้ลูกค้าสามารถมีระบบ Post-Sales IoT เป็นของตัวเอง รันบนเครื่องของตัวเอง ใช้โดเมนของตัวเอง และยังเชื่อมกับทีมช่างนอกสถานที่กับ LINE OA ได้จริง จุดสำคัญของการติดตั้งคือ ต้องเตรียมโดเมน, Tunnel, LINE OA, License และ Backup ให้ครบตั้งแต่วันแรก เพื่อให้ระบบพร้อมใช้งานแบบ Production ไม่ใช่แค่ Demo
