import { z } from 'zod';
import { UserSchema } from './user';

export const PostSchema = z.object({
  id: z.string().uuid(),
  author: UserSchema,
  content: z.string(),
  mediaUrls: z.array(z.string().url()).optional(),
  likesCount: z.number().default(0),
  commentsCount: z.number().default(0),
  sharesCount: z.number().default(0),
  createdAt: z.string().datetime(),
});

export type Post = z.infer<typeof PostSchema>;
