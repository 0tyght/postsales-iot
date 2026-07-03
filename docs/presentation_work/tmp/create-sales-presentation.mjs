import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const OUT_DIR = "C:/xampp/htdocs/postsales-iot/docs";
const QA_DIR = "C:/xampp/htdocs/postsales-iot/docs/presentation_work/tmp/qa";
const FINAL = path.join(OUT_DIR, "Post-Sales-IoT-Sales-Presentation.pptx");

const W = 1280;
const H = 720;
const C = {
  navy: "#0B1F3A",
  blue: "#2378D8",
  blue2: "#35A7FF",
  teal: "#19A88A",
  green: "#38C172",
  line: "#06C755",
  orange: "#F59E0B",
  red: "#EF4444",
  bg: "#F4FBFF",
  soft: "#EAF7F5",
  softBlue: "#EAF3FF",
  text: "#132238",
  muted: "#607086",
  border: "#CFE1EF",
  white: "#FFFFFF",
};

async function writeBlob(file, blob) {
  await fs.writeFile(file, new Uint8Array(await blob.arrayBuffer()));
}

function addText(slide, text, x, y, w, h, opt = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    fontFace: opt.fontFace || "Aptos",
    fontSize: opt.size || 22,
    bold: !!opt.bold,
    color: opt.color || C.text,
    italic: !!opt.italic,
  };
  return shape;
}

function addBox(slide, x, y, w, h, opt = {}) {
  return slide.shapes.add({
    geometry: opt.geometry || "roundRect",
    position: { left: x, top: y, width: w, height: h },
    fill: opt.fill || C.white,
    line: { style: "solid", fill: opt.line || C.border, width: opt.lineWidth ?? 1 },
    borderRadius: opt.radius || "rounded-xl",
    shadow: opt.shadow || "shadow-sm",
  });
}

function addCard(slide, x, y, w, h, title, body, opt = {}) {
  addBox(slide, x, y, w, h, { fill: opt.fill || C.white, line: opt.line || C.border });
  if (opt.accent) addBox(slide, x, y, 8, h, { fill: opt.accent, line: opt.accent, radius: "rounded-xl", shadow: "none" });
  addText(slide, title, x + 24, y + 22, w - 48, 32, { size: opt.titleSize || 22, bold: true, color: opt.titleColor || C.navy });
  if (body) addText(slide, body, x + 24, y + 64, w - 48, h - 76, { size: opt.bodySize || 17, color: opt.bodyColor || C.muted });
}

function addPill(slide, text, x, y, w, color = C.blue) {
  addBox(slide, x, y, w, 34, { fill: `${color}18`, line: `${color}55`, radius: "rounded-full", shadow: "none" });
  addText(slide, text, x + 12, y + 6, w - 24, 22, { size: 13, bold: true, color });
}

function addHeader(slide, title, subtitle, noNum = false, num = "") {
  slide.background.fill = C.bg;
  addText(slide, title, 62, 44, 780, 48, { size: 36, bold: true, color: C.navy });
  if (subtitle) addText(slide, subtitle, 64, 94, 820, 34, { size: 18, color: C.muted });
  if (!noNum) addText(slide, num, 1160, 48, 60, 24, { size: 13, color: C.muted });
}

function addLogo(slide, x = 62, y = 42, s = 58) {
  addBox(slide, x, y, s, s, { fill: C.blue, line: C.blue, radius: "rounded-xl", shadow: "shadow-sm" });
  addText(slide, "TYT", x + 9, y + 16, s - 18, 24, { size: 17, bold: true, color: C.white });
}

function addArrow(slide, x, y, w = 46) {
  addText(slide, "→", x, y, w, 34, { size: 28, bold: true, color: C.blue });
}

const deck = Presentation.create({ slideSize: { width: W, height: H } });

