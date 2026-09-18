import "./globals.css";
import AppShell from "../components/AppShell";
import { getSession } from "../lib/auth";

export const metadata = {
  metadataBase: new URL("https://school-management-system-six-blond.vercel.app"),
  title: { default: "EduManage Pro - School Management System", template: "%s | EduManage Pro" },
  description: "EduManage Pro is a complete school management system for handling students, teachers, classes, attendance, fees, results, timetables, and more - all in one place.",
  keywords: ["school management system", "student management", "attendance software", "fee management", "EduManage Pro"],
  robots: { index: true, follow: true },
  openGraph: {
    title: "EduManage Pro - School Management System",
    description: "A complete school management system for students, teachers, attendance, fees, results, and more.",
    type: "website",
    siteName: "EduManage Pro",
  },
  twitter: {
    card: "summary",
    title: "EduManage Pro - School Management System",
    description: "A complete school management system for students, teachers, attendance, fees, results, and more.",
  },
};

export default async function RootLayout({ children }) {
  const session = await getSession();
  return (
    <html>
      <body>
        <AppShell user={session}>{children}</AppShell>
      </body>
    </html>
  );
}
