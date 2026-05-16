import { redis } from './redis';

interface RateLimitConfig {
  /** Max requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSec: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Sliding-window rate limiter using Upstash Redis.
 * Used to protect API routes, auth endpoints, AI features, etc.
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 60, windowSec: 60 }
): Promise<RateLimitResult> {
  const key = `rl:${identifier}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - config.windowSec;

  // Use a pipeline for atomicity
  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart);
  pipeline.zadd(key, { score: now, member: `${now}:${Math.random()}` });
  pipeline.zcard(key);
  pipeline.expire(key, config.windowSec);

  const results = await pipeline.exec();
  const count = results[2] as number;

  return {
    allowed: count <= config.limit,
    remaining: Math.max(0, config.limit - count),
    resetAt: now + config.windowSec,
  };
}
