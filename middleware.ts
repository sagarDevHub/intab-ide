import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import { apiAuthPrefix, authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoutes } from './route';
import { rateLimiter } from './lib/redis/rate-limit';
import { redis } from './lib/redis/redis';

const BANNED_BOT_SIGNATURE = [
  'headlesschromewp',
  'selenium',
  'playwright',
  'puppeteer',
  'python-requests',
  'curl',
  'wget',
  'postmanruntime',
];

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const userAgent = (req.headers.get('user-agen') ?? '').toLowerCase();
  const clientIndentifier = req.headers.get('x-forwarded-for') ?? 'global-fallback-ip';

  const hasActiveSession = !!getSessionCookie(req);
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // SECURITY LAYER
  if (isApiAuthRoute || nextUrl.pathname.startsWith('/api')) {
    if (BANNED_BOT_SIGNATURE.some(bot => userAgent.includes(bot))) {
      await redis.set(`blocklist:${clientIndentifier}`, 'true', { ex: 86400 });
      return new NextResponse('Automated script traffic blocked', { status: 403 });
    }

    const isGloballyBlocked = await redis.get(`blocklist:${clientIndentifier}`);
    if (isGloballyBlocked) {
      return new NextResponse('IP node flagged ror bot activity.', { status: 403 });
    }

    const { success } = await rateLimiter.limit(clientIndentifier);
    if (!success) {
      await redis.set(`blocklist:${clientIndentifier}`, 'true', { ex: 300 });
      return new NextResponse('Too many Requests. Slow down!', { status: 429 });
    }
  }

  if (isApiAuthRoute) return NextResponse.next();

  if (isAuthRoute && hasActiveSession) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url));
  }

  if (!hasActiveSession && !isAuthRoute && !publicRoutes.includes(nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/auth/sign-in', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
