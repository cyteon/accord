import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL!);

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

  const { userId } = (await res.json()) as { userId: string };
  return userId;
}

const server = Bun.serve<{ userId: string }>({
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
      ws.subscribe(`user:${ws.data.userId}`);

      ws.send(JSON.stringify({ e: "READY", d: { userId: ws.data.userId } }));
    },

    message() {},
  },
});

await redis.psubscribe("rt:*");
redis.on("pmessage", (_pattern, channel, message) => {
  console.log("publishing to channel", channel, "message", message);

  server.publish(channel.slice(3), message);
});

console.log("websocket server running");
