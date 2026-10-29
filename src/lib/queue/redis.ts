import { Redis } from "@upstash/redis";

// REST-based client — fits a Next.js route handler, which doesn't hold a
// persistent connection the way the Python worker's redis-py client does.
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
