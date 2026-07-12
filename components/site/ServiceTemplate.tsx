import Link from 'next/link';
import type { Service } from '@/data/services';
import { projects } from '@/data/projects';
import { PageHero, SectionHead, CtaBand, FaqList, JsonLd } from './Shared';
import { ShowcaseCard } from './Cards';
import { contact, whatsappLink } from '@/data/contact';
import { whatsappMessages } from '@/data/siteContent';

/** Hizmet sayfalarının ortak landing şablonu — içerik data/services.ts'ten gelir.
 *  Editoryal düzen: sticky yan blok + akış içinde reveal'lı bölümler. */
export default function ServiceTemplate({ service }: { service: Service }) {
  const related = projects.filter((p) => service.relatedProjects.includes(p.slug)).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.title,
          description: service.summary,
          provider: {
            '@type': 'AutoRepair',
            name: contact.companyName,
            telephone: contact.phone,
            areaServed: contact.city,
          },
          areaServed: contact.city,
          url: `${contact.siteUrl}/hizmetler/${service.slug}`,
        }}
      />

      <PageHero kicker="Hizmetler" title={service.title} lead={service.intro} image={service.image} />

      {/* Kapsam — sticky yan blok + içerik (açık tema) */}
      <section className="section section-light">
        <div className="container sticky-side">
          <div className="side">
            <p className="kicker" data-reveal="fade">Kapsam</p>
            <h2 data-reveal>Bu hizmette neler var?</h2>
            <p className="lead" data-reveal>
              Kapsam, aracınıza ve kullanım senaryonuza göre birlikte netleştirilir; aşağıdaki başlıklar
              tipik bir projenin iskeletidir.
            </p>
            <div className="cta-row" style={{ marginTop: 30 }} data-reveal>
              <Link className="cta cta-primary cta-small" href="/teklif-formu">Teklif Al</Link>
              <a
                className="cta cta-small"
                href={whatsappLink(whatsappMessages.quote)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </div>
          <div>
            <div style={{ marginBottom: 'clamp(36px, 5vw, 56px)' }}>
              <h3 style={{ marginBottom: 20, color: 'var(--amber)', letterSpacing: '0.24em', textTransform: 'uppercase', fontSize: 12 }} data-reveal="fade">
                Hangi araçlara uygulanır?
              </h3>
              <ul className="check-list" data-reveal-group>
                {service.vehicles.map((v) => <li key={v} data-reveal>{v}</li>)}
              </ul>
            </div>
            <div>
              <h3 style={{ marginBottom: 20, color: 'var(--amber)', letterSpacing: '0.24em', textTransform: 'uppercase', fontSize: 12 }} data-reveal="fade">
                Neler uygulanır?
              </h3>
              <ul className="check-list" data-reveal-group>
                {service.scope.map((s) => <li key={s} data-reveal>{s}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Malzeme + süreç (açık taş) */}
      <section className="section section-stone">
        <div className="container split-2">
          <div>
            <SectionHead kicker="Malzeme" title="Malzeme ve donanım" />
            <ul className="dash-list" data-reveal-group>
              {service.materials.map((m) => <li key={m} data-reveal>{m}</li>)}
            </ul>
            <p className="note" data-reveal>
              Malzeme sınıfları ve işçilik standartları için <Link href="/malzeme-iscilik">Malzeme &amp; İşçilik</Link> sayfasına bakın.
            </p>
          </div>
          <div>
            <SectionHead kicker="Süreç" title="Uygulama süreci" />
            <ol className="step-list" data-reveal-group>
              {service.steps.map((s, i) => (
                <li key={s} data-reveal>
                  <span className="step-no">{String(i + 1).padStart(2, '0')}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section-light">
          <div className="container">
            <SectionHead kicker="Projeler" title="Bu hizmetten örnek işler" />
            <div className="showcase-grid" data-reveal-group>
              {related.map((p) => <ShowcaseCard key={p.slug} project={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className="section section-soft">
        <div className="container narrow">
          <SectionHead kicker="SSS" title="Sık sorulan sorular" />
          <FaqList faqs={service.faqs} />
        </div>
      </section>

      <CtaBand variant="cabin" />
    </>
  );
}
