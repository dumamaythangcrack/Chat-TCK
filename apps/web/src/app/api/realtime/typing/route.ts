import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { withAuth, type AuthContext } from '@tck/shared/src/auth-guard';
import { setTyping, getTypingUsers, setOnline } from '@tck/realtime/src/index';

// POST /api/realtime/typing — Set typing indicator
export async function POST(req: NextRequest) {
  return withAuth(req, async (ctx: AuthContext) => {
    const body = await req.json();
    const { room_id, is_typing } = body;

    if (!room_id) {
      return NextResponse.json({ success: false, error: 'Missing room_id' }, { status: 400 });
    }

    await setTyping(room_id, ctx.userId, is_typing ?? true);
    return NextResponse.json({ success: true });
  });
}

// GET /api/realtime/typing?room_id=xxx — Get who's typing
export async function GET(req: NextRequest) {
  const roomId = new URL(req.url).searchParams.get('room_id');
  if (!roomId) {
    return NextResponse.json({ success: false, error: 'Missing room_id' }, { status: 400 });
  }

  const typingUsers = await getTypingUsers(roomId);
  return NextResponse.json({ success: true, data: { typing: typingUsers } });
}
