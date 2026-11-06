async function identify(req: Request): Promise<string | null> {
  if (req.headers.get("origin") !== process.env.APP_ORIGIN) {
    return null;
  }

  const cookie = req.headers.get("cookie");
  if (!cookie) return null;

  const res = await fetch(
    `${process.env.APP_INTERNAL_URL}/internal/gateway/identify`,
    {
      method: "POST",
      headers: {
        cookie,
        authorization: `Bearer ${process.env.INTERNAL_SECRET}`,
      },
    },
  );

  if (!res.ok) return null;

  const { userId } = await res.json();
  return userId;
}

Bun.serve<{ userId: string }>({
  port: Number(process.env.PORT || 4001),

  async fetch(req, server) {
    if (req.headers.get("upgrade")?.toLowerCase() !== "websocket") {
      return new Response(null, { status: 426 });
    }

    const userId = await identify(req);
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    server.upgrade(req, { data: { userId } });
  },

  websocket: {
    open(ws) {
      console.log(ws.data.userId + " connected");
    },

    message() {},
  },
});

console.log("websocket server running");
