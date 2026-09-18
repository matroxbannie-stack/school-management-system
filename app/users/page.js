"use client";
import { useEffect, useState } from "react";

const ROLES = ["ADMIN", "TEACHER", "PARENT"];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);
  const [form, setForm] = useState({ username: "", password: "", role: "TEACHER", name: "", teacherId: "", parentId: "" });
  const [edit, setEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [u, t, p] = await Promise.all([
        fetch("/api/users").then((r) => r.json()),
        fetch("/api/teachers").then((r) => r.json()),
        fetch("/api/parents").then((r) => r.json()),
      ]);
      setUsers(Array.isArray(u) ? u : []);
      setTeachers(Array.isArray(t) ? t : []);
      setParents(Array.isArray(p) ? p : []);
    } catch (e) {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function change(k, v) { setForm({ ...form, [k]: v }); }

  async function save(e) {
    e.preventDefault();
    setError("");
    const body = { ...form, id: edit };
    if (!edit && !body.password) { setError("Password is required for a new account"); return; }
    const r = await fetch("/api/users", { method: edit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await r.json().catch(() => ({}));
    if (r.ok) { setForm({ username: "", password: "", role: "TEACHER", name: "", teacherId: "", parentId: "" }); setEdit(null); load(); }
    else setError(data.error || "Save failed");
  }

  async function del(id) {
    if (!confirm("Delete this login account?")) return;
    const r = await fetch("/api/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) setError(data.error || "Delete failed");
    load();
  }

  function start(u) {
    setForm({ username: u.username, password: "", role: u.role, name: u.name || "", teacherId: u.teacherId || "", parentId: u.parentId || "" });
    setEdit(u.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const filtered = users.filter((u) => JSON.stringify(u).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="top"><div><h1>Login Accounts</h1><div className="sub">Admin, Teacher aur Parent portal ke liye username/password yahan banayein</div></div></div>

      <div className="form">
        <h2>{edit ? "Edit" : "Add"} Login Account</h2>
        <form onSubmit={save}>
          <div className="grid">
            <div className="field"><label>Username</label><input value={form.username} onChange={(e) => change("username", e.target.value)} required /></div>
            <div className="field"><label>Password {edit && <span style={{ fontWeight: 400 }}>(blank = keep same)</span>}</label><input type="password" value={form.password} onChange={(e) => change("password", e.target.value)} placeholder={edit ? "Leave blank to keep current password" : ""} /></div>
            <div className="field"><label>Display Name</label><input value={form.name} onChange={(e) => change("name", e.target.value)} required /></div>
            <div className="field">
              <label>Role</label>
              <select value={form.role} onChange={(e) => change("role", e.target.value)} required>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {form.role === "TEACHER" && (
              <div className="field">
                <label>Linked Teacher</label>
                <select value={form.teacherId} onChange={(e) => change("teacherId", e.target.value)} required>
                  <option value="">Select teacher</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.name} — {t.subject}</option>)}
                </select>
              </div>
            )}
            {form.role === "PARENT" && (
              <div className="field">
                <label>Linked Parent</label>
                <select value={form.parentId} onChange={(e) => change("parentId", e.target.value)} required>
                  <option value="">Select parent</option>
                  {parents.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.phone}</option>)}
                </select>
              </div>
            )}
          </div>
          {error && <div className="loginError" style={{ marginTop: 16 }}>{error}</div>}
          <div className="formActions">
            <button className="btn">{edit ? "Update" : "Add"} Account</button>
            {edit && <button type="button" className="btn gray" onClick={() => { setEdit(null); setForm({ username: "", password: "", role: "TEACHER", name: "", teacherId: "", parentId: "" }); }}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <div className="search"><input placeholder="Search accounts..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="tableWrap">
          {loading ? <p>Loading...</p> : filtered.length === 0 ? <p className="muted">No accounts found.</p> : (
            <table className="table">
              <thead><tr><th>Username</th><th>Name</th><th>Role</th><th>Linked To</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.name || "-"}</td>
                    <td>{u.role}</td>
                    <td>{u.role === "TEACHER" ? (teachers.find((t) => t.id === u.teacherId)?.name || "-") : u.role === "PARENT" ? (parents.find((p) => p.id === u.parentId)?.name || "-") : "-"}</td>
                    <td>
                      <div className="actions">
                        <button className="iconbtn" onClick={() => start(u)}>Edit</button>
                        <button className="iconbtn danger" onClick={() => del(u.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
