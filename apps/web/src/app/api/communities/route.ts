import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

// GET /api/communities — List public communities
export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);
  const search = searchParams.get('search');
  const offset = (page - 1) * limit;

  let query = supabase
    .from('communities')
    .select('*, owner:profiles!owner_id(id, username, display_name, avatar_url)')
    .eq('is_public', true)
    .order('member_count', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data } = await query;
  return NextResponse.json({ communities: data ?? [], page, limit });
}

// POST /api/communities — Create a community
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
    name: z.string().min(2).max(100),
    description: z.string().max(2000).optional(),
    is_public: z.boolean().default(true),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 });

  const { data: community, error } = await supabase
    .from('communities')
    .insert({ ...parsed.data, owner_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Auto-join owner as first member
  await supabase.from('community_members').insert({ community_id: community.id, user_id: user.id });

  // Create default channels
  await supabase.from('channels').insert([
    { community_id: community.id, name: 'general', channel_type: 'text', category: 'Text Channels' },
    { community_id: community.id, name: 'announcements', channel_type: 'announcement', category: 'Information' },
    { community_id: community.id, name: 'Lounge', channel_type: 'voice', category: 'Voice Channels' },
  ]);

  return NextResponse.json({ community }, { status: 201 });
}
