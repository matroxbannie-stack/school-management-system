import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin } from "../../lib/auth";
export default async function Page() {
  const canWrite = isAdmin(await getSession());
  return (
    <CrudPage
      title="Exam Schedule"
      api="/api/examSchedule"
      canWrite={canWrite}
      fields={[{key:"examName",label:"Exam Name"},{key:"className",label:"Class"},{key:"section",label:"Section",required:false},{key:"subject",label:"Subject"},{key:"date",label:"Date",type:"date"},{key:"startTime",label:"Start Time"},{key:"endTime",label:"End Time"},{key:"room",label:"Room",required:false}]}
      columns={[{key:"examName",label:"Exam"},{key:"className",label:"Class"},{key:"subject",label:"Subject"},{key:"date",label:"Date"},{key:"startTime",label:"Start"},{key:"endTime",label:"End"}]}
    />
  );
}