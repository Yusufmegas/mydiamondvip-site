import type { Faq as FaqItem } from '@/data/services';

/** İç sayfa hero'su — parallax fon + reveal */
export function PageHero({
  kicker,
  title,
  lead,
  image,
}: {
  kicker?: string;
  title: string;
  lead?: string;
  image?: string;
}) {
  return (
    <section className={`page-hero${image ? ' has-image' : ''}`}>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="page-hero-bg" loading="eager" fetchPriority="high" data-parallax="0.1" />
      )}
      <div className="container">
        {kicker && <p className="kicker" data-reveal="fade">{kicker}</p>}
        <h1 data-reveal>{title}</h1>
        {lead && <p className="lead" data-reveal>{lead}</p>}
      </div>
    </section>
  );
}

/** Bölüm başlığı */
export function SectionHead({
  kicker, title, lead, centered,
}: {
  kicker?: string; title: string; lead?: string; centered?: boolean;
}) {
  return (
    <div className={`section-head${centered ? ' centered' : ''}`}>
      {kicker && <p className={`kicker${centered ? ' centered' : ''}`} data-reveal="fade">{kicker}</p>}
      <h2 data-reveal>{title}</h2>
      {lead && <p className="lead" data-reveal>{lead}</p>}
    </div>
  );
}

/** Sayfa sonu CTA bandı — sinematik sürüm CtaBandFx'te (client bileşen) */
export { CtaBand } from './CtaBandFx';

/** Editoryal ara söz bandı */
export function QuoteBand({ kicker, text, image }: { kicker?: string; text: string; image: string }) {
  return (
    <section className="quote-band">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" loading="lazy" data-parallax="0.1" />
      <div className="container">
        {kicker && <p className="kicker centered" data-reveal="fade">{kicker}</p>}
        <p data-reveal>{text}</p>
      </div>
    </section>
  );
}

/** SSS listesi (native details — JS gerekmez) */
export function FaqList({ faqs }: { faqs: FaqItem[] }) {
  return (
    <div className="faq-list" data-reveal-group>
      {faqs.map((f) => (
        <details key={f.q} data-reveal>
          <summary>{f.q}</summary>
          <p>{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/** JSON-LD yapılandırılmış veri. İçerik JSON.stringify ile üretilir (veri, kod değil). */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
