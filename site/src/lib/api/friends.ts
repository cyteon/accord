import { and, desc, eq, or, sql } from "drizzle-orm";
import { requireUser } from "../server/auth";
import db from "../server/db";
import { friendships, users } from "../server/db/schema";
import { action, query } from "@solidjs/router";

function sortPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export const getFriendRequests = query(async () => {
  "use server";
  const user = await requireUser();

  const otherId = sql<string>`CASE WHEN ${friendships.userA} = ${user.id} THEN ${friendships.userB} ELSE ${friendships.userA} END`;

  const rows = await db
    .select({
      requesterId: friendships.requesterId,
      user: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
      },
    })
    .from(friendships)
    .innerJoin(users, eq(users.id, otherId))
    .where(
      and(
        eq(friendships.status, "pending"),
        or(eq(friendships.userA, user.id), eq(friendships.userB, user.id)),
      ),
    )
    .orderBy(desc(friendships.createdAt));

  const incoming = rows.filter((row) => row.requesterId !== user.id);
  const outgoing = rows.filter((row) => row.requesterId === user.id);

  return { incoming, outgoing };
}, "getFriendRequests");

export const sendFriendRequest = action(
  async (formData: FormData): Promise<string> => {
    "use server";

    const self = await requireUser();
    const username = String(formData.get("username") ?? "");

    if (!username) {
      throw new Error("Missing username");
    }

    if (self.username === username) {
      throw new Error("You cannot send a friend request to yourself");
    }

    const [target] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!target) {
      throw new Error("User not found");
    }

    const [userA, userB] = sortPair(self.id, target.id);
    const pairQuery = and(
      eq(friendships.userA, userA),
      eq(friendships.userB, userB),
    );

    const [existing] = await db.select().from(friendships).where(pairQuery);

    if (existing?.status === "accepted") {
      throw new Error("You are already friends");
    }

    if (existing?.requesterId === self.id) {
      throw new Error("Friend request already sent");
    }

    if (existing?.status === "pending" && existing.requesterId === target.id) {
      await db
        .update(friendships)
        .set({
          status: "accepted",
          requesterId: target.id,
          acceptedAt: new Date(),
        })
        .where(pairQuery);

      return "Incoming friend request found so it was accepted";
    }

    await db.insert(friendships).values({
      userA,
      userB,
      requesterId: self.id,
      status: "pending",
    });

    return "Friend request sent";
  },
);

export const acceptFriendRequest = action(async (otherId: string) => {
  "use server";
  const self = await requireUser();

  const [userA, userB] = sortPair(self.id, otherId);
  const pairQuery = and(
    eq(friendships.userA, userA),
    eq(friendships.userB, userB),
  );

  await db
    .update(friendships)
    .set({
      status: "accepted",
      acceptedAt: new Date(),
    })
    .where(and(pairQuery, eq(friendships.requesterId, otherId)));
});

export const declineFriendRequest = action(async (otherId: string) => {
  "use server";
  const self = await requireUser();

  const [userA, userB] = sortPair(self.id, otherId);
  const pairQuery = and(
    eq(friendships.userA, userA),
    eq(friendships.userB, userB),
  );

  await db
    .delete(friendships)
    .where(
      and(
        pairQuery,
        eq(friendships.requesterId, otherId),
        eq(friendships.status, "pending"),
      ),
    );
});

export const cancelFriendRequest = action(async (otherId: string) => {
  "use server";
  const self = await requireUser();

  const [userA, userB] = sortPair(self.id, otherId);
  const pairQuery = and(
    eq(friendships.userA, userA),
    eq(friendships.userB, userB),
  );

  await db
    .delete(friendships)
    .where(
      and(
        pairQuery,
        eq(friendships.requesterId, self.id),
        eq(friendships.status, "pending"),
      ),
    );
});
