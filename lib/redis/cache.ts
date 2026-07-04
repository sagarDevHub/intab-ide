// lib/redis/cache.ts
import { redis } from './redis';
import { rateLimiter } from './rate-limit';

export class AICache {
  private ttl: number = 3600;
  // ✅ In-memory cache fallback
  private memoryCache: Map<string, { value: any; expires: number }> = new Map();
  private isRedisAvailable: boolean = !!redis;

  constructor() {
    if (!this.isRedisAvailable) {
      console.log('📦 Using in-memory cache (Redis not available)');
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && Date.now() < memoryEntry.expires) {
      return memoryEntry.value as T;
    }
    if (memoryEntry) {
      this.memoryCache.delete(key);
    }

    // Try Redis if available
    if (this.isRedisAvailable && redis) {
      try {
        const data = await redis.get(key);
        if (data) {
          // Cache in memory for faster access
          this.memoryCache.set(key, {
            value: data,
            expires: Date.now() + this.ttl * 1000,
          });
          return data as T;
        }
      } catch (error) {
        console.warn('Redis get error:', error);
      }
    }

    return null;
  }

  async set(key: string, value: any, ttl: number = this.ttl): Promise<void> {
    // Store in memory
    this.memoryCache.set(key, {
      value,
      expires: Date.now() + ttl * 1000,
    });

    // Store in Redis if available
    if (this.isRedisAvailable && redis) {
      try {
        await redis.set(key, JSON.stringify(value), { ex: ttl });
      } catch (error) {
        console.warn('Redis set error:', error);
      }
    }
  }

  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    if (this.isRedisAvailable && redis) {
      try {
        await redis.del(key);
      } catch (error) {
        console.warn('Redis delete error:', error);
      }
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
