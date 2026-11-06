import { getSessionUser } from "~/lib/server/session";

export async function POST({ request }: { request: Request }) {
  if (
    request.headers.get("authorization") !==
    `Bearer ${process.env.INTERNAL_SECRET}`
  ) {
    return new Response(null, { status: 404 });
  }

  const user = await getSessionUser();

  if (!user) return new Response(null, { status: 401 });

  return Response.json({ userId: user.id });
}
