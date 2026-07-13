// ORTAK proje detay şablonu — public sayfa VE admin önizleme aynı bileşeni
// kullanır (tasarım çatallanmaz). Kaynak bağımsız ProjectView alır.
import { PageHero, SectionHead, CtaBand, JsonLd } from '@/components/site/Shared';
import { ShowcaseCard } from '@/components/site/Cards';
import MatterportExperience from '@/components/projects/MatterportExperience';
import ProjectGallery from '@/components/projects/ProjectGallery';
import type { ProjectView } from '@/lib/projects/types';
import { contact } from '@/data/contact';

export function ProjectDetail({ project, related }: { project: ProjectView; related: ProjectView[] }) {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: project.title,
          description: project.summary,
          image: `${contact.siteUrl}${project.image}`,
          creator: { '@type': 'Organization', name: contact.companyName },
        }}
      />

      {/* 1 — Proje hero */}
      <PageHero
        kicker={project.categories.join(' · ')}
        title={project.title}
        lead={project.description}
        image={project.image}
      />

      {/* 2 — Araç ve uygulama bilgileri */}
      <section className="section section-light">
        <div className="container meta-grid" data-reveal-group>
          <div data-reveal>
            <h3>Araç Modeli</h3>
            <p>{project.vehicle}</p>
          </div>
          <div data-reveal>
            <h3>Uygulama Alanı</h3>
            <p>{project.categories.join(', ')}</p>
          </div>
          <div data-reveal>
            <h3>Uygulanan İşlemler</h3>
            <ul>{project.operations.map((o) => <li key={o}>— {o}</li>)}</ul>
          </div>
          <div data-reveal>
            <h3>Malzeme Detayları</h3>
            <ul>{project.materials.map((m) => <li key={m}>— {m}</li>)}</ul>
          </div>
        </div>
      </section>

      {/* 3 — Matterport 360° araç deneyimi (yalnızca turu olan projelerde) */}
      {project.matterportTour && (
        <section className="section mp-section">
          <div className="container">
            <SectionHead
              kicker="360° Dijital Araç Deneyimi"
              title="Aracın İçini Her Açıdan Keşfedin"
              lead="Kabin yerleşimini, koltuk sistemlerini, malzeme detaylarını ve aydınlatma çözümlerini interaktif 360° deneyim üzerinden inceleyin."
            />
            <MatterportExperience tour={project.matterportTour} />
          </div>
        </section>
      )}

      {/* 4 — Yüksek kaliteli detay galerisi */}
      {project.gallery.length > 0 && (
        <section className="section section-stone">
          <div className="container">
            <SectionHead
              kicker="Detay Galerisi"
              title="Malzeme, İşçilik ve Teknolojiye Yakından Bakın"
              lead="Kabin mimarisinden deri işçiliğine, yıldız tavandan akıllı kontrol sistemlerine kadar projenin öne çıkan detaylarını inceleyin."
            />
            <ProjectGallery items={project.gallery} />
          </div>
        </section>
      )}

      {/* 5 — Proje detayları */}
      <section className="section section-light">
        <div className="container">
          <SectionHead kicker="Proje Detayları" title="Kabini Oluşturan Unsurlar" />
          <div className="project-facts" data-reveal-group>
            <div className="fact-block" data-reveal>
              <h3>Uygulanan İşlemler</h3>
              <ul>{project.operations.map((o) => <li key={o}>{o}</li>)}</ul>
            </div>
            <div className="fact-block" data-reveal>
              <h3>Kullanılan Malzemeler</h3>
              <ul>{project.materials.map((m) => <li key={m}>{m}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6 — Benzer projeler */}
      {related.length > 0 && (
        <section className="section section-soft">
          <div className="container">
            <SectionHead kicker="Projeler" title="Benzer Projeler" />
            <div className="showcase-grid" data-reveal-group>
              {related.map((p) => <ShowcaseCard key={p.slug} project={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* 7 — Teklif CTA */}
      <CtaBand
        title="Benzer bir proje mi düşünüyorsunuz?"
        text="Aracınızı ve beklentinizi paylaşın; bu projedeki yaklaşımın aracınıza nasıl uyarlanacağını birlikte planlayalım."
      />
    </>
  );
}
