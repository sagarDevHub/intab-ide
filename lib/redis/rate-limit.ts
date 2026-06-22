import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

export const rateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@intabide/ratelimit',
});
