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

export const register = action(async (formData: FormData) => {
  "use server";

  const email = String(formData.get("email") ?? "");
  const username = String(formData.get("username") ?? "");
  const displayName = String(formData.get("displayName") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !username || !displayName || !password) {
    throw new Error("Missing email, username, display name, or password");
  }

  const [existingUser] = await db
    .select()
    .from(users)
    .where(or(eq(users.email, email), eq(users.username, username)));

  if (existingUser) {
    if (existingUser.email === email) {
      throw new Error("Email already in use");
    } else {
      throw new Error("Username already in use");
    }
  }

  const [user] = await db
    .insert(users)
    .values({
      email,
      username,
      displayName,
      password: await bcrypt.hash(password, 12),
    })
    .returning();

  await createSession(user.id);
  throw redirect("/app");
}, "register");
