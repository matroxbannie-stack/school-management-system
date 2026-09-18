import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin } from "../../lib/auth";
export default async function Page() {
  const canWrite = isAdmin(await getSession());
  return <CrudPage title="Notices" api="/api/notices" canWrite={canWrite} fields={[{key:"title",label:"Title"},{key:"date",label:"Date",type:"date"},{key:"message",label:"Message",type:"textarea"}]} columns={[{key:"title",label:"Title"},{key:"date",label:"Date"},{key:"message",label:"Message"}]}/>;
}
