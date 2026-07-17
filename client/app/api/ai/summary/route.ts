import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/ai/gemini';
import { aiCache } from '@/lib/redis/cache';
import { rateLimiter } from '@/lib/redis/rate-limit';
import { PROMPTS } from '@/lib/ai/prompts';

export async function POST(req: NextRequest) {
  try {
    const { files, userId = 'anonymous' } = await req.json();

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: 'Files required' }, { status: 400 });
    }

    // Rate limiting
    const rateLimitResult = await rateLimiter.limit(`ai:summary:${userId}`);
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
    const filePaths = files
      .map((f: any) => f.path)
      .sort()
      .join(':');
    const cacheKey = aiCache.generateKey('summary', filePaths.slice(0, 100));

    // Check cache
    const cached = await aiCache.get<string>(cacheKey);
    if (cached) {
      return NextResponse.json({
        summary: cached,
        cached: true,
        remaining: rateLimitResult.remaining,
      });
    }

    // Generate summary
    const gemini = getGeminiClient();
    const prompt = PROMPTS.CODE_SUMMARY(files);
    const summary = await gemini.generateContent(prompt, true);

    // Cache (longer TTL for summaries)
    await aiCache.set(cacheKey, summary, 7200);

    return NextResponse.json({
      summary,
      cached: false,
      remaining: rateLimitResult.remaining,
    });
  } catch (error: any) {
    console.error('AI Summary error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
