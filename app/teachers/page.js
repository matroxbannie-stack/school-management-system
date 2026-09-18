import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin } from "../../lib/auth";
export default async function Page() {
  const canWrite = isAdmin(await getSession());
  return <CrudPage title="Teachers" api="/api/teachers" canWrite={canWrite} fields={[{key:"name",label:"Full Name"},{key:"subject",label:"Subject"},{key:"qualification",label:"Qualification",required:false},{key:"phone",label:"Phone",required:false},{key:"email",label:"Email",type:"email",required:false},{key:"address",label:"Address",required:false},{key:"joiningDate",label:"Joining Date",type:"date",required:false}]} columns={[{key:"name",label:"Name"},{key:"subject",label:"Subject"},{key:"qualification",label:"Qualification"},{key:"phone",label:"Phone"},{key:"email",label:"Email"}]}/>;
}
