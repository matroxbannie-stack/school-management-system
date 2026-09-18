import "./globals.css";
import AppShell from "../components/AppShell";
import { getSession } from "../lib/auth";

export const metadata = { title: "EduManage Pro", description: "Professional School Management System" };

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
