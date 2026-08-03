import redis from "@/server/redis";

export async function countTrackedUsers(): Promise<number> {
  return redis.hlen("users").catch(() => 0);
}

export async function trackUser(userId: string): Promise<void> {
  await redis.hset("users", userId, "true").catch(() => 0);
}
