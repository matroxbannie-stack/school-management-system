import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin } from "../../lib/auth";
export default async function Page() {
  const canWrite = isAdmin(await getSession());
  return <CrudPage title="School Settings" api="/api/settings" canWrite={canWrite} fields={[{key:"schoolName",label:"School Name"},{key:"email",label:"Email",type:"email",required:false},{key:"phone",label:"Phone",required:false},{key:"address",label:"Address",required:false},{key:"website",label:"Website",required:false},{key:"logoUrl",label:"Logo URL",required:false}]} columns={[{key:"schoolName",label:"School Name"},{key:"email",label:"Email"},{key:"phone",label:"Phone"},{key:"address",label:"Address"},{key:"website",label:"Website"},{key:"logoUrl",label:"Logo URL"}]}/>;
}
