import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const OUT_DIR = "C:/xampp/htdocs/postsales-iot/docs";
const QA_DIR = "C:/xampp/htdocs/postsales-iot/docs/presentation_work/tmp/qa-v2";
const FINAL = path.join(OUT_DIR, "Post-Sales-IoT-Sales-Pitch-Deck.pptx");

const W = 1280;
const H = 720;
const C = {
  ink: "#071B33",
  navy: "#0B2545",
  blue: "#1666D8",
  cyan: "#21B8F3",
  teal: "#12B497",
  green: "#06C755",
  amber: "#F59E0B",
  red: "#EF4444",
  white: "#FFFFFF",
  fog: "#F6FAFD",
  blueSoft: "#EAF4FF",
  tealSoft: "#E8FAF6",
  amberSoft: "#FFF5E2",
  redSoft: "#FFF0F0",
  border: "#D7E4EF",
  muted: "#5C6F86",
  pale: "#DCEBFA",
};

async function writeBlob(file, blob) {
  await fs.writeFile(file, new Uint8Array(await blob.arrayBuffer()));
}

function t(slide, text, x, y, w, h, o = {}) {
  const s = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  s.text = text;
  s.text.style = {
    fontFace: o.font || "Aptos",
    fontSize: o.size || 22,
    bold: !!o.bold,
    color: o.color || C.ink,
    italic: !!o.italic,
  };
  return s;
}

function box(slide, x, y, w, h, o = {}) {
  return slide.shapes.add({
    geometry: o.geometry || "roundRect",
    position: { left: x, top: y, width: w, height: h },
    fill: o.fill || C.white,
    line: { style: "solid", fill: o.line ?? C.border, width: o.lineWidth ?? 1 },
    borderRadius: o.radius || "rounded-2xl",
    shadow: o.shadow ?? "shadow-sm",
  });
}

function page(slide, n, dark = false) {
  slide.background.fill = dark ? C.ink : C.fog;
  if (!dark) {
    box(slide, 52, 40, 54, 54, { fill: C.ink, line: C.ink, radius: "rounded-xl", shadow: "shadow-sm" });
    t(slide, "TYT", 62, 56, 34, 20, { size: 14, bold: true, color: C.white });
    t(slide, String(n).padStart(2, "0"), 1168, 48, 42, 20, { size: 13, color: C.muted });
  }
}

function title(slide, headline, sub, n) {
  page(slide, n);
  t(slide, headline, 76, 118, 820, 86, { size: 40, bold: true, color: C.ink });
  if (sub) t(slide, sub, 78, 214, 770, 48, { size: 20, color: C.muted });
}

function pill(slide, text, x, y, w, color = C.teal) {
  box(slide, x, y, w, 34, { fill: color + "18", line: color + "55", radius: "rounded-full", shadow: "none" });
  t(slide, text, x + 14, y + 6, w - 28, 20, { size: 13, bold: true, color });
}

function card(slide, x, y, w, h, head, body, o = {}) {
  box(slide, x, y, w, h, { fill: o.fill || C.white, line: o.line || C.border, lineWidth: o.lineWidth || 1, radius: o.radius || "rounded-2xl", shadow: o.shadow ?? "shadow-sm" });
  if (o.accent) box(slide, x, y, 8, h, { fill: o.accent, line: o.accent, radius: "rounded-2xl", shadow: "none" });
  if (o.icon) {
    box(slide, x + 24, y + 22, 44, 44, { fill: o.accent ? o.accent + "20" : C.blueSoft, line: "none", radius: "rounded-xl", shadow: "none" });
    t(slide, o.icon, x + 34, y + 31, 26, 22, { size: 19, bold: true, color: o.accent || C.blue });
    t(slide, head, x + 84, y + 22, w - 108, 35, { size: o.headSize || 22, bold: true, color: o.headColor || C.ink });
    if (body) t(slide, body, x + 84, y + 66, w - 108, h - 78, { size: o.bodySize || 17, color: o.bodyColor || C.muted });
  } else {
    t(slide, head, x + 24, y + 24, w - 48, 36, { size: o.headSize || 22, bold: true, color: o.headColor || C.ink });
    if (body) t(slide, body, x + 24, y + 72, w - 48, h - 84, { size: o.bodySize || 17, color: o.bodyColor || C.muted });
  }
}

