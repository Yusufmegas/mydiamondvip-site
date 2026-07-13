// Next 16 route koruması (middleware yerine proxy.ts — resmi konvansiyon).
// Hızlı cookie varlık kontrolü yapar; GERÇEK yetki doğrulaması her zaman
// sunucu tarafında (requireAdmin / requireAdminPage) tekrarlanır.
import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(getSessionCookie(request));

  const isLogin = pathname === '/admin/giris';

  if (isLogin) {
    // Girişli kullanıcı login sayfasına gelirse panele yönlendir
    if (hasSessionCookie) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // /admin ve /api/admin altındaki her şey cookie ister
  if (!hasSessionCookie) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
    }
    // Açık redirect açığı yok: hedef sabit /admin/giris
    return NextResponse.redirect(new URL('/admin/giris', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/api/admin/:path*'],
};
