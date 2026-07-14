// Public proje deposu — TEK veri erişim noktası.
// Kaynak seçimi (sıra önemli):
//   - build/prerender aşaması → HER ZAMAN data/projects.ts statik fallback
//     (Railway build ortamına DATABASE_URL verse bile bağlanılmaz; migration
//     henüz uygulanmamış veya private DB ağı erişilemez olabilir)
//   - runtime + DATABASE_URL varsa → PostgreSQL (yalnızca PUBLISHED kayıtlar)
//   - development + DB yoksa → statik fallback
//   - production RUNTIME + DB yoksa → açık DbConfigurationError (sessiz düşüş YOK)
import 'server-only';
import { getDb, isDbConfigured, isBuildPhase, DbConfigurationError } from '@/lib/db';
import { projects as staticProjects } from '@/data/projects';
import { dbProjectToView, staticProjectToView } from './mappers';
import type { ProjectView } from './types';

function assertRuntimeSource(): 'db' | 'static' {
  // Next.js build/prerender sırasında Railway DATABASE_URL tanımlı olsa bile
  // veritabanına bağlanma. Migration henüz pre-deploy aşamasında uygulanmamış
  // olabilir ve build ortamı private DB ağına erişemeyebilir.
  if (isBuildPhase()) {
    return 'static';
  }

  // Gerçek runtime'da DATABASE_URL varsa PostgreSQL kullan.
  if (isDbConfigured()) {
    return 'db';
  }

  // Local development DB olmadan statik veriyle çalışabilir.
  if (process.env.NODE_ENV !== 'production') {
    return 'static';
  }

  // Production runtime'da DB eksikse sessiz fallback yapma.
  throw new DbConfigurationError();
}

const mediaInclude = { media: true } as const;

export async function getPublishedProjects(): Promise<ProjectView[]> {
  if (assertRuntimeSource() === 'static') {
    return staticProjects.map(staticProjectToView);
  }
  const rows = await getDb().project.findMany({
    where: { status: 'PUBLISHED' },
    include: mediaInclude,
    orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
  });
  return rows.map(dbProjectToView);
}

export async function getFeaturedProjects(limit = 4): Promise<ProjectView[]> {
  if (assertRuntimeSource() === 'static') {
    return staticProjects.slice(0, limit).map(staticProjectToView);
  }
  const rows = await getDb().project.findMany({
    where: { status: 'PUBLISHED', featured: true },
    include: mediaInclude,
    orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
    take: limit,
  });
  if (rows.length > 0) return rows.map(dbProjectToView);
  // Featured işaretli proje yoksa vitrin boş kalmasın: son yayınlananlar
  const fallback = await getDb().project.findMany({
    where: { status: 'PUBLISHED' },
    include: mediaInclude,
    orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
    take: limit,
  });
  return fallback.map(dbProjectToView);
}

export async function getPublishedProjectBySlug(slug: string): Promise<ProjectView | null> {
  if (assertRuntimeSource() === 'static') {
    const p = staticProjects.find((x) => x.slug === slug);
    return p ? staticProjectToView(p) : null;
  }
  const row = await getDb().project.findFirst({
    where: { slug, status: 'PUBLISHED' },
    include: mediaInclude,
  });
  return row ? dbProjectToView(row) : null;
}

/** Slug bulunamazsa kalıcı yönlendirme hedefi (varsa). Döngü koruması içerir. */
export async function resolveSlugRedirect(slug: string): Promise<string | null> {
  if (assertRuntimeSource() === 'static') return null;
  const db = getDb();
  const seen = new Set<string>([slug]);
  let current = slug;
  for (let hop = 0; hop < 5; hop++) {
    const r = await db.slugRedirect.findUnique({ where: { oldSlug: current } });
    if (!r) return hop === 0 ? null : current;
    if (seen.has(r.newSlug)) return null; // döngü — yönlendirme yapma
    seen.add(r.newSlug);
    current = r.newSlug;
  }
  return current;
}

export async function getRelatedProjects(slug: string, limit = 3): Promise<ProjectView[]> {
  if (assertRuntimeSource() === 'static') {
    const current = staticProjects.find((p) => p.slug === slug);
    if (!current) return staticProjects.slice(0, limit).map(staticProjectToView);
    return staticProjects
      .filter((p) => p.slug !== slug)
      .sort((a, b) => {
        const as = a.categories.filter((c) => current.categories.includes(c)).length;
        const bs = b.categories.filter((c) => current.categories.includes(c)).length;
        return bs - as;
      })
      .slice(0, limit)
      .map(staticProjectToView);
  }
  const db = getDb();
  const current = await db.project.findUnique({ where: { slug } });
  const rows = await db.project.findMany({
    where: { status: 'PUBLISHED', slug: { not: slug } },
    include: mediaInclude,
    orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
    take: 24,
  });
  const cats = current?.categories ?? [];
  return rows
    .map((r) => ({ r, score: r.categories.filter((c) => cats.includes(c)).length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ r }) => dbProjectToView(r));
}
