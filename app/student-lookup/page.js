"use client";
import { useEffect, useState } from "react";

export default function StudentLookup() {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/students").then((r) => r.json()).then((data) => setStudents(Array.isArray(data) ? data : []));
  }, []);

  const matches = query.trim()
    ? students.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8)
    : [];

  async function openProfile(id) {
    setLoading(true); setError(""); setProfile(null);
    try {
      const r = await fetch(`/api/student-profile/${id}`);
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
      <div className="top"><div><h1>Student Lookup</h1><div className="sub">Type a student's name to see their full profile - attendance, fees, results, and parent details.</div></div></div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <div className="field">
          <label>Student Name</label>
          <input
            autoFocus
            value={query}
            onChange={(e) => { setQuery(e.target.value); setProfile(null); }}
            placeholder="Start typing a name..."
          />
        </div>
        {matches.length > 0 && !profile && (
          <div style={{ marginTop: 10 }}>
            {matches.map((s) => (
              <div
                key={s.id}
                onClick={() => openProfile(s.id)}
                style={{ padding: "10px 14px", borderRadius: 8, cursor: "pointer", border: "1px solid #edf0f5", marginBottom: 6 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f7fb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <b>{s.name}</b> <span className="muted">- Roll {s.rollNo}, {s.className}-{s.section}</span>
              </div>
            ))}
          </div>
        )}
        {query.trim() && matches.length === 0 && !profile && <p className="muted" style={{ marginTop: 10 }}>No student found matching "{query}".</p>}
      </div>

      {loading && <p className="muted">Loading profile...</p>}
      {error && <div className="loginError">{error}</div>}

      {profile && (
        <div className="panel">
          <h2>{profile.name} <span className="muted" style={{ fontWeight: 400, fontSize: 14 }}>(Roll {profile.rollNo}, {profile.className}-{profile.section})</span></h2>

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
    </>
  );
}