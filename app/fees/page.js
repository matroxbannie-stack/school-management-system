import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
export default async function Page() {
  const canWrite = isAdmin(await getSession());
  const students = await prisma.student.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, rollNo: true, className: true, section: true } });
  const studentOptions = students.map((s) => ({ value: s.id, label: `${s.name} (Roll ${s.rollNo}, ${s.className}-${s.section})` }));
  return (
    <CrudPage
      title="Fees"
      api="/api/fees"
      canWrite={canWrite}
      extraActions={[{ label: "Receipt", hrefPrefix: "/api/fee-receipt/" }]}
      fields={[{key:"studentId",label:"Student",type:"select",options:studentOptions},{key:"month",label:"Month"},{key:"amount",label:"Total Amount",type:"number"},{key:"paid",label:"Paid Amount",type:"number"},{key:"status",label:"Status",type:"select",options:["Paid","Pending","Partial"]},{key:"dueDate",label:"Due Date",type:"date",required:false}]}
      columns={[{key:"studentId",label:"Student ID"},{key:"month",label:"Month"},{key:"amount",label:"Amount"},{key:"paid",label:"Paid"},{key:"status",label:"Status"}]}
    />
  );
}
