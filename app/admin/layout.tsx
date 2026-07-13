// Admin layout — public site tasarımından bağımsız, sade ve operasyonel.
// İndexlenmez; her sayfa ayrıca server tarafında requireAdminPage kullanır.
import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: { default: 'Yönetim Paneli — MyDiamondVIP', template: '%s — MyDiamondVIP Admin' },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm-root">{children}</div>;
}
