import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { generateUploadSignature, checkMediaQuota, enqueueVideoProcessing } from '@tck/media/src/index';
import { withAuth, type AuthContext } from '@tck/shared/src/auth-guard';
import { z } from 'zod';

// POST /api/media/upload-signature — Get signed upload params
export async function POST(req: NextRequest) {
  return withAuth(req, async (ctx: AuthContext) => {
    const body = await req.json();
    const schema = z.object({
      folder: z.enum(['posts', 'reels', 'stories', 'messages', 'avatars', 'covers']),
      fileSizeMb: z.number().min(0.01).max(500),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Validation failed' }, { status: 400 });
    }

    // Check user's storage quota
    const quota = await checkMediaQuota(ctx.userId, parsed.data.fileSizeMb);
    if (!quota.allowed) {
      return NextResponse.json({
        success: false,
        error: `Storage quota exceeded. Used: ${quota.usedMb.toFixed(1)}MB / ${quota.limitMb}MB`,
      }, { status: 413 });
    }

    const signature = await generateUploadSignature(
      `tck/${parsed.data.folder}/${ctx.userId}`,
      ctx.userId
    );

    return NextResponse.json({ success: true, data: signature });
  });
}
