import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/auth";

export async function GET(req, { params }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated" }, { status: 401 });
  if (session.role === "PARENT") return Response.json({ error: "Forbidden" }, { status: 403 });

  const teacherId = Number((await params).teacherId);
  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId }, include: { salaries: true } });
  if (!teacher) return Response.json({ error: "Teacher not found" }, { status: 404 });

  const totalSalary = teacher.salaries.reduce((sum, s) => sum + Number(s.amount), 0);
  const paidSalary = teacher.salaries.reduce((sum, s) => sum + Number(s.paid), 0);

  const [classesTaught, subjectsTaught] = await Promise.all([
    prisma.classRoom.findMany({ where: { classTeacher: teacher.name } }),
    prisma.subject.findMany({ where: { teacher: teacher.name } }),
  ]);

  return Response.json({
    id: teacher.id,
    name: teacher.name,
    subject: teacher.subject,
    qualification: teacher.qualification,
    phone: teacher.phone,
    email: teacher.email,
    address: teacher.address,
    joiningDate: teacher.joiningDate,
    classesTaught: classesTaught.map((c) => `${c.name}-${c.section}`),
    subjectsTaught: subjectsTaught.map((s) => `${s.name} (${s.className || "-"})`),
    salary: { total: totalSalary, paid: paidSalary, balance: totalSalary - paidSalary, records: teacher.salaries },
  });
}