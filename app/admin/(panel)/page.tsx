// Genel Bakış — yalnızca gerçek veritabanı verisi; sahte istatistik yok.
import Link from 'next/link';
import { requireAdminPage } from '@/lib/auth/guard';
import { getDashboardStats } from '@/lib/projects/admin-repository';
import { isDbConfigured } from '@/lib/db';
import { StatusBadge } from '@/components/admin/StatusBadge';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireAdminPage();

  if (!isDbConfigured()) {
    return (
      <div className="adm-card">
        <p className="adm-error">
          DATABASE_URL yapılandırılmamış. Kurulum adımları için ADMIN_SETUP.md dosyasına bakın.
        </p>
      </div>
    );
  }

  const stats = await getDashboardStats();

  return (
    <>
      <div className="adm-stats">
        {[
          { label: 'Toplam Proje', value: stats.total },
          { label: 'Yayında', value: stats.published },
          { label: 'Taslak', value: stats.draft },
          { label: 'Arşiv', value: stats.archived },
          { label: '360° Turlu', value: stats.withMatterport },
        ].map((s) => (
          <div className="adm-card" key={s.label}>
            <div className="adm-stat-num">{s.value}</div>
            <div className="adm-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="adm-card">
        <div className="adm-row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
          <strong>Son Güncellenen Projeler</strong>
          <Link className="adm-btn adm-btn-sm" href="/admin/projeler">Tümünü Gör</Link>
        </div>
        {stats.recentlyUpdated.length === 0 ? (
          <p className="adm-hint">Henüz proje yok. Seed çalıştırın veya yeni proje oluşturun.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Proje</th>
                  <th>Durum</th>
                  <th>Güncelleme</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {stats.recentlyUpdated.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>{p.updatedAt.toLocaleString('tr-TR')}</td>
                    <td>
                      <Link className="adm-btn adm-btn-sm" href={`/admin/projeler/${p.id}`}>Düzenle</Link>
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
