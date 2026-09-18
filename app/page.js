import { prisma } from "../lib/prisma";
import { getSession } from "../lib/auth";
export const dynamic = "force-dynamic";

async function AdminDashboard() {
  const [s, t, c, f] = await Promise.all([
    prisma.student.count(), prisma.teacher.count(), prisma.classRoom.count(),
    prisma.fee.aggregate({ _sum: { amount: true, paid: true } }),
  ]);
  return (
    <>
      <div className="cards">
        <div className="card"><div className="label">Total Students</div><div className="num">{s}</div></div>
        <div className="card"><div className="label">Teachers</div><div className="num">{t}</div></div>
        <div className="card"><div className="label">Classes</div><div className="num">{c}</div></div>
        <div className="card"><div className="label">Fee Collected</div><div className="num">Rs. {Number(f._sum.paid || 0).toLocaleString()}</div></div>
      </div>
      <div className="panel">
        <h2>EduManage Pro</h2>
        <p className="muted">All major modules are connected to the SQLite database. Use the sidebar to add, edit and delete records. Open <b>Analytics</b> for attendance & fee charts.</p>
      </div>
    </>
  );
}

async function TeacherDashboard() {
  const [s, c] = await Promise.all([prisma.student.count(), prisma.classRoom.count()]);
  const recentAttendance = await prisma.attendance.count({ where: { status: "Absent" } });
  return (
    <>
      <div className="cards">
        <div className="card"><div className="label">Total Students</div><div className="num">{s}</div></div>
        <div className="card"><div className="label">Classes</div><div className="num">{c}</div></div>
        <div className="card"><div className="label">Absences Logged</div><div className="num">{recentAttendance}</div></div>
      </div>
      <div className="panel">
        <h2>Welcome back</h2>
        <p className="muted">Mark attendance and enter results from the sidebar. Check <b>Analytics</b> for class-wide attendance & performance trends.</p>
      </div>
    </>
  );
}

async function ParentDashboard(session) {
  const children = session.parentId
    ? await prisma.student.findMany({ where: { parentId: session.parentId }, include: { fees: true, attendance: true, results: true } })
    : [];

  return (
    <div className="panel">
      <h2>Your Children</h2>
      {children.length === 0 ? (
        <p className="muted">Koi student is account se link nahi hai. School admin se rabta karein.</p>
      ) : (
        children.map((child) => {
          const present = child.attendance.filter((a) => a.status === "Present").length;
          const total = child.attendance.length;
          const pct = total ? Math.round((present / total) * 100) : null;
          const pendingFee = child.fees.find((f) => f.status !== "Paid");
          return (
            <div key={child.id} style={{ border: "1px solid #edf0f5", borderRadius: 10, padding: 16, marginBottom: 14 }}>
              <h3 style={{ margin: "0 0 8px" }}>{child.name} <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}>({child.className}-{child.section}, Roll #{child.rollNo})</span></h3>
              <p className="muted" style={{ margin: "0 0 10px" }}>
                Attendance: {pct !== null ? `${pct}% (${present}/${total} days)` : "No records yet"}
                {" · "}
                Fee status: {pendingFee ? `${pendingFee.status} for ${pendingFee.month}` : (child.fees.length ? "Up to date" : "No fee records")}
                {" · "}
                Results recorded: {child.results.length}
              </p>
              <div className="actions">
                <a className="iconbtn" href={`/api/report-card/${child.id}`} target="_blank" rel="noreferrer">📄 Report Card</a>
                {pendingFee && <a className="iconbtn" href={`/api/fee-receipt/${pendingFee.id}`} target="_blank" rel="noreferrer">🧾 Latest Fee Receipt</a>}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default async function Home() {
  const session = await getSession();
  const role = session?.role || "ADMIN";
  return (
    <>
      <div className="top"><div><h1>Dashboard</h1><div className="sub">School overview & administration</div></div></div>
      {role === "PARENT" ? await ParentDashboard(session) : role === "TEACHER" ? await TeacherDashboard() : await AdminDashboard()}
    </>
  );
}
