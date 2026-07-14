import { redirect } from 'next/navigation';
import { hasQuoteSession } from '@/lib/quote-demo/session';
import { QuoteBuilder } from '@/components/quote-builder/QuoteBuilder';

export const dynamic = 'force-dynamic';

export default async function QuoteBuilderPage() {
  // Sunucu tarafı koruma — client gizleme güvenlik katmanı DEĞİLDİR
  if (!(await hasQuoteSession())) redirect('/teklif-demo/giris');
  return <QuoteBuilder />;
}
