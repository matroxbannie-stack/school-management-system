import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin } from "../../lib/auth";
export default async function Page() {
  const canWrite = isAdmin(await getSession());
  return <CrudPage title="Parents / Guardians" api="/api/parents" canWrite={canWrite} fields={[{key:"name",label:"Name"},{key:"phone",label:"Phone"},{key:"email",label:"Email",type:"email",required:false},{key:"address",label:"Address",required:false},{key:"occupation",label:"Occupation",required:false}]} columns={[{key:"id",label:"Parent ID"},{key:"name",label:"Name"},{key:"phone",label:"Phone"},{key:"email",label:"Email"},{key:"address",label:"Address"},{key:"occupation",label:"Occupation"}]}/>;
}
