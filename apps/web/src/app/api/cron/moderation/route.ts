import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { moderateContent } from '@tck/ai/src/index';

/**
 * Cron: Process moderation queue
 * Runs every 15 minutes
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const results = { processed: 0, flagged: 0, actioned: 0 };

  // Fetch recent unmoderated posts
  const { data: posts } = await supabase
    .from('posts')
    .select('id, content, author_id')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50);

  if (posts) {
    for (const post of posts) {
      if (!post.content) continue;

      // Check if already moderated
      const { data: existing } = await supabase
        .from('ai_moderation')
        .select('id')
        .eq('content_type', 'post')
        .eq('content_id', post.id)
        .single();

      if (existing) continue;

      const result = await moderateContent(post.content);
      results.processed++;

      await supabase.from('ai_moderation').insert({
        content_type: 'post',
        content_id: post.id,
        flagged: result.flagged,
        categories: result.categories,
        confidence: result.confidence,
        action_taken: result.suggestedAction,
      });

      if (result.flagged) {
        results.flagged++;

        // Auto-action for high-severity content
        if (result.severity === 'critical' || result.severity === 'high') {
          await supabase.from('posts').update({ deleted_at: new Date().toISOString() }).eq('id', post.id);
          results.actioned++;

          // Log moderation action
          await supabase.from('moderation_actions').insert({
            moderator_id: post.author_id, // System action
            target_user_id: post.author_id,
            action_type: result.severity === 'critical' ? 'ban' : 'warn',
            reason: `AI: ${result.reason ?? 'Content policy violation'}`,
          });
        }
      }
    }
  }

  return NextResponse.json({ success: true, results });
}
