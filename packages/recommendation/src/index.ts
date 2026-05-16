import { createClient } from '@supabase/supabase-js';
import { redis } from '@tck/shared/src/redis';

// ============================================
// RECOMMENDATION ENGINE
// Multi-signal ranking for feeds, reels, creators, communities
// ============================================

interface EngagementSignals {
  likes: number;
  comments: number;
  shares: number;
  views: number;
  watchTimeSec?: number;
  saves?: number;
}

/** Calculate virality score using weighted engagement signals */
export function calculateViralityScore(signals: EngagementSignals, ageHours: number): number {
  const engagementScore =
    (signals.likes * 1.0) +
    (signals.comments * 2.5) +
    (signals.shares * 4.0) +
    (signals.saves ?? 0) * 3.0 +
    ((signals.watchTimeSec ?? 0) * 0.1);

  const viewRatio = signals.views > 0 ? engagementScore / signals.views : 0;

  // Time decay: content loses ~50% relevance every 24 hours
  const timeDecay = Math.pow(0.5, ageHours / 24);

  return (engagementScore * 0.4 + viewRatio * 100 * 0.3) * timeDecay * 100;
}

/** Get personalized feed recommendation scores for a user */
export async function getPersonalizedFeed(userId: string, candidatePostIds: string[]): Promise<Map<string, number>> {
  const scores = new Map<string, number>();

  // Get user's interaction history from cache
  const interactedKey = `user:${userId}:interactions`;
  const interacted = new Set((await redis.smembers(interactedKey)) as string[]);

  // Get user's interest profile
  const interestsKey = `user:${userId}:interests`;
  const interests = (await redis.hgetall(interestsKey)) as Record<string, string> | null;

  for (const postId of candidatePostIds) {
    let score = 1.0;

    // Penalize already-seen content
    if (interacted.has(postId)) {
      score *= 0.1;
    }

    // Boost based on cached post metadata
    const postMeta = await redis.hgetall(`post:${postId}:meta`);
    if (postMeta) {
      const meta = postMeta as Record<string, string>;
      const likes = parseInt(meta.likes ?? '0');
      const comments = parseInt(meta.comments ?? '0');
      const aiScore = parseFloat(meta.ai_score ?? '0.5');

      score *= (1 + aiScore);
      score *= (1 + Math.log1p(likes) * 0.1);
      score *= (1 + Math.log1p(comments) * 0.15);

      // Interest matching
      if (interests && meta.hashtags) {
        const tags = meta.hashtags.split(',');
        for (const tag of tags) {
          if (interests[tag]) score *= (1 + parseFloat(interests[tag]) * 0.5);
        }
      }
    }

    scores.set(postId, score);
  }

  return scores;
}

/** Get trending reels by watch-time weighted engagement */
export async function getTrendingReels(limit = 50): Promise<string[]> {
  const cacheKey = 'trending:reels';
  const cached = await redis.zrevrange(cacheKey, 0, limit - 1);
  if (cached.length > 0) return cached as string[];
  return [];
}

/** Update trending scores for a reel after interaction */
export async function updateReelTrendingScore(reelId: string, signals: EngagementSignals): Promise<void> {
  const score = calculateViralityScore(signals, 1); // Assume recent
  await redis.zadd('trending:reels', { score, member: reelId });
  await redis.expire('trending:reels', 3600); // Refresh hourly
}

/** Record user interaction for personalization */
export async function recordInteraction(userId: string, contentId: string, contentType: string, action: string): Promise<void> {
  const key = `user:${userId}:interactions`;
  await redis.sadd(key, contentId);
  await redis.expire(key, 86400 * 7); // 7 days

  // Update interest profile based on content tags
  if (action === 'like' || action === 'save' || action === 'share') {
    const tags = await redis.hget(`post:${contentId}:meta`, 'hashtags');
    if (tags) {
      const interestsKey = `user:${userId}:interests`;
      for (const tag of (tags as string).split(',')) {
        await redis.hincrbyfloat(interestsKey, tag, action === 'share' ? 0.5 : 0.2);
      }
      await redis.expire(interestsKey, 86400 * 30); // 30 days
    }
  }
}

/** Friend/creator recommendation based on social graph */
export async function recommendUsers(userId: string, limit = 20): Promise<string[]> {
  const cacheKey = `recommend:users:${userId}`;
  const cached = await redis.lrange(cacheKey, 0, limit - 1);
  if (cached.length > 0) return cached as string[];
  return [];
}

/** Community recommendation */
export async function recommendCommunities(userId: string, limit = 10): Promise<string[]> {
  const cacheKey = `recommend:communities:${userId}`;
  const cached = await redis.lrange(cacheKey, 0, limit - 1);
  if (cached.length > 0) return cached as string[];
  return [];
}
