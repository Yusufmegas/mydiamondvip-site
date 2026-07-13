// İlk OWNER hesabını oluşturur. Public signup kapalıdır; kullanıcılar YALNIZCA
// bu komutla oluşturulur.
//
// Kullanım (PowerShell):
//   $env:ADMIN_EMAIL = "yonetici@ornek.com"; $env:ADMIN_PASSWORD = "guclu-sifre"
//   npm run admin:create
//   Remove-Item Env:ADMIN_EMAIL; Remove-Item Env:ADMIN_PASSWORD
//
// Kurallar: default şifre yok, şifre asla loglanmaz, aynı e-posta varsa
// ikinci kullanıcı oluşturulmaz.
import { getAuth } from '../lib/auth';
import { getDb } from '../lib/db';

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Yönetici';

  if (!process.env.DATABASE_URL) {
    console.error('HATA: DATABASE_URL tanımlı değil.');
    process.exit(1);
  }
  if (!process.env.AUTH_SECRET) {
    console.error('HATA: AUTH_SECRET tanımlı değil (rastgele uzun bir değer üretin).');
    process.exit(1);
  }
  if (!email || !password) {
    console.error('HATA: ADMIN_EMAIL ve ADMIN_PASSWORD environment değişkenlerini tanımlayın.');
    console.error('Şifre komut satırına argüman olarak YAZILMAZ (geçmişe düşmesin).');
    process.exit(1);
  }
  if (password.length < 10) {
    console.error('HATA: Şifre en az 10 karakter olmalı.');
    process.exit(1);
  }

  const db = getDb();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`HATA: ${email} zaten kayıtlı — ikinci kullanıcı oluşturulmadı.`);
    process.exit(1);
  }

  // disableSignUp etkinken sunucu tarafı oluşturma için signUpEmail API'si
  // doğrudan çağrılamaz; Better Auth'un internal adapter'ı yerine resmi yol:
  // geçici olarak signup'ı açık bir instance ile kullanıcı yaratmak yerine
  // auth.api.signUpEmail çağrısı disableSignUp=false gerektirir. Bu nedenle
  // burada Better Auth'un kendi context'i ile güvenli oluşturma yapılır.
  const auth = getAuth();
  const ctx = await auth.$context;
  const hashed = await ctx.password.hash(password);
  const user = await ctx.internalAdapter.createUser({
    email,
    name,
    emailVerified: true,
    role: 'OWNER',
  });
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: 'credential',
    accountId: user.id,
    password: hashed,
  });

  console.log(`OWNER oluşturuldu: ${email} (id: ${user.id})`);
  console.log('Artık /admin/giris adresinden giriş yapabilirsiniz.');
  await db.$disconnect();
}

main().catch((err) => {
  console.error('admin:create hatası:', err instanceof Error ? err.message : err);
  process.exit(1);
});
