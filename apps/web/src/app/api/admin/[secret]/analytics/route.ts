import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

type Params = { params: Promise<{ secret: string }> };

// GET — Analytics dashboard data
export async function GET(req: NextRequest, { params }: Params) {
  const { secret } = await params;
  if (secret !== process.env.ADMIN_SECRET_PATH) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const supabase = createAdminClient();

  // Parallel queries for dashboard stats
  const [usersResult, postsResult, streamsResult, transactionsResult, moderationResult] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('posts').select('id', { count: 'exact', head: true }),
    supabase.from('livestreams').select('id', { count: 'exact', head: true }).eq('status', 'live'),
    supabase.from('transactions').select('amount').eq('tx_type', 'recharge').eq('status', 'completed'),
    supabase.from('ai_moderation').select('id', { count: 'exact', head: true }).eq('flagged', true),
  ]);

  const totalRevenue = (transactionsResult.data ?? []).reduce((sum, t) => sum + (t.amount ?? 0), 0);

  return NextResponse.json({
    totalUsers: usersResult.count ?? 0,
    totalPosts: postsResult.count ?? 0,
    activeStreams: streamsResult.count ?? 0,
    totalRevenue,
    flaggedContent: moderationResult.count ?? 0,
  });
}
