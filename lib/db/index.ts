// Prisma client tekil örneği (Prisma 7 + pg driver adapter).
// DATABASE_URL yokken import güvenlidir; yalnızca getDb() çağrısı hata verir.
// NOT: 'server-only' bilinçli olarak YOK — CLI script'leri (seed/admin:create)
// bu modülü tsx altında kullanır; Next tarafında client'a sızması route
// yapısı ve tip katmanıyla engellenir.
import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { __mdvPrisma?: PrismaClient };

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Next build aşamasında mıyız? (Yerel build'in DB'siz çalışabilmesi için) */
export function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

export class DbConfigurationError extends Error {
  constructor() {
    super(
      'DATABASE_URL yapılandırılmamış. Railway PostgreSQL ekleyip DATABASE_URL ' +
        'değişkenini tanımlayın ve migration + seed çalıştırın (bkz. ADMIN_SETUP.md).',
    );
    this.name = 'DbConfigurationError';
  }
}

export function getDb(): PrismaClient {
  if (!process.env.DATABASE_URL) throw new DbConfigurationError();
  if (!globalForPrisma.__mdvPrisma) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    globalForPrisma.__mdvPrisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.__mdvPrisma;
}
