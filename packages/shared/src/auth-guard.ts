import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export interface AuthContext {
  userId: string;
  email?: string;
}

/**
 * Auth guard HOF for API routes.
 * Extracts and validates the Bearer token, returning the user context.
 */
export async function withAuth(
  req: NextRequest,
  handler: (ctx: AuthContext, req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'Missing authorization token' }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
  }

  return handler({ userId: user.id, email: user.email }, req);
}
