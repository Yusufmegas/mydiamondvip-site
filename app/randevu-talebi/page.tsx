import type { Metadata } from 'next';
import { PageHero } from '@/components/site/Shared';
import { AppointmentForm } from '@/components/site/Forms';
import { contact } from '@/data/contact';

export const metadata: Metadata = {
  title: 'Randevu Talebi — Atölye veya Online Görüşme',
  description:
    'MyDiamondVIP ile randevu planlayın: atölyede yüz yüze, telefon veya video görüşme. Aracınız için VIP dizayn yol haritasını birlikte çıkaralım.',
  alternates: { canonical: '/randevu-talebi' },
};

export default function Page() {
  return (
    <>
      <PageHero
        kicker="Randevu"
        title="Randevu Talebi"
        lead="İlk görüşme ücretsizdir. Atölyede yüz yüze, telefonla veya video görüşmeyle; aracınızı ve hedeflerinizi dinleyip projenizin yol haritasını çıkarıyoruz."
      />
      <section className="section section-light">
        <div className="container form-layout">
          <AppointmentForm />
          <aside className="trust-panel" data-reveal>
            <h3>Görüşmede neler konuşulur?</h3>
            <ul>
              <li>Aracınıza özel değerlendirme ve uygulanabilirlik</li>
              <li>Hizmet kapsamı ve bütçe çerçevesi</li>
              <li>Uygulama takvimi ve teslim planı</li>
            </ul>
            <div className="trust-contact">
              <span>Çalışma saatleri: {contact.workHours}</span>
              <a href={contact.phoneHref}>{contact.phone}</a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
