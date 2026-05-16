import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { redis } from '@tck/shared/src/redis';

// ============================================
// REALTIME EVENT ORCHESTRATION ENGINE
// Manages WebSocket subscriptions, presence, typing, reactions
// ============================================

function getRealtimeClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ============================================
// TYPING INDICATORS (debounced)
// ============================================

export async function setTyping(roomId: string, userId: string, isTyping: boolean): Promise<void> {
  const key = `rt:typing:${roomId}`;
  if (isTyping) {
    await redis.hset(key, userId, Date.now().toString());
    await redis.expire(key, 10); // Auto-expire after 10s
  } else {
    await redis.hdel(key, userId);
  }
}

export async function getTypingUsers(roomId: string): Promise<string[]> {
  const key = `rt:typing:${roomId}`;
  const data = await redis.hgetall(key) as Record<string, string> | null;
  if (!data) return [];
  const now = Date.now();
  return Object.entries(data)
    .filter(([_, ts]) => now - parseInt(ts) < 8000) // Only recent
    .map(([userId]) => userId);
}

// ============================================
// PRESENCE SYSTEM
// ============================================

export async function setOnline(userId: string): Promise<void> {
  await redis.hset('rt:presence', userId, Date.now().toString());
}

export async function setOffline(userId: string): Promise<void> {
  await redis.hdel('rt:presence', userId);
}

export async function getOnlineUsers(userIds: string[]): Promise<Set<string>> {
  if (!userIds.length) return new Set();
  const online = new Set<string>();
  const now = Date.now();

  // Batch check
  for (const uid of userIds) {
    const ts = await redis.hget('rt:presence', uid);
    if (ts && now - parseInt(ts as string) < 120_000) { // 2 minute heartbeat window
      online.add(uid);
    }
  }
  return online;
}

export async function getOnlineCount(): Promise<number> {
  return redis.hlen('rt:presence');
}

// ============================================
// REALTIME REACTIONS (throttled)
// ============================================

export async function broadcastReaction(
  contentType: 'post' | 'reel' | 'livestream',
  contentId: string,
  userId: string,
  reaction: string
): Promise<void> {
  // Throttle: max 1 reaction per 2 seconds per user per content
  const throttleKey = `rt:react:${userId}:${contentId}`;
  const exists = await redis.exists(throttleKey);
  if (exists) return;
  await redis.set(throttleKey, '1', { ex: 2 });

  // Broadcast via Supabase channel
  const supabase = getRealtimeClient();
  const channel = supabase.channel(`reactions:${contentType}:${contentId}`);
  await channel.send({
    type: 'broadcast',
    event: 'reaction',
    payload: { userId, reaction, timestamp: Date.now() },
  });
}

// ============================================
// LIVESTREAM REALTIME
// ============================================

export async function broadcastLiveGift(
  livestreamId: string,
  senderId: string,
  senderName: string,
  giftName: string,
  giftIcon: string,
  coinValue: number
): Promise<void> {
  const supabase = getRealtimeClient();
  const channel = supabase.channel(`live:${livestreamId}`);
  await channel.send({
    type: 'broadcast',
    event: 'gift',
    payload: { senderId, senderName, giftName, giftIcon, coinValue, timestamp: Date.now() },
  });
}

export async function broadcastLiveChat(
  livestreamId: string,
  userId: string,
  username: string,
  message: string
): Promise<void> {
  const supabase = getRealtimeClient();
  const channel = supabase.channel(`live:${livestreamId}`);
  await channel.send({
    type: 'broadcast',
    event: 'chat',
    payload: { userId, username, message, timestamp: Date.now() },
  });
}

export async function updateViewerCount(livestreamId: string, delta: number): Promise<number> {
  const key = `rt:live:viewers:${livestreamId}`;
  const count = await redis.incrby(key, delta);
  await redis.expire(key, 3600);
  return Math.max(0, count);
}

// ============================================
// NOTIFICATION BROADCAST
// ============================================

export async function broadcastNotification(userId: string, notification: {
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  const supabase = getRealtimeClient();
  const channel = supabase.channel(`user:${userId}`);
  await channel.send({
    type: 'broadcast',
    event: 'notification',
    payload: { ...notification, timestamp: Date.now() },
  });
}

// ============================================
// COIN/WALLET REALTIME UPDATES
// ============================================

export async function broadcastWalletUpdate(userId: string, newBalance: number): Promise<void> {
  const supabase = getRealtimeClient();
  const channel = supabase.channel(`user:${userId}`);
  await channel.send({
    type: 'broadcast',
    event: 'wallet_update',
    payload: { balance_coins: newBalance, timestamp: Date.now() },
  });
}

// ============================================
// STREAK SYSTEM REALTIME
// ============================================

export async function broadcastStreakUpdate(userId: string, streakDays: number, xpGained: number): Promise<void> {
  const supabase = getRealtimeClient();
  const channel = supabase.channel(`user:${userId}`);
  await channel.send({
    type: 'broadcast',
    event: 'streak',
    payload: { streakDays, xpGained, timestamp: Date.now() },
  });
}
