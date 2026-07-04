import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/ai/gemini';
import { aiCache } from '@/lib/redis/cache';
import { rateLimiter } from '@/lib/redis/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const { prompt, context, useCache = true, userId = 'anonymous' } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    const rateLimitResult = await rateLimiter.limit(`ai:${userId}`);

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

    // Cache check
    const cacheKey = aiCache.generateKey('ai', prompt.slice(0, 50), context?.slice(0, 50) || '');

    if (useCache) {
      const cached = await aiCache.get<string>(cacheKey);
      if (cached) {
        return NextResponse.json({
          response: cached,
          cached: true,
          remaining: rateLimitResult.remaining,
        });
      }
    }

    // Generate with Gemini
    const gemini = getGeminiClient();
    const fullPrompt = context ? `Context:\n${context}\n\nTask:\n${prompt}` : prompt;
    const response = await gemini.generateContent(fullPrompt, true);

    // Cache the response
    if (useCache) {
      await aiCache.set(cacheKey, response, 1800); // 30 minutes cache
    }

    return NextResponse.json({
      response,
      cached: false,
      remaining: rateLimitResult.remaining,
    });
  } catch (error: any) {
    console.error('AI API error:', error);

    // Handle specific Gemini errors
    if (error.message?.includes('Rate limit')) {
      return NextResponse.json(
        { error: 'AI rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
