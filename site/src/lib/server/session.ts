import { useSession } from "@solidjs/start/http";
import db from "./db";
import { sessions, users } from "./db/schema";
import { and, eq, gte } from "drizzle-orm";
import { createHash } from "node:crypto";

const SESSION_DAYS = 30;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;

function getCookie() {
  return useSession<{ token: string }>({
    name: "session",
    password: process.env.SESSION_SECRET!,
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    }
  });
}

export async function getSessionUser() {
  const cookie = await getCookie();
  if (!cookie.data.token) return null;

  const hash = createHash("sha256").update(cookie.data.token).digest("hex");

  const [user] = await db.select({
    id: users.id,
    email: users.email,
    username: users.username,
    displayName: users.displayName,
    admin: users.admin,
  }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(and(eq(sessions.hash, hash), gte(sessions.expiresAt, new Date())));

  return user || null;
}