function arrow(slide, x, y, color = C.blue) {
  t(slide, "→", x, y, 42, 36, { size: 30, bold: true, color });
}

function metric(slide, x, y, w, label, value, color) {
  box(slide, x, y, w, 126, { fill: C.white, line: color + "55", radius: "rounded-2xl", shadow: "shadow-sm" });
  t(slide, value, x + 24, y + 26, w - 48, 42, { size: 36, bold: true, color });
  t(slide, label, x + 24, y + 76, w - 48, 28, { size: 16, color: C.muted });
}

const deck = Presentation.create({ slideSize: { width: W, height: H } });

// 1
{
  const s = deck.slides.add();
  page(s, 1, true);
  box(s, 790, 0, 490, 720, { fill: "#0E3561", line: "#0E3561", radius: "rounded-none", shadow: "none" });
  box(s, 900, 118, 230, 460, { fill: "#F8FBFF", line: "#9FC8EE", radius: "rounded-3xl", shadow: "shadow-lg" });
  box(s, 930, 160, 170, 32, { fill: C.blueSoft, line: "none", radius: "rounded-full", shadow: "none" });
  t(s, "งานวันนี้", 960, 166, 90, 18, { size: 13, bold: true, color: C.blue });
  card(s, 930, 226, 170, 74, "รับเคสใหม่", "3 งาน", { headSize: 18, bodySize: 17, accent: C.red, shadow: "none" });
  card(s, 930, 318, 170, 74, "กำลังทำ", "5 งาน", { headSize: 18, bodySize: 17, accent: C.amber, shadow: "none" });
  card(s, 930, 410, 170, 74, "ปิดงานแล้ว", "หลักฐานครบ", { headSize: 18, bodySize: 16, accent: C.teal, shadow: "none" });
  pill(s, "ระบบดูแลหลังการขายสำหรับธุรกิจติดตั้งและบริการ", 82, 82, 390, C.teal);
  t(s, "ขายอุปกรณ์แล้วจบงานไม่ได้\nความเชื่อใจอยู่หลังวันติดตั้ง", 82, 155, 660, 145, { size: 50, bold: true, color: C.white });
  t(s, "Post-Sales IoT Support ช่วยให้ทีมติดตั้ง ทีมซ่อม และแอดมินเห็นงานเดียวกันตั้งแต่รับเรื่องจนปิดงาน", 86, 340, 610, 78, { size: 23, color: "#C7D8EA" });
  box(s, 84, 500, 308, 54, { fill: C.teal, line: C.teal, radius: "rounded-full", shadow: "shadow-sm" });
  t(s, "เริ่มจากทีมเล็ก ใช้งานจริงได้ทันที", 115, 514, 250, 24, { size: 18, bold: true, color: C.white });
}

// 2
{
  const s = deck.slides.add();
  title(s, "ลูกค้าไม่ได้จำแค่วันที่ซื้อ แต่จำวันที่มีปัญหา", "ถ้าวันนั้นทีมตอบช้า หาเรื่องไม่เจอ หรือไม่มีหลักฐาน งานหลังการขายจะกลายเป็นต้นทุนทันที", 2);
  card(s, 80, 312, 260, 160, "เคสรั่ว", "รับเรื่องแล้วไม่มีเจ้าของชัดเจน", { icon: "!", accent: C.red });
  card(s, 370, 312, 260, 160, "ข้อมูลกระจาย", "แชต รูป และ serial อยู่คนละที่", { icon: "↔", accent: C.amber });
  card(s, 660, 312, 260, 160, "ตามงานยาก", "แอดมินต้องถามช่างซ้ำเพื่ออัปเดตลูกค้า", { icon: "?", accent: C.blue });
  card(s, 950, 312, 250, 160, "เสียโอกาส", "หมดรอบดูแลแล้วไม่มีใครชวนต่อบริการ", { icon: "↓", accent: C.teal });
  box(s, 120, 542, 1040, 70, { fill: C.ink, line: C.ink, radius: "rounded-2xl" });
  t(s, "ปัญหาจริงไม่ใช่ไม่มีช่าง แต่คือไม่มีระบบที่ทำให้ทุกคนเห็นภาพเดียวกัน", 170, 562, 940, 30, { size: 25, bold: true, color: C.white });
}

