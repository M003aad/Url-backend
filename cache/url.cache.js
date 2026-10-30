import { LRUCache } from 'lru-cache';

export const localUrlCache = new LRUCache({
  max: 10000,
  ttl: 1000 * 60 * 60, 
});
