// Teklif demo girişi — kod yalnızca sunucuda doğrulanır, asla loglanmaz.
import { NextResponse, type NextRequest } from 'next/server';
import {
  isQuoteDemoConfigured,
  verifyAccessCode,
  createSessionToken,
  QUOTE_SESSION_COOKIE,
  QUOTE_SESSION_TTL_MS,
} from '@/lib/quote-demo/auth';

export const dynamic = 'force-dynamic';

// Best-effort, bellek içi deneme sınırı (DB/Redis YOK — demo kapsamı).
// Çok replikalı ortamda mutlak garanti vermez; kaba brute-force'u yavaşlatır.
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(request: NextRequest) {
  if (!isQuoteDemoConfigured()) {
    return NextResponse.json(
      { error: 'Teklif sistemi yapılandırılmamış.' },
      { status: 503 },
    );
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.' },
      { status: 429 },
    );
  }

  let code = '';
  try {
    const body = (await request.json()) as { code?: unknown };
    code = typeof body.code === 'string' ? body.code : '';
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 });
  }

  if (!code || code.length > 200 || !verifyAccessCode(code)) {
    return NextResponse.json({ error: 'Giriş kodu hatalı.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(QUOTE_SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(QUOTE_SESSION_TTL_MS / 1000),
    // domain YOK — host-only cookie
  });
  return res;
}
