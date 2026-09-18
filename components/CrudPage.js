"use client";
import { useEffect, useState } from "react";

export default function CrudPage({ title, api, fields, columns, canWrite = true, extraActions, exportName }) {
  const [rows, setRows] = useState([]), [form, setForm] = useState({}), [edit, setEdit] = useState(null),
    [loading, setLoading] = useState(true), [q, setQ] = useState(""), [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(api);
      const data = await r.json();
      if (!r.ok) throw Error(data.error || "Failed to load");
      setRows(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function change(k, v) { setForm({ ...form, [k]: v }); }

  async function save(e) {
    e.preventDefault();
    setError("");
    const r = await fetch(api, { method: edit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(edit ? { ...form, id: edit } : form) });
    const data = await r.json().catch(() => ({}));
    if (r.ok) { setForm({}); setEdit(null); load(); } else setError(data.error || "Save failed");
  }

  async function del(id) {
    if (!confirm("Delete this record?")) return;
    const r = await fetch(api, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (!r.ok) { const d = await r.json().catch(() => ({})); setError(d.error || "Delete failed"); }
    load();
  }

  function start(x) {
    let f = {};
    fields.forEach((a) => (f[a.key] = x[a.key] ?? ""));
    setForm(f); setEdit(x.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function optionValue(o) { return typeof o === "object" ? o.value : o; }
  function optionLabel(o) { return typeof o === "object" ? o.label : o; }

  async function exportExcel() {
    const XLSX = await import("xlsx");
    const sheetRows = filtered.map((r) => {
      const out = {};
      columns.forEach((c) => (out[c.label] = r[c.key] ?? ""));
      return out;
    });
    const ws = XLSX.utils.json_to_sheet(sheetRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 30));
    XLSX.writeFile(wb, `${(exportName || title).replace(/\s+/g, "_")}.xlsx`);
  }

  let filtered = rows.filter((x) => JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div className="top">
        <div>
          <h1>{title}</h1>
          <div className="sub">{canWrite ? "Search, add, edit and delete records" : "Search and view records"}</div>
        </div>
      </div>

      {canWrite && (
        <div className="form">
          <h2>{edit ? "Edit" : "Add"} {title.replace(/s$/i, "")}</h2>
          <form onSubmit={save}>
            <div className="grid">
              {fields.map((f) => (
                <div className={"field " + (f.type === "textarea" ? "full" : "")} key={f.key}>
                  <label>{f.label}</label>
                  {f.type === "select" ? (
                    <select value={form[f.key] || ""} onChange={(e) => change(f.key, e.target.value)} required={f.required !== false}>
                      <option value="">Select</option>
                      {f.options.map((o) => <option key={optionValue(o)} value={optionValue(o)}>{optionLabel(o)}</option>)}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea value={form[f.key] || ""} onChange={(e) => change(f.key, e.target.value)} required={f.required !== false} />
                  ) : (
                    <input type={f.type || "text"} value={form[f.key] || ""} onChange={(e) => change(f.key, e.target.value)} required={f.required !== false} />
                  )}
                </div>
              ))}
            </div>
            {error && <div className="loginError" style={{ marginTop: 16 }}>{error}</div>}
            <div className="formActions">
              <button className="btn">{edit ? "Update" : "Add"} Record</button>
              {edit && <button type="button" className="btn gray" onClick={() => { setEdit(null); setForm({}); }}>Cancel</button>}
            </div>
          </form>
        </div>
      )}

      <div className="panel" style={{ marginTop: 20 }}>
        <div className="search" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input placeholder={`Search ${title.toLowerCase()}...`} value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="button" className="btn gray" onClick={exportExcel}>⬇ Export Excel</button>
        </div>
        {!canWrite && error && <div className="loginError" style={{ marginBottom: 12 }}>{error}</div>}
        <div className="tableWrap">
          {loading ? <p>Loading...</p> : filtered.length === 0 ? <p className="muted">No records found.</p> : (
            <table className="table">
              <thead>
                <tr>
                  {columns.map((c) => <th key={c.key}>{c.label}</th>)}
                  {(canWrite || extraActions) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((x) => (
                  <tr key={x.id}>
                    {columns.map((c) => <td key={c.key}>{x[c.key] ?? "-"}</td>)}
                    {(canWrite || extraActions) && (
                      <td>
                        <div className="actions">
                          {extraActions && extraActions.map((a) => (
                            <a key={a.label} className="iconbtn" href={`${a.hrefPrefix}${x.id}`} target="_blank" rel="noreferrer">{a.label}</a>
                          ))}
                          {canWrite && <button className="iconbtn" onClick={() => start(x)}>Edit</button>}
                          {canWrite && <button className="iconbtn danger" onClick={() => del(x.id)}>Delete</button>}
                        </div>
                      </td>
                    )}
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
