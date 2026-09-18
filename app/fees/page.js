import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
export default async function Page() {
  const canWrite = isAdmin(await getSession());
  const students = await prisma.student.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, rollNo: true, className: true, section: true, fees: { select: { amount: true, paid: true } } } });
  const studentOptions = students.map((s) => ({ value: s.id, label: `${s.name} (Roll ${s.rollNo}, ${s.className}-${s.section})` }));
  const summary = students
    .map((s) => {
      const total = s.fees.reduce((sum, f) => sum + Number(f.amount), 0);
      const paid = s.fees.reduce((sum, f) => sum + Number(f.paid), 0);
      return { id: s.id, name: s.name, className: s.className, section: s.section, total, paid, balance: total - paid };
    })
    .filter((s) => s.total > 0);

  return (
    <>
      <div className="panel" style={{ marginBottom: 20 }}>
        <h2>Fee Summary by Student</h2>
        {summary.length === 0 ? (
          <p className="muted">No fee records yet.</p>
        ) : (
          <div className="tableWrap">
            <table className="table">
              <thead><tr><th>Student</th><th>Total Fee</th><th>Paid</th><th>Balance Due</th></tr></thead>
              <tbody>
                {summary.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name} <span className="muted" style={{ fontSize: 12 }}>({s.className}-{s.section})</span></td>
                    <td>Rs. {s.total.toLocaleString()}</td>
                    <td>Rs. {s.paid.toLocaleString()}</td>
                    <td style={{ color: s.balance > 0 ? "#c02020" : "#1a9c53", fontWeight: 600 }}>Rs. {s.balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <CrudPage
        title="Fees"
        api="/api/fees"
        canWrite={canWrite}
        extraActions={[{ label: "Receipt", hrefPrefix: "/api/fee-receipt/" }]}
        fields={[{key:"studentId",label:"Student",type:"select",options:studentOptions},{key:"month",label:"Month"},{key:"amount",label:"Total Amount",type:"number"},{key:"paid",label:"Paid Amount",type:"number"},{key:"status",label:"Status",type:"select",options:["Paid","Pending","Partial"]},{key:"dueDate",label:"Due Date",type:"date",required:false}]}
        columns={[{key:"studentId",label:"Student ID"},{key:"month",label:"Month"},{key:"amount",label:"Amount"},{key:"paid",label:"Paid"},{key:"status",label:"Status"}]}
      />
    </>
  );
}
