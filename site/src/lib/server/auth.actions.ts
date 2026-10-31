import { query } from "@solidjs/router";
import { requireUser } from "./auth";

export const requireUserQ = query(async () => {
  "use server";
  return requireUser();
}, "requireUser");
