// Public proje detayı — yalnızca PUBLISHED kayıtlar (repository üzerinden).
// DRAFT/ARCHIVED → 404; değişen slug'lar SlugRedirect ile kalıcı yönlendirilir.
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getPublishedProjectBySlug, getRelatedProjects, resolveSlugRedirect } from '@/lib/projects/repository';
import { ProjectDetail } from '@/components/projects/ProjectDetail';

// Panelden yayınlama/güncelleme revalidatePath ile anında yansır; ek ISR güvencesi.
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.seoTitle || `${project.title} — ${project.vehicle}`,
    description: project.seoDescription || project.summary,
    keywords: project.keywords,
    alternates: { canonical: `/projeler/${slug}` },
    openGraph: { images: [project.image] },
    robots: project.robotsIndex === false ? { index: false, follow: false } : undefined,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);

  if (!project) {
    // Slug değişmiş olabilir → kalıcı redirect (loop korumalı)
    const target = await resolveSlugRedirect(slug);
    if (target && target !== slug) permanentRedirect(`/projeler/${target}`);
    notFound();
  }

  const related = await getRelatedProjects(slug);
  return <ProjectDetail project={project} related={related} />;
}
