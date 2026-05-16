import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { aiChat, moderateContent, generateSmartReplies, translateText, summarizeMessages, generateCaption, aiSearch } from '@/lib/ai';
import { z } from 'zod';

const aiRequestSchema = z.discriminatedUnion('feature', [
  z.object({
    feature: z.literal('chat'),
    messages: z.array(z.object({ role: z.string(), content: z.string() })).min(1),
  }),
  z.object({
    feature: z.literal('moderate'),
    content: z.string().min(1).max(5000),
  }),
  z.object({
    feature: z.literal('smart_reply'),
    context: z.string().min(1),
  }),
  z.object({
    feature: z.literal('translate'),
    text: z.string().min(1),
    target_lang: z.string().min(2),
  }),
  z.object({
    feature: z.literal('summarize'),
    messages: z.array(z.string()).min(1),
  }),
  z.object({
    feature: z.literal('caption'),
    description: z.string().min(1),
  }),
  z.object({
    feature: z.literal('search'),
    query: z.string().min(1),
    context: z.array(z.string()).optional(),
  }),
]);

// POST /api/ai — Unified AI endpoint
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
  const parsed = aiRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
  }

  const startTime = Date.now();

  try {
    let result: unknown;

    switch (parsed.data.feature) {
      case 'chat':
        result = { reply: await aiChat(parsed.data.messages) };
        break;
      case 'moderate':
        result = await moderateContent(parsed.data.content);
        break;
      case 'smart_reply':
        result = { suggestions: await generateSmartReplies(parsed.data.context) };
        break;
      case 'translate':
        result = { translated: await translateText(parsed.data.text, parsed.data.target_lang) };
        break;
      case 'summarize':
        result = { summary: await summarizeMessages(parsed.data.messages) };
        break;
      case 'caption':
        result = await generateCaption(parsed.data.description);
        break;
      case 'search':
        result = { answer: await aiSearch(parsed.data.query, parsed.data.context ?? []) };
        break;
    }

    const durationMs = Date.now() - startTime;

    // Log AI usage (async, don't await)
    supabase.from('ai_usage').insert({
      user_id: user.id,
      feature: parsed.data.feature,
      tokens_used: 0, // Gemini doesn't always return token count easily
    });

    supabase.from('ai_logs').insert({
      user_id: user.id,
      feature: parsed.data.feature,
      duration_ms: durationMs,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI error:', error);
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}
