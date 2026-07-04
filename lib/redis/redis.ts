// lib/redis/redis.ts
// ✅ Completely safe Redis initialization with fallback

let redisInstance: any = null;

// Only run on server side
if (typeof window === 'undefined') {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      // Dynamic import to avoid build issues
      import('@upstash/redis')
        .then(({ Redis }) => {
          redisInstance = new Redis({
            url: url,
            token: token,
          });
          console.log('✅ Redis connected successfully');
        })
        .catch(err => {
          console.warn('⚠️ Failed to load Redis module:', err.message);
          redisInstance = null;
        });
    } catch (error) {
      console.warn('⚠️ Redis not available:', error);
      redisInstance = null;
    }
  } else {
    console.log('📦 Redis not configured. Using in-memory fallback.');
  }
}

export const redis = redisInstance;
