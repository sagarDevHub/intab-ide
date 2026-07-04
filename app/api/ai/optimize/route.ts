import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/ai/gemini';
import { aiCache } from '@/lib/redis/cache';
import { rateLimiter } from '@/lib/redis/rate-limit';
import { PROMPTS } from '@/lib/ai/prompts';

export async function POST(req: NextRequest) {
  try {
    const { code, language, filePath, userId = 'anonymous' } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimiter.limit(`ai:optimize:${userId}`);
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
    const cacheKey = aiCache.generateKey('optimize', filePath || 'unknown', code.slice(-100));

    // Check cache
    const cached = await aiCache.get<string>(cacheKey);
    if (cached) {
      return NextResponse.json({
        optimizedCode: cached,
        cached: true,
        remaining: rateLimitResult.remaining,
      });
    }

    // Generate optimization
    const gemini = getGeminiClient();
    const prompt = PROMPTS.OPTIMIZE_CODE(code, language || 'javascript');
    const optimizedCode = await gemini.generateContent(prompt, true);

    // Cache
    await aiCache.set(cacheKey, optimizedCode, 3600);

    return NextResponse.json({
      optimizedCode,
      cached: false,
      remaining: rateLimitResult.remaining,
    });
  } catch (error: any) {
    console.error('AI Optimize error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to optimize code' },
      { status: 500 }
    );
  }
}
