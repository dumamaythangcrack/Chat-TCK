import { z } from 'zod';

export const AdminLogSchema = z.object({
  id: z.string().uuid(),
  admin_id: z.string().uuid(),
  action: z.string(),
  target_type: z.string().optional(),
  target_id: z.string().uuid().optional(),
  details: z.record(z.unknown()).optional(),
  created_at: z.string().datetime(),
});

export type AdminLog = z.infer<typeof AdminLogSchema>;

export const ModerationActionSchema = z.object({
  id: z.string().uuid(),
  moderator_id: z.string().uuid(),
  target_user_id: z.string().uuid().optional(),
  action_type: z.enum(['warn','mute','ban','shadow_ban','unban','delete_content','approve']),
  reason: z.string().optional(),
  expires_at: z.string().datetime().optional(),
});

export type ModerationAction = z.infer<typeof ModerationActionSchema>;
