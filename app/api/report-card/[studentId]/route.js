import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/auth";

const PAGE = [595.28, 841.89]; // A4 portrait, points
const MARGIN = 50;

export async function GET(req, { params }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const studentId = Number((await params).studentId);
  const student = await prisma.student.findUnique({ where: { id: studentId }, include: { results: true } });
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });

  if (session.role === "PARENT" && student.parentId !== session.parentId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const settings = await prisma.setting.findFirst();

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage(PAGE);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  let y = height - MARGIN;

  function text(str, x, yPos, opts = {}) {
    page.drawText(String(str), { x, y: yPos, size: opts.size || 10, font: opts.bold ? bold : font, color: opts.color || rgb(0.08, 0.11, 0.19) });
  }
  function centerText(str, yPos, opts = {}) {
    const f = opts.bold ? bold : font;
    const size = opts.size || 10;
    const w = f.widthOfTextAtSize(String(str), size);
    text(str, (width - w) / 2, yPos, opts);
  }
  function hLine(yPos, color = rgb(0.85, 0.87, 0.9)) {
    page.drawLine({ start: { x: MARGIN, y: yPos }, end: { x: width - MARGIN, y: yPos }, thickness: 1, color });
  }
  function ensureSpace(needed) {
    if (y - needed < 70) {
      page = pdfDoc.addPage(PAGE);
      y = height - MARGIN;
    }
  }

  // Header
  centerText(settings?.schoolName || "EduManage Pro School", y, { size: 20, bold: true });
  y -= 20;
  const contactLine = [settings?.address, settings?.phone, settings?.email].filter(Boolean).join("   |   ");
  if (contactLine) { centerText(contactLine, y, { size: 9, color: rgb(0.45, 0.5, 0.58) }); y -= 16; }
  y -= 4;
  hLine(y); y -= 26;
  centerText("STUDENT REPORT CARD", y, { size: 14, bold: true }); y -= 30;

  // Student info block
  const leftX = MARGIN, rightX = width / 2 + 10;
  text("Name:", leftX, y, { bold: true }); text(student.name, leftX + 60, y);
  text("Roll No:", rightX, y, { bold: true }); text(student.rollNo, rightX + 60, y);
  y -= 20;
  text("Class:", leftX, y, { bold: true }); text(`${student.className} - ${student.section}`, leftX + 60, y);
  text("Parent:", rightX, y, { bold: true }); text(student.parentName || "-", rightX + 60, y);
  y -= 20;
  text("Generated:", leftX, y, { bold: true }); text(new Date().toLocaleDateString("en-GB"), leftX + 60, y);
  y -= 26;
  hLine(y); y -= 24;

  const byExam = {};
  for (const r of student.results) { (byExam[r.exam] = byExam[r.exam] || []).push(r); }
  const examNames = Object.keys(byExam);

  let grandObtained = 0, grandTotal = 0;

  if (examNames.length === 0) {
    text("No results have been recorded for this student yet.", leftX, y, { color: rgb(0.5, 0.5, 0.5) });
    y -= 20;
  }

  for (const exam of examNames) {
    ensureSpace(120);
    text(exam, leftX, y, { bold: true, size: 12 }); y -= 18;

    const colX = { subject: leftX, marks: leftX + 230, total: leftX + 310, pct: leftX + 390, grade: leftX + 460 };
    text("Subject", colX.subject, y, { bold: true, size: 9, color: rgb(0.45, 0.5, 0.58) });
    text("Marks", colX.marks, y, { bold: true, size: 9, color: rgb(0.45, 0.5, 0.58) });
    text("Total", colX.total, y, { bold: true, size: 9, color: rgb(0.45, 0.5, 0.58) });
    text("%", colX.pct, y, { bold: true, size: 9, color: rgb(0.45, 0.5, 0.58) });
    text("Grade", colX.grade, y, { bold: true, size: 9, color: rgb(0.45, 0.5, 0.58) });
    y -= 6; hLine(y); y -= 16;

    let obtained = 0, total = 0;
    for (const r of byExam[exam]) {
      ensureSpace(20);
      text(r.subject, colX.subject, y);
      text(String(r.marks), colX.marks, y);
      text(String(r.total), colX.total, y);
      text(r.total ? `${Math.round((r.marks / r.total) * 100)}%` : "-", colX.pct, y);
      text(r.grade || "-", colX.grade, y);
      y -= 18;
      obtained += r.marks; total += r.total;
    }
    grandObtained += obtained; grandTotal += total;

    hLine(y); y -= 16;
    text(`${exam} Total:`, colX.subject, y, { bold: true });
    text(`${obtained} / ${total}`, colX.marks, y, { bold: true });
    text(total ? `${Math.round((obtained / total) * 100)}%` : "-", colX.pct, y, { bold: true });
    y -= 30;
  }

  if (grandTotal > 0) {
    ensureSpace(60);
    hLine(y); y -= 22;
    const overallPct = Math.round((grandObtained / grandTotal) * 100);
    const overallGrade = overallPct >= 90 ? "A+" : overallPct >= 80 ? "A" : overallPct >= 70 ? "B" : overallPct >= 60 ? "C" : overallPct >= 50 ? "D" : "F";
    text("Overall Percentage:", leftX, y, { bold: true, size: 12 });
    text(`${overallPct}%  (Grade: ${overallGrade})`, leftX + 160, y, { bold: true, size: 12 });
    y -= 40;
  }

  ensureSpace(60);
  hLine(y - 40);
  text("Class Teacher Signature", leftX, y - 55, { size: 9, color: rgb(0.5, 0.5, 0.5) });
  text("Principal Signature", width - MARGIN - 120, y - 55, { size: 9, color: rgb(0.5, 0.5, 0.5) });

  const bytes = await pdfDoc.save();
  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="ReportCard_${student.rollNo}.pdf"`,
    },
  });
}
