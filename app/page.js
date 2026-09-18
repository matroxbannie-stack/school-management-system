import { prisma } from "../lib/prisma";
import { getSession } from "../lib/auth";
export const dynamic = "force-dynamic";

async function AdminDashboard() {
  const [s, t, c, f] = await Promise.all([
    prisma.student.count(), prisma.teacher.count(), prisma.classRoom.count(),
    prisma.fee.aggregate({ _sum: { amount: true, paid: true } }),
  ]);
  const pendingFees = await prisma.fee.findMany({
    where: { status: { not: "Paid" } },
    include: { student: true },
    orderBy: { dueDate: "asc" },
  });
  const lowStockItems = await prisma.inventoryItem.findMany({ orderBy: { quantity: "asc" } }).then((items) => items.filter((i) => i.quantity <= i.lowStock));
  const totalPending = pendingFees.reduce((sum, fee) => sum + (Number(fee.amount) - Number(fee.paid)), 0);

  return (
    <>
      <div className="cards">
        <div className="card"><div className="label">Total Students</div><div className="num">{s}</div></div>
        <div className="card"><div className="label">Teachers</div><div className="num">{t}</div></div>
        <div className="card"><div className="label">Classes</div><div className="num">{c}</div></div>
        <div className="card"><div className="label">Fee Collected</div><div className="num">Rs. {Number(f._sum.paid || 0).toLocaleString()}</div></div>
      </div>

      <div className="twoCol" style={{ marginTop: 20 }}>
        <div className="panel">
          <h2>⚠️ Pending Fees {pendingFees.length > 0 && <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}>({pendingFees.length} students, Rs. {totalPending.toLocaleString()} total)</span>}</h2>
          {pendingFees.length === 0 ? (
            <p className="muted">No pending fees. Everyone is paid up. 🎉</p>
          ) : (
            <div className="tableWrap">
              <table className="table">
                <thead><tr><th>Student</th><th>Month</th><th>Balance Due</th><th>Status</th></tr></thead>
                <tbody>
                  {pendingFees.slice(0, 8).map((fee) => (
                    <tr key={fee.id}>
                      <td>{fee.student?.name || "-"}{fee.student ? ` (${fee.student.className}-${fee.student.section})` : ""}</td>
                      <td>{fee.month}</td>
                      <td>Rs. {(Number(fee.amount) - Number(fee.paid)).toLocaleString()}</td>
                      <td>{fee.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pendingFees.length > 8 && <p className="muted" style={{ marginTop: 8 }}>+{pendingFees.length - 8} more - see the Fees page for the full list.</p>}
            </div>
          )}
        </div>

        <div className="panel">
          <h2>📦 Low Stock Items {lowStockItems.length > 0 && <span className="muted" style={{ fontWeight: 400, fontSize: 13 }}>({lowStockItems.length})</span>}</h2>
          {lowStockItems.length === 0 ? (
            <p className="muted">All inventory items are sufficiently stocked.</p>
          ) : (
            <div className="tableWrap">
              <table className="table">
                <thead><tr><th>Item</th><th>Quantity Left</th><th>Alert Level</th></tr></thead>
                <tbody>
                  {lowStockItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td style={{ color: item.quantity === 0 ? "#c02020" : "#b17a00", fontWeight: 600 }}>{item.quantity} {item.unit || ""}</td>
                      <td>{item.lowStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <h2>Quick Actions</h2>
        <div className="quickLinks">
          <a className="quickLink" href="/students"><span className="qi">🧑‍🎓</span>Students</a>
          <a className="quickLink" href="/teachers"><span className="qi">🧑‍🏫</span>Teachers</a>
          <a className="quickLink" href="/classes"><span className="qi">🏫</span>Classes</a>
          <a className="quickLink" href="/subjects"><span className="qi">📚</span>Subjects</a>
          <a className="quickLink" href="/attendance"><span className="qi">🗓️</span>Attendance</a>
          <a className="quickLink" href="/fees"><span className="qi">💳</span>Fees</a>
          <a className="quickLink" href="/results"><span className="qi">📝</span>Results</a>
          <a className="quickLink" href="/timetable"><span className="qi">⏰</span>Timetable</a>
          <a className="quickLink" href="/library"><span className="qi">📖</span>Library</a>
          <a className="quickLink" href="/inventory"><span className="qi">📦</span>Inventory</a>
          <a className="quickLink" href="/transport"><span className="qi">🚌</span>Transport</a>
          <a className="quickLink" href="/notices"><span className="qi">📌</span>Notices</a>
          <a className="quickLink" href="/announcements"><span className="qi">📣</span>Announcements</a>
          <a className="quickLink" href="/parents"><span className="qi">👪</span>Parents</a>
          <a className="quickLink" href="/users"><span className="qi">🔑</span>Login Accounts</a>
          <a className="quickLink" href="/analytics"><span className="qi">📊</span>Analytics</a>
          <a className="quickLink" href="/settings"><span className="qi">⚙️</span>Settings</a>
        </div>
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
        <p className="muted">Mark attendance and enter results from the sidebar. Check <b>Analytics</b> for class-wide attendance and performance trends.</p>
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
        <p className="muted">No student is linked to this account. Please contact the school admin.</p>
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
                {" - "}
                Fee status: {pendingFee ? `${pendingFee.status} for ${pendingFee.month}` : (child.fees.length ? "Up to date" : "No fee records")}
                {" - "}
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
      <div className="top"><div><h1>Dashboard</h1><div className="sub">School overview and administration</div></div></div>
      {role === "PARENT" ? await ParentDashboard(session) : role === "TEACHER" ? await TeacherDashboard() : await AdminDashboard()}
    </>
  );
}
