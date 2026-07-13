// İdempotent seed — data/projects.ts içindeki statik projeleri veritabanına taşır.
// Kurallar:
//   - Var olan slug ATLANIR (panelden düzenlenmiş veri asla ezilmez)
//   - --force verilirse mevcut kayıt medyasıyla birlikte statik veriden YENİDEN yazılır
//   - Medya kayıtları mevcut /images/projects/... public yollarını kullanır
//     (object storage'a taşıma zorunlu değildir; yeni yüklemeler S3 kullanır)
// Çalıştırma: npm run db:seed   |   zorla: npm run db:seed -- --force
import { PrismaClient } from '../lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { projects as staticProjects } from '../data/projects';
import type { Project as StaticProject } from '../data/projects';

const FORCE = process.argv.includes('--force');

function orientationToDb(o?: string): 'LANDSCAPE' | 'PORTRAIT' | 'SQUARE' | 'WIDE' {
  switch (o) {
    case 'portrait': return 'PORTRAIT';
    case 'square': return 'SQUARE';
    case 'wide': return 'WIDE';
    default: return 'LANDSCAPE';
  }
}

function parseObjectPosition(pos?: string): { x: number; y: number } {
  if (!pos) return { x: 50, y: 50 };
  const m = /^(\d{1,3})%\s+(\d{1,3})%$/.exec(pos.trim());
  if (!m) return { x: 50, y: 50 };
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  return { x: clamp(parseInt(m[1], 10)), y: clamp(parseInt(m[2], 10)) };
}

function extractModelId(url: string): string | null {
  try {
    return new URL(url).searchParams.get('m');
  } catch {
    return null;
  }
}

async function seedProject(db: PrismaClient, p: StaticProject, sortOrder: number): Promise<'created' | 'skipped' | 'forced'> {
  const existing = await db.project.findUnique({ where: { slug: p.slug } });
  if (existing && !FORCE) return 'skipped';

  const data = {
    slug: p.slug,
    title: p.title,
    vehicle: p.vehicle,
    categories: [...p.categories],
    operations: [...p.operations],
    materials: [...p.materials],
    keywords: [...p.keywords],
    summary: p.summary,
    description: p.description,
    status: 'PUBLISHED' as const,
    featured: sortOrder < 4, // mevcut ana sayfa vitrini ilk 4 projeydi
    sortOrder,
    matterportTitle: p.matterportTour?.title ?? null,
    matterportUrl: p.matterportTour?.embedUrl ?? null,
    matterportModelId: p.matterportTour ? extractModelId(p.matterportTour.embedUrl) : null,
    robotsIndex: true,
    publishedAt: new Date('2026-07-13T00:00:00Z'),
  };

  const mediaData = [
    {
      role: 'COVER' as const,
      publicUrl: p.image,
      thumbnailUrl: p.image,
      alt: `${p.title} — kapak görseli`,
      orientation: 'LANDSCAPE' as const,
      objectPositionX: 50,
      objectPositionY: 50,
      sortOrder: 0,
      storageKey: null, // statik public dosya — storage'dan silinmez
    },
    ...(p.matterportTour
      ? [{
          role: 'MATTERPORT_POSTER' as const,
          publicUrl: p.matterportTour.poster,
          thumbnailUrl: p.matterportTour.poster,
          alt: `${p.title} — Matterport poster`,
          orientation: 'LANDSCAPE' as const,
          objectPositionX: 50,
          objectPositionY: 50,
          sortOrder: 0,
          storageKey: null,
        }]
      : []),
    ...p.gallery.map((g, i) => {
      const pos = parseObjectPosition(g.objectPosition);
      return {
        role: 'GALLERY' as const,
        publicUrl: g.src,
        thumbnailUrl: g.src,
        alt: g.alt,
        caption: g.caption ?? null,
        orientation: orientationToDb(g.orientation),
        objectPositionX: pos.x,
        objectPositionY: pos.y,
        sortOrder: i,
        storageKey: null,
      };
    }),
  ];

  await db.$transaction(async (tx) => {
    if (existing) {
      await tx.projectMedia.deleteMany({ where: { projectId: existing.id } });
      await tx.project.update({ where: { id: existing.id }, data });
      for (const m of mediaData) {
        await tx.projectMedia.create({ data: { ...m, projectId: existing.id } });
      }
    } else {
      const created = await tx.project.create({ data });
      for (const m of mediaData) {
        await tx.projectMedia.create({ data: { ...m, projectId: created.id } });
      }
    }
  });

  return existing ? 'forced' : 'created';
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('HATA: DATABASE_URL tanımlı değil. Seed çalıştırılamaz.');
    process.exit(1);
  }
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const db = new PrismaClient({ adapter });

  console.log(`Seed başlıyor (${staticProjects.length} statik proje, force=${FORCE})…`);
  let created = 0, skipped = 0, forced = 0;
  for (let i = 0; i < staticProjects.length; i++) {
    const result = await seedProject(db, staticProjects[i], i);
    if (result === 'created') created++;
    else if (result === 'skipped') skipped++;
    else forced++;
    console.log(`  ${staticProjects[i].slug}: ${result}`);
  }
  console.log(`Bitti — oluşturulan: ${created}, atlanan: ${skipped}, zorla güncellenen: ${forced}`);
  await db.$disconnect();
}

main().catch((err) => {
  console.error('Seed hatası:', err);
  process.exit(1);
});
