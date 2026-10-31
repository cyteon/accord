import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const users = pgTable("users", {
  id: uuid().primaryKey().$defaultFn(() => v7()),
  email: text().notNull().unique(),
  password: text().notNull(),
  username: text().notNull().unique(),
  displayName: text().notNull(),
  admin: boolean().notNull().default(false),
});

export const sessions = pgTable("sessions", {
  hash: text().primaryKey(),
  userId: uuid().notNull().references(() => users.id),
  expiresAt: timestamp().notNull(),
});
