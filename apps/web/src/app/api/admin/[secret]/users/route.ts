import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

type Params = { params: Promise<{ secret: string }> };

/**
 * Admin API — protected by dynamic secret path
 * Route: /api/admin/[secret]/users
 */
export async function GET(req: NextRequest, { params }: Params) {
  const { secret } = await params;
  if (secret !== process.env.ADMIN_SECRET_PATH) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
  const search = searchParams.get('search') ?? '';
  const offset = (page - 1) * limit;

  let query = supabase
    .from('profiles')
    .select('*, wallets(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`);
  }

  const { data: users, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ users, total: count, page, limit });
}
