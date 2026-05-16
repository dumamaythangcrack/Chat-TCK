import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

/**
 * Cron: Clean expired stories, disappearing messages, inactive streams
 * Protected by CRON_SECRET bearer token
 * Vercel Cron: add to vercel.json
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const results: Record<string, number> = {};

  // 1. Delete expired stories
  const { count: stories } = await supabase
    .from('stories')
    .delete({ count: 'exact' })
    .lt('expires_at', now);
  results.expired_stories = stories ?? 0;

  // 2. Delete disappearing messages
  const { count: msgs } = await supabase
    .from('messages')
    .delete({ count: 'exact' })
    .not('disappear_at', 'is', null)
    .lt('disappear_at', now);
  results.disappeared_messages = msgs ?? 0;

  // 3. End stale livestreams (live for > 12 hours)
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
  const { count: streams } = await supabase
    .from('livestreams')
    .update({ status: 'ended', ended_at: now })
    .eq('status', 'live')
    .lt('started_at', twelveHoursAgo);
  results.stale_streams_ended = streams ?? 0;

  // 4. Clear old notifications (> 90 days)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { count: notifs } = await supabase
    .from('notifications')
    .delete({ count: 'exact' })
    .eq('is_read', true)
    .lt('created_at', ninetyDaysAgo);
  results.old_notifications = notifs ?? 0;

  return NextResponse.json({ success: true, cleaned: results, timestamp: now });
}
