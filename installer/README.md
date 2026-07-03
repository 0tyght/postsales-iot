# Post-Sales IoT Installer

โฟลเดอร์นี้ใช้สำหรับสร้างและติดตั้ง `Post-Sales IoT Local Server Edition` ซึ่งเป็นรุ่นสำหรับส่งให้ลูกค้าติดตั้งบนเครื่อง Windows ของลูกค้าเอง

## เป้าหมาย

- ให้เครื่องลูกค้ากลายเป็น Server กลางของระบบ
- รองรับ Web/PWA, API, Database, Upload, Backup และ LINE OA
- รองรับการใช้งานผ่านโดเมนลูกค้า เช่น `https://service.customer.com`
- รองรับการขายแบบรายเดือน/รายปีผ่าน License Server

## ไฟล์สำคัญ

```text
installer/
├─ config.example.json
├─ install-customer-local.bat
├─ install-customer-local-no-service.bat
├─ scripts/
│  ├─ install-local-server.ps1
│  ├─ install-cloudflare-tunnel.ps1
│  ├─ install-windows-service.ps1
│  ├─ start-postsales-server.ps1
│  ├─ backup.ps1
│  ├─ restore.ps1
│  ├─ render-env.ps1
│  ├─ package-customer-edition.ps1
│  └─ build-windows-installer.ps1
└─ windows/
   └─ PostSalesIoT.iss
```

## สร้างชุดติดตั้งสำหรับลูกค้า

```powershell
cd C:\xampp\htdocs\postsales-iot
npm.cmd run build
powershell -ExecutionPolicy Bypass -File .\installer\scripts\package-customer-edition.ps1
powershell -ExecutionPolicy Bypass -File .\installer\scripts\build-windows-installer.ps1
```

ผลลัพธ์:

```text
release\PostSales-IoT-Setup.exe
release\customer-local
```

## ติดตั้งบนเครื่องลูกค้า

1. เปิด `PostSales-IoT-Setup.exe` แบบ Run as administrator
2. ติดตั้งลง `C:\PostSalesIoT`
3. คัดลอก `config.example.json` เป็น `config.json`
4. แก้ค่าโดเมน, database, LINE OA และ License
5. รัน `install-customer-local.bat`

ถ้ายังไม่ต้องการติดตั้ง Windows Service ให้ใช้:

```powershell
.\installer\install-customer-local-no-service.bat
```

## ข้อควรระวัง

- ห้ามแพ็ก `server\.env` ของเครื่องผู้พัฒนาไปให้ลูกค้า
- การใช้งานจริงควรใช้โดเมนลูกค้าเอง ไม่ควรใช้ลิงก์ชั่วคราว
- LINE Webhook ต้องเป็น HTTPS public URL
- ต้องตั้ง Backup ก่อนส่งมอบงานจริง
- ควรเปลี่ยนรหัส admin หลังติดตั้งทันที

อ่านคู่มือเต็มได้ที่:

```text
docs\customer-local-installation-manual.md
docs\Post-Sales-IoT-Local-Server-Installation-Manual.docx
```
