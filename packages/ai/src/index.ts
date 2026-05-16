import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { redis } from '@tck/shared/src/redis';
import { logger } from '@tck/shared/src/logger';

// ============================================
// AI ORCHESTRATION LAYER
// Centralized Gemini access with caching, rate limiting, fallbacks
// ============================================

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  return genAI;
}

const SAFETY = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// ============================================
// RATE LIMITING & QUOTA
// ============================================

async function checkAiQuota(userId: string, feature: string): Promise<boolean> {
  const key = `ai:quota:${userId}:${feature}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 3600); // 1 hour window

  const limits: Record<string, number> = {
    chat: 100, moderate: 500, translate: 200, summarize: 100,
    caption: 50, search: 200, smart_reply: 300, score: 1000,
    subtitle: 50, trend: 20, recommend: 100,
  };

  return count <= (limits[feature] ?? 100);
}

// ============================================
// CACHING LAYER
// ============================================

async function getCachedResult<T>(cacheKey: string): Promise<T | null> {
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached as string) as T;
  return null;
}

async function setCachedResult(cacheKey: string, data: unknown, ttlSec = 300): Promise<void> {
  await redis.set(cacheKey, JSON.stringify(data), { ex: ttlSec });
}

// ============================================
// CORE GENERATION (with retry & fallback)
// ============================================

async function generate(prompt: string, model = 'gemini-2.0-flash', maxRetries = 2): Promise<string> {
  const genModel = getGenAI().getGenerativeModel({ model, safetySettings: SAFETY });

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await genModel.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      logger.warn(`AI generation attempt ${attempt + 1} failed`, 'AI', { error: String(err) });
      if (attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1))); // Exponential backoff
    }
  }
  throw new Error('AI generation exhausted all retries');
}

function parseJSON<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
  } catch {
    return fallback;
  }
}

// ============================================
// AI FEATURES
// ============================================

export async function aiChat(userId: string, messages: { role: string; content: string }[]): Promise<string> {
  if (!(await checkAiQuota(userId, 'chat'))) throw new Error('AI chat quota exceeded');

  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash', safetySettings: SAFETY });
  const chat = model.startChat({
    history: messages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
  });
  const result = await chat.sendMessage(messages[messages.length - 1].content);
  return result.response.text();
}

export interface ModerationResult {
  flagged: boolean;
  categories: Record<string, boolean>;
  confidence: number;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  suggestedAction: 'none' | 'warn' | 'hide' | 'delete' | 'ban';
  reason?: string;
}

export async function moderateContent(content: string): Promise<ModerationResult> {
  const cacheKey = `ai:mod:${Buffer.from(content.slice(0, 200)).toString('base64').slice(0, 40)}`;
  const cached = await getCachedResult<ModerationResult>(cacheKey);
  if (cached) return cached;

  const prompt = `You are an advanced content moderation AI for a social platform. Analyze this text:
- spam, hate_speech, harassment, nsfw, violence, self_harm, misinformation, scam, phishing
Return ONLY valid JSON:
{"flagged":bool,"categories":{"spam":bool,...},"confidence":0-1,"severity":"none|low|medium|high|critical","suggestedAction":"none|warn|hide|delete|ban","reason":"brief or null"}
Text: "${content.slice(0, 3000)}"`;

  const text = await generate(prompt);
  const result = parseJSON<ModerationResult>(text, {
    flagged: false, categories: {}, confidence: 0, severity: 'none', suggestedAction: 'none',
  });

  await setCachedResult(cacheKey, result, 600);
  return result;
}

export async function generateSmartReplies(context: string): Promise<string[]> {
  const text = await generate(
    `Given this chat context, suggest 3 short smart reply options. Return JSON array of strings only.\nContext: "${context.slice(0, 1000)}"`
  );
  return parseJSON<string[]>(text, ['Got it!', 'Thanks!', 'Sure!']);
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  const cacheKey = `ai:tr:${targetLang}:${Buffer.from(text.slice(0, 100)).toString('base64').slice(0, 30)}`;
  const cached = await getCachedResult<string>(cacheKey);
  if (cached) return cached;

  const result = (await generate(`Translate to ${targetLang}. Return ONLY the translated text:\n"${text}"`)).trim();
  await setCachedResult(cacheKey, result, 3600);
  return result;
}

export async function summarizeMessages(messages: string[]): Promise<string> {
  return (await generate(`Summarize these chat messages in 2-3 concise bullet points:\n${messages.join('\n')}`)).trim();
}

export async function generateCaption(description: string): Promise<{ caption: string; hashtags: string[] }> {
  const text = await generate(
    `Generate a viral social media caption and 5 hashtags. Return JSON only: {"caption":"...","hashtags":["#tag1",...]}\nContent: "${description}"`
  );
  return parseJSON(text, { caption: description, hashtags: [] });
}

export async function scoreContent(content: string, engagement: { likes: number; comments: number; shares: number; views: number }): Promise<number> {
  const cacheKey = `ai:score:${Buffer.from(content.slice(0, 50)).toString('base64').slice(0, 20)}`;
  const cached = await getCachedResult<number>(cacheKey);
  if (cached !== null) return cached;

  const text = await generate(
    `Rate this content quality + virality potential from 0.0 to 1.0. Consider engagement: ${JSON.stringify(engagement)}. Return ONLY a decimal number.\nContent: "${content.slice(0, 500)}"`
  );
  const score = Math.max(0, Math.min(1, parseFloat(text.trim()) || 0.5));
  await setCachedResult(cacheKey, score, 1800);
  return score;
}

export async function generateSubtitles(transcriptChunk: string): Promise<string> {
  return (await generate(`Convert this audio transcript into clean subtitles with proper punctuation and timing cues:\n"${transcriptChunk}"`)).trim();
}

export async function detectTrends(posts: string[]): Promise<string[]> {
  const text = await generate(
    `Analyze these recent posts and identify top 5 trending topics. Return JSON array of strings.\nPosts:\n${posts.slice(0, 20).join('\n')}`
  );
  return parseJSON<string[]>(text, []);
}

export async function aiSearch(query: string, context: string[]): Promise<string> {
  return (await generate(
    `You are a smart search assistant for TCK Chat. Answer the query using context provided.\nQuery: "${query}"\nContext: ${JSON.stringify(context.slice(0, 10))}`
  )).trim();
}

export async function aiNotificationPriority(notifications: Array<{ type: string; body: string }>): Promise<number[]> {
  const text = await generate(
    `Rank these notifications by importance (1=most important). Return JSON array of numbers in same order.\n${JSON.stringify(notifications.slice(0, 20))}`
  );
  return parseJSON<number[]>(text, notifications.map((_, i) => i + 1));
}
