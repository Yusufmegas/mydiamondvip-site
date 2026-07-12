import type { Metadata } from "next";
import Link from "next/link";
// Statik import — next/dynamic({ ssr: false }) Turbopack prod tuzağı (bkz. proje CLAUDE.md §4)
import FilmSection from "@/components/home/FilmSection";
import BrandLogoLoop from "@/components/home/BrandLogoLoop";
import CraftSection from "@/components/home/CraftSection";
import ProcessSection from "@/components/home/ProcessSection";
import SplitText from "@/components/SplitText";
import { SectionHead, CtaBand, QuoteBand } from "@/components/site/Shared";
import { ServiceCard, ShowcaseCard } from "@/components/site/Cards";
import { featuredServices } from "@/data/services";
import { projects } from "@/data/projects";
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
          <SplitText
            tag="h1"
            text={home.hero.title}
            splitType="words"
            from={{ opacity: 0, y: 24 }}
            to={{ opacity: 1, y: 0 }}
            duration={0.7}
            delay={80}
            ease="power3.out"
            threshold={0.1}
            rootMargin="0px"
          />
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

      {/* 2.5 — Marka logo şeridi (film → hizmetler geçişi) */}
      <BrandLogoLoop />

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
      <section className="section section-light showcase-section">
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

      {/* 6 — Neden MyDiamondVIP? (açık tema, sinematik reveal — CraftSection) */}
      <CraftSection />

      {/* 7 — Tasarım süreci şeridi (açık taş, sinematik reveal — ProcessSection) */}
      <ProcessSection />

      {/* 8 — CTA */}
      <CtaBand title={home.cta.title} text={home.cta.text} />
    </>
  );
}
