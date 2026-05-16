import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

// GET /api/notifications — User's notifications
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.replace('Bearer ', '');
  const supabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '30'), 50);
  const cursor = searchParams.get('cursor');

  let query = supabase
    .from('notifications')
    .select('*, actor:profiles!actor_id(id, username, display_name, avatar_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data } = await query;

  return NextResponse.json({
    notifications: data ?? [],
    nextCursor: data?.length === limit ? data[data.length - 1].created_at : null,
  });
}

// PATCH /api/notifications — Mark as read
export async function PATCH(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.replace('Bearer ', '');
  const supabase = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const ids: string[] = body.ids;

  if (ids?.length) {
    await supabase.from('notifications').update({ is_read: true }).in('id', ids).eq('user_id', user.id);
  } else {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
  }

  return NextResponse.json({ success: true });
}
