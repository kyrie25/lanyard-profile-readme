import Redis from "ioredis";

let redisClient:
  | Redis
  | {
      [key: string]: (...args: any[]) => Promise<any>;
    };
if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL!, {
    connectTimeout: 1000,
    lazyConnect: false,
    maxRetriesPerRequest: 1,
  });
} else {
  redisClient = new Proxy(
    {},
    {
      get: (_, prop: string) => {
        return async (...argv: any) => {
          if (prop === "exists") {
            return 0;
          }
          return null;
        };
      },
    },
  ) as any;
}

export default redisClient;