// 1 Cover
{
  const slide = deck.slides.add();
  slide.background.fill = "#F8FCFF";
  addBox(slide, 720, 0, 540, 720, { geometry: "roundRect", fill: C.softBlue, line: C.softBlue, radius: "rounded-3xl", shadow: "none" });
  addLogo(slide, 78, 72, 72);
  addPill(slide, "ระบบดูแลหลังการขายสำหรับงานติดตั้งและบริการ", 78, 176, 360, C.teal);
  addText(slide, "Post-Sales IoT\nSupport", 78, 230, 560, 145, { size: 54, bold: true, color: C.navy });
  addText(slide, "ดูแลลูกค้า งานติดตั้ง งานซ่อม อุปกรณ์จริง รูปหลักฐาน และ LINE OA ได้ในระบบเดียว", 82, 398, 540, 86, { size: 24, color: C.muted });
  addBox(slide, 760, 120, 380, 420, { fill: C.white, line: C.border, radius: "rounded-2xl" });
  addText(slide, "งานที่ไม่หลุด", 810, 165, 260, 36, { size: 28, bold: true, color: C.navy });
  addText(slide, "สถานะชัดเจน\nรูปหน้างานครบ\nติดต่อผ่าน LINE\nดูแลต่อเนื่องหลังขาย", 810, 230, 280, 200, { size: 26, color: C.text });
  addBox(slide, 790, 468, 320, 44, { fill: C.teal, line: C.teal, radius: "rounded-full" });
  addText(slide, "พร้อมใช้งานแบบ Web App / PWA", 820, 478, 270, 24, { size: 17, bold: true, color: C.white });
}

// 2 Problems
{
  const slide = deck.slides.add();
  addHeader(slide, "งานหลังการขายมักพังตรงช่องว่างเล็ก ๆ", "เมื่อข้อมูลกระจายอยู่หลายที่ ทีมจะเห็นภาพไม่พร้อมกัน", false, "02");
  const items = [
    ["งานหลุด", "รับแจ้งแล้วไม่มีใครเห็นสถานะล่าสุด", C.red],
    ["รูปกระจัดกระจาย", "หลักฐานอยู่ในมือถือช่างหรือแชตส่วนตัว", C.orange],
    ["ไม่รู้ว่าช่างทำถึงไหน", "แอดมินต้องโทรถามซ้ำเพื่ออัปเดตลูกค้า", C.blue],
    ["ประกันกับรอบดูแลไม่ชัด", "หมดระยะหรือถึงรอบ service แล้วไม่มีใครเตือน", C.teal],
    ["ลูกค้าติดต่อยาก", "ไม่รู้ว่า LINE นี้เป็นของลูกค้ารายไหน", C.line],
  ];
  items.forEach((it, i) => addCard(slide, 80 + (i % 3) * 380, 180 + Math.floor(i / 3) * 185, i < 3 ? 330 : 520, 140, it[0], it[1], { accent: it[2] }));
}

// 3 Solution
{
  const slide = deck.slides.add();
  addHeader(slide, "ระบบนี้ทำหน้าที่เป็นศูนย์กลางงานบริการ", "ทุกฝ่ายเห็นข้อมูลเดียวกัน ตั้งแต่รับเรื่องจนปิดงาน", false, "03");
  addBox(slide, 458, 185, 360, 290, { fill: C.navy, line: C.navy, radius: "rounded-2xl" });
  addText(slide, "Post-Sales IoT", 510, 235, 260, 42, { size: 32, bold: true, color: C.white });
  addText(slide, "ลูกค้า • จุดติดตั้ง • อุปกรณ์ • เคส • งานช่าง • รูปหลักฐาน • LINE", 500, 305, 280, 98, { size: 20, color: "#D8E8F7" });
  const nodes = [
    ["แอดมิน", 110, 180, C.blue],
    ["ช่าง", 110, 420, C.teal],
    ["ลูกค้า", 890, 180, C.orange],
    ["LINE OA", 890, 420, C.line],
  ];
  nodes.forEach(([t, x, y, c]) => {
    addBox(slide, x, y, 250, 96, { fill: C.white, line: c, lineWidth: 2, radius: "rounded-2xl" });
    addText(slide, t, x + 52, y + 30, 160, 32, { size: 26, bold: true, color: C.navy });
  });
  addArrow(slide, 380, 212); addArrow(slide, 380, 452); addArrow(slide, 830, 212); addArrow(slide, 830, 452);
}

