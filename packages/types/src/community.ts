import { z } from 'zod';

export const CommunitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  avatar_url: z.string().url().optional(),
  owner_id: z.string().uuid(),
  member_count: z.number(),
  is_public: z.boolean(),
  boost_level: z.number(),
});

export type Community = z.infer<typeof CommunitySchema>;

export const ChannelSchema = z.object({
  id: z.string().uuid(),
  community_id: z.string().uuid(),
  name: z.string(),
  channel_type: z.enum(['text','voice','event','announcement']),
  category: z.string().optional(),
});

export type Channel = z.infer<typeof ChannelSchema>;
