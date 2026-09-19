import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
export default async function Page() {
  const canWrite = isAdmin(await getSession());
  const teachers = await prisma.teacher.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, subject: true, salaries: { select: { amount: true, paid: true } } } });
  const teacherOptions = teachers.map((t) => ({ value: t.id, label: `${t.name} (${t.subject})` }));
  const summary = teachers
    .map((t) => {
      const total = t.salaries.reduce((sum, s) => sum + Number(s.amount), 0);
      const paid = t.salaries.reduce((sum, s) => sum + Number(s.paid), 0);
      return { id: t.id, name: t.name, subject: t.subject, total, paid, balance: total - paid };
    })
    .filter((t) => t.total > 0);

  return (
    <>
      <div className="panel" style={{ marginBottom: 20 }}>
        <h2>Salary Summary by Teacher</h2>
        {summary.length === 0 ? (
          <p className="muted">No salary records yet.</p>
        ) : (
          <div className="tableWrap">
            <table className="table">
              <thead><tr><th>Teacher</th><th>Total Salary</th><th>Paid</th><th>Balance Due</th></tr></thead>
              <tbody>
                {summary.map((t) => (
                  <tr key={t.id}>
                    <td>{t.name} <span className="muted" style={{ fontSize: 12 }}>({t.subject})</span></td>
                    <td>Rs. {t.total.toLocaleString()}</td>
                    <td>Rs. {t.paid.toLocaleString()}</td>
                    <td style={{ color: t.balance > 0 ? "#c02020" : "#1a9c53", fontWeight: 600 }}>Rs. {t.balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <CrudPage
        title="Teacher Salary"
        api="/api/salaries"
        canWrite={canWrite}
        fields={[{key:"teacherId",label:"Teacher",type:"select",options:teacherOptions},{key:"month",label:"Month"},{key:"amount",label:"Salary Amount",type:"number"},{key:"paid",label:"Paid Amount",type:"number"},{key:"status",label:"Status",type:"select",options:["Paid","Pending","Partial"]}]}
        columns={[{key:"teacherId",label:"Teacher ID"},{key:"month",label:"Month"},{key:"amount",label:"Amount"},{key:"paid",label:"Paid"},{key:"status",label:"Status"}]}
      />
    </>
  );
}