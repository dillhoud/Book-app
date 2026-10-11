import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "roost_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** Admin is disabled entirely until ADMIN_PASSWORD is set. */
export const adminEnabled = () => Boolean(process.env.ADMIN_PASSWORD);

// Sessions are signed with a key derived from the password (or ADMIN_SECRET
// if set), so changing the password logs everyone out.
function key() {
  return process.env.ADMIN_SECRET || `roost:${process.env.ADMIN_PASSWORD}`;
}

function sign(payload: string) {
  return createHmac("sha256", key()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(input: string) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  // Compare digests so the comparison is constant-time regardless of length.
  const h = (s: string) => createHmac("sha256", "pw").update(s).digest("hex");
  return safeEqual(h(input), h(real));
}

export async function startSession() {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `admin.${expires}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  if (!adminEnabled()) return false;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const i = raw.lastIndexOf(".");
  const payload = raw.slice(0, i);
  const sig = raw.slice(i + 1);
  if (!payload.startsWith("admin.") || !safeEqual(sig, sign(payload))) return false;
  return Number(payload.slice(6)) > Date.now() / 1000;
}

/** Call at the top of every admin page AND every admin server action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
