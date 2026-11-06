import { and, eq } from "drizzle-orm";
import { sortPair } from "../api/friends";
import { friendships } from "./db/schema";
import db from "./db";

export async function areFriends(userA: string, userB: string) {
  const [sortedA, sortedB] = sortPair(userA, userB);

  const [friendship] = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.userA, sortedA),
        eq(friendships.userB, sortedB),
        eq(friendships.status, "accepted"),
      ),
    );

  return !!friendship;
}
