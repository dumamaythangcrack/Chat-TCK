import { NextRequest, NextResponse } from 'next/server';
import { setOnline, setOffline, getOnlineUsers, getOnlineCount } from '@tck/realtime/src/index';
import { withAuth, type AuthContext } from '@tck/shared/src/auth-guard';

// POST /api/realtime/presence — Heartbeat (call every 60s)
export async function POST(req: NextRequest) {
  return withAuth(req, async (ctx: AuthContext) => {
    const body = await req.json();
    const { action } = body;

    if (action === 'offline') {
      await setOffline(ctx.userId);
    } else {
      await setOnline(ctx.userId);
    }

    return NextResponse.json({ success: true });
  });
}

// GET /api/realtime/presence?user_ids=id1,id2,id3
export async function GET(req: NextRequest) {
  const userIdsParam = new URL(req.url).searchParams.get('user_ids');
  if (!userIdsParam) {
    const count = await getOnlineCount();
    return NextResponse.json({ success: true, data: { onlineCount: count } });
  }

  const userIds = userIdsParam.split(',').filter(Boolean);
  const online = await getOnlineUsers(userIds);

  return NextResponse.json({
    success: true,
    data: {
      online: Object.fromEntries(userIds.map(id => [id, online.has(id)])),
      onlineCount: online.size,
    },
  });
}
