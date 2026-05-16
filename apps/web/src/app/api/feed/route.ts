import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

const feedQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  type: z.enum(['recommended', 'following', 'trending', 'nearby']).default('recommended'),
});

// GET /api/feed — Paginated feed with type filter
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = feedQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid parameters', details: parsed.error.flatten() }, { status: 400 });
  }

  const { page, limit, type } = parsed.data;
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();

  let query = supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id(id, username, display_name, avatar_url, verified, is_premium)
    `)
    .eq('is_draft', false)
    .eq('visibility', 'public')
    .range(offset, offset + limit - 1);

  // Apply ordering strategy by feed type
  switch (type) {
    case 'trending':
      query = query.order('likes_count', { ascending: false });
      break;
    case 'recommended':
      query = query.order('ai_score', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data: posts, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    posts: posts ?? [],
    page,
    limit,
    hasMore: (posts?.length ?? 0) === limit,
  });
}

// POST /api/feed — Create a new post
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = createAdminClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const postSchema = z.object({
    content: z.string().max(5000),
    media_urls: z.array(z.string().url()).max(10).optional(),
    post_type: z.enum(['text', 'image', 'video', 'poll', 'carousel', 'audio', 'mood', 'anonymous']).default('text'),
    visibility: z.enum(['public', 'friends', 'private']).default('public'),
    hashtags: z.array(z.string()).max(30).optional(),
  });

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const { data: post, error: insertError } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      ...parsed.data,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ post }, { status: 201 });
}
