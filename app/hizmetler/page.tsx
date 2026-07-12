import type { Metadata } from 'next';
import { PageHero, CtaBand } from '@/components/site/Shared';
import { ServiceCard } from '@/components/site/Cards';
import { services } from '@/data/services';

export const metadata: Metadata = {
  title: 'Hizmetler — VIP Araç Dizayn, Kaplama, Deri Döşeme',
  description:
    'MyDiamondVIP hizmetleri: VIP araç dizaynı, Mercedes Vito & Sprinter VIP dönüşüm, araç içi kaplama, deri döşeme, yıldız tavan, ses sistemi, dış kaplama ve bakım.',
  alternates: { canonical: '/hizmetler' },
};

export default function Page() {
  return (
    <>
      <PageHero
        kicker="Hizmetler"
        title="Aracınız İçin Uçtan Uca Tasarım"
        lead="Tasarımdan teslime her uygulama tek atölyede, tek sorumlulukla yürütülür. Her hizmetin detay sayfasında kapsam, malzeme sınıfları ve uygulama süreci ayrı ayrı anlatılır."
        image="/images/services/vip-arac-dizayni.png"
      />
      <section className="section section-light">
        <div className="container">
          <div className="grid-cards" data-reveal-group>
            {services.map((s, i) => <ServiceCard key={s.slug} service={s} index={i} />)}
          </div>
        </div>
      </section>
      <CtaBand variant="cabin" />
    </>
  );
}
