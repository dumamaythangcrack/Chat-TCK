import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { z } from 'zod';

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
    type: z.enum(['offer', 'answer', 'candidate']),
    target_user_id: z.string().uuid(),
    room_id: z.string().uuid(),
    payload: z.any(),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 });

  const channel = supabase.channel(`webrtc:${parsed.data.room_id}`);
  await channel.send({
    type: 'broadcast',
    event: 'signal',
    payload: { from: user.id, to: parsed.data.target_user_id, signal_type: parsed.data.type, data: parsed.data.payload },
  });
  return NextResponse.json({ sent: true });
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      ...(process.env.TURN_USERNAME ? [{ urls: 'turn:turn.tck.chat:3478', username: process.env.TURN_USERNAME, credential: process.env.TURN_PASSWORD }] : []),
    ],
  });
}
