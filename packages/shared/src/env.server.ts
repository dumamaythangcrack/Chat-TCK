import { z } from 'zod';

/**
 * SERVER-ONLY environment variables.
 * These NEVER reach the client bundle.
 * Validated at startup — fails fast if missing.
 */
const serverEnvSchema = z.object({
  // --- Supabase ---
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  DATABASE_URL: z.string().optional(),

  // --- AI ---
  GEMINI_API_KEY: z.string().min(10),

  // --- Cloudinary ---
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  // --- Redis ---
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(10),

  // --- Push ---
  ONESIGNAL_API_KEY: z.string().optional(),

  // --- Payment ---
  SEPAY_API_KEY: z.string().optional(),
  VIETQR_API_KEY: z.string().optional(),
  SEPAY_WEBHOOK_SECRET: z.string().optional(),

  // --- Cron ---
  CRON_SECRET: z.string().min(16),

  // --- JWT ---
  JWT_SECRET: z.string().min(32),

  // --- Admin ---
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(12),
  ADMIN_SECRET_PATH: z.string().min(8),

  // --- WebRTC TURN ---
  TURN_URL: z.string().optional(),
  TURN_USERNAME: z.string().optional(),
  TURN_PASSWORD: z.string().optional(),

  // --- Node ---
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let _serverEnv: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (_serverEnv) return _serverEnv;

  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const missing = Object.entries(errors)
      .map(([key, msgs]) => `  ❌ ${key}: ${msgs?.join(', ')}`)
      .join('\n');
    console.error(`\n🚨 Missing/invalid server environment variables:\n${missing}\n`);
    throw new Error('Server environment validation failed. Check logs above.');
  }

  _serverEnv = parsed.data;
  return _serverEnv;
}

/** Helper: check if we're in production */
export function isProd(): boolean {
  return serverEnv().NODE_ENV === 'production';
}
