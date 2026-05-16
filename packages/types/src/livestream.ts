import { z } from 'zod';

export const LivestreamSchema = z.object({
  id: z.string().uuid(),
  streamer_id: z.string().uuid(),
  title: z.string(),
  status: z.enum(['idle','live','ended']),
  viewer_count: z.number(),
  peak_viewers: z.number(),
  total_gifts_value: z.number(),
  is_premium: z.boolean(),
  started_at: z.string().datetime().optional(),
  ended_at: z.string().datetime().optional(),
});

export type Livestream = z.infer<typeof LivestreamSchema>;
