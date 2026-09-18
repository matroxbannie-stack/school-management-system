import { prisma } from "../../../lib/prisma";
import { getSession } from "../../../lib/auth";

const maps = {
  students: "student", teachers: "teacher", parents: "parent",
  classes: "classRoom", subjects: "subject", attendance: "attendance",
  fees: "fee", results: "result", timetable: "timetable", notices: "notice",
  library: "libraryBook", transport: "transport", inventory: "inventoryItem",
  announcements: "announcement", settings: "setting", homework: "homework"
};

const PARENT_BLOCKED_READ = ["teachers", "parents"];
const PARENT_OWN_DATA = ["students", "attendance", "fees", "results"];
const TEACHER_WRITABLE = ["attendance", "results", "homework"];

function clean(resource, data) {
  const d = { ...data };
  delete d.id;
  const numeric = {
    classes: ["capacity"],
    attendance: ["studentId"],
    fees: ["studentId", "amount", "paid"],
    results: ["studentId", "marks", "total"],
    library: ["quantity", "available"],
    transport: ["monthlyFee"],
    students: ["parentId"],
    inventory: ["quantity", "lowStock"],
  };
  for (const k of numeric[resource] || []) {
    if (d[k] === "") d[k] = null;
    else if (d[k] !== undefined) d[k] = Number(d[k]);
  }
  return d;
}

function unauthorized() {
  return Response.json({ error: "Not authenticated" }, { status: 401 });
}
function forbidden(msg = "You are not allowed to do this") {
  return Response.json({ error: msg }, { status: 403 });
}

async function childIds(parentId) {
  if (!parentId) return [];
  const rows = await prisma.student.findMany({ where: { parentId }, select: { id: true } });
  return rows.map((r) => r.id);
}

export async function GET(req, { params }) {
  const session = await getSession();
  if (!session) return unauthorized();
  const resource = (await params).resource, model = maps[resource];
  if (!model) return Response.json({ error: "Not found" }, { status: 404 });
  if (session.role === "PARENT" && PARENT_BLOCKED_READ.includes(resource)) return forbidden();

  try {
    let data = await prisma[model].findMany({ orderBy: { id: "desc" } });
    if (session.role === "PARENT" && PARENT_OWN_DATA.includes(resource)) {
      const ids = await childIds(session.parentId);
      data = resource === "students" ? data.filter((s) => ids.includes(s.id)) : data.filter((r) => ids.includes(r.studentId));
    }
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const session = await getSession();
  if (!session) return unauthorized();
  const resource = (await params).resource, model = maps[resource];
  if (!model) return Response.json({ error: "Not found" }, { status: 404 });
  if (session.role === "PARENT") return forbidden();
  if (session.role === "TEACHER" && !TEACHER_WRITABLE.includes(resource)) return forbidden();
  try {
    return Response.json(await prisma[model].create({ data: clean(resource, await req.json()) }));
  } catch (e) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}

export async function PUT(req, { params }) {
  const session = await getSession();
  if (!session) return unauthorized();
  const resource = (await params).resource, model = maps[resource], body = await req.json();
  if (!model) return Response.json({ error: "Not found" }, { status: 404 });
  if (session.role === "PARENT") return forbidden();
  if (session.role === "TEACHER" && !TEACHER_WRITABLE.includes(resource)) return forbidden();
  const id = Number(body.id);
  try {
    return Response.json(await prisma[model].update({ where: { id }, data: clean(resource, body) }));
  } catch (e) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session) return unauthorized();
  const resource = (await params).resource, model = maps[resource], { id } = await req.json();
  if (!model) return Response.json({ error: "Not found" }, { status: 404 });
  if (session.role === "PARENT") return forbidden();
  if (session.role === "TEACHER" && !TEACHER_WRITABLE.includes(resource)) return forbidden();
  try {
    await prisma[model].delete({ where: { id: Number(id) } });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}