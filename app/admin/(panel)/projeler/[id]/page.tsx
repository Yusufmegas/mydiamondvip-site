import { notFound } from 'next/navigation';
import { requireAdminPage } from '@/lib/auth/guard';
import { getProjectForAdmin } from '@/lib/projects/admin-repository';
import { isStorageConfigured } from '@/lib/storage';
import { ProjectForm } from '@/components/admin/projects/ProjectForm';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { MediaItem } from '@/components/admin/media/MediaManager';

export const dynamic = 'force-dynamic';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const project = await getProjectForAdmin(id);
  if (!project) notFound();

  const media: MediaItem[] = project.media.map((m) => ({
    id: m.id,
    role: m.role,
    publicUrl: m.publicUrl,
    thumbnailUrl: m.thumbnailUrl,
    alt: m.alt,
    caption: m.caption,
    orientation: m.orientation,
    objectPositionX: m.objectPositionX,
    objectPositionY: m.objectPositionY,
    sortOrder: m.sortOrder,
  }));

  return (
    <>
      <div className="adm-row" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 16 }}>{project.title}</h2>
        <StatusBadge status={project.status} />
      </div>
      <ProjectForm
        projectId={project.id}
        media={media}
        storageConfigured={isStorageConfigured()}
        statusLabel={project.status}
        initial={{
          title: project.title,
          vehicle: project.vehicle,
          slug: project.slug,
          categories: project.categories,
          operations: project.operations,
          materials: project.materials,
          keywords: project.keywords,
          summary: project.summary,
          description: project.description,
          featured: project.featured,
          sortOrder: project.sortOrder,
          matterportEnabled: Boolean(project.matterportUrl),
          matterportTitle: project.matterportTitle ?? '',
          matterportInput: project.matterportUrl ?? '',
          seoTitle: project.seoTitle ?? '',
          seoDescription: project.seoDescription ?? '',
          robotsIndex: project.robotsIndex,
        }}
      />
    </>
  );
}
