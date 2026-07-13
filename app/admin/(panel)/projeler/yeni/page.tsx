import { requireAdminPage } from '@/lib/auth/guard';
import { ProjectForm } from '@/components/admin/projects/ProjectForm';

export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
  await requireAdminPage();

  return (
    <>
      <h2 style={{ fontSize: 16 }}>Yeni Proje</h2>
      <ProjectForm
        media={[]}
        initial={{
          title: '',
          vehicle: '',
          slug: '',
          categories: [],
          operations: [],
          materials: [],
          keywords: [],
          summary: '',
          description: '',
          featured: false,
          sortOrder: 0,
          matterportEnabled: false,
          matterportTitle: '',
          matterportInput: '',
          seoTitle: '',
          seoDescription: '',
          robotsIndex: true,
        }}
      />
    </>
  );
}
