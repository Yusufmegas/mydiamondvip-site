// Better Auth sunucu örneği — e-posta/şifre, public signup KAPALI.
// Şifreler Better Auth'un varsayılan güçlü hash'iyle (scrypt) saklanır.
// ('server-only' yok: admin:create CLI script'i bu modülü tsx ile kullanır.)
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { getDb } from '@/lib/db';

function createAuth() {
  return betterAuth({
      appName: 'MyDiamondVIP Admin',
      baseURL: process.env.AUTH_URL,
      secret: process.env.AUTH_SECRET,
      basePath: '/api/auth',
      database: prismaAdapter(getDb(), { provider: 'postgresql' }),
      emailAndPassword: {
        enabled: true,
        // Public kayıt YOK — kullanıcılar yalnızca admin:create CLI ile oluşturulur
        disableSignUp: true,
        minPasswordLength: 10,
      },
      user: {
        additionalFields: {
          role: { type: 'string', defaultValue: 'OWNER', input: false },
        },
      },
      session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 gün
        updateAge: 60 * 60 * 24,
      },
      advanced: {
        useSecureCookies: process.env.NODE_ENV === 'production',
        defaultCookieAttributes: {
          httpOnly: true,
          sameSite: 'lax',
        },
      },
      rateLimit: {
        enabled: true,
        window: 60,
        max: 20, // login brute-force koruması (better-auth sign-in için ayrıca daha sıkı kural uygular)
      },
      plugins: [nextCookies()],
    });
}

let authInstance: ReturnType<typeof createAuth> | null = null;

export function getAuth(): ReturnType<typeof createAuth> {
  if (!authInstance) authInstance = createAuth();
  return authInstance;
}
