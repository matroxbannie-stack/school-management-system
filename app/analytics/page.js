import { prisma } from "../../lib/prisma";
import AnalyticsCharts from "../../components/AnalyticsCharts";
export const dynamic = "force-dynamic";

export default async function Page() {
  const [attendance, fees, students, results] = await Promise.all([
    prisma.attendance.findMany(),
    prisma.fee.findMany(),
    prisma.student.findMany({ select: { className: true } }),
    prisma.result.findMany(),
  ]);

  const attByDate = {};
  attendance.forEach((a) => {
    attByDate[a.date] = attByDate[a.date] || { present: 0, absent: 0, other: 0 };
    if (a.status === "Present") attByDate[a.date].present++;
    else if (a.status === "Absent") attByDate[a.date].absent++;
    else attByDate[a.date].other++;
  });
  const attendanceTrend = Object.entries(attByDate).sort(([a], [b]) => a.localeCompare(b)).slice(-30).map(([date, v]) => ({ date, ...v }));

  const feeByMonth = {};
  fees.forEach((f) => {
    feeByMonth[f.month] = feeByMonth[f.month] || { amount: 0, paid: 0 };
    feeByMonth[f.month].amount += f.amount;
    feeByMonth[f.month].paid += f.paid;
  });
  const feesTrend = Object.entries(feeByMonth).map(([month, v]) => ({ month, paid: v.paid, pending: Math.max(v.amount - v.paid, 0) }));

  const classCount = {};
  students.forEach((s) => { classCount[s.className] = (classCount[s.className] || 0) + 1; });
  const classDistribution = Object.entries(classCount).map(([name, value]) => ({ name, value }));

  const examMap = {};
  results.forEach((r) => {
    examMap[r.exam] = examMap[r.exam] || { obtained: 0, total: 0 };
    examMap[r.exam].obtained += r.marks;
    examMap[r.exam].total += r.total;
  });
  const examPerformance = Object.entries(examMap).map(([exam, v]) => ({ exam, avgPct: v.total ? Math.round((v.obtained / v.total) * 100) : 0 }));

  return (
    <>
      <div className="top"><div><h1>Analytics</h1><div className="sub">Attendance & fees insights across the school</div></div></div>
      <AnalyticsCharts attendanceTrend={attendanceTrend} feesTrend={feesTrend} classDistribution={classDistribution} examPerformance={examPerformance} />
    </>
  );
}
