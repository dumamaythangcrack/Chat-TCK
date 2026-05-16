import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

// GET /api/livestream — List active livestreams
export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);
  const offset = (page - 1) * limit;

  const { data: streams } = await supabase
    .from('livestreams')
    .select(`
      *,
      streamer:profiles!streamer_id(id, username, display_name, avatar_url, verified)
    `)
    .eq('status', 'live')
    .order('viewer_count', { ascending: false })
    .range(offset, offset + limit - 1);

  return NextResponse.json({ streams: streams ?? [], page, limit });
}

// POST /api/livestream — Start a livestream
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
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    is_premium: z.boolean().default(false),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  // Generate a unique stream key
  const streamKey = `tck_${crypto.randomUUID().replace(/-/g, '')}`;

  const { data: stream, error } = await supabase
    .from('livestreams')
    .insert({
      streamer_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      is_premium: parsed.data.is_premium,
      stream_key: streamKey,
      status: 'live',
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ stream }, { status: 201 });
}