// 4 Actors
{
  const slide = deck.slides.add();
  addHeader(slide, "แต่ละบทบาททำงานของตัวเองได้ชัดเจน", "ระบบแยกสิทธิ์จากบัญชี และลดงานถามซ้ำระหว่างทีม", false, "04");
  addCard(slide, 70, 170, 270, 340, "แอดมิน", "ดู Dashboard\nจัดการลูกค้าและจุดติดตั้ง\nติดตามเคสแบบเรียลไทม์\nตั้งค่าข้อความ LINE", { accent: C.blue, bodySize: 19 });
  addCard(slide, 370, 170, 270, 340, "ช่าง", "รับงานจากมือถือ\nเพิ่มอุปกรณ์จริงและรูป\nบันทึกผลซ่อม/ติดตั้ง\nปิดงานจากหน้างาน", { accent: C.teal, bodySize: 19 });
  addCard(slide, 670, 170, 270, 340, "ลูกค้า", "ผูก LINE ด้วยรหัสสั้น\nแจ้งปัญหาและนัดหมาย\nรับข้อความดูแลตามรอบ\nติดต่อทีมได้ง่ายขึ้น", { accent: C.orange, bodySize: 19 });
  addCard(slide, 970, 170, 240, 340, "LINE OA", "รับแจ้งปัญหา\nส่งเตือนรอบ service\nตอบกลับอัตโนมัติ\nแจ้งทีมช่างเมื่อมีเคสใหม่", { accent: C.line, bodySize: 18 });
}

// 5 Installation workflow
{
  const slide = deck.slides.add();
  addHeader(slide, "งานติดตั้งเริ่มจากหน้างานจริง ไม่ใช่เดาจากออฟฟิศ", "ช่างสามารถสร้างข้อมูลที่เจอจริง แล้วระบบเก็บเป็นประวัติหลังการขาย", false, "05");
  const steps = [
    ["1", "สร้างลูกค้า / จุดติดตั้ง", "ลูกค้าใหม่หรือเดิมก็ได้"],
    ["2", "สร้าง Job ติดตั้งใหม่", "เป็นงานติดตั้งสำหรับ site ใหม่"],
    ["3", "ช่างรับงาน", "กดรับเองแล้วไปหน้างาน"],
    ["4", "เลือก/เพิ่มอุปกรณ์จริง", "ใช้ serial และวันที่ซื้อ"],
    ["5", "แนบรูปและปิดงาน", "เริ่มนับระยะดูแล"],
  ];
  steps.forEach((s, i) => {
    const x = 72 + i * 235;
    addBox(slide, x, 220, 195, 210, { fill: C.white, line: i === 4 ? C.teal : C.border, lineWidth: i === 4 ? 2 : 1, radius: "rounded-2xl" });
    addBox(slide, x + 22, 242, 42, 42, { fill: C.blue, line: C.blue, radius: "rounded-full", shadow: "none" });
    addText(slide, s[0], x + 35, 250, 16, 22, { size: 18, bold: true, color: C.white });
    addText(slide, s[1], x + 22, 305, 150, 55, { size: 21, bold: true, color: C.navy });
    addText(slide, s[2], x + 22, 370, 150, 42, { size: 15, color: C.muted });
    if (i < steps.length - 1) addArrow(slide, x + 196, 304, 36);
  });
}

