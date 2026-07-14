import type { Metadata } from 'next';
import './quote-demo.css';

export const metadata: Metadata = {
  title: {
    default: 'Teklif Hazırlama Sistemi — MyDiamondVIP',
    template: '%s — MyDiamondVIP Teklif',
  },
  robots: { index: false, follow: false, noarchive: true },
};

export default function QuoteDemoLayout({ children }: { children: React.ReactNode }) {
  // .qd-root: ana site header/footer/floating-wa bu kapsamda CSS ile gizlenir
  return <div className="qd-root">{children}</div>;
}
