// Admin sorguları — yalnızca requireAdmin geçmiş çağrılardan kullanılır.
import 'server-only';
import { getDb } from '@/lib/db';
import type { ProjectStatus } from '@/lib/generated/prisma/enums';
import { dbProjectToView, type PrismaProjectWithMedia } from './mappers';
import type { ProjectView } from './types';

export interface AdminProjectListItem {
  id: string;
  slug: string;
  title: string;
  vehicle: string;
  status: ProjectStatus;
  featured: boolean;
  sortOrder: number;
  hasMatterport: boolean;
  galleryCount: number;
  coverThumb: string | null;
  updatedAt: Date;
}

export interface AdminListFilters {
  q?: string;
  status?: 'ALL' | ProjectStatus | 'HAS_TOUR' | 'NO_TOUR' | 'FEATURED';
}

export async function listProjectsForAdmin(filters: AdminListFilters): Promise<AdminProjectListItem[]> {
  const db = getDb();
  const where: Record<string, unknown> = {};

  if (filters.q) {
    const q = filters.q.trim();
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { vehicle: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (filters.status === 'DRAFT' || filters.status === 'PUBLISHED' || filters.status === 'ARCHIVED') {
    where.status = filters.status;
  } else if (filters.status === 'HAS_TOUR') {
    where.matterportModelId = { not: null };
  } else if (filters.status === 'NO_TOUR') {
    where.matterportModelId = null;
  } else if (filters.status === 'FEATURED') {
    where.featured = true;
  }

  const rows = await db.project.findMany({
    where,
    include: { media: true },
    orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
  });

  return rows.map((p) => {
    const cover = p.media.find((m) => m.role === 'COVER');
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      vehicle: p.vehicle,
      status: p.status,
      featured: p.featured,
      sortOrder: p.sortOrder,
      hasMatterport: Boolean(p.matterportModelId),
      galleryCount: p.media.filter((m) => m.role === 'GALLERY').length,
      coverThumb: cover?.thumbnailUrl ?? cover?.publicUrl ?? null,
      updatedAt: p.updatedAt,
    };
  });
}

export async function getProjectForAdmin(id: string): Promise<PrismaProjectWithMedia | null> {
  return getDb().project.findUnique({
    where: { id },
    include: { media: { orderBy: [{ role: 'asc' }, { sortOrder: 'asc' }] } },
  });
}

/** Admin önizleme: DRAFT dahil, public ProjectDetail görünüm modeli üretir. */
export async function getProjectViewForPreview(id: string): Promise<ProjectView | null> {
  const row = await getProjectForAdmin(id);
  return row ? dbProjectToView(row) : null;
}

export interface AdminDashboardStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  withMatterport: number;
  recentlyUpdated: AdminProjectListItem[];
}

export async function getDashboardStats(): Promise<AdminDashboardStats> {
  const db = getDb();
  const [total, published, draft, archived, withMatterport, recent] = await Promise.all([
    db.project.count(),
    db.project.count({ where: { status: 'PUBLISHED' } }),
    db.project.count({ where: { status: 'DRAFT' } }),
    db.project.count({ where: { status: 'ARCHIVED' } }),
    db.project.count({ where: { matterportModelId: { not: null } } }),
    db.project.findMany({
      include: { media: true },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
  ]);

  return {
    total,
    published,
    draft,
    archived,
    withMatterport,
    recentlyUpdated: recent.map((p) => {
      const cover = p.media.find((m) => m.role === 'COVER');
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        vehicle: p.vehicle,
        status: p.status,
        featured: p.featured,
        sortOrder: p.sortOrder,
        hasMatterport: Boolean(p.matterportModelId),
        galleryCount: p.media.filter((m) => m.role === 'GALLERY').length,
        coverThumb: cover?.thumbnailUrl ?? cover?.publicUrl ?? null,
        updatedAt: p.updatedAt,
      };
    }),
  };
}
