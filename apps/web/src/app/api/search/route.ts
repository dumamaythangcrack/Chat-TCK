import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { withAuth, type AuthContext } from '@tck/shared/src/auth-guard';

// GET /api/search — Full-text search across content types
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  const type = searchParams.get('type') ?? 'all'; // all, post, reel, user, community
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);

  if (!query || query.length < 2) {
    return NextResponse.json({ success: false, error: 'Query too short' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const results: Record<string, unknown[]> = {};

  // Search users
  if (type === 'all' || type === 'user') {
    const { data: users } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, verified, is_premium')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(limit);
    results.users = users ?? [];
  }

  // Search posts
  if (type === 'all' || type === 'post') {
    const { data: posts } = await supabase
      .from('posts')
      .select('id, content, author_id, likes_count, created_at, author:profiles!author_id(username, display_name, avatar_url)')
      .ilike('content', `%${query}%`)
      .eq('visibility', 'public')
      .is('deleted_at', null)
      .order('likes_count', { ascending: false })
      .limit(limit);
    results.posts = posts ?? [];
  }

  // Search communities
  if (type === 'all' || type === 'community') {
    const { data: communities } = await supabase
      .from('communities')
      .select('id, name, description, avatar_url, member_count')
      .eq('is_public', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('member_count', { ascending: false })
      .limit(limit);
    results.communities = communities ?? [];
  }

  // Search hashtags
  if (type === 'all' || type === 'hashtag') {
    const { data: hashtags } = await supabase
      .from('hashtags')
      .select('id, tag, usage_count, trending')
      .ilike('tag', `%${query}%`)
      .order('usage_count', { ascending: false })
      .limit(10);
    results.hashtags = hashtags ?? [];
  }

  return NextResponse.json({ success: true, data: results, query });
}
