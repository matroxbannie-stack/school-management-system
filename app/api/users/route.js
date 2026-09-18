import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { getSession, isAdmin } from "../../../lib/auth";

const SELECT = { id: true, username: true, role: true, name: true, teacherId: true, parentId: true, createdAt: true };

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated" }, { status: 401 });
  if (!isAdmin(session)) return Response.json({ error: "Admin only" }, { status: 403 });
  const users = await prisma.user.findMany({ orderBy: { id: "desc" }, select: SELECT });
  return Response.json(users);
}

export async function POST(req) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated" }, { status: 401 });
  if (!isAdmin(session)) return Response.json({ error: "Admin only" }, { status: 403 });
  const body = await req.json();
  if (!body.username || !body.password || !body.role) {
    return Response.json({ error: "Username, password and role are required" }, { status: 400 });
  }
  try {
    const password = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        username: body.username,
        password,
        role: body.role,
        name: body.name || null,
        teacherId: body.role === "TEACHER" && body.teacherId ? Number(body.teacherId) : null,
        parentId: body.role === "PARENT" && body.parentId ? Number(body.parentId) : null,
      },
      select: SELECT,
    });
    return Response.json(user);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}

export async function PUT(req) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated" }, { status: 401 });
  if (!isAdmin(session)) return Response.json({ error: "Admin only" }, { status: 403 });
  const body = await req.json();
  const id = Number(body.id);
  const data = {
    username: body.username,
    role: body.role,
    name: body.name || null,
    teacherId: body.role === "TEACHER" && body.teacherId ? Number(body.teacherId) : null,
    parentId: body.role === "PARENT" && body.parentId ? Number(body.parentId) : null,
  };
  // Only rehash + update the password if a new one was actually typed.
  if (body.password) data.password = await bcrypt.hash(body.password, 10);
  try {
    const user = await prisma.user.update({ where: { id }, data, select: SELECT });
    return Response.json(user);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Not authenticated" }, { status: 401 });
  if (!isAdmin(session)) return Response.json({ error: "Admin only" }, { status: 403 });
  const { id } = await req.json();
  if (Number(id) === session.id) {
    return Response.json({ error: "Aap apna khud ka account delete nahi kar sakte" }, { status: 400 });
  }
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}
