# EduManage Pro V2 — School Management System (Next.js)

A full-stack School Management System built with **Next.js (App Router)**, **Prisma**, and **SQLite** (local dev database).

> ✅ **Security note:** This copy runs on `next@15.5.9`, which patches three disclosed React
> Server Components vulnerabilities (CVE-2025-66478 — critical RCE, CVE-2025-55183,
> CVE-2025-55184/CVE-2025-67779). Always keep Next.js updated — check
> https://nextjs.org/blog/security-update-2025-12-11 for the latest advisories.

## What's new in this version
- **Multi-role login** — Admin, Teacher and Parent each log in from the same `/login` form and see
  a different sidebar/dashboard. Passwords are hashed with `bcryptjs`; accounts are managed by the
  Admin from the new **Login Accounts** page (`/users`).
- **PDF Report Card & Fee Receipt** — generated on the fly with `pdf-lib` (no external service
  needed). Download links sit next to each student (Report Card) and each fee record (Receipt).
- **Analytics dashboard** (`/analytics`) — attendance trend, monthly fee collection, class-wise
  student distribution and average exam score, charted with `recharts`.
- **Excel export** — every list page (Students, Teachers, Fees, Attendance, Results, etc.) has an
  "⬇ Export Excel" button that exports the currently filtered rows via `xlsx`.
- **Role-based access control** — enforced twice: `middleware.js` restricts which pages each role
  can open, and `app/api/[resource]/route.js` enforces read/write rules and row-level filtering
  (a Parent only ever sees their own children's records) on the API itself.

## Roles & what each one can do
| | Admin | Teacher | Parent |
|---|---|---|---|
| Manage students/teachers/parents/classes/subjects/settings | ✅ | view students only | ❌ |
| Mark attendance & enter results | ✅ | ✅ | view own child only |
| Manage fees | ✅ | ❌ | view + download receipt (own child) |
| Download report card | ✅ (any student) | ✅ (any student) | ✅ (own child) |
| Analytics dashboard | ✅ | ✅ | ❌ |
| Manage login accounts (`/users`) | ✅ | ❌ | ❌ |

## Requirements
- Node.js 18.18+ (Node 20 LTS recommended)
- npm

## Setup (run these on your own machine)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Generate the Prisma client**
   ```bash
   npx prisma generate
   ```

3. **Create the local SQLite database and tables**
   ```bash
   npx prisma db push
   ```

4. **Seed demo data + one login for each role**
   ```bash
   npm run seed
   ```
   This creates:
   - Admin&nbsp;&nbsp;→ `admin` / `admin123`
   - Teacher → `sara.teacher` / `teacher123`
   - Parent&nbsp;→ `ahmed.parent` / `parent123` (linked to demo student "Ali Khan")

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 — you'll be redirected to `/login`.

## Creating more login accounts
Log in as Admin → **Login Accounts** in the sidebar → Add Login Account. Pick a role; for
Teacher/Parent roles you'll link the account to an existing Teacher/Parent record (create the
Teacher or Parent record first from their own pages if it doesn't exist yet). To link a **Student**
to a Parent account, open the student in **Students** and set "Linked Parent Account ID" to that
parent's ID (shown in the Parents/Guardians table).

## Moving to production
- SQLite (`file:./dev.db`) is for local development only. For a real deployment, change
  `DATABASE_URL` in `.env` to a hosted PostgreSQL/MySQL database and update the `provider`
  in `prisma/schema.prisma` accordingly, then re-run `npx prisma generate` and `npx prisma db push`
  (or set up proper migrations with `npx prisma migrate dev`).
- The session cookie in this project is a simple base64 token (no server-side session store, no
  signature). It matches the trust level of the original single-admin login it replaces, but before
  a real production launch you should sign/encrypt it (e.g. with `jose`/JWT) and add CSRF protection.
- **Not built yet (kept out of scope for now, per your instructions):** SMS/Email/WhatsApp
  notifications and online fee payments. The `Notice`/`Announcement` models and pages already exist,
  so wiring a provider like Twilio (SMS) or Resend/Nodemailer (email) on top of them later is
  straightforward — happy to add this whenever you want it.

## Project structure
```
app/                    → pages & API routes (Next.js App Router)
  api/[resource]/       → generic CRUD API (students, teachers, fees, etc.) — role-aware
  api/users/             → Login Accounts CRUD (admin only, password hashing)
  api/login, api/logout → auth routes
  api/report-card/[studentId]/ → PDF report card generator
  api/fee-receipt/[feeId]/     → PDF fee receipt generator
  analytics/             → charts dashboard
  users/                 → admin UI for managing login accounts
components/             → Sidebar, AppShell, CrudPage (table+form UI), AnalyticsCharts
lib/prisma.js           → Prisma client singleton
lib/session.js          → session token encode/decode (edge-safe)
lib/auth.js             → getSession()/role helpers for server components & API routes
prisma/schema.prisma    → database schema (now includes User, and Parent↔Student linking)
prisma/seed.js          → demo data + one login per role
middleware.js           → route protection + per-role page access control
```
