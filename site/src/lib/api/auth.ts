import { action, query, redirect } from "@solidjs/router";
import { requireAdmin, requireUser } from "../server/auth";
import db from "../server/db";
import { users } from "../server/db/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import { createSession } from "../server/session";

export const requireUserQ = query(async () => {
  "use server";
  return requireUser();
}, "requireUser");

export const requireAdminQ = query(async () => {
  "use server";
  return requireAdmin();
}, "requireAdmin");

export async function register(data: {
  email: string;
  username: string;
  displayName: string;
  password: string;
}) {
  "use server";
}

export const login = action(async (formData: FormData) => {
  "use server";

  const identifier = String(formData.get("identifier") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!identifier || !password) {
    throw new Error("Missing email/username or password");
  }

  const [user] = await db
    .select()
    .from(users)
    .where(or(eq(users.email, identifier), eq(users.username, identifier)));

  if (!user) {
    throw new Error("Invalid email/username or password");
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error("Invalid email/username or password");
  }

  await createSession(user.id);
  throw redirect("/app");
}, "login");
