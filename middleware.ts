import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import { apiAuthPrefix, authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoutes } from './route';
import { redis } from './lib/redis/rate-limit';

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

  if (isApiAuthRoute || nextUrl.pathname.startsWith('/api')) {
    await redis.set(`blocklist:${clientIndentifier}`, 'true', { ex: 86400 });
    return new NextResponse('Automated script traffic blocked', { status: 403 });
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
