// lib/redis/rate-limit.ts
// ✅ In-memory rate limiter with Redis fallback

// In-memory rate limiter
class MemoryRateLimiter {
  private limits = new Map<string, { count: number; reset: number }>();

  async limit(key: string): Promise<{ success: boolean; remaining: number; reset: number }> {
    const now = Math.floor(Date.now() / 1000);
    const entry = this.limits.get(key);

    if (entry && entry.reset > now) {
      if (entry.count >= 100) {
        return { success: false, remaining: 0, reset: entry.reset };
      }
      entry.count++;
      return { success: true, remaining: 100 - entry.count, reset: entry.reset };
    }

    this.limits.set(key, { count: 1, reset: now + 60 });
    return { success: true, remaining: 99, reset: now + 60 };
  }
}

const memoryRateLimiter = new MemoryRateLimiter();

// Try to use Redis if available
let redisRateLimiter: any = null;

if (typeof window === 'undefined') {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      import('@upstash/ratelimit')
        .then(({ Ratelimit }) => {
          import('@upstash/redis')
            .then(({ Redis }) => {
              const redis = new Redis({ url, token });
              redisRateLimiter = new Ratelimit({
                redis: redis,
                limiter: Ratelimit.slidingWindow(10, '10 s'),
                analytics: true,
                prefix: '@intabide/ratelimit',
              });
              console.log('✅ Rate limiter connected to Redis');
            })
            .catch(() => {});
        })
        .catch(() => {});
    } catch (error) {
      console.warn('⚠️ Redis rate limiter not available, using memory');
    }
  }
}

export const rateLimiter = {
  limit: async (key: string) => {
    if (redisRateLimiter) {
      try {
        return await redisRateLimiter.limit(key);
      } catch (error) {
        console.warn('Redis rate limit error, using memory:', error);
      }
    }
    return memoryRateLimiter.limit(key);
  },
};
