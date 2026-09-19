"use client";
import { useEffect, useState } from "react";

export default function PeopleLookup() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);
  const [query, setQuery] = useState("");
  const [profile, setProfile] = useState(null);
  const [profileType, setProfileType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/students").then((r) => r.json()).then((d) => setStudents(Array.isArray(d) ? d : []));
    fetch("/api/teachers").then((r) => r.json()).then((d) => setTeachers(Array.isArray(d) ? d : []));
    fetch("/api/parents").then((r) => r.json()).then((d) => setParents(Array.isArray(d) ? d : []));
  }, []);

  const q = query.trim().toLowerCase();
  const matches = q
    ? [
        ...students.filter((s) => s.name.toLowerCase().includes(q)).map((s) => ({ ...s, _type: "Student" })),
        ...teachers.filter((t) => t.name.toLowerCase().includes(q)).map((t) => ({ ...t, _type: "Teacher" })),
        ...parents.filter((p) => p.name.toLowerCase().includes(q)).map((p) => ({ ...p, _type: "Parent" })),
      ].slice(0, 10)
    : [];

  async function openProfile(item) {
    setLoading(true); setError(""); setProfile(null); setProfileType(item._type);
    try {
      const url = item._type === "Student" ? `/api/student-profile/${item.id}` : item._type === "Teacher" ? `/api/teacher-profile/${item.id}` : `/api/parent-profile/${item.id}`;
      const r = await fetch(url);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed to load profile");
      setProfile(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="top"><div><h1>People Lookup</h1><div className="sub">Type any name - student, teacher, or parent - to see their full details instantly.</div></div></div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="field">
          <label>Name</label>
          <input
            autoFocus
            value={query}
            onChange={(e) => { setQuery(e.target.value); setProfile(null); }}
            placeholder="Start typing a name..."
          />
        </div>
        {matches.length > 0 && !profile && (
          <div style={{ marginTop: 10 }}>
            {matches.map((m) => (
              <div
                key={`${m._type}-${m.id}`}
                onClick={() => openProfile(m)}
                style={{ padding: "10px 14px", borderRadius: 8, cursor: "pointer", border: "1px solid #edf0f5", marginBottom: 6, display: "flex", justifyContent: "space-between" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f7fb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span>
                  <b>{m.name}</b>{" "}
                  <span className="muted">
                    {m._type === "Student" ? `- Roll ${m.rollNo}, ${m.className}-${m.section}` : m._type === "Teacher" ? `- ${m.subject}` : `- ${m.phone || ""}`}
                  </span>
                </span>
                <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{m._type}</span>
              </div>
            ))}
          </div>
        )}
        {q && matches.length === 0 && !profile && <p className="muted" style={{ marginTop: 10 }}>No one found matching "{query}".</p>}
      </div>

      {loading && <p className="muted">Loading profile...</p>}
      {error && <div className="loginError">{error}</div>}

      {profile && profileType === "Student" && (
        <div className="panel">
          <h2>{profile.name} <span className="muted" style={{ fontWeight: 400, fontSize: 14 }}>(Student - Roll {profile.rollNo}, {profile.className}-{profile.section})</span></h2>

          <div className="cards" style={{ marginTop: 14 }}>
            <div className="card"><div className="label">Attendance</div><div className="num">{profile.attendance.percent !== null ? `${profile.attendance.percent}%` : "N/A"}</div></div>
            <div className="card"><div className="label">Total Fee</div><div className="num">Rs. {profile.fees.total.toLocaleString()}</div></div>
            <div className="card"><div className="label">Fee Balance</div><div className="num" style={{ color: profile.fees.balance > 0 ? "#c02020" : "#1a9c53" }}>Rs. {profile.fees.balance.toLocaleString()}</div></div>
            <div className="card"><div className="label">Avg. Result</div><div className="num">{profile.results.averagePercent !== null ? `${profile.results.averagePercent}%` : "N/A"}</div></div>
          </div>

          <div className="twoCol" style={{ marginTop: 20 }}>
            <div>
              <h3>Personal Details</h3>
              <p className="muted" style={{ lineHeight: 1.9 }}>
                Gender: {profile.gender || "-"}<br />
                Date of Birth: {profile.dob || "-"}<br />
                Phone: {profile.phone || "-"}<br />
                Email: {profile.email || "-"}<br />
                Address: {profile.address || "-"}<br />
                Admission Date: {profile.admissionDate || "-"}
              </p>
            </div>
            <div>
              <h3>Parent / Guardian</h3>
              {profile.parent ? (
                <p className="muted" style={{ lineHeight: 1.9 }}>
                  Name: {profile.parent.name || "-"}<br />
                  Phone: {profile.parent.phone || "-"}<br />
                  Email: {profile.parent.email || "-"}
                </p>
              ) : <p className="muted">No parent linked.</p>}
            </div>
          </div>

          <h3 style={{ marginTop: 20 }}>Recent Attendance</h3>
          {profile.attendance.recent.length === 0 ? <p className="muted">No attendance records.</p> : (
            <div className="tableWrap">
              <table className="table">
                <thead><tr><th>Date</th><th>Status</th></tr></thead>
                <tbody>{profile.attendance.recent.map((a) => <tr key={a.id}><td>{a.date}</td><td>{a.status}</td></tr>)}</tbody>
              </table>
            </div>
          )}

          <h3 style={{ marginTop: 20 }}>Fee Records</h3>
          {profile.fees.records.length === 0 ? <p className="muted">No fee records.</p> : (
            <div className="tableWrap">
              <table className="table">
                <thead><tr><th>Month</th><th>Amount</th><th>Paid</th><th>Status</th></tr></thead>
                <tbody>{profile.fees.records.map((f) => <tr key={f.id}><td>{f.month}</td><td>Rs. {Number(f.amount).toLocaleString()}</td><td>Rs. {Number(f.paid).toLocaleString()}</td><td>{f.status}</td></tr>)}</tbody>
              </table>
            </div>
          )}

          <h3 style={{ marginTop: 20 }}>Results</h3>
          {profile.results.records.length === 0 ? <p className="muted">No result records.</p> : (
            <div className="tableWrap">
              <table className="table">
                <thead><tr><th>Exam</th><th>Subject</th><th>Marks</th><th>Grade</th></tr></thead>
                <tbody>{profile.results.records.map((r) => <tr key={r.id}><td>{r.exam}</td><td>{r.subject}</td><td>{r.marks}/{r.total}</td><td>{r.grade}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {profile && profileType === "Teacher" && (
        <div className="panel">
          <h2>{profile.name} <span className="muted" style={{ fontWeight: 400, fontSize: 14 }}>(Teacher)</span></h2>

          <div className="cards" style={{ marginTop: 14 }}>
            <div className="card"><div className="label">Total Salary</div><div className="num">Rs. {profile.salary.total.toLocaleString()}</div></div>
            <div className="card"><div className="label">Paid</div><div className="num">Rs. {profile.salary.paid.toLocaleString()}</div></div>
            <div className="card"><div className="label">Balance Due</div><div className="num" style={{ color: profile.salary.balance > 0 ? "#c02020" : "#1a9c53" }}>Rs. {profile.salary.balance.toLocaleString()}</div></div>
          </div>

          <div className="twoCol" style={{ marginTop: 20 }}>
            <div>
              <h3>Personal Details</h3>
              <p className="muted" style={{ lineHeight: 1.9 }}>
                Main Subject: {profile.subject || "-"}<br />
                Qualification: {profile.qualification || "-"}<br />
                Phone: {profile.phone || "-"}<br />
                Email: {profile.email || "-"}<br />
                Address: {profile.address || "-"}<br />
                Joining Date: {profile.joiningDate || "-"}
              </p>
            </div>
            <div>
              <h3>Teaching Assignments</h3>
              <p className="muted" style={{ lineHeight: 1.9 }}>
                Class Teacher for: {profile.classesTaught.length ? profile.classesTaught.join(", ") : "-"}<br />
                Subjects Taught: {profile.subjectsTaught.length ? profile.subjectsTaught.join(", ") : "-"}
              </p>
            </div>
          </div>

          <h3 style={{ marginTop: 20 }}>Salary Records</h3>
          {profile.salary.records.length === 0 ? <p className="muted">No salary records.</p> : (
            <div className="tableWrap">
              <table className="table">
                <thead><tr><th>Month</th><th>Amount</th><th>Paid</th><th>Status</th></tr></thead>
                <tbody>{profile.salary.records.map((s) => <tr key={s.id}><td>{s.month}</td><td>Rs. {Number(s.amount).toLocaleString()}</td><td>Rs. {Number(s.paid).toLocaleString()}</td><td>{s.status}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {profile && profileType === "Parent" && (
        <div className="panel">
          <h2>{profile.name} <span className="muted" style={{ fontWeight: 400, fontSize: 14 }}>(Parent / Guardian)</span></h2>
          <div className="twoCol" style={{ marginTop: 14 }}>
            <div>
              <h3>Contact Details</h3>
              <p className="muted" style={{ lineHeight: 1.9 }}>
                Phone: {profile.phone || "-"}<br />
                Email: {profile.email || "-"}<br />
                Address: {profile.address || "-"}<br />
                Occupation: {profile.occupation || "-"}
              </p>
            </div>
            <div>
              <h3>Children</h3>
              {profile.children.length === 0 ? <p className="muted">No linked students.</p> : (
                <div className="tableWrap">
                  <table className="table">
                    <thead><tr><th>Name</th><th>Class</th><th>Attendance</th><th>Fee Balance</th></tr></thead>
                    <tbody>
                      {profile.children.map((c) => (
                        <tr key={c.id}>
                          <td>{c.name}</td>
                          <td>{c.className}-{c.section}</td>
                          <td>{c.attendancePercent !== null ? `${c.attendancePercent}%` : "N/A"}</td>
                          <td style={{ color: c.feeBalance > 0 ? "#c02020" : "#1a9c53" }}>Rs. {c.feeBalance.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}