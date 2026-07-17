// lib/redis/cache.ts
import { redis } from './redis';
import { rateLimiter } from './rate-limit';

export class AICache {
  private ttl: number = 3600; // 1 hour default

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key);
      return (data as T) || null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = this.ttl): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), { ex: ttl });
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  generateKey(prefix: string, ...parts: string[]): string {
    const cleaned = parts.map(p => p.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50));
    return `ai:${prefix}:${cleaned.join(':')}`;
  }

  async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttl: number = this.ttl): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    const result = await fetchFn();
    await this.set(key, result, ttl);
    return result;
  }

  async checkRateLimit(identifier: string): Promise<{
    success: boolean;
    remaining: number;
    reset: number;
  }> {
    const result = await rateLimiter.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: Math.floor(Date.now() / 1000) + (result.reset || 60),
    };
  }

  async getRateLimitStatus(identifier: string): Promise<{
    remaining: number;
    reset: number;
  }> {
    const result = await rateLimiter.limit(identifier);
    return {
      remaining: result.remaining,
      reset: Math.floor(Date.now() / 1000) + (result.reset || 60),
    };
  }
}

export const aiCache = new AICache();
