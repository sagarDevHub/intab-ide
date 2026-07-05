// import { Redis } from '@upstash/redis';

// export const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL!,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
// });

import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// This protects the browser environment from crashing if the keys are stripped 🟢
export const redis = new Redis({
  url: url || '',
  token: token || '',
});
