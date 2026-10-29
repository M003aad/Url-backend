import { Redis } from '@upstash/redis';

export const redisClient = Redis.fromEnv();

export const createUpstashStore = (prefix, windowInSeconds = 60) => ({
  increment: async (key) => {
    const fullKey = `${prefix}${key}`;

    const p = redisClient.pipeline();
    p.incr(fullKey);
    p.ttl(fullKey);
    const [currentCount, ttl] = await p.exec();

    // If key was just created (currentCount === 1) or has no TTL (ttl < 0), set expiration
    if (currentCount === 1 || ttl < 0) {
      await redisClient.expire(fullKey, windowInSeconds);
    }

    const currentTtl = ttl < 0 ? windowInSeconds : ttl;

    return {
      totalHits: currentCount,
      resetTime: new Date(Date.now() + currentTtl * 1000),
    };
  },
  decrement: async (key) => {
    await redisClient.decr(`${prefix}${key}`);
  },
  resetKey: async (key) => {
    await redisClient.del(`${prefix}${key}`);
  },
});

export default createUpstashStore;
