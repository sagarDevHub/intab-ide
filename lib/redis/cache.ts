// lib/redis/cache.ts
// ✅ In-memory cache with Redis fallback

import { rateLimiter } from './rate-limit';

export class AICache {
  private cache = new Map<string, { value: any; expires: number }>();
  private redisInstance: any = null;

  constructor() {
    // Try to use Redis if available
    if (typeof window === 'undefined') {
      const url = process.env.UPSTASH_REDIS_REST_URL;
      const token = process.env.UPSTASH_REDIS_REST_TOKEN;

      if (url && token) {
        import('@upstash/redis')
          .then(({ Redis }) => {
            this.redisInstance = new Redis({ url, token });
            console.log('✅ Redis cache connected');
          })
          .catch(() => {
            console.warn('⚠️ Redis cache not available, using memory');
          });
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // Try Redis first
    if (this.redisInstance) {
      try {
        const data = await this.redisInstance.get(key);
        if (data) {
          // Cache in memory for faster access
          this.cache.set(key, {
            value: data,
            expires: Date.now() + 3600000,
          });
          return data as T;
        }
      } catch (error) {
        console.warn('Redis get error:', error);
      }
    }

    // Fallback to memory
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    // Store in memory
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl * 1000,
    });

    // Store in Redis if available
    if (this.redisInstance) {
      try {
        await this.redisInstance.set(key, JSON.stringify(value), { ex: ttl });
      } catch (error) {
        console.warn('Redis set error:', error);
      }
    }
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    if (this.redisInstance) {
      try {
        await this.redisInstance.del(key);
      } catch (error) {
        console.warn('Redis delete error:', error);
      }
    }
  }

  generateKey(prefix: string, ...parts: string[]): string {
    const cleaned = parts.map(p => p.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50));
    return `ai:${prefix}:${cleaned.join(':')}`;
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
}

export const aiCache = new AICache();
