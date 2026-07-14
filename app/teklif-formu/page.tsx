import type { Metadata } from 'next';
import { PageHero } from '@/components/site/Shared';
import { QuoteForm } from '@/components/site/Forms';
import { contact } from '@/data/contact';

export const metadata: Metadata = {
  title: 'Teklif Formu — VIP Araç Dizayn Fiyat Teklifi',
  description:
    'VIP araç dizaynı, deri döşeme, kaplama ve iç mekân projeleri için teklif alın. Aracınızı ve beklentinizi paylaşın; kalem kalem yazılmış, karşılaştırılabilir bir teklifle dönelim.',
  alternates: { canonical: '/teklif-formu' },
};

export default function Page() {
  return (
    <>
      <PageHero
        kicker="Teklif"
        title="Teklif Formu"
        lead="Tek rakamlı teklif vermeyiz; kalem kalem yazılmış, karşılaştırılabilir bir kapsam çıkarırız. Aracınızı ve beklentinizi paylaşın — ilk değerlendirme aynı gün içinde döner."
      />
      <section className="section section-light">
        <div className="container form-layout">
          <QuoteForm />
          <aside className="trust-panel" data-reveal>
            <h3>Formu gönderdiğinizde</h3>
            <ul>
              <li>Aracınıza özel ön değerlendirme yapılır</li>
              <li>Hizmet kapsamı ve bütçe aralığı analiz edilir</li>
              <li>Randevu ve uygulama süreci birlikte planlanır</li>
            </ul>
            <div className="trust-contact">
              <span>Formu kullanmak istemezseniz:</span>
              <a href={contact.phoneHref}>{contact.phoneDisplay}</a>
              <a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer">
                WhatsApp: {contact.whatsappDisplay}
              </a>
              <a href={contact.emailHref}>{contact.email}</a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
