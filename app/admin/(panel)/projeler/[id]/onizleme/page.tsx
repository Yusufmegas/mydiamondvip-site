// Admin önizleme — DRAFT dahil, GERÇEK public template (ProjectDetail) ile.
// Cache kullanmaz, indexlenmez, yalnızca admin session ile açılır.
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdminPage } from '@/lib/auth/guard';
import { getProjectViewForPreview } from '@/lib/projects/admin-repository';
import { ProjectDetail } from '@/components/projects/ProjectDetail';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Önizleme',
  robots: { index: false, follow: false, nocache: true },
};

export default async function ProjectPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const view = await getProjectViewForPreview(id);
  if (!view) notFound();

  return (
    <div style={{ margin: '-24px' }}>
      <div
        style={{
          background: '#c99b5f',
          color: '#171310',
          padding: '10px 20px',
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span>ÖNİZLEME — bu sayfa public değildir ve taslak içeriği gösterebilir.</span>
        <Link href={`/admin/projeler/${id}`} style={{ textDecoration: 'underline' }}>
          Düzenlemeye Dön
        </Link>
      </div>
      {/* Public tasarımın kendisi: koyu zeminli site bölümleri */}
      <div style={{ background: '#0a0a0b' }}>
        <ProjectDetail project={view} related={[]} />
      </div>
    </div>
  );
}
