import type { Metadata } from 'next';
import { PageHero, CtaBand } from '@/components/site/Shared';
import { materialSections } from '@/data/materials';

export const metadata: Metadata = {
  title: 'Malzeme & İşçilik — Deri, Yıldız Tavan, Kaplama Standartları',
  description:
    'MyDiamondVIP malzeme ve işçilik standartları: nappa deri ve kapitone işçilik, fiber optik yıldız tavan, ambiyans aydınlatma, gerçek ahşap ve karbon kaplama, akustik izolasyon.',
  alternates: { canonical: '/malzeme-iscilik' },
};

export default function Page() {
  return (
    <>
      <PageHero
        kicker="Malzeme & İşçilik"
        title="Lüks, Detayda Gizlidir"
        lead="Bir projeyi premium yapan kataloglar değil; malzemenin gerçekliği ve görünmeyen işçiliğin disiplinidir. Kullandığımız malzeme sınıflarını ve uygulama standartlarımızı açıkça paylaşıyoruz."
        image="/images/materials/deri-kapitone.webp"
      />
      {materialSections.map((m, i) => (
        <section className={`section ${i % 2 === 1 ? 'section-stone' : 'section-light'}`} key={m.title}>
          <div className="container split-2" style={i % 2 === 1 ? { direction: 'rtl' } : undefined}>
            <div style={{ direction: 'ltr' }}>
              <div className="section-head" style={{ marginBottom: 28 }}>
                <p className="kicker" data-reveal="fade">{String(i + 1).padStart(2, '0')}</p>
                <h2 data-reveal>{m.title}</h2>
                <p className="lead" data-reveal>{m.description}</p>
              </div>
              <ul className="check-list" data-reveal-group>
                {m.points.map((p) => <li key={p} data-reveal>{p}</li>)}
              </ul>
            </div>
            <div style={{ direction: 'ltr' }} data-reveal>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.image}
                alt={m.title}
                loading={i === 0 ? 'eager' : 'lazy'}
                style={{ borderRadius: 2, border: '1px solid var(--hairline)', width: '100%', aspectRatio: '16/10', objectFit: 'cover' }}
              />
            </div>
          </div>
        </section>
      ))}
      <CtaBand variant="cabin" />
    </>
  );
}
