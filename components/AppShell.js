"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
export default function AppShell({ children, user }) {
  const p = usePathname();
  if (p === "/login") return children;
  return (
    <div className="app">
      <Sidebar user={user} />
      <main className="main">{children}</main>
    </div>
  );
}
