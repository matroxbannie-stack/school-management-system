"use client";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#2563eb", "#60a5fa", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

export default function AnalyticsCharts({ attendanceTrend, feesTrend, classDistribution, examPerformance }) {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div className="panel">
        <h2>Attendance Trend (last 30 recorded days)</h2>
        {attendanceTrend.length === 0 ? <p className="muted">No attendance data yet.</p> : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="present" stroke="#10b981" name="Present" strokeWidth={2} />
              <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="panel">
        <h2>Fees Collection by Month</h2>
        {feesTrend.length === 0 ? <p className="muted">No fee data yet.</p> : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={feesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="paid" fill="#2563eb" name="Collected" radius={[6, 6, 0, 0]} />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="twoCol">
        <div className="panel">
          <h2>Students by Class</h2>
          {classDistribution.length === 0 ? <p className="muted">No students yet.</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={classDistribution} dataKey="value" nameKey="name" outerRadius={90} label>
                  {classDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="panel">
          <h2>Average Score by Exam</h2>
          {examPerformance.length === 0 ? <p className="muted">No results yet.</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={examPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="exam" tick={{ fontSize: 11 }} />
                <YAxis unit="%" />
                <Tooltip />
                <Bar dataKey="avgPct" fill="#8b5cf6" name="Avg %" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
