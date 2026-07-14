// Next 16 route koruması + host-based routing (middleware yerine proxy.ts).
// 1) teklif.mydiamondvip.com → dahili /teklif-demo rewrite (adres çubuğu değişmez)
// 2) /admin hızlı cookie varlık kontrolü; GERÇEK yetki doğrulaması her zaman
//    sunucu tarafında (requireAdmin / requireAdminPage / hasQuoteSession) tekrarlanır.
import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

const QUOTE_HOST = 'teklif.mydiamondvip.com';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = (request.headers.get('host') ?? '').toLowerCase().split(':')[0];

  // ---- Teklif subdomain'i: dahili rewrite (statik dosya/asset/API hariç) ----
  if (host === QUOTE_HOST) {
    if (
      !pathname.startsWith('/teklif-demo') &&
      !pathname.startsWith('/api/') &&
      !pathname.startsWith('/_next') &&
      !/\.[a-zA-Z0-9]+$/.test(pathname) // uzantılı statik dosyalar (logo, favicon…)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = pathname === '/' ? '/teklif-demo' : `/teklif-demo${pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // ---- Ana domain'den /teklif-demo → production'da subdomain'e yönlendir ----
  if (
    pathname.startsWith('/teklif-demo') &&
    process.env.NODE_ENV === 'production' &&
    (host === 'mydiamondvip.com' || host === 'www.mydiamondvip.com')
  ) {
    const rest = pathname.replace(/^\/teklif-demo/, '') || '/';
    return NextResponse.redirect(`https://${QUOTE_HOST}${rest}`);
  }

  // ---- Admin koruması (mevcut davranış aynen) ----
  if (pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/')) {
    const hasSessionCookie = Boolean(getSessionCookie(request));
    const isLogin = pathname === '/admin/giris';

    if (isLogin) {
      if (hasSessionCookie) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    if (!hasSessionCookie) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
      }
      // Açık redirect açığı yok: hedef sabit /admin/giris
      return NextResponse.redirect(new URL('/admin/giris', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Subdomain rewrite'ı için '/' ve '/giris' de eşleşir; diğer hostlarda bu
  // yollar hiçbir işleme girmeden next() ile devam eder.
  matcher: [
    '/admin/:path*',
    '/admin',
    '/api/admin/:path*',
    '/teklif-demo/:path*',
    '/teklif-demo',
    '/',
    '/giris',
  ],
};
