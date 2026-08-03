import Redis from "ioredis";

export interface RedisStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode: "EX", duration: number): Promise<unknown>;
  hset(key: string, field: string, value: string): Promise<number>;
  hlen(key: string): Promise<number>;
}

const fallbackRedis: RedisStore = {
  async get() {
    return null;
  },
  async set() {
    return null;
  },
  async hset() {
    return 0;
  },
  async hlen() {
    return 0;
  },
};

const redis: RedisStore = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      connectTimeout: 1000,
      lazyConnect: false,
      maxRetriesPerRequest: 1,
    })
  : fallbackRedis;

export default redis;
