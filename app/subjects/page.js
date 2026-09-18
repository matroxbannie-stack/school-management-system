import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin } from "../../lib/auth";
export default async function Page() {
  const canWrite = isAdmin(await getSession());
  return <CrudPage title="Subjects" api="/api/subjects" canWrite={canWrite} fields={[{key:"name",label:"Subject Name"},{key:"code",label:"Subject Code"}]} columns={[{key:"name",label:"Subject"},{key:"code",label:"Code"}]}/>;
}
