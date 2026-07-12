import type { Metadata } from 'next';
import { PageHero, CtaBand, QuoteBand } from '@/components/site/Shared';
import { kurumsal } from '@/data/siteContent';

export const metadata: Metadata = {
  title: 'Kurumsal — MyDiamondVIP Hakkında',
  description:
    'MyDiamondVIP; İstanbul merkezli VIP araç dizaynı, araç içi kaplama, deri döşeme ve özel araç dönüşüm atölyesi. Tasarım yaklaşımımız, işçilik standartlarımız ve atölye sürecimiz.',
  alternates: { canonical: '/kurumsal' },
};

export default function Page() {
  return (
    <>
      <PageHero
        kicker="Kurumsal"
        title={kurumsal.title}
        lead={kurumsal.intro}
        image="/images/placeholders/hood.webp"
      />

      {kurumsal.sections.map((s, i) => (
        <section className={`section ${i % 2 === 1 ? 'section-stone' : 'section-light'}`} key={s.title}>
          {/* Görsel yerleşimi dönüşümlü: 1. bölüm solda, 2. sağda, 3. solda, 4. sağda */}
          <div className="container split-2" style={i % 2 === 0 ? { direction: 'rtl' } : undefined}>
            <div style={{ direction: 'ltr' }}>
              <div className="section-head" style={{ marginBottom: 24 }}>
                <p className="kicker" data-reveal="fade">{String(i + 1).padStart(2, '0')}</p>
                <h2 data-reveal>{s.title}</h2>
              </div>
              <p className="lead" style={{ marginTop: 0 }} data-reveal>{s.text}</p>
            </div>
            <div style={{ direction: 'ltr' }} data-reveal>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image}
                alt={s.title}
                loading={i === 0 ? 'eager' : 'lazy'}
                style={{ borderRadius: 2, border: '1px solid var(--hairline)', width: '100%', aspectRatio: '16/10', objectFit: 'cover' }}
              />
            </div>
          </div>
        </section>
      ))}

      <QuoteBand
        kicker="Atölye"
        text="Görünmeyen işçilik, görünen kadar önemsenmediği sürece lüks yarım kalır."
        image="/images/placeholders/dark-curtain.webp"
      />

      <CtaBand variant="process" />
    </>
  );
}
