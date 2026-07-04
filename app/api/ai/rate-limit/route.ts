import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // ✅ Use the userId or prefix with underscore to indicate it's intentionally unused
    const { userId = 'anonymous' } = await req.json();

    // Return default rate limit values
    return NextResponse.json({
      remaining: 100,
      reset: Math.floor(Date.now() / 1000) + 60,
      limit: 100,
    });
  } catch (error) {
    console.error('Rate limit check error:', error);
    return NextResponse.json({ error: 'Failed to check rate limit' }, { status: 500 });
  }
}
