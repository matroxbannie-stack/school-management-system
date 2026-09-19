import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/auth";

const MARGIN = 50;

export async function GET(req, { params }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const studentId = Number((await params).studentId);
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });

  if (session.role === "PARENT" && student.parentId !== session.parentId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const exams = await prisma.examSchedule.findMany({
    where: { className: student.className, OR: [{ section: null }, { section: student.section }] },
    orderBy: { date: "asc" },
  });
  const settings = await prisma.setting.findFirst();

  const pdfDoc = await PDFDocument.create();
  const height = 260 + exams.length * 26;
  const page = pdfDoc.addPage([595.28, Math.max(height, 400)]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width } = page.getSize();
  let y = page.getSize().height - MARGIN;

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

  centerText(settings?.schoolName || "EduManage Pro School", y, { size: 18, bold: true }); y -= 18;
  const contactLine = [settings?.address, settings?.phone, settings?.email].filter(Boolean).join("   |   ");
  if (contactLine) { centerText(contactLine, y, { size: 9, color: rgb(0.45, 0.5, 0.58) }); y -= 16; }
  y -= 6; hLine(y); y -= 24;
  centerText("EXAM ADMIT CARD", y, { size: 14, bold: true }); y -= 30;

  text("Student Name:", MARGIN, y, { bold: true }); text(student.name, MARGIN + 110, y); y -= 22;
  text("Roll No:", MARGIN, y, { bold: true }); text(student.rollNo, MARGIN + 110, y);
  text("Class:", 320, y, { bold: true }); text(`${student.className}-${student.section}`, 320 + 60, y); y -= 30;

  hLine(y); y -= 24;
  text("Exam", MARGIN, y, { bold: true, size: 9, color: rgb(0.45, 0.5, 0.58) });
  text("Subject", MARGIN + 140, y, { bold: true, size: 9, color: rgb(0.45, 0.5, 0.58) });
  text("Date", MARGIN + 280, y, { bold: true, size: 9, color: rgb(0.45, 0.5, 0.58) });
  text("Time", MARGIN + 370, y, { bold: true, size: 9, color: rgb(0.45, 0.5, 0.58) });
  text("Room", MARGIN + 470, y, { bold: true, size: 9, color: rgb(0.45, 0.5, 0.58) });
  y -= 6; hLine(y); y -= 20;

  if (exams.length === 0) {
    text("No exams scheduled for this class yet.", MARGIN, y);
    y -= 20;
  } else {
    for (const ex of exams) {
      text(ex.examName, MARGIN, y);
      text(ex.subject, MARGIN + 140, y);
      text(ex.date, MARGIN + 280, y);
      text(`${ex.startTime}-${ex.endTime}`, MARGIN + 370, y);
      text(ex.room || "-", MARGIN + 470, y);
      y -= 22;
    }
  }

  y -= 20; hLine(y); y -= 30;
  text("Student Signature", MARGIN, y, { size: 9, color: rgb(0.5, 0.5, 0.5) });
  text("Invigilator Signature", width - MARGIN - 130, y, { size: 9, color: rgb(0.5, 0.5, 0.5) });

  const bytes = await pdfDoc.save();
  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="AdmitCard_${student.rollNo}.pdf"`,
    },
  });
}