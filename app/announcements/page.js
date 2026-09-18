import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin } from "../../lib/auth";
export default async function Page() {
  const canWrite = isAdmin(await getSession());
  return <CrudPage title="Announcements" api="/api/announcements" canWrite={canWrite} fields={[{key:"title",label:"Title"},{key:"message",label:"Message",type:"textarea"},{key:"date",label:"Date",type:"date"},{key:"priority",label:"Priority",type:"select",options:["Normal","Important","Urgent"]}]} columns={[{key:"title",label:"Title"},{key:"message",label:"Message"},{key:"date",label:"Date"},{key:"priority",label:"Priority"}]}/>;
}
