import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin, isTeacher } from "../../lib/auth";
export default async function Page() {
  const session = await getSession();
  const canWrite = isAdmin(session) || isTeacher(session);
  return <CrudPage title="Attendance" api="/api/attendance" canWrite={canWrite} fields={[{key:"studentId",label:"Student ID",type:"number"},{key:"date",label:"Date",type:"date"},{key:"status",label:"Status",type:"select",options:["Present","Absent","Late","Leave"]}]} columns={[{key:"studentId",label:"Student ID"},{key:"date",label:"Date"},{key:"status",label:"Status"}]}/>;
}
