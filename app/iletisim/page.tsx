import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, SectionHead } from '@/components/site/Shared';
import { contact, whatsappLink } from '@/data/contact';
import { whatsappMessages } from '@/data/siteContent';

export const metadata: Metadata = {
  title: 'İletişim — MyDiamondVIP İstanbul',
  description: `MyDiamondVIP iletişim: Sabit hat ${contact.phoneDisplay} · WhatsApp destek ${contact.whatsappDisplay} · ${contact.email} · ${contact.district} / ${contact.city}. VIP araç dizayn projeleriniz için arayın veya WhatsApp ile yazın.`,
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
            <div className="contact-blocks" data-reveal-group>
              <div className="contact-block" data-reveal>
                <span className="contact-block-label">Sabit Hat</span>
                <span className="contact-block-value">
                  <a href={contact.phoneHref}>{contact.phoneDisplay}</a>
                </span>
              </div>
              <div className="contact-block" data-reveal>
                <span className="contact-block-label">WhatsApp Destek</span>
                <span className="contact-block-value">
                  <a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer">
                    {contact.whatsappDisplay}
                  </a>
                </span>
              </div>
              <div className="contact-block" data-reveal>
                <span className="contact-block-label">E-posta</span>
                <span className="contact-block-value">
                  <a href={contact.emailHref}>{contact.email}</a>
                </span>
              </div>
              <div className="contact-block" data-reveal>
                <span className="contact-block-label">Çalışma Saatleri</span>
                <span className="contact-block-value">{contact.workHours}</span>
              </div>
              <div className="contact-block contact-block-wide" data-reveal>
                <span className="contact-block-label">Adres</span>
                <span className="contact-block-value">
                  {contact.address}
                  <br />
                  {contact.postalCode} {contact.district} / {contact.city}
                </span>
              </div>
            </div>
            <div className="cta-row" style={{ marginTop: 34 }} data-reveal>
              <a
                className="cta cta-primary"
                href={whatsappLink(whatsappMessages.general)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp Destek
              </a>
              <a className="cta" href={contact.phoneHref}>Sabit Hattı Ara</a>
              <a className="cta" href={contact.mapUrl} target="_blank" rel="noopener noreferrer">
                Yol Tarifi
              </a>
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
