// Better Auth route handler — signup disableSignUp ile kapalıdır;
// yalnızca sign-in/sign-out/session uçları etkindir.
// Auth örneği lazy kurulur (DATABASE_URL yokken import patlamasın diye).
import { getAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function handle(request: Request): Promise<Response> {
  try {
    return await getAuth().handler(request);
  } catch (err) {
    console.error('[auth] istek işlenemedi:', err);
    return Response.json(
      { error: 'Kimlik doğrulama servisi yapılandırılmamış (DATABASE_URL/AUTH_SECRET kontrol edin).' },
      { status: 503 },
    );
  }
}

export { handle as GET, handle as POST };
