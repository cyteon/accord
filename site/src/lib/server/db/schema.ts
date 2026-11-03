import {
  boolean,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { v7 } from "uuid";

export const users = pgTable("users", {
  id: uuid()
    .primaryKey()
    .$defaultFn(() => v7()),
  email: text().notNull().unique(),
  password: text().notNull(),
  username: text().notNull().unique(),
  displayName: text().notNull(),
  admin: boolean().notNull().default(false),

  createdAt: timestamp().notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  hash: text().primaryKey(),
  userId: uuid()
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp().notNull(),
});

export const friendshipStatus = pgEnum("friendship_status", [
  "pending",
  "accepted",
]);

export const friendships = pgTable(
  "friendships",
  {
    userA: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userB: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    requesterId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: friendshipStatus().notNull().default("pending"),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    acceptedAt: timestamp({ withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.userA, t.userB] })],
);