// 3
{
  const s = deck.slides.add();
  title(s, "ต้นทุนที่ซ่อนอยู่ไม่ได้อยู่ในอะไหล่ แต่อยู่ในความไม่ชัดเจน", "งานบริการที่ไม่มีระบบทำให้ทีมเสียเวลา และทำให้ลูกค้ารู้สึกว่าไม่มีใครดูแล", 3);
  metric(s, 90, 300, 250, "เวลาที่เสียไปกับการถามสถานะ", "ตามงานซ้ำ", C.red);
  metric(s, 380, 300, 250, "หลักฐานไม่ครบเมื่อลูกค้าทักกลับ", "ตอบยาก", C.amber);
  metric(s, 670, 300, 250, "ประวัติงานไม่ต่อเนื่องเมื่อเปลี่ยนคนดูแล", "เริ่มใหม่", C.blue);
  metric(s, 960, 300, 250, "รอบ service ที่ควรสร้างความสัมพันธ์ต่อ", "พลาดโอกาส", C.teal);
  t(s, "ระบบนี้จึงไม่ได้ขายแค่ “จัดการงาน” แต่ขายความมั่นใจว่าลูกค้าจะไม่ถูกทิ้งหลังติดตั้ง", 140, 540, 1000, 42, { size: 27, bold: true, color: C.ink });
}

// 4
{
  const s = deck.slides.add();
  title(s, "แนวทางคือทำให้งานหลังการขายมีเจ้าของ มีหลักฐาน และติดตามต่อได้", "Post-Sales IoT รวมลูกค้า จุดติดตั้ง อุปกรณ์ เคส งานช่าง รูป และ LINE ไว้ในระบบเดียว", 4);
  box(s, 440, 235, 400, 210, { fill: C.ink, line: C.ink, radius: "rounded-3xl", shadow: "shadow-lg" });
  t(s, "Post-Sales IoT", 500, 285, 280, 40, { size: 34, bold: true, color: C.white });
  t(s, "ศูนย์กลางงานบริการหลังขาย", 505, 342, 270, 30, { size: 20, color: "#C7D8EA" });
  [["ลูกค้า", 96, 185, C.blue], ["จุดติดตั้ง", 96, 410, C.teal], ["อุปกรณ์จริง", 940, 185, C.amber], ["LINE OA", 940, 410, C.green]].forEach(([label, x, y, c]) => {
    box(s, x, y, 245, 108, { fill: C.white, line: c, lineWidth: 2, radius: "rounded-2xl" });
    t(s, label, x + 42, y + 36, 160, 30, { size: 26, bold: true, color: C.ink });
  });
  arrow(s, 360, 225); arrow(s, 360, 450); arrow(s, 872, 225); arrow(s, 872, 450);
}

// 5
{
  const s = deck.slides.add();
  title(s, "คนซื้อไม่ต้องเห็นระบบซับซ้อน เขาต้องเห็นว่างานไหลลื่นขึ้น", "จากแจ้งปัญหาใน LINE ไปจนช่างปิดงาน ทุกขั้นตอนมีสถานะและหลักฐาน", 5);
  const steps = [
    ["ลูกค้าแจ้ง", "LINE / โทร / แอดมินบันทึก", C.green],
    ["สร้างเคส", "ระบุบ้าน อุปกรณ์ อาการ และเวลานัด", C.blue],
    ["ช่างรับงาน", "เข้าหน้างานของฉันบนมือถือ", C.teal],
    ["บันทึกหลักฐาน", "รูป อะไหล่ สรุปผลซ่อม", C.amber],
    ["ปิดงาน", "แอดมินและลูกค้าเห็นประวัติ", C.ink],
  ];
  steps.forEach((v, i) => {
    const x = 62 + i * 240;
    box(s, x, 310, 200, 170, { fill: i === 4 ? C.ink : C.white, line: v[2], lineWidth: 2, radius: "rounded-2xl" });
    t(s, v[0], x + 22, 350, 150, 30, { size: 22, bold: true, color: i === 4 ? C.white : C.ink });
    t(s, v[1], x + 22, 394, 150, 50, { size: 16, color: i === 4 ? "#D7E7F5" : C.muted });
    if (i < steps.length - 1) arrow(s, x + 205, 374, C.blue);
  });
}

