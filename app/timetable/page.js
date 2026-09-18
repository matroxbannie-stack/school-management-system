import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin } from "../../lib/auth";
export default async function Page() {
  const canWrite = isAdmin(await getSession());
  return <CrudPage title="Timetable" api="/api/timetable" canWrite={canWrite} fields={[{key:"day",label:"Day",type:"select",options:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]},{key:"className",label:"Class"},{key:"subject",label:"Subject"},{key:"teacher",label:"Teacher"},{key:"startTime",label:"Start Time",type:"time"},{key:"endTime",label:"End Time",type:"time"}]} columns={[{key:"day",label:"Day"},{key:"className",label:"Class"},{key:"subject",label:"Subject"},{key:"teacher",label:"Teacher"},{key:"startTime",label:"Start"},{key:"endTime",label:"End"}]}/>;
}
