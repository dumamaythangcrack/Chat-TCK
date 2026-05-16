import { redis } from '@tck/shared/src/redis';
import { logger } from '@tck/shared/src/logger';

// ============================================
// SECURITY ENGINE
// Anti-abuse, anti-bot, anti-raid, device fingerprinting
// ============================================

// ============================================
// IP RATE LIMITING & COOLDOWN
// ============================================

export async function checkIpCooldown(ip: string, action: string, maxPerMinute = 30): Promise<{ allowed: boolean; remaining: number }> {
  const key = `sec:ip:${ip}:${action}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60);
  return { allowed: count <= maxPerMinute, remaining: Math.max(0, maxPerMinute - count) };
}

// ============================================
// DEVICE FINGERPRINTING
// ============================================

export interface DeviceFingerprint {
  userAgent: string;
  language: string;
  platform: string;
  screenRes?: string;
  timezone?: string;
}

export function generateDeviceHash(fp: DeviceFingerprint): string {
  const raw = `${fp.userAgent}|${fp.language}|${fp.platform}|${fp.screenRes ?? ''}|${fp.timezone ?? ''}`;
  // Simple hash for fingerprinting (non-crypto, for matching purposes)
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// ============================================
// SUSPICIOUS BEHAVIOR DETECTION
// ============================================

interface BehaviorEvent {
  userId: string;
  action: string;
  timestamp: number;
}

export async function trackBehavior(userId: string, action: string): Promise<void> {
  const key = `sec:behavior:${userId}`;
  const event: BehaviorEvent = { userId, action, timestamp: Date.now() };
  await redis.lpush(key, JSON.stringify(event));
  await redis.ltrim(key, 0, 99); // Keep last 100 events
  await redis.expire(key, 3600);
}

export async function detectSuspiciousBehavior(userId: string): Promise<{ suspicious: boolean; reason?: string; score: number }> {
  const key = `sec:behavior:${userId}`;
  const events = await redis.lrange(key, 0, -1);
  if (!events.length) return { suspicious: false, score: 0 };

  const parsed = events.map((e) => JSON.parse(e as string) as BehaviorEvent);
  const now = Date.now();
  const last5min = parsed.filter((e) => now - e.timestamp < 300_000);

  let suspicionScore = 0;
  let reason: string | undefined;

  // Rapid-fire actions (bot behavior)
  if (last5min.length > 50) {
    suspicionScore += 40;
    reason = 'Rapid-fire actions detected';
  }

  // Repetitive actions
  const actionCounts = new Map<string, number>();
  for (const e of last5min) {
    actionCounts.set(e.action, (actionCounts.get(e.action) ?? 0) + 1);
  }
  for (const [action, count] of actionCounts) {
    if (count > 30) {
      suspicionScore += 30;
      reason = `Repetitive ${action} (${count}x in 5min)`;
    }
  }

  // Check timing patterns (uniform intervals = bot)
  if (last5min.length >= 10) {
    const intervals: number[] = [];
    for (let i = 1; i < Math.min(last5min.length, 20); i++) {
      intervals.push(last5min[i - 1].timestamp - last5min[i].timestamp);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
    if (variance < 100 && avgInterval < 2000) { // Very uniform, very fast
      suspicionScore += 30;
      reason = 'Bot-like timing pattern detected';
    }
  }

  return { suspicious: suspicionScore >= 50, reason, score: suspicionScore };
}

// ============================================
// ANTI-RAID DETECTION
// ============================================

export async function detectRaid(communityId: string): Promise<{ isRaid: boolean; joinCount: number }> {
  const key = `sec:raid:${communityId}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 300); // 5 minute window

  const isRaid = count > 50; // 50+ joins in 5 minutes
  if (isRaid) {
    logger.warn(`Raid detected on community ${communityId}: ${count} joins in 5min`, 'Security');
  }
  return { isRaid, joinCount: count };
}

// ============================================
// SHADOW BAN CHECK
// ============================================

export async function isShadowBanned(userId: string): Promise<boolean> {
  const banned = await redis.get(`sec:shadowban:${userId}`);
  return banned === '1';
}

export async function setShadowBan(userId: string, durationSec = 86400): Promise<void> {
  await redis.set(`sec:shadowban:${userId}`, '1', { ex: durationSec });
  logger.info(`Shadow banned user ${userId} for ${durationSec}s`, 'Security');
}

// ============================================
// LOGIN ANOMALY DETECTION
// ============================================

export async function detectLoginAnomaly(userId: string, ip: string, deviceHash: string): Promise<{ anomaly: boolean; reason?: string }> {
  const knownDevicesKey = `sec:devices:${userId}`;
  const knownIpsKey = `sec:ips:${userId}`;

  const knownDevices = new Set(await redis.smembers(knownDevicesKey) as string[]);
  const knownIps = new Set(await redis.smembers(knownIpsKey) as string[]);

  const newDevice = !knownDevices.has(deviceHash);
  const newIp = !knownIps.has(ip);

  // Remember this device/IP
  await redis.sadd(knownDevicesKey, deviceHash);
  await redis.sadd(knownIpsKey, ip);
  await redis.expire(knownDevicesKey, 86400 * 90);
  await redis.expire(knownIpsKey, 86400 * 90);

  if (newDevice && newIp && knownDevices.size > 0) {
    return { anomaly: true, reason: 'Login from new device and new IP' };
  }
  if (newDevice && knownDevices.size > 5) {
    return { anomaly: true, reason: 'Too many different devices' };
  }

  return { anomaly: false };
}
