// Prisma satırları ve statik seed verisi → ProjectView dönüştürücüleri.
import type { Project as PrismaProject, ProjectMedia } from '@/lib/generated/prisma/client';
import type { MediaOrientation } from '@/lib/generated/prisma/enums';
import type { ProjectView, ProjectGalleryItemView, GalleryOrientationView } from './types';
import type { Project as StaticProject } from '@/data/projects';

const orientationMap: Record<MediaOrientation, GalleryOrientationView> = {
  LANDSCAPE: 'landscape',
  PORTRAIT: 'portrait',
  SQUARE: 'square',
  WIDE: 'wide',
};

export type PrismaProjectWithMedia = PrismaProject & { media: ProjectMedia[] };

function mediaToGalleryItem(m: ProjectMedia): ProjectGalleryItemView {
  return {
    src: m.publicUrl,
    alt: m.alt,
    caption: m.caption ?? undefined,
    orientation: orientationMap[m.orientation],
    objectPosition: `${m.objectPositionX}% ${m.objectPositionY}%`,
  };
}

export function dbProjectToView(p: PrismaProjectWithMedia): ProjectView {
  const cover = p.media.find((m) => m.role === 'COVER');
  const poster = p.media.find((m) => m.role === 'MATTERPORT_POSTER');
  const gallery = p.media
    .filter((m) => m.role === 'GALLERY')
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(mediaToGalleryItem);

  const hasTour = Boolean(p.matterportUrl && poster);

  return {
    slug: p.slug,
    title: p.title,
    vehicle: p.vehicle,
    categories: p.categories,
    operations: p.operations,
    summary: p.summary,
    description: p.description,
    materials: p.materials,
    image: cover?.publicUrl ?? gallery[0]?.src ?? '/poster.webp',
    matterportTour: hasTour
      ? {
          title: p.matterportTitle ?? p.title,
          embedUrl: p.matterportUrl!,
          poster: poster!.publicUrl,
        }
      : undefined,
    gallery,
    keywords: p.keywords,
    seoTitle: p.seoTitle ?? undefined,
    seoDescription: p.seoDescription ?? undefined,
    robotsIndex: p.robotsIndex,
  };
}

export function staticProjectToView(p: StaticProject): ProjectView {
  return {
    slug: p.slug,
    title: p.title,
    vehicle: p.vehicle,
    categories: [...p.categories],
    operations: [...p.operations],
    summary: p.summary,
    description: p.description,
    materials: [...p.materials],
    image: p.image,
    matterportTour: p.matterportTour
      ? { title: p.matterportTour.title, embedUrl: p.matterportTour.embedUrl, poster: p.matterportTour.poster }
      : undefined,
    gallery: p.gallery.map((g) => ({
      src: g.src,
      alt: g.alt,
      caption: g.caption,
      orientation: g.orientation,
      objectPosition: g.objectPosition,
    })),
    keywords: [...p.keywords],
  };
}
