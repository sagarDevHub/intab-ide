// app/api/ai/route.ts
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

    // Rate limiting with fallback
    let rateLimitResult;
    try {
      rateLimitResult = await rateLimiter.limit(`ai:${userId}`);
    } catch (error) {
      console.warn('Rate limit error, allowing request:', error);
      rateLimitResult = {
        success: true,
        remaining: 100,
        reset: Math.floor(Date.now() / 1000) + 60,
      };
    }

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

    // Cache check with error handling
    let cachedResponse = null;
    if (useCache) {
      try {
        const cacheKey = aiCache.generateKey(
          'ai',
          prompt.slice(0, 50),
          context?.slice(0, 50) || ''
        );
        cachedResponse = await aiCache.get<string>(cacheKey);
        if (cachedResponse) {
          return NextResponse.json({
            response: cachedResponse,
            cached: true,
            remaining: rateLimitResult.remaining,
          });
        }
      } catch (error) {
        console.warn('Cache read error:', error);
      }
    }

    // Generate with Gemini
    try {
      const gemini = getGeminiClient();
      const fullPrompt = context ? `Context:\n${context}\n\nTask:\n${prompt}` : prompt;
      const response = await gemini.generateContent(fullPrompt, true);

      // Cache the response
      if (useCache) {
        try {
          const cacheKey = aiCache.generateKey(
            'ai',
            prompt.slice(0, 50),
            context?.slice(0, 50) || ''
          );
          await aiCache.set(cacheKey, response, 1800);
        } catch (error) {
          console.warn('Cache write error:', error);
        }
      }

      return NextResponse.json({
        response,
        cached: false,
        remaining: rateLimitResult.remaining,
      });
    } catch (error: any) {
      console.error('AI API error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to process AI request' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