// 6 Service workflow
{
  const slide = deck.slides.add();
  addHeader(slide, "เคสซ่อมและงานบริการเดินต่อได้โดยไม่หลุดคิว", "ลูกค้าแจ้งเองได้ แอดมินสร้างเองได้ และช่างรับงานต่อได้ทันที", false, "06");
  addCard(slide, 78, 180, 300, 145, "รับแจ้งปัญหา", "ผ่าน LINE OA หรือแอดมินบันทึกให้ลูกค้า", { accent: C.red });
  addCard(slide, 490, 180, 300, 145, "สร้างเคสบริการ", "เลือกจุดติดตั้ง อุปกรณ์ที่มีปัญหา และเวลานัดหมาย", { accent: C.orange });
  addCard(slide, 902, 180, 300, 145, "ทีมช่างรับงาน", "ระบบแจ้งเตือนและช่างกดรับเคสเข้าหน้างานของฉัน", { accent: C.teal });
  addArrow(slide, 405, 230); addArrow(slide, 817, 230);
  addCard(slide, 180, 410, 390, 150, "บันทึกหน้างาน", "อาการซ่อม รูปหลักฐาน อุปกรณ์ที่เปลี่ยน เพิ่ม หรือลด", { accent: C.blue });
  addCard(slide, 710, 410, 390, 150, "ปิดงานและดูย้อนหลัง", "แอดมินเห็นสถานะ รูป และสรุปงานแบบเรียลไทม์", { accent: C.navy });
  addArrow(slide, 602, 462);
}

// 7 LINE
{
  const slide = deck.slides.add();
  addHeader(slide, "LINE OA ทำให้ลูกค้าเข้าระบบได้โดยไม่ต้องลงแอปใหม่", "ใช้ QR เพิ่มเพื่อนและรหัส TYTC0000 เพื่อผูกลูกค้าให้ถูกคน", false, "07");
  addBox(slide, 90, 175, 300, 360, { fill: C.white, line: C.line, lineWidth: 2, radius: "rounded-2xl" });
  addText(slide, "LINE OA", 145, 220, 190, 40, { size: 34, bold: true, color: C.line });
  addText(slide, "QR เพิ่มเพื่อน\nรหัสผูกบัญชี\nแจ้งเตือนรอบดูแล\nเมนูแจ้งปัญหา", 140, 300, 180, 160, { size: 24, color: C.text });
  const points = [
    ["ผูกลูกค้าถูกคน", "ลูกค้าส่งรหัสสั้น TYTC0000 ระบบบันทึก LINE User ID"],
    ["ถามอาการตามรอบ service", "ข้อความอัตโนมัติถามว่ามีปัญหาหรือไม่"],
    ["แจ้งเคสเข้าไลน์ทีมช่าง", "เมื่อมีปัญหาใหม่ ทีมเห็นทันทีและรับงานได้เร็ว"],
  ];
  points.forEach((p, i) => addCard(slide, 470, 165 + i * 128, 650, 104, p[0], p[1], { accent: [C.blue, C.teal, C.orange][i], bodySize: 17 }));
}

// 8 Admin value
{
  const slide = deck.slides.add();
  addHeader(slide, "แอดมินเห็นงานทั้งหมดโดยไม่ต้องไล่ถามทีละคน", "หน้าบ้านออกแบบให้ดูสถานะและหลักฐานได้เร็ว", false, "08");
  addCard(slide, 82, 170, 330, 160, "Dashboard งานวันนี้", "เห็นลูกค้า จุดติดตั้ง อุปกรณ์ เคสค้าง และงานใกล้ครบระยะดูแล", { accent: C.blue });
  addCard(slide, 472, 170, 330, 160, "สถานะงานเรียลไทม์", "ดูงานรอรับ กำลังทำ และปิดงานแล้ว พร้อมรูปจากช่าง", { accent: C.teal });
  addCard(slide, 862, 170, 330, 160, "ข้อมูลลูกค้าเป็นระบบ", "จัดการลูกค้า จุดติดตั้ง อุปกรณ์จริง ประกัน และรอบดูแล", { accent: C.orange });
  addBox(slide, 120, 410, 1040, 100, { fill: C.navy, line: C.navy, radius: "rounded-2xl" });
  addText(slide, "ผลลัพธ์: ตอบลูกค้าเร็วขึ้น ลดงานตกหล่น และมีหลักฐานหน้างานย้อนดูได้", 170, 440, 940, 36, { size: 28, bold: true, color: C.white });
}

