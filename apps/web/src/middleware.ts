import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================
// EDGE MIDDLEWARE — Enterprise Grade
// Rate limiting, security headers, bot protection, CORS
// ============================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? req.ip
    ?? '0.0.0.0';
}

// Route-specific rate limits
const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  '/api/ai': { limit: 20, windowMs: 60_000 },
  '/api/auth': { limit: 10, windowMs: 60_000 },
  '/api/wallet': { limit: 30, windowMs: 60_000 },
  '/api/webhooks': { limit: 100, windowMs: 60_000 },
  '/api/feed': { limit: 120, windowMs: 60_000 },
  '/api/messages': { limit: 200, windowMs: 60_000 },
  '/api/livestream': { limit: 60, windowMs: 60_000 },
  '/api/cron': { limit: 5, windowMs: 60_000 },
  default: { limit: 120, windowMs: 60_000 },
};

function getRateLimit(pathname: string) {
  for (const [prefix, config] of Object.entries(RATE_LIMITS)) {
    if (prefix !== 'default' && pathname.startsWith(prefix)) return config;
  }
  return RATE_LIMITS.default;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getClientIp(req);

  // ============================================
  // BOT / SCRAPER DETECTION
  // ============================================
  if (pathname.startsWith('/api/')) {
    const ua = req.headers.get('user-agent')?.toLowerCase() ?? '';
    const suspiciousBots = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python-requests', 'go-http-client'];
    const isBot = suspiciousBots.some(b => ua.includes(b));

    // Block bots from sensitive endpoints
    if (isBot && (pathname.includes('/wallet') || pathname.includes('/admin') || pathname.includes('/auth'))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // ============================================
  // RATE LIMITING
  // ============================================
  if (pathname.startsWith('/api/')) {
    const { limit, windowMs } = getRateLimit(pathname);
    const key = `${ip}:${pathname.split('/').slice(0, 3).join('/')}`;
    const now = Date.now();

    const entry = rateLimitMap.get(key);
    if (entry && now < entry.resetAt) {
      entry.count++;
      if (entry.count > limit) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded', retryAfter },
          {
            status: 429,
            headers: {
              'Retry-After': String(retryAfter),
              'X-RateLimit-Limit': String(limit),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
            },
          }
        );
      }
    } else {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    }

    // Cleanup stale entries
    if (rateLimitMap.size > 50_000) {
      for (const [k, v] of rateLimitMap) {
        if (now > v.resetAt) rateLimitMap.delete(k);
      }
    }
  }

  // ============================================
  // CRON ROUTE PROTECTION
  // ============================================
  if (pathname.startsWith('/api/cron/')) {
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // ============================================
  // SECURITY HEADERS
  // ============================================
  const response = NextResponse.next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // Strict CSP for non-API routes
  if (!pathname.startsWith('/api/')) {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' wss: https:; media-src 'self' blob: https:; font-src 'self' https://fonts.gstatic.com;"
    );
  }

  // CORS for API
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL ?? '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-Id');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
