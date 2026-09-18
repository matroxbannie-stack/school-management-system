import CrudPage from "../../components/CrudPage";
import { getSession, isAdmin, isTeacher } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
export default async function Page() {
  const session = await getSession();
  const canWrite = isAdmin(session) || isTeacher(session);
  const students = await prisma.student.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, rollNo: true, className: true, section: true } });
  const studentOptions = students.map((s) => ({ value: s.id, label: `${s.name} (Roll ${s.rollNo}, ${s.className}-${s.section})` }));
  return <CrudPage title="Attendance" api="/api/attendance" canWrite={canWrite} fields={[{key:"studentId",label:"Student",type:"select",options:studentOptions},{key:"date",label:"Date",type:"date"},{key:"status",label:"Status",type:"select",options:["Present","Absent","Late","Leave"]}]} columns={[{key:"studentId",label:"Student ID"},{key:"date",label:"Date"},{key:"status",label:"Status"}]}/>;
}
