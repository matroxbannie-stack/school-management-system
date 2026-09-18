import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin, isTeacher } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
export default async function Page() {
  const session = await getSession();
  const canWrite = isAdmin(session) || isTeacher(session);
  const students = await prisma.student.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, rollNo: true, className: true, section: true } });
  const studentOptions = students.map((s) => ({ value: s.id, label: `${s.name} (Roll ${s.rollNo}, ${s.className}-${s.section})` }));
  return <CrudPage title="Results" api="/api/results" canWrite={canWrite} fields={[{key:"studentId",label:"Student",type:"select",options:studentOptions},{key:"exam",label:"Exam"},{key:"subject",label:"Subject"},{key:"marks",label:"Obtained Marks",type:"number"},{key:"total",label:"Total Marks",type:"number"},{key:"grade",label:"Grade"}]} columns={[{key:"studentId",label:"Student ID"},{key:"exam",label:"Exam"},{key:"subject",label:"Subject"},{key:"marks",label:"Marks"},{key:"total",label:"Total"},{key:"grade",label:"Grade"}]}/>;
}
