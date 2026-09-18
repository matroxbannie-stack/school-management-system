import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { encodeSession } from "../../../lib/session";
import { SESSION_COOKIE } from "../../../lib/auth";

export async function POST(req) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });

  const session = {
    id: user.id,
    role: user.role,
    username: user.username,
    name: user.name,
    teacherId: user.teacherId,
    parentId: user.parentId,
  };

  const res = NextResponse.json({ ok: true, role: user.role, name: user.name });
  res.cookies.set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return res;
}
