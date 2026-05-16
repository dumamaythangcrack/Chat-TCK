import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

/**
 * Advanced Cron: Analytics aggregation, scheduled posts, streak resets, trend computation
 * Runs every hour via Vercel Cron
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const results: Record<string, unknown> = {};

  // ============================================
  // 1. PUBLISH SCHEDULED POSTS
  // ============================================
  const { data: scheduledPosts } = await supabase
    .from('scheduled_posts')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', now.toISOString())
    .limit(50);

  if (scheduledPosts?.length) {
    for (const sp of scheduledPosts) {
      const { data: post, error } = await supabase
        .from('posts')
        .insert({ ...sp.post_data, author_id: sp.user_id })
        .select('id')
        .single();

      await supabase
        .from('scheduled_posts')
        .update({
          status: error ? 'failed' : 'published',
          published_post_id: post?.id ?? null,
        })
        .eq('id', sp.id);
    }
    results.scheduled_posts_published = scheduledPosts.length;
  }

  // ============================================
  // 2. AGGREGATE DAILY ANALYTICS
  // ============================================
  const { count: newUsers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00Z`);

  const { count: newPosts } = await supabase
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00Z`);

  const { count: newMessages } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', `${today}T00:00:00Z`);

  // Upsert analytics
  const metrics = [
    { date: today, metric_type: 'dau_signups', value: newUsers ?? 0 },
    { date: today, metric_type: 'daily_posts', value: newPosts ?? 0 },
    { date: today, metric_type: 'daily_messages', value: newMessages ?? 0 },
  ];

  for (const m of metrics) {
    await supabase
      .from('analytics_daily')
      .upsert(
        { date: m.date, metric_type: m.metric_type, metric_key: 'global', value: m.value },
        { onConflict: 'date,metric_type,metric_key' }
      );
  }

  results.analytics = { newUsers, newPosts, newMessages };

  // ============================================
  // 3. EXPIRE PREMIUM SUBSCRIPTIONS
  // ============================================
  const { count: expiredPremium } = await supabase
    .from('premium_purchases')
    .update({ status: 'expired' })
    .eq('status', 'active')
    .lt('expires_at', now.toISOString());

  results.expired_premium = expiredPremium ?? 0;

  // ============================================
  // 4. CLEAN STALE PRESENCE DATA
  // ============================================
  // (handled by Redis TTL in realtime engine)

  return NextResponse.json({ success: true, results, timestamp: now.toISOString() });
}
