"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/login", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({username, password}) });
    if (res.ok) router.replace(params.get("from") || "/");
    else { const data = await res.json().catch(() => ({})); setError(data.error || "Invalid username or password"); setLoading(false); }
  }

  return <main className="loginPage"><div className="loginCard"><div className="loginBrand">Edu<span>Manage</span><small>PRO</small></div><h1>Welcome Back</h1><p className="sub">Sign in to access the school management system.</p><form onSubmit={submit}><div className="field"><label>Username</label><input autoFocus value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" required /></div><div className="field"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required /></div>{error && <div className="loginError">{error}</div>}<button className="btn loginBtn" disabled={loading}>{loading ? "Signing in..." : "Login"}</button></form><p className="loginHint">Admin, Teacher aur Parent — Admin, Teacher, and Parent all log in using this same form..</p></div></main>;
}
