import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

type Params = { params: Promise<{ secret: string }> };

// GET — List pending withdrawal requests
export async function GET(req: NextRequest, { params }: Params) {
  const { secret } = await params;
  if (secret !== process.env.ADMIN_SECRET_PATH) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? 'pending';

  const { data } = await supabase
    .from('withdrawal_requests')
    .select('*, user:profiles!user_id(id, username, display_name)')
    .eq('status', status)
    .order('created_at', { ascending: true });

  return NextResponse.json({ withdrawals: data ?? [] });
}

// PATCH — Approve/reject a withdrawal
export async function PATCH(req: NextRequest, { params }: Params) {
  const { secret } = await params;
  if (secret !== process.env.ADMIN_SECRET_PATH) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await req.json();
  const schema = z.object({
    withdrawal_id: z.string().uuid(),
    action: z.enum(['approved', 'rejected', 'completed']),
    admin_note: z.string().optional(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('withdrawal_requests')
    .update({
      status: parsed.data.action,
      admin_note: parsed.data.admin_note,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.withdrawal_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
