import { getRequestEvent } from "solid-js/web";
import { getSessionUser } from "./session";
import { redirect } from "@solidjs/router";

async function getUser() {
  const event = getRequestEvent();
  if (event && event.locals.user !== undefined) return event.locals.user;

  const user = await getSessionUser();
  if (event) event.locals.user = user;

  return user;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) throw redirect("/login");

  return user;
}

export async function requireAdmin() {
  const user = await getUser();
  if (!user.admin) throw redirect("/app");

  return user;
}
