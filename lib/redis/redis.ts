// lib/redis/redis.ts
import { Redis } from '@upstash/redis';

// ✅ Only initialize Redis if environment variables are present
const getRedis = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      return new Redis({
        url: url,
        token: token,
      });
    } catch (error) {
      console.warn('Failed to initialize Redis:', error);
      return null;
    }
  }

  console.log('📦 Redis not configured. Using fallback in-memory cache.');
  return null;
};

export const redis = getRedis();
