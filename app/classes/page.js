import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin } from "../../lib/auth";
export default async function Page() {
  const canWrite = isAdmin(await getSession());
  return <CrudPage title="Classes" api="/api/classes" canWrite={canWrite} fields={[{key:"name",label:"Class Name"},{key:"section",label:"Section"},{key:"room",label:"Room",required:false}]} columns={[{key:"name",label:"Class"},{key:"section",label:"Section"},{key:"room",label:"Room"}]}/>;
}