// 6
{
  const s = deck.slides.add();
  title(s, "จุดขายสำคัญคือ LINE ทำให้ลูกค้าใช้งานง่าย", "ลูกค้าไม่ต้องจำเว็บ ไม่ต้องลงทะเบียนยาว แค่เพิ่มเพื่อนและส่งรหัสสั้น", 6);
  box(s, 90, 185, 325, 360, { fill: C.green, line: C.green, radius: "rounded-3xl", shadow: "shadow-lg" });
  t(s, "LINE OA", 150, 244, 210, 42, { size: 38, bold: true, color: C.white });
  t(s, "เพิ่มเพื่อน\nส่งรหัส TYTC0000\nแจ้งปัญหา\nนัดหมาย", 148, 320, 190, 148, { size: 27, color: C.white });
  card(s, 505, 190, 600, 96, "ผูกตัวตนลูกค้าให้ถูกคน", "เมื่อส่งรหัส ระบบรู้ว่า LINE นี้เป็นของลูกค้ารายไหนและจุดติดตั้งใด", { accent: C.green, headSize: 24 });
  card(s, 505, 320, 600, 96, "ถามอาการตามรอบ service ได้", "ถึงรอบดูแล ระบบส่งข้อความถามอาการและเปิดทางให้แจ้งเคสต่อได้", { accent: C.teal, headSize: 24 });
  card(s, 505, 450, 600, 96, "ทีมช่างรู้เร็วขึ้นเมื่อมีเคสใหม่", "เคสจากลูกค้าถูกส่งเข้าระบบและแจ้งเตือนไปยังทีมที่เกี่ยวข้อง", { accent: C.blue, headSize: 24 });
}

// 7
{
  const s = deck.slides.add();
  title(s, "แอดมินขายความมั่นใจให้ลูกค้าได้ เพราะมีข้อมูลพร้อมตอบ", "ไม่ต้องไล่เปิดแชตหลายห้องเพื่อหาว่างานถึงไหนหรือรูปอยู่ที่ใคร", 7);
  box(s, 82, 190, 520, 330, { fill: C.white, line: C.border, radius: "rounded-3xl", shadow: "shadow-lg" });
  t(s, "ภาพรวมที่แอดมินเห็น", 120, 235, 300, 36, { size: 28, bold: true, color: C.ink });
  metric(s, 122, 300, 195, "เคสรอรับ", "5", C.red);
  metric(s, 342, 300, 195, "งานกำลังทำ", "8", C.amber);
  box(s, 122, 452, 414, 40, { fill: C.blueSoft, line: "none", radius: "rounded-full", shadow: "none" });
  t(s, "กดดูรูปและรายละเอียดงานได้ทันที", 160, 461, 330, 20, { size: 16, bold: true, color: C.blue });
  card(s, 680, 190, 450, 105, "ตอบลูกค้าเร็วขึ้น", "รู้สถานะล่าสุดโดยไม่ต้องโทรถามช่างก่อน", { accent: C.blue, icon: "1" });
  card(s, 680, 325, 450, 105, "ลดข้อโต้แย้งหลังงาน", "มีรูปและประวัติอุปกรณ์เป็นหลักฐาน", { accent: C.teal, icon: "2" });
  card(s, 680, 460, 450, 105, "เห็นงานที่ควรติดตามต่อ", "รอบ service และประกันไม่หลุดจากสายตา", { accent: C.amber, icon: "3" });
}

