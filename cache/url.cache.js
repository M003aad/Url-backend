import { LRUCache } from 'lru-cache';
import { redisClient } from '../config/redis.config.js';

export const localCache = new LRUCache({
  max: 10000,
  ttl: 1000 * 60 * 60, // 1 hour
});

const getCacheKey = (code) => `url:${code}`;

/**
 * Retrieve URL from L1 (Memory) or L2 (Redis)
 */
export const getCachedUrl = async (code) => {
  const cacheKey = getCacheKey(code);

  // 1. Check Local Memory Cache
  const memoryCachedUrl = localCache.get(cacheKey);
  if (memoryCachedUrl) return memoryCachedUrl;

  // 2. Check Redis Cache
  try {
    const redisCachedUrl = await redisClient.get(cacheKey);
    if (redisCachedUrl) {
      localCache.set(cacheKey, redisCachedUrl); // Backfill L1
      return redisCachedUrl;
    }
  } catch (error) {
    console.error('Failed to read from Redis cache:', error);
  }

  return null;
};

/**
 * Save URL to both L1 (Memory) and L2 (Redis)
 */
export const cacheUrl = async (code, originalUrl) => {
  const cacheKey = getCacheKey(code);

  localCache.set(cacheKey, originalUrl);

  try {
    await redisClient.set(cacheKey, originalUrl, { EX: 86400 }); // 24 hours
  } catch (error) {
    console.error('Failed to set Redis cache on URL creation:', error);
  }
};

/**
 * Delete URL from both L1 (Memory) and L2 (Redis)
 */
export const invalidateUrlCache = async (code) => {
  const cacheKey = getCacheKey(code);

  // Supports both lru-cache v7+ (.delete) and older versions (.del)
  if (typeof localCache.delete === 'function') {
    localCache.delete(cacheKey);
  } else {
    localCache.del(cacheKey);
  }

  try {
    await redisClient.del(cacheKey);
  } catch (error) {
    console.error('Failed to invalidate Redis cache:', error);
  }
};

export default cacheUrl;