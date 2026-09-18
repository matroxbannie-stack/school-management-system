import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin } from "../../lib/auth";
export default async function Page() {
  const canWrite = isAdmin(await getSession());
  return (
    <CrudPage
      title="Fees"
      api="/api/fees"
      canWrite={canWrite}
      extraActions={[{ label: "Receipt", hrefPrefix: "/api/fee-receipt/" }]}
      fields={[{key:"studentId",label:"Student ID",type:"number"},{key:"month",label:"Month"},{key:"amount",label:"Total Amount",type:"number"},{key:"paid",label:"Paid Amount",type:"number"},{key:"status",label:"Status",type:"select",options:["Paid","Pending","Partial"]},{key:"dueDate",label:"Due Date",type:"date",required:false}]}
      columns={[{key:"studentId",label:"Student ID"},{key:"month",label:"Month"},{key:"amount",label:"Amount"},{key:"paid",label:"Paid"},{key:"status",label:"Status"}]}
    />
  );
}
