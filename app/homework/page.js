import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin, isTeacher } from "../../lib/auth";
export default async function Page() {
  const session = await getSession();
  const canWrite = isAdmin(session) || isTeacher(session);
  return (
    <CrudPage
      title="Homework"
      api="/api/homework"
      canWrite={canWrite}
      fields={[{key:"className",label:"Class"},{key:"section",label:"Section",required:false},{key:"subject",label:"Subject"},{key:"title",label:"Title"},{key:"description",label:"Description",type:"textarea",required:false},{key:"dueDate",label:"Due Date",type:"date",required:false}]}
      columns={[{key:"className",label:"Class"},{key:"section",label:"Section"},{key:"subject",label:"Subject"},{key:"title",label:"Title"},{key:"dueDate",label:"Due Date"}]}
    />
  );
}