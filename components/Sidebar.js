"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const items = [
  ["/", "📊", "Dashboard", "ALL"],
  ["/student-lookup", "🔍", "Student Lookup", ["ADMIN", "TEACHER"]],
  ["/students", "🎓", "Students", ["ADMIN", "TEACHER"]],
  ["/teachers", "🧑‍🏫", "Teachers", ["ADMIN"]],
  ["/parents", "👪", "Parents / Guardians", ["ADMIN"]],
  ["/classes", "🏫", "Classes & Sections", ["ADMIN"]],
  ["/subjects", "📚", "Subjects", ["ADMIN"]],
  ["/attendance", "📅", "Attendance", ["ADMIN", "TEACHER", "PARENT"]],
  ["/fees", "💰", "Fees", ["ADMIN", "PARENT"]],
  ["/results", "📝", "Results", ["ADMIN", "TEACHER", "PARENT"]],
  ["/homework", "📔", "Homework", ["ADMIN", "TEACHER", "PARENT"]],
  ["/timetable", "🕐", "Timetable", ["ADMIN", "TEACHER", "PARENT"]],
  ["/notices", "📢", "Notices", "ALL"],
  ["/announcements", "🔔", "Announcements", "ALL"],
  ["/library", "📖", "Library", ["ADMIN", "TEACHER"]],
  ["/inventory", "📦", "Inventory", ["ADMIN"]],
  ["/transport", "🚌", "Transport", ["ADMIN"]],
  ["/analytics", "📈", "Analytics", ["ADMIN", "TEACHER"]],
  ["/users", "🔑", "Login Accounts", ["ADMIN"]],
  ["/settings", "⚙️", "School Settings", ["ADMIN"]],
];

export default function Sidebar({ user }) {
  const p = usePathname(), router = useRouter();
  const role = user?.role || "ADMIN";
  async function logout() { await fetch("/api/logout", { method: "POST" }); router.replace("/login"); }
  const visible = items.filter(([, , , roles]) => roles === "ALL" || roles.includes(role));

  return (
    <aside className="sidebar">
      <div className="brand">Edu<span>Manage</span><small>PRO</small></div>
      <nav>
        {visible.map(([href, icon, label]) => (
          <Link className={p === href ? "active" : ""} href={href} key={href}>
            <span className="navIcon">{icon}</span>{label}
          </Link>
        ))}
      </nav>
      <button className="logout" onClick={logout}>Logout</button>
      <div className="sideBottom">
        {user?.name || "School Administration"}<br />
        <b>{role}</b>
      </div>
    </aside>
  );
}