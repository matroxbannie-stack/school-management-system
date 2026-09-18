import { cookies } from "next/headers";
import { decodeSession } from "./session";

export const SESSION_COOKIE = "edumanage_session";

// Returns { id, role, username, name, teacherId, parentId } or null.
export async function getSession() {
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}

export function isAdmin(session) {
  return session?.role === "ADMIN";
}

export function isTeacher(session) {
  return session?.role === "TEACHER";
}

export function isParent(session) {
  return session?.role === "PARENT";
}
