// src/cache/profile.cache.js
import { LRUCache } from 'lru-cache';
import { redisClient } from '../config/redis.config.js';

export const localProfileCache = new LRUCache({
  max: 5000,
  ttl: 1000 * 60 * 15,
});

const getProfileCacheKey = (userId) => `user:profile:${userId}`;

export const getCachedProfile = async (userId) => {
  const cacheKey = getProfileCacheKey(userId);

  const memoryCached = localProfileCache.get(cacheKey);
  if (memoryCached) return memoryCached;

  try {
    const redisCached = await redisClient.get(cacheKey);
    if (redisCached) {
      const parsed = JSON.parse(redisCached);
      localProfileCache.set(cacheKey, parsed); // Backfill L1
      return parsed;
    }
  } catch (error) {
    console.error('Failed to read profile from Redis cache:', error);
  }

  return null;
};

export const cacheProfile = async (userId, profileData) => {
  const cacheKey = getProfileCacheKey(userId);

  localProfileCache.set(cacheKey, profileData);

  try {
    await redisClient.set(cacheKey, JSON.stringify(profileData), { EX: 3600 });
  } catch (error) {
    console.error('Failed to set profile in Redis cache:', error);
  }
};

export const invalidateProfileCache = async (userId) => {
  const cacheKey = getProfileCacheKey(userId);

  if (typeof localProfileCache.delete === 'function') {
    localProfileCache.delete(cacheKey);
  } else {
    localProfileCache.del(cacheKey);
  }

  try {
    await redisClient.del(cacheKey);
  } catch (error) {
    console.error('Failed to invalidate profile Redis cache:', error);
  }
};
