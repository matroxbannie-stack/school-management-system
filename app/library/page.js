import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin } from "../../lib/auth";
export default async function Page() {
  const canWrite = isAdmin(await getSession());
  return <CrudPage title="Library" api="/api/library" canWrite={canWrite} fields={[{key:"title",label:"Book Title"},{key:"author",label:"Author"},{key:"isbn",label:"ISBN",required:false},{key:"category",label:"Category",required:false},{key:"quantity",label:"Quantity",type:"number"},{key:"available",label:"Available",type:"number"}]} columns={[{key:"title",label:"Book Title"},{key:"author",label:"Author"},{key:"isbn",label:"ISBN"},{key:"category",label:"Category"},{key:"quantity",label:"Quantity"},{key:"available",label:"Available"}]}/>;
}
