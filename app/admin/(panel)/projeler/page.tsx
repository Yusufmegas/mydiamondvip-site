// Proje listesi — arama + filtre + durum işlemleri. Kalıcı silme YOK.
import Link from 'next/link';
import { requireAdminPage } from '@/lib/auth/guard';
import { listProjectsForAdmin, type AdminListFilters } from '@/lib/projects/admin-repository';
import { isDbConfigured } from '@/lib/db';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ProjectRowActions } from '@/components/admin/projects/ProjectRowActions';

export const dynamic = 'force-dynamic';

const FILTERS: Array<{ key: string; label: string }> = [
  { key: 'ALL', label: 'Tümü' },
  { key: 'DRAFT', label: 'Taslak' },
  { key: 'PUBLISHED', label: 'Yayında' },
  { key: 'ARCHIVED', label: 'Arşiv' },
  { key: 'HAS_TOUR', label: 'Matterport Var' },
  { key: 'NO_TOUR', label: 'Matterport Yok' },
  { key: 'FEATURED', label: 'Featured' },
];

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; durum?: string }>;
}) {
  await requireAdminPage();
  const { q, durum } = await searchParams;

  if (!isDbConfigured()) {
    return (
      <div className="adm-card">
        <p className="adm-error">DATABASE_URL yapılandırılmamış — ADMIN_SETUP.md adımlarını izleyin.</p>
      </div>
    );
  }

  const filters: AdminListFilters = {
    q: q || undefined,
    status: (durum as AdminListFilters['status']) || 'ALL',
  };
  const rows = await listProjectsForAdmin(filters);

  return (
    <>
      <div className="adm-card">
        <form className="adm-row" method="get">
          <input
            className="adm-input"
            style={{ maxWidth: 320 }}
            type="search"
            name="q"
            placeholder="Başlık, araç veya slug ara…"
            defaultValue={q ?? ''}
            aria-label="Proje ara"
          />
          <input type="hidden" name="durum" value={durum ?? 'ALL'} />
          <button className="adm-btn" type="submit">Ara</button>
        </form>
        <div className="adm-row" style={{ marginTop: 12 }}>
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              className={`adm-btn adm-btn-sm${(durum ?? 'ALL') === f.key ? ' adm-btn-primary' : ''}`}
              href={`/admin/projeler?durum=${f.key}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="adm-card">
        {rows.length === 0 ? (
          <p className="adm-hint">Kayıt bulunamadı.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Kapak</th>
                  <th>Proje</th>
                  <th>Araç</th>
                  <th>Slug</th>
                  <th>Matterport</th>
                  <th>Galeri</th>
                  <th>Durum</th>
                  <th>Featured</th>
                  <th>Sıra</th>
                  <th>Güncelleme</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.coverThumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="adm-thumb" src={p.coverThumb} alt="" />
                      ) : (
                        <span className="adm-hint">—</span>
                      )}
                    </td>
                    <td>{p.title}</td>
                    <td>{p.vehicle}</td>
                    <td><code style={{ fontSize: 12 }}>{p.slug}</code></td>
                    <td>{p.hasMatterport ? <span className="adm-badge adm-badge-tour">360°</span> : '—'}</td>
                    <td>{p.galleryCount}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>{p.featured ? '★' : '—'}</td>
                    <td>{p.sortOrder}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{p.updatedAt.toLocaleDateString('tr-TR')}</td>
                    <td>
                      <ProjectRowActions projectId={p.id} status={p.status} slug={p.slug} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
