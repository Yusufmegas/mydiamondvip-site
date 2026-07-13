import type { Metadata } from 'next';
import { PageHero, SectionHead, CtaBand } from '@/components/site/Shared';
import { ServiceCard } from '@/components/site/Cards';
import ServicePillars from '@/components/home/ServicePillars';
import { platformServices, aftercareServices } from '@/data/services';

export const metadata: Metadata = {
  title: 'Hizmetler — VIP Dönüşüm, Kabin Tasarımı, Koltuk, Deri, Yıldız Tavan',
  description:
    'MyDiamondVIP ana hizmetleri: komple VIP araç dönüşümü, özel kabin tasarımı, VIP koltuk ve konfor sistemleri, deri döşeme, yıldız tavan, multimedya ve akıllı kontrol, mini bar ve mobil ofis, dış tasarım. Vito, Sprinter, V-Class ve Volkswagen platformlarına özel mühendislik.',
  alternates: { canonical: '/hizmetler' },
};

export default function Page() {
  return (
    <>
      <PageHero
        kicker="Hizmetler"
        title="Aracınız İçin Uçtan Uca Tasarım"
        lead="İç mimariden koltuk sistemlerine, deri işçiliğinden akıllı kabin teknolojilerine kadar tüm dönüşüm tek ekip tarafından yönetilir. Her hizmetin detay sayfasında kapsam, malzeme sınıfları ve uygulama süreci ayrı ayrı anlatılır."
        image="/images/services/vip-arac-dizayni.png"
      />

      {/* 1 — Sekiz ana hizmet: editorial pillar grid */}
      <section className="section section-light">
        <div className="container">
          <ServicePillars />
        </div>
      </section>

      {/* 2 — Araç platformları */}
      <section className="section section-soft">
        <div className="container">
          <div className="section-head services-sub-head">
            <p className="kicker" data-reveal="fade">Araç Platformları</p>
            <h2 data-reveal>Her Platforma Özel Mühendislik</h2>
            <p className="lead" data-reveal>
              Vito, Sprinter, V-Class ve Volkswagen platformlarının her biri farklı gövde,
              yerleşim ve elektrik altyapısı gerektirir. Her araç için ayrı çözüm geliştiririz.
            </p>
          </div>
          <div className="grid-cards" data-reveal-group>
            {platformServices.map((s, i) => (
              <ServiceCard key={s.slug} service={s} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* 3 — Satış sonrası */}
      <section className="section section-stone">
        <div className="container">
          <div className="section-head services-sub-head">
            <p className="kicker" data-reveal="fade">Satış Sonrası</p>
            <h2 data-reveal>Teslimden Sonra da Yanınızdayız</h2>
          </div>
          <div className="grid-cards" data-reveal-group>
            {aftercareServices.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </div>
      </section>

      <CtaBand variant="cabin" />
    </>
  );
}
