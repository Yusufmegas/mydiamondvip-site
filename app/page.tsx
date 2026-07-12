import type { Metadata } from "next";
import Link from "next/link";
// Statik import — next/dynamic({ ssr: false }) Turbopack prod tuzağı (bkz. proje CLAUDE.md §4)
import FilmSection from "@/components/home/FilmSection";
import { SectionHead, CtaBand, QuoteBand } from "@/components/site/Shared";
import { ServiceCard, ShowcaseCard } from "@/components/site/Cards";
import { featuredServices } from "@/data/services";
import { projects } from "@/data/projects";
import { processSummary } from "@/data/process";
import { home, whatsappMessages } from "@/data/siteContent";
import { whatsappLink } from "@/data/contact";

export const metadata: Metadata = {
  title: "MyDiamondVIP — VIP Araç Dizayn | Mercedes Vito & Sprinter | İstanbul",
  description:
    "VIP araç tasarımında yeni bir seviye: Mercedes Vito, Sprinter, V-Class VIP dönüşüm, araç içi kaplama, deri döşeme, yıldız tavan ve ambiyans aydınlatma. İstanbul.",
  alternates: { canonical: "/" },
  openGraph: { images: ["/poster.webp"] },
};

export default function Home() {
  return (
    <>
      {/* 1 — Hero */}
      <section className="home-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/stills/f-0100.webp" alt="" className="home-hero-bg" fetchPriority="high" data-parallax="0.08" />
        <div className="container">
          <h1 data-reveal>{home.hero.title}</h1>
          <p className="lead" data-reveal>{home.hero.subtitle}</p>
          <div className="cta-row" data-reveal>
            <Link className="cta cta-primary" href={home.hero.primaryCta.href}>
              {home.hero.primaryCta.label}
            </Link>
            <a
              className="cta"
              href={whatsappLink(whatsappMessages.general)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {home.hero.secondaryCta.label}
            </a>
          </div>
        </div>
      </section>

      {/* 2 — Sinematik araç deneyimi (scroll-film — DOKUNMA) */}
      <FilmSection />

      {/* 3 — Hizmetler: lüks katalog (açık tema) */}
      <section className="section section-light">
        <div className="container">
          <SectionHead kicker={home.services.kicker} title={home.services.title} lead={home.services.lead} />
          <div className="grid-cards" data-reveal-group>
            {featuredServices.map((s, i) => <ServiceCard key={s.slug} service={s} index={i} />)}
          </div>
          <p style={{ marginTop: 36 }} data-reveal>
            <Link className="text-link" href="/hizmetler">Tüm hizmetleri inceleyin</Link>
          </p>
        </div>
      </section>

      {/* 4 — Editoryal ara söz */}
      <QuoteBand kicker={home.quote.kicker} text={home.quote.text} image="/images/placeholders/star-detail.webp" />

      {/* 5 — Proje vitrini (açık tema) */}
      <section className="section section-light">
        <div className="container">
          <SectionHead kicker={home.projects.kicker} title={home.projects.title} lead={home.projects.lead} />
          <div className="showcase-grid" data-reveal-group>
            {projects.slice(0, 4).map((p) => <ShowcaseCard key={p.slug} project={p} />)}
          </div>
          <p style={{ marginTop: 36 }} data-reveal>
            <Link className="cta" href="/projeler">Projeleri İncele</Link>
          </p>
        </div>
      </section>

      {/* 6 — Neden MyDiamondVIP? (açık tema) */}
      <section className="section section-soft">
        <div className="container sticky-side">
          <div className="side">
            <p className="kicker" data-reveal="fade">{home.why.kicker}</p>
            <h2 data-reveal>{home.why.title}</h2>
            <p className="lead" data-reveal>{home.why.lead}</p>
          </div>
          <div className="why-list" data-reveal-group>
            {home.why.items.map((f, i) => (
              <div className="why-item" key={f.title} data-reveal>
                <span className="no">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 — Tasarım süreci şeridi (açık taş) */}
      <section className="section section-stone">
        <div className="container">
          <SectionHead kicker={home.process.kicker} title={home.process.title} lead={home.process.lead} />
          <div className="process-strip" data-reveal-group>
            {processSummary.map((s, i) => (
              <div key={s.title} data-reveal>
                <p className="no">{String(i + 1).padStart(2, "0")}</p>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 40 }} data-reveal>
            <Link className="text-link" href="/tasarim-sureci">Sürecin tamamını inceleyin</Link>
          </p>
        </div>
      </section>

      {/* 8 — CTA */}
      <CtaBand title={home.cta.title} text={home.cta.text} />
    </>
  );
}
