import { z } from 'zod';

export const MessageSchema = z.object({
  id: z.string().uuid(),
  room_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  content: z.string(),
  message_type: z.enum(['text','image','video','audio','file','gif','sticker','poll','system']),
  media_url: z.string().url().optional(),
  reply_to_id: z.string().uuid().optional(),
  thread_id: z.string().uuid().optional(),
  is_edited: z.boolean(),
  is_deleted: z.boolean(),
  disappear_at: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
});

export type Message = z.infer<typeof MessageSchema>;

export const RoomSchema = z.object({
  id: z.string().uuid(),
  room_type: z.enum(['dm','group','community','ai','secret']),
  name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  is_encrypted: z.boolean(),
  last_message_at: z.string().datetime(),
  created_at: z.string().datetime(),
});

export type Room = z.infer<typeof RoomSchema>;
