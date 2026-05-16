import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }
  return genAI;
}

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// ============================================
// AI CHATBOT
// ============================================
export async function aiChat(messages: { role: string; content: string }[]): Promise<string> {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });
  const chat = model.startChat({
    safetySettings: SAFETY_SETTINGS,
    history: messages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
  });
  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text();
}

// ============================================
// CONTENT MODERATION
// ============================================
export interface ModerationResult {
  flagged: boolean;
  categories: Record<string, boolean>;
  confidence: number;
  reason?: string;
}

export async function moderateContent(content: string): Promise<ModerationResult> {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = `You are a content moderation system. Analyze the following text for:
- spam
- hate_speech
- harassment
- nsfw
- violence
- self_harm
- misinformation

Respond in JSON only:
{"flagged": boolean, "categories": {"spam": bool, "hate_speech": bool, ...}, "confidence": 0-1, "reason": "brief explanation or null"}

Text: "${content.slice(0, 2000)}"`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { flagged: false, categories: {}, confidence: 0 };
  }
}

// ============================================
// SMART REPLY SUGGESTIONS
// ============================================
export async function generateSmartReplies(context: string): Promise<string[]> {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = `Given this chat context, suggest 3 short smart reply options. Return JSON array of strings only.
Context: "${context.slice(0, 1000)}"`;
  const result = await model.generateContent(prompt);
  try {
    const cleaned = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return ['Got it!', 'Thanks!', 'Sure thing!'];
  }
}

// ============================================
// AI TRANSLATION
// ============================================
export async function translateText(text: string, targetLang: string): Promise<string> {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = `Translate the following text to ${targetLang}. Return ONLY the translated text, nothing else.
Text: "${text}"`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ============================================
// AI SUMMARIZE
// ============================================
export async function summarizeMessages(messages: string[]): Promise<string> {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = `Summarize these chat messages in 2-3 bullet points. Be concise.
Messages:
${messages.join('\n')}`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ============================================
// AI CAPTION / HASHTAG GENERATION
// ============================================
export async function generateCaption(description: string): Promise<{ caption: string; hashtags: string[] }> {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = `Generate a social media caption and 5 relevant hashtags for this content. Return JSON only:
{"caption": "...", "hashtags": ["#tag1", "#tag2", ...]}
Content: "${description}"`;
  const result = await model.generateContent(prompt);
  try {
    const cleaned = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { caption: description, hashtags: [] };
  }
}

// ============================================
// AI CONTENT SCORING (for recommendation engine)
// ============================================
export async function scoreContent(content: string, engagement: { likes: number; comments: number; shares: number }): Promise<number> {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = `Rate this social media content on quality, engagement potential, and virality from 0 to 1. Consider engagement stats: ${JSON.stringify(engagement)}. Return only a number between 0 and 1.
Content: "${content.slice(0, 500)}"`;
  const result = await model.generateContent(prompt);
  const score = parseFloat(result.response.text().trim());
  return isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score));
}

// ============================================
// AI SEARCH
// ============================================
export async function aiSearch(query: string, context: string[]): Promise<string> {
  const model = getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = `You are a search assistant for the TCK Chat social platform. Based on the user query and available context, provide a helpful and concise answer.
Query: "${query}"
Context: ${JSON.stringify(context.slice(0, 10))}`;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}
