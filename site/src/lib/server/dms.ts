import { eq } from "drizzle-orm";
import { sortPair } from "../api/friends";
import db from "./db";
import { channels } from "./db/schema";

export async function getOrCreateDm(userA: string, userB: string) {
  const [sortedA, sortedB] = sortPair(userA, userB);
  const dmKey = `${sortedA}:${sortedB}`;

  const [channel] = await db
    .select()
    .from(channels)
    .where(eq(channels.dmKey, dmKey));

  if (channel) {
    return channel;
  }

  const [created] = await db
    .insert(channels)
    .values({
      dmKey,
    })
    .returning();

  return created;
}
