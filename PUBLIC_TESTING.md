# เปิดระบบทดสอบผ่านอินเทอร์เน็ต

เปิด PowerShell ที่โฟลเดอร์โปรเจกต์ แล้วรัน:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-public-test.ps1
```

คำสั่งนี้จะเปิด API และหน้าเว็บ (ถ้ายังไม่เปิด), สร้าง Cloudflare Quick Tunnel ใหม่, เขียน URL ลง `runtime-config.json` และ push ไฟล์ขึ้นสาขา `main` โดยอัตโนมัติ

APK และ PWA จะอ่าน URL ล่าสุดจาก:

`https://raw.githubusercontent.com/0tyght/postsales-iot/main/runtime-config.json`

หากต้องการทดสอบสคริปต์โดยไม่ commit/push ให้เพิ่ม `-SkipGitPush`

> Quick Tunnel ใช้สำหรับทดสอบชั่วคราวเท่านั้น เครื่องเซิร์ฟเวอร์ต้องเปิดอยู่ และห้ามใส่รหัสผ่านหรือ token ลงใน `runtime-config.json`
