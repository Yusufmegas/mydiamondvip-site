import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, SectionHead } from '@/components/site/Shared';
import { contact, whatsappLink } from '@/data/contact';
import { whatsappMessages } from '@/data/siteContent';

export const metadata: Metadata = {
  title: 'İletişim — MyDiamondVIP İstanbul',
  description:
    'MyDiamondVIP iletişim: +90 532 543 69 69 · info@mydiamondvip.com · İstanbul. VIP araç dizayn projeleriniz için arayın veya WhatsApp ile yazın.',
  alternates: { canonical: '/iletisim' },
};

export default function Page() {
  return (
    <>
      <PageHero
        kicker="İletişim"
        title="Bize Ulaşın"
        lead="Projeniz için en hızlı kanal WhatsApp'tır; dilerseniz arayın veya atölyemize gelin."
      />
      <section className="section section-light">
        <div className="container split-2">
          <div>
            <SectionHead kicker="Ulaşın" title="İletişim Bilgileri" />
            <ul className="dash-list" style={{ fontSize: 17 }} data-reveal-group>
              <li data-reveal><a href={contact.phoneHref}>{contact.phone}</a></li>
              <li data-reveal><a href={contact.emailHref}>{contact.email}</a></li>
              <li data-reveal>{contact.address}, {contact.city}</li>
              <li data-reveal>{contact.workHours}</li>
            </ul>
            <div className="cta-row" style={{ marginTop: 34 }} data-reveal>
              <a className="cta cta-primary" href={whatsappLink(whatsappMessages.general)} target="_blank" rel="noopener noreferrer">
                WhatsApp ile Yazın
              </a>
              <a className="cta" href={contact.phoneHref}>Hemen Ara</a>
            </div>
          </div>
          <div>
            <SectionHead kicker="Süreç" title="Hızlı Başlangıç" />
            <ol className="step-list" data-reveal-group>
              <li><span className="step-no">01</span><span>Aracınızın modelini ve beklentinizi <Link href="/teklif-formu" className="text-link">teklif formunda</Link> paylaşın.</span></li>
              <li><span className="step-no">02</span><span>Size ön kapsam ve bütçe aralığıyla dönelim.</span></li>
              <li><span className="step-no">03</span><span><Link href="/randevu-talebi" className="text-link">Randevu</Link> ile aracınızı yerinde analiz edelim.</span></li>
            </ol>
            <p className="note">
              Atölye ziyaretleri randevuyla yapılır; devam eden projelerin mahremiyeti için kabin bölümü kapalı alandır.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
