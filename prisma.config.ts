// Prisma 7 yapılandırması — bağlantı URL'si şemadan buraya taşındı.
// DATABASE_URL yoksa datasource verilmez: validate/generate/build DB'siz çalışır;
// migrate/seed gibi bağlantı gerektiren komutlar açık hata verir.
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  ...(process.env.DATABASE_URL
    ? { datasource: { url: process.env.DATABASE_URL } }
    : {}),
});