// 8
{
  const s = deck.slides.add();
  title(s, "ช่างไม่ต้องกลับมาเขียนรายงานซ้ำ เพราะรายงานเกิดตอนทำงาน", "มือถือคือเครื่องมือหลักของช่าง รับงาน เพิ่มอุปกรณ์ ถ่ายรูป และปิดงานได้จากหน้างาน", 8);
  box(s, 92, 165, 300, 430, { fill: C.ink, line: C.ink, radius: "rounded-3xl", shadow: "shadow-lg" });
  box(s, 124, 210, 236, 46, { fill: "#183A61", line: "none", radius: "rounded-xl", shadow: "none" });
  t(s, "งานของฉัน", 152, 222, 130, 22, { size: 21, bold: true, color: C.white });
  [["รับเคส", C.blue], ["เพิ่มลูกค้า/ไซต์", C.teal], ["เพิ่มอุปกรณ์", C.amber], ["แนบรูป", C.green], ["ปิดงาน", C.white]].forEach((v, i) => {
    box(s, 124, 292 + i * 52, 236, 36, { fill: i === 4 ? C.green : "#FFFFFF12", line: i === 4 ? C.green : "#FFFFFF22", radius: "rounded-lg", shadow: "none" });
    t(s, v[0], 145, 300 + i * 52, 160, 18, { size: 16, bold: true, color: i === 4 ? C.white : "#D8E8F7" });
  });
  card(s, 500, 190, 270, 160, "รับงานเอง", "เห็นเคสทั้งหมดและกดรับเข้า “งานของฉัน”", { accent: C.blue });
  card(s, 840, 190, 270, 160, "ข้อมูลจริงกว่า", "ช่างเพิ่มอุปกรณ์ที่ติดตั้งจริงจากหน้างาน", { accent: C.teal });
  card(s, 500, 420, 270, 160, "หลักฐานครบ", "รูปก่อน/หลังซ่อมแนบกับเคสโดยตรง", { accent: C.amber });
  card(s, 840, 420, 270, 160, "เริ่มใช้ง่าย", "ใช้เป็น PWA หรือ APK บน Android ได้", { accent: C.green });
}

// 9
{
  const s = deck.slides.add();
  title(s, "สิ่งที่ทำให้ระบบนี้ต่างจาก LINE กลุ่มและ Excel", "ไม่ใช่แค่บันทึกข้อมูล แต่เปลี่ยนข้อมูลให้กลายเป็นงานที่ตามต่อได้", 9);
  card(s, 90, 210, 320, 220, "LINE กลุ่ม", "คุยเร็ว แต่ค้นประวัติยาก\nรูปไหลหาย\nไม่รู้เจ้าของงาน\nวัดผลทีมไม่ได้", { fill: C.redSoft, line: "#FFCACA", accent: C.red, headSize: 27, bodySize: 20 });
  card(s, 480, 210, 320, 220, "Excel / Sheet", "เก็บข้อมูลได้\nแต่ไม่เชื่อมรูปหน้างาน\nไม่แจ้งเตือนลูกค้า\nไม่ใช่ workflow จริง", { fill: C.amberSoft, line: "#FFE0A3", accent: C.amber, headSize: 27, bodySize: 20 });
  card(s, 870, 210, 320, 220, "Post-Sales IoT", "ข้อมูล + สถานะ + รูป\nเชื่อม LINE OA\nช่างรับงานเอง\nติดตาม service ต่อได้", { fill: C.tealSoft, line: "#AEEBDE", accent: C.teal, headSize: 27, bodySize: 20 });
  box(s, 180, 525, 920, 58, { fill: C.ink, line: C.ink, radius: "rounded-full" });
  t(s, "จุดขายคือเปลี่ยนงานหลังบ้านที่กระจัดกระจายให้เป็นประสบการณ์บริการที่ลูกค้ารู้สึกได้", 250, 539, 800, 26, { size: 21, bold: true, color: C.white });
}

// 10
{
  const s = deck.slides.add();
  title(s, "เหมาะกับธุรกิจที่รายได้ไม่ได้จบที่การขายครั้งแรก", "โดยเฉพาะงานที่มีอุปกรณ์จริง มีการติดตั้ง มีรับประกัน และต้องกลับไปดูแลลูกค้า", 10);
  const rows = [
    ["ธุรกิจ IoT / Smart Farm", "มีอุปกรณ์หลายตัว หลายจุดติดตั้ง และต้องดูแลต่อเนื่อง"],
    ["บริษัทติดตั้งระบบ", "ต้องเก็บรูปหน้างาน serial อุปกรณ์ และสรุปผลให้ลูกค้า"],
    ["ทีมซ่อมบำรุง", "ต้องรับเคส แบ่งงาน และติดตามสถานะงานรายวัน"],
    ["ผู้ให้บริการหลังการขาย", "ต้องรักษาความสัมพันธ์ลูกค้าและชวนต่อ service ได้"],
  ];
  rows.forEach((r, i) => card(s, 110, 185 + i * 98, 1060, 74, r[0], r[1], { accent: [C.green, C.blue, C.amber, C.teal][i], headSize: 23, bodySize: 18 }));
}

