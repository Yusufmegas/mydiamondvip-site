import Image from 'next/image';
import { redirect } from 'next/navigation';
import { hasQuoteSession } from '@/lib/quote-demo/session';
import { QuoteAccessForm } from '@/components/quote-builder/QuoteAccessForm';
import { brand } from '@/data/brand';

export const dynamic = 'force-dynamic';

export default async function QuoteLoginPage() {
  if (await hasQuoteSession()) redirect('/teklif-demo');

  return (
    <div className="qd-login">
      <div className="qd-login-card">
        <Image
          src={brand.logo}
          alt="MyDiamondVIP"
          width={brand.logoWidth}
          height={brand.logoHeight}
          priority
          className="qd-login-logo"
        />
        <p className="qd-login-title">
          Teklif Hazırlama Sistemi <span className="qd-demo-badge">Demo</span>
        </p>
        <QuoteAccessForm />
      </div>
    </div>
  );
}
