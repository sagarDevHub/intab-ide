import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/ai/gemini';
import { aiCache } from '@/lib/redis/cache';
import { rateLimiter } from '@/lib/redis/rate-limit';
import { PROMPTS } from '@/lib/ai/prompts';

export async function POST(req: NextRequest) {
  try {
    const { code, language, cursorPosition, filePath, userId = 'anonymous' } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimiter.limit(`ai:suggestion:${userId}`);
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

    // Cache key
    const cacheKey = aiCache.generateKey(
      'suggestion',
      filePath || 'unknown',
      code.slice(-200),
      String(cursorPosition || 0)
    );

    // Check cache
    const cached = await aiCache.get<string>(cacheKey);
    if (cached) {
      return NextResponse.json({
        suggestion: cached,
        cached: true,
        remaining: rateLimitResult.remaining,
      });
    }

    // Generate suggestion
    const gemini = getGeminiClient();
    const prompt = PROMPTS.INLINE_SUGGESTION(
      code,
      language || 'javascript',
      cursorPosition || code.length
    );
    const suggestion = await gemini.generateContent(prompt, true);

    // Cache
    await aiCache.set(cacheKey, suggestion, 300);

    return NextResponse.json({
      suggestion,
      cached: false,
      remaining: rateLimitResult.remaining,
    });
  } catch (error: any) {
    console.error('AI Suggestion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate suggestion' },
      { status: 500 }
    );
  }
}
