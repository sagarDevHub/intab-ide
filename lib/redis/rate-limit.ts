// lib/redis/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

// In-memory fallback for rate limiting
class MemoryRateLimiter {
  private limits = new Map<string, { count: number; reset: number }>();

  async limit(key: string): Promise<{ success: boolean; remaining: number; reset: number }> {
    const now = Math.floor(Date.now() / 1000);
    const entry = this.limits.get(key);

    if (entry && entry.reset > now) {
      if (entry.count >= 10) {
        return {
          success: false,
          remaining: 0,
          reset: entry.reset,
        };
      }
      entry.count++;
      return {
        success: true,
        remaining: 10 - entry.count,
        reset: entry.reset,
      };
    }

    this.limits.set(key, {
      count: 1,
      reset: now + 10,
    });

    return {
      success: true,
      remaining: 9,
      reset: now + 10,
    };
  }
}

const memoryRateLimiter = new MemoryRateLimiter();

// ✅ Use Redis if available, otherwise fallback to memory
export const rateLimiter = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      prefix: '@intabide/ratelimit',
    })
  : memoryRateLimiter;
