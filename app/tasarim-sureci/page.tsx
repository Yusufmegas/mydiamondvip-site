import type { Metadata } from 'next';
import { PageHero, CtaBand, QuoteBand } from '@/components/site/Shared';
import { processSteps } from '@/data/process';

export const metadata: Metadata = {
  title: 'Tasarım Süreci — 7 Adımda VIP Araç Dönüşümü',
  description:
    'MyDiamondVIP tasarım süreci: ilk görüşme, araç ve kullanım analizi, konsept tasarım, malzeme seçimi, uygulama, kalite kontrol ve teslim. Planlı ve şeffaf VIP dönüşüm.',
  alternates: { canonical: '/tasarim-sureci' },
};

export default function Page() {
  return (
    <>
      <PageHero
        kicker="Tasarım Süreci"
        title="Yedi Adımda Projeniz"
        lead="Her VIP dönüşüm aynı disiplinle ilerler: dinle, analiz et, tasarla, onayla, uygula, test et, teslim et. Hangi aşamada ne olacağını her zaman bilirsiniz."
        image="/images/process/hero.webp"
      />

      <section className="section section-stone">
        <div className="container narrow">
          <div className="timeline">
            {processSteps.map((s, i) => (
              <div className="timeline-step" key={s.title} data-reveal>
                <p className="no">ADIM {String(i + 1).padStart(2, '0')}</p>
                <h2>{s.title}</h2>
                <p>{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <QuoteBand
        kicker="İlke"
        text="Onay sizden gelmeden üretim başlamaz; teslim, testler bitmeden planlanmaz."
        image="/images/placeholders/dark-exterior.webp"
      />

      <CtaBand variant="process" />
    </>
  );
}
