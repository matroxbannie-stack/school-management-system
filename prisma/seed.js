import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const p = new PrismaClient();

async function main() {
  const student = await p.student
    .create({ data: { name: "Ali Khan", rollNo: "1001", className: "10th", section: "A", phone: "03001234567", parentName: "Ahmed Khan", parentPhone: "03007654321" } })
    .catch(() => null);
  const teacher = await p.teacher
    .create({ data: { name: "Sara Ahmed", subject: "Mathematics", qualification: "M.Ed", phone: "03001112222", email: "sara.teacher@school.test" } })
    .catch(() => null);
  await p.classRoom.create({ data: { name: "10th", section: "A", room: "101" } }).catch(() => {});
  await p.subject.create({ data: { name: "Mathematics", code: "MATH" } }).catch(() => {});
  const parent = await p.parent
    .create({ data: { name: "Ahmed Khan", phone: "03007654321", email: "ahmed.parent@school.test", occupation: "Business" } })
    .catch(() => null);

  if (student && parent) {
    await p.student.update({ where: { id: student.id }, data: { parentId: parent.id } }).catch(() => {});
  }
  if (student) {
    await p.result.createMany({ data: [
      { studentId: student.id, exam: "Mid Term", subject: "Mathematics", marks: 82, total: 100, grade: "A" },
      { studentId: student.id, exam: "Mid Term", subject: "English", marks: 76, total: 100, grade: "B+" },
      { studentId: student.id, exam: "Final Term", subject: "Mathematics", marks: 91, total: 100, grade: "A+" },
    ] }).catch(() => {});
    await p.fee.create({ data: { studentId: student.id, month: "September", amount: 5000, paid: 5000, status: "Paid" } }).catch(() => {});
    await p.fee.create({ data: { studentId: student.id, month: "October", amount: 5000, paid: 0, status: "Pending" } }).catch(() => {});
    await p.attendance.createMany({ data: [
      { studentId: student.id, date: "2026-09-01", status: "Present" },
      { studentId: student.id, date: "2026-09-02", status: "Present" },
      { studentId: student.id, date: "2026-09-03", status: "Absent" },
    ] }).catch(() => {});
  }
  await p.setting.create({ data: { schoolName: "EduManage Pro School", email: "info@school.test", phone: "0300-0000000", address: "Main Campus" } }).catch(() => {});

  // Login accounts: one per role. Passwords are hashed with bcrypt before storage.
  const users = [
    { username: "admin", password: "admin123", role: "ADMIN", name: "System Admin" },
    teacher ? { username: "sara.teacher", password: "teacher123", role: "TEACHER", name: teacher.name, teacherId: teacher.id } : null,
    parent ? { username: "ahmed.parent", password: "parent123", role: "PARENT", name: parent.name, parentId: parent.id } : null,
  ].filter(Boolean);

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await p.user.create({ data: { username: u.username, password: hash, role: u.role, name: u.name, teacherId: u.teacherId, parentId: u.parentId } }).catch(() => {});
  }

  console.log("Seeded demo data + login accounts:");
  console.log("  Admin   -> admin / admin123");
  console.log("  Teacher -> sara.teacher / teacher123");
  console.log("  Parent  -> ahmed.parent / parent123");
}

main().finally(() => p.$disconnect());
