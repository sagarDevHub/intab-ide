import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/ai/gemini';
import { aiCache } from '@/lib/redis/cache';
import { rateLimiter } from '@/lib/redis/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const { messages, context, userId = 'anonymous' } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages required' }, { status: 400 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimiter.limit(`ai:chat:${userId}`);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          remaining: rateLimitResult.remaining,
          reset: Math.floor(Date.now() / 1000) + (rateLimitResult.reset || 60),
        },
        { status: 429 }
      );
    }

    // Build cache key from messages
    const lastMessage = messages[messages.length - 1]?.content || '';
    const cacheKey = aiCache.generateKey('chat', lastMessage.slice(0, 50), userId);

    // Check cache
    const cached = await aiCache.get<string>(cacheKey);
    if (cached) {
      return NextResponse.json({
        response: cached,
        cached: true,
        remaining: rateLimitResult.remaining,
      });
    }

    // Build the prompt
    const gemini = getGeminiClient();
    const conversation = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');
    const fullPrompt = context
      ? `Project Context:\n${context}\n\nConversation:\n${conversation}\n\nAssistant:`
      : `Conversation:\n${conversation}\n\nAssistant:`;

    // Generate response
    const response = await gemini.generateContent(fullPrompt, true);

    // Cache the response
    await aiCache.set(cacheKey, response, 1800);

    return NextResponse.json({
      response,
      cached: false,
      remaining: rateLimitResult.remaining,
    });
  } catch (error: any) {
    console.error('AI Chat error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process chat' }, { status: 500 });
  }
}
