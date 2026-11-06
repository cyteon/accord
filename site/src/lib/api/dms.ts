import { action, query, redirect } from "@solidjs/router";
import { requireUser } from "../server/auth";
import { sortPair } from "./friends";
import db from "../server/db";
import { channels, messages, users } from "../server/db/schema";
import { eq } from "drizzle-orm";
import { getOrCreateDm } from "../server/dms";

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
    ? await db
        .select()
        .from(messages)
        .where(eq(messages.channelId, channel.id))
        .orderBy(messages.createdAt)
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

  return message;
});
