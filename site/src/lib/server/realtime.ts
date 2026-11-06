import Redis from "ioredis";

const global = globalThis as unknown as { redis: Redis | undefined };
const redis = (global.redis ??= new Redis(process.env.REDIS_URL!));

export async function publish(userIds: string[], event: any) {
  const payload = JSON.stringify(event);
  const pipeline = redis.pipeline();

  for (const userId of userIds) {
    pipeline.publish(`rt:user:${userId}`, payload);
  }

  await pipeline.exec();
}
