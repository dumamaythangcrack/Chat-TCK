import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3),
  displayName: z.string(),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(160).optional(),
  isPremium: z.boolean().default(false),
  verified: z.boolean().default(false),
});

export type User = z.infer<typeof UserSchema>;
