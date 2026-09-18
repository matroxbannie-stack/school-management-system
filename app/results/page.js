import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin, isTeacher } from "../../lib/auth";
export default async function Page() {
  const session = await getSession();
  const canWrite = isAdmin(session) || isTeacher(session);
  return <CrudPage title="Results" api="/api/results" canWrite={canWrite} fields={[{key:"studentId",label:"Student ID",type:"number"},{key:"exam",label:"Exam"},{key:"subject",label:"Subject"},{key:"marks",label:"Obtained Marks",type:"number"},{key:"total",label:"Total Marks",type:"number"},{key:"grade",label:"Grade"}]} columns={[{key:"studentId",label:"Student ID"},{key:"exam",label:"Exam"},{key:"subject",label:"Subject"},{key:"marks",label:"Marks"},{key:"total",label:"Total"},{key:"grade",label:"Grade"}]}/>;
}
