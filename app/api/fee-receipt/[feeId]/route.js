import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/auth";

const PAGE = [595.28, 421]; // roomy receipt-sized page (A5 landscape-ish)
const MARGIN = 50;

export async function GET(req, { params }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const feeId = Number((await params).feeId);
  const fee = await prisma.fee.findUnique({ where: { id: feeId }, include: { student: true } });
  if (!fee) return Response.json({ error: "Fee record not found" }, { status: 404 });

  if (session.role === "PARENT" && fee.student.parentId !== session.parentId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const settings = await prisma.setting.findFirst();

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage(PAGE);
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
  function row2(label1, value1, label2, value2, yPos) {
    text(label1, MARGIN, yPos, { bold: true });
    text(value1, MARGIN + 95, yPos);
    text(label2, 320, yPos, { bold: true });
    text(value2, 320 + 75, yPos);
  }

  centerText(settings?.schoolName || "EduManage Pro School", y, { size: 18, bold: true }); y -= 18;
  const contactLine = [settings?.address, settings?.phone, settings?.email].filter(Boolean).join("   |   ");
  if (contactLine) { centerText(contactLine, y, { size: 9, color: rgb(0.45, 0.5, 0.58) }); y -= 16; }
  y -= 6; hLine(y); y -= 24;
  centerText("FEE RECEIPT", y, { size: 14, bold: true }); y -= 30;

  row2("Receipt No:", `RC-${String(fee.id).padStart(5, "0")}`, "Date:", new Date().toLocaleDateString("en-GB"), y); y -= 22;
  row2("Student Name:", fee.student.name, "Roll No:", fee.student.rollNo, y); y -= 22;
  row2("Class:", `${fee.student.className} - ${fee.student.section}`, "Month:", fee.month, y); y -= 30;

  hLine(y); y -= 24;
  const colLabel = MARGIN, colVal = width - MARGIN - 100;
  text("Description", colLabel, y, { bold: true, size: 9, color: rgb(0.45, 0.5, 0.58) });
  text("Amount (Rs.)", colVal, y, { bold: true, size: 9, color: rgb(0.45, 0.5, 0.58) });
  y -= 6; hLine(y); y -= 20;

  text(`Tuition / School Fee - ${fee.month}`, colLabel, y); text(Number(fee.amount).toLocaleString(), colVal, y); y -= 20;
  text("Amount Paid", colLabel, y); text(Number(fee.paid).toLocaleString(), colVal, y); y -= 20;
  const balance = Number(fee.amount) - Number(fee.paid);
  text("Balance Due", colLabel, y); text(balance.toLocaleString(), colVal, y); y -= 24;

  hLine(y); y -= 26;
  text("Status:", MARGIN, y, { bold: true, size: 12 });
  const statusColor = fee.status === "Paid" ? rgb(0.1, 0.55, 0.3) : fee.status === "Partial" ? rgb(0.75, 0.5, 0) : rgb(0.75, 0.15, 0.15);
  text(fee.status, MARGIN + 60, y, { bold: true, size: 12, color: statusColor });
  y -= 40;

  hLine(y - 30);
  text("Authorized Signature", width - MARGIN - 130, y - 45, { size: 9, color: rgb(0.5, 0.5, 0.5) });

  const bytes = await pdfDoc.save();
  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="FeeReceipt_${fee.student.rollNo}_${fee.month}.pdf"`,
    },
  });
}