import { prisma } from "../../../../lib/prisma";
import { getSession } from "../../../../lib/auth";

export async function GET(req, { params }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated" }, { status: 401 });
  if (session.role === "PARENT" && session.parentId !== Number((await params).parentId)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const parentId = Number((await params).parentId);
  const parent = await prisma.parent.findUnique({
    where: { id: parentId },
    include: { children: { include: { attendance: true, fees: true, results: true } } },
  });
  if (!parent) return Response.json({ error: "Parent not found" }, { status: 404 });

  const children = parent.children.map((c) => {
    const present = c.attendance.filter((a) => a.status === "Present").length;
    const total = c.attendance.length;
    const totalFee = c.fees.reduce((sum, f) => sum + Number(f.amount), 0);
    const paidFee = c.fees.reduce((sum, f) => sum + Number(f.paid), 0);
    return {
      id: c.id,
      name: c.name,
      rollNo: c.rollNo,
      className: c.className,
      section: c.section,
      attendancePercent: total ? Math.round((present / total) * 100) : null,
      feeBalance: totalFee - paidFee,
      resultsCount: c.results.length,
    };
  });

  return Response.json({
    id: parent.id,
    name: parent.name,
    phone: parent.phone,
    email: parent.email,
    address: parent.address,
    occupation: parent.occupation,
    children,
  });
}