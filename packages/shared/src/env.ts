import { z } from 'zod';

/**
 * Runtime environment validation.
 * Throws at startup if required secrets are missing.
 */
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  ONESIGNAL_API_KEY: z.string().optional(),
  SEPAY_API_KEY: z.string().optional(),
  CRON_SECRET: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  ADMIN_SECRET_PATH: z.string().min(8),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function env(): Env {
  if (cachedEnv) return cachedEnv;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Missing required environment variables');
  }
  cachedEnv = parsed.data;
  return cachedEnv;
}
