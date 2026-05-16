import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const roomsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(30),
});

// GET /api/messages — List user's chat rooms
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
  const { page, limit } = roomsQuerySchema.parse(Object.fromEntries(searchParams));
  const offset = (page - 1) * limit;

  // Get rooms where user is a member
  const { data: memberships } = await supabase
    .from('room_members')
    .select('room_id, is_pinned, folder, is_muted')
    .eq('user_id', user.id)
    .order('is_pinned', { ascending: false });

  if (!memberships?.length) {
    return NextResponse.json({ rooms: [] });
  }

  const roomIds = memberships.map((m) => m.room_id);

  const { data: rooms } = await supabase
    .from('rooms')
    .select('*')
    .in('id', roomIds)
    .order('last_message_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return NextResponse.json({ rooms: rooms ?? [], page, limit });
}

// POST /api/messages — Send a message to a room
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
  const messageSchema = z.object({
    room_id: z.string().uuid(),
    content: z.string().max(10000).optional(),
    message_type: z.enum(['text', 'image', 'video', 'audio', 'file', 'gif', 'sticker', 'poll', 'system']).default('text'),
    media_url: z.string().url().optional(),
    reply_to_id: z.string().uuid().optional(),
    thread_id: z.string().uuid().optional(),
  });

  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  // Verify user is member of the room
  const { data: membership } = await supabase
    .from('room_members')
    .select('id')
    .eq('room_id', parsed.data.room_id)
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    return NextResponse.json({ error: 'Not a member of this room' }, { status: 403 });
  }

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      ...parsed.data,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message }, { status: 201 });
}
