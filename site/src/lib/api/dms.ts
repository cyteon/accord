import { action, query, redirect } from "@solidjs/router";
import { requireUser } from "../server/auth";
import { sortPair } from "./friends";
import db from "../server/db";
import { channels, messages, users } from "../server/db/schema";
import { and, desc, eq, getTableColumns, lt } from "drizzle-orm";
import { getOrCreateDm } from "../server/dms";
import { publish } from "../server/realtime";

export const getDm = query(async (otherId: string) => {
  "use server";
  const self = await requireUser();

  if (self.id === otherId) {
    throw redirect("/app");
  }

  const [otherUser] = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
    })
    .from(users)
    .where(eq(users.id, otherId));

  if (!otherUser) {
    throw redirect("/app");
  }

  const [userA, userB] = sortPair(self.id, otherId);
  const dmKey = `${userA}:${userB}`;

  const [channel] = await db
    .select()
    .from(channels)
    .where(eq(channels.dmKey, dmKey));

  const messageList = channel
    ? (
        await db
          .select({
            author: {
              id: users.id,
              username: users.username,
              displayName: users.displayName,
            },
            ...getTableColumns(messages),
          })
          .from(messages)
          .innerJoin(users, eq(users.id, messages.authorId))
          .where(eq(messages.channelId, channel.id))
          .orderBy(desc(messages.createdAt))
          .limit(50)
      ).reverse()
    : [];

  return {
    channel,
    messages: messageList,
    otherUser,
  };
}, "getDm");

export const sendDm = action(async (formData: FormData) => {
  "use server";
  const self = await requireUser();

  const otherId = String(formData.get("otherId") ?? "");
  const content = String(formData.get("content") ?? "");

  if (!otherId || !content) {
    throw new Error("Missing fields");
  }

  if (self.id === otherId) {
    throw new Error("You cannot send a message to yourself");
  }

  const dm = await getOrCreateDm(self.id, otherId);

  const [message] = await db
    .insert(messages)
    .values({
      channelId: dm.id,
      authorId: self.id,
      content,
    })
    .returning();

  await publish([self.id, otherId], {
    e: "MESSAGE_CREATE",
    d: {
      author: {
        id: self.id,
        username: self.username,
        displayName: self.displayName,
      },
      ...message,
    },
  });

  return message;
});

export async function getOlderMessages(otherId: string, beforeId: string) {
  "use server";
  const self = await requireUser();

  const [userA, userB] = sortPair(self.id, otherId);
  const dmKey = `${userA}:${userB}`;

  const [channel] = await db
    .select()
    .from(channels)
    .where(eq(channels.dmKey, dmKey));
  if (!channel) return [];

  const rows = await db
    .select({
      author: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
      },
      ...getTableColumns(messages),
    })
    .from(messages)
    .innerJoin(users, eq(users.id, messages.authorId))
    .where(and(eq(messages.channelId, channel.id), lt(messages.id, beforeId)))
    .orderBy(desc(messages.createdAt))
    .limit(50);

  return rows.reverse();
}
