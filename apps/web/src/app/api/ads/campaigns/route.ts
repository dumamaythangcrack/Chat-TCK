import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

// GET /api/ads/campaigns — List user's ad campaigns
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.replace('Bearer ', '');
  const supabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase
    .from('ad_campaigns')
    .select('*, ads(*)')
    .eq('advertiser_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ campaigns: data ?? [] });
}

// POST /api/ads/campaigns — Create an ad campaign
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.replace('Bearer ', '');
  const supabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const schema = z.object({
    name: z.string().min(1).max(200),
    budget_coins: z.number().min(100),
    target_audience: z.object({
      age_range: z.tuple([z.number(), z.number()]).optional(),
      interests: z.array(z.string()).optional(),
      locations: z.array(z.string()).optional(),
    }).optional(),
    starts_at: z.string().datetime().optional(),
    ends_at: z.string().datetime().optional(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 });

  // Check wallet balance
  const { data: wallet } = await supabase.from('wallets').select('balance_coins').eq('user_id', user.id).single();
  if (!wallet || wallet.balance_coins < parsed.data.budget_coins) {
    return NextResponse.json({ error: 'Insufficient coins for campaign budget' }, { status: 400 });
  }

  const { data: campaign, error } = await supabase
    .from('ad_campaigns')
    .insert({ ...parsed.data, advertiser_id: user.id, status: 'draft' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ campaign }, { status: 201 });
}
