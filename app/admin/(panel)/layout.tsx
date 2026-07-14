// Panel chrome — her istek sunucuda requireAdminPage'den geçer (proxy'ye ek
// gerçek yetki katmanı). Giriş sayfası bu grubun dışındadır.
import Link from 'next/link';
import Image from 'next/image';
import { requireAdminPage } from '@/lib/auth/guard';
import { LogoutButton } from '@/components/admin/LogoutButton';
import { brand } from '@/data/brand';

export const dynamic = 'force-dynamic';

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();

  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <div className="adm-brand">
          <Image
            src={brand.logo}
            alt="MyDiamondVIP"
            width={brand.logoWidth}
            height={brand.logoHeight}
            className="adm-brand-logo"
          />
          <span className="adm-brand-suffix">PANEL</span>
        </div>
        <Link className="adm-nav-link" href="/admin">Genel Bakış</Link>
        <Link className="adm-nav-link" href="/admin/projeler">Projeler</Link>
        <Link className="adm-nav-link" href="/admin/projeler/yeni">Yeni Proje</Link>
        <div className="adm-side-bottom">
          <Link className="adm-nav-link" href="/" target="_blank">Public Siteye Git ↗</Link>
          <LogoutButton />
        </div>
      </aside>
      <div className="adm-main">
        <header className="adm-header">
          <h1>Proje Yönetim Paneli</h1>
          <span className="adm-user">{session.name} · {session.email}</span>
        </header>
        <main className="adm-content">{children}</main>
      </div>
    </div>
  );
}
