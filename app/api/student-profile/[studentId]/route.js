import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/auth";

export async function GET(req, { params }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const studentId = Number((await params).studentId);
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      attendance: { orderBy: { date: "desc" } },
      fees: { orderBy: { dueDate: "asc" } },
      results: { orderBy: { id: "desc" } },
      parentAccount: true,
    },
  });
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });

  if (session.role === "PARENT" && student.parentId !== session.parentId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const present = student.attendance.filter((a) => a.status === "Present").length;
  const totalAttendance = student.attendance.length;
  const attendancePct = totalAttendance ? Math.round((present / totalAttendance) * 100) : null;

  const totalFee = student.fees.reduce((sum, f) => sum + Number(f.amount), 0);
  const paidFee = student.fees.reduce((sum, f) => sum + Number(f.paid), 0);

  const avgMarksPct = student.results.length
    ? Math.round((student.results.reduce((sum, r) => sum + Number(r.marks) / Number(r.total), 0) / student.results.length) * 100)
    : null;

  return Response.json({
    id: student.id,
    name: student.name,
    rollNo: student.rollNo,
    className: student.className,
    section: student.section,
    gender: student.gender,
    dob: student.dob,
    phone: student.phone,
    email: student.email,
    address: student.address,
    admissionDate: student.admissionDate,
    parent: student.parentAccount ? { name: student.parentAccount.name, phone: student.parentAccount.phone, email: student.parentAccount.email } : (student.parentName ? { name: student.parentName, phone: student.parentPhone } : null),
    attendance: { percent: attendancePct, present, total: totalAttendance, recent: student.attendance.slice(0, 10) },
    fees: { total: totalFee, paid: paidFee, balance: totalFee - paidFee, records: student.fees },
    results: { averagePercent: avgMarksPct, records: student.results },
  });
}