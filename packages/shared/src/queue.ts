import { redis } from './redis';

interface QueueJob<T = unknown> {
  id: string;
  type: string;
  payload: T;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
}

/**
 * Redis-backed job queue for background processing.
 * Used for: AI moderation, video transcoding, notification batching, analytics aggregation.
 */
export class Queue {
  constructor(private name: string) {}

  private get key() {
    return `queue:${this.name}`;
  }

  async enqueue<T>(type: string, payload: T, maxAttempts = 3): Promise<string> {
    const job: QueueJob<T> = {
      id: `${this.name}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
      type,
      payload,
      attempts: 0,
      maxAttempts,
      createdAt: Date.now(),
    };
    await redis.lpush(this.key, JSON.stringify(job));
    return job.id;
  }

  async dequeue<T>(): Promise<QueueJob<T> | null> {
    const raw = await redis.rpop(this.key);
    if (!raw) return null;
    return JSON.parse(raw as string) as QueueJob<T>;
  }

  async size(): Promise<number> {
    return redis.llen(this.key);
  }

  async peek<T>(count = 10): Promise<QueueJob<T>[]> {
    const items = await redis.lrange(this.key, -count, -1);
    return items.map((item) => JSON.parse(item as string) as QueueJob<T>);
  }

  /** Process jobs with a handler. Retries on failure up to maxAttempts. */
  async process<T>(handler: (job: QueueJob<T>) => Promise<void>): Promise<number> {
    let processed = 0;
    const batchSize = 10;

    for (let i = 0; i < batchSize; i++) {
      const job = await this.dequeue<T>();
      if (!job) break;

      try {
        job.attempts++;
        await handler(job);
        processed++;
      } catch (err) {
        if (job.attempts < job.maxAttempts) {
          // Re-enqueue for retry
          await redis.lpush(`${this.key}:retry`, JSON.stringify(job));
        } else {
          // Dead letter queue
          await redis.lpush(`${this.key}:dead`, JSON.stringify({ ...job, error: String(err) }));
        }
      }
    }

    return processed;
  }
}

// Pre-configured queues
export const moderationQueue = new Queue('moderation');
export const notificationQueue = new Queue('notifications');
export const analyticsQueue = new Queue('analytics');
export const mediaQueue = new Queue('media');