// 9 Technician value
{
  const slide = deck.slides.add();
  addHeader(slide, "ช่างทำงานผ่านมือถือได้เหมือนแอป", "เหมาะกับทีมเล็กที่ต้องเริ่มใช้งานจริงเร็ว โดยยังไม่ต้องทำแอป iOS เต็มรูปแบบ", false, "09");
  addBox(slide, 90, 160, 330, 440, { fill: C.white, line: C.border, radius: "rounded-3xl" });
  addBox(slide, 125, 200, 260, 48, { fill: C.softBlue, line: C.softBlue, radius: "rounded-xl", shadow: "none" });
  addText(slide, "งานของฉัน", 152, 212, 160, 26, { size: 22, bold: true, color: C.navy });
  ["รับเคส", "เพิ่มอุปกรณ์", "ถ่ายรูปหลักฐาน", "ปิดงาน"].forEach((t, i) => addCard(slide, 125, 280 + i * 70, 260, 50, t, "", { accent: [C.blue, C.teal, C.orange, C.line][i], titleSize: 19 }));
  addCard(slide, 500, 180, 290, 150, "รับงานเอง", "ช่างเห็นเคสทั้งหมดและกดรับเข้าหน้างานของฉัน", { accent: C.blue });
  addCard(slide, 840, 180, 290, 150, "เพิ่มข้อมูลจริง", "เพิ่มลูกค้า จุดติดตั้ง โมเดล และอุปกรณ์จากหน้างาน", { accent: C.teal });
  addCard(slide, 500, 405, 290, 150, "เก็บหลักฐานครบ", "แนบรูปก่อนซ่อม ระหว่างซ่อม และหลังจบงาน", { accent: C.orange });
  addCard(slide, 840, 405, 290, 150, "ใช้ง่ายบนมือถือ", "เปิดผ่าน PWA หรือ APK สำหรับ Android", { accent: C.line });
}

// 10 Close
{
  const slide = deck.slides.add();
  addHeader(slide, "เริ่มใช้ระบบได้จากข้อมูลพื้นฐาน แล้วค่อยขยายตามงานจริง", "เหมาะกับธุรกิจที่ต้องดูแลลูกค้าหลังติดตั้งอย่างต่อเนื่อง", false, "10");
  addText(slide, "สิ่งที่ระบบช่วยให้ดีขึ้น", 92, 165, 440, 42, { size: 32, bold: true, color: C.navy });
  addText(slide, "ลดงานหลุด\nเห็นสถานะตรงกัน\nมีรูปหลักฐานครบ\nดูแลลูกค้าตามรอบ\nติดต่อผ่าน LINE ได้ถูกคน", 105, 230, 450, 230, { size: 27, color: C.text });
  addBox(slide, 660, 160, 455, 330, { fill: C.white, line: C.border, radius: "rounded-2xl" });
  addText(slide, "ขั้นตอนเริ่มต้น", 710, 208, 250, 36, { size: 30, bold: true, color: C.navy });
  addText(slide, "1. เพิ่มผู้ใช้และทีมช่าง\n2. เพิ่มลูกค้าและจุดติดตั้ง\n3. ลงทะเบียนโมเดลและอุปกรณ์จริง\n4. เชื่อม LINE OA\n5. ทดลองสร้างงานติดตั้งและเคสซ่อม", 712, 275, 330, 180, { size: 22, color: C.text });
  addBox(slide, 88, 565, 1030, 60, { fill: C.teal, line: C.teal, radius: "rounded-full" });
  addText(slide, "Post-Sales IoT Support เปลี่ยนงานบริการหลังขายให้ติดตามได้จริงตั้งแต่วันแรก", 150, 580, 910, 30, { size: 23, bold: true, color: C.white });
}

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.mkdir(QA_DIR, { recursive: true });

for (const [index, slide] of deck.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, "0")}`;
  const png = await deck.export({ slide, format: "png", scale: 1 });
  await writeBlob(path.join(QA_DIR, `${stem}.png`), png);
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(path.join(QA_DIR, `${stem}.layout.json`), await layout.text(), "utf8");
}

const montage = await deck.export({ format: "webp", montage: true, scale: 1 });
await writeBlob(path.join(QA_DIR, "deck-montage.webp"), montage);

const pptx = await PresentationFile.exportPptx(deck);
await pptx.save(FINAL);
console.log(FINAL);