// 11
{
  const s = deck.slides.add();
  title(s, "เริ่มขายได้ด้วยข้อความง่าย ๆ", "ไม่ต้องพูดว่าเป็นระบบใหญ่ ให้พูดว่าเป็นเครื่องมือทำให้ทีมบริการไม่หลุดงาน", 11);
  box(s, 118, 192, 1044, 250, { fill: C.ink, line: C.ink, radius: "rounded-3xl", shadow: "shadow-lg" });
  t(s, "“ระบบนี้ช่วยให้คุณรู้ทันทีว่า ลูกค้ารายไหนมีอุปกรณ์อะไร อยู่ที่ไหน ใครรับงานอยู่ มีรูปหลักฐานหรือยัง และถึงรอบดูแลเมื่อไร”", 170, 245, 930, 106, { size: 34, bold: true, color: C.white });
  t(s, "นี่คือประโยคหลักสำหรับขายงาน เพราะคนซื้อจะเห็นภาพการใช้งานจริงทันที", 210, 375, 840, 28, { size: 19, color: "#C7D8EA" });
  card(s, 150, 505, 280, 92, "ขายให้เจ้าของ", "ลดงานหลุดและเพิ่มความน่าเชื่อถือ", { accent: C.blue, headSize: 21 });
  card(s, 500, 505, 280, 92, "ขายให้หัวหน้าช่าง", "ทีมทำงานง่ายและมีหลักฐานครบ", { accent: C.teal, headSize: 21 });
  card(s, 850, 505, 280, 92, "ขายให้แอดมิน", "ตอบลูกค้าได้โดยไม่ต้องไล่ถาม", { accent: C.amber, headSize: 21 });
}

// 12
{
  const s = deck.slides.add();
  page(s, 12, true);
  t(s, "ข้อเสนอสำหรับการเริ่มใช้งาน", 82, 92, 720, 58, { size: 46, bold: true, color: C.white });
  t(s, "เริ่มจากทีมเล็ก ทดสอบกับงานจริง แล้วค่อยขยายเป็นระบบกลางของงานบริการหลังขาย", 86, 168, 760, 54, { size: 23, color: "#C7D8EA" });
  const items = [
    ["1", "นำเข้าข้อมูลลูกค้าและอุปกรณ์ชุดแรก"],
    ["2", "ให้ช่างทดลองรับงานและปิดงานจากมือถือ"],
    ["3", "เชื่อม LINE OA สำหรับผูกลูกค้าและรับแจ้งปัญหา"],
    ["4", "วัดผลจากงานที่ปิดได้ รูปครบ และเคสไม่หลุด"],
  ];
  items.forEach((it, i) => {
    const y = 285 + i * 72;
    box(s, 112, y, 48, 48, { fill: C.teal, line: C.teal, radius: "rounded-full", shadow: "none" });
    t(s, it[0], 128, y + 12, 20, 20, { size: 18, bold: true, color: C.white });
    t(s, it[1], 185, y + 10, 680, 28, { size: 24, color: C.white });
  });
  box(s, 920, 145, 250, 430, { fill: "#FFFFFF10", line: "#FFFFFF26", radius: "rounded-3xl", shadow: "none" });
  t(s, "Post-Sales\nIoT", 958, 222, 180, 95, { size: 42, bold: true, color: C.white });
  t(s, "เปลี่ยนหลังการขาย\nให้เป็นระบบที่ขายต่อได้", 960, 360, 180, 70, { size: 23, color: "#C7D8EA" });
  box(s, 955, 476, 180, 46, { fill: C.teal, line: C.teal, radius: "rounded-full", shadow: "shadow-sm" });
  t(s, "เริ่มทดลองใช้", 990, 488, 110, 20, { size: 17, bold: true, color: C.white });
}

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.rm(QA_DIR, { recursive: true, force: true });
await fs.mkdir(QA_DIR, { recursive: true });

for (const [index, slide] of deck.slides.items.entries()) {
  const stem = `slide-${String(index + 1).padStart(2, "0")}`;
  await writeBlob(path.join(QA_DIR, `${stem}.png`), await deck.export({ slide, format: "png", scale: 1 }));
  await fs.writeFile(path.join(QA_DIR, `${stem}.layout.json`), await (await slide.export({ format: "layout" })).text(), "utf8");
}
await writeBlob(path.join(QA_DIR, "deck-montage.webp"), await deck.export({ format: "webp", montage: true, scale: 1 }));
const pptx = await PresentationFile.exportPptx(deck);
await pptx.save(FINAL);
console.log(FINAL);
