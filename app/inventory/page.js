import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin } from "../../lib/auth";
export default async function Page() {
  const canWrite = isAdmin(await getSession());
  return (
    <CrudPage
      title="Inventory"
      api="/api/inventory"
      canWrite={canWrite}
      fields={[{key:"name",label:"Item Name"},{key:"category",label:"Category",required:false},{key:"quantity",label:"Quantity in Stock",type:"number"},{key:"unit",label:"Unit (e.g. pcs, boxes)",required:false},{key:"lowStock",label:"Low Stock Alert Level",type:"number"}]}
      columns={[{key:"name",label:"Item Name"},{key:"category",label:"Category"},{key:"quantity",label:"Quantity"},{key:"unit",label:"Unit"},{key:"lowStock",label:"Alert Level"}]}
    />
  );
}
