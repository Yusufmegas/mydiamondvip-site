import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHero, SectionHead, CtaBand, JsonLd } from '@/components/site/Shared';
import { ShowcaseCard } from '@/components/site/Cards';
import { projects, getProject, relatedProjects } from '@/data/projects';
import { contact } from '@/data/contact';

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — ${project.vehicle}`,
    description: project.summary,
    keywords: project.keywords,
    alternates: { canonical: `/projeler/${slug}` },
    openGraph: { images: [project.image] },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const related = relatedProjects(slug);

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

      <PageHero
        kicker={project.categories.join(' · ')}
        title={project.title}
        lead={project.description}
        image={project.image}
      />

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

      <section className="section section-stone">
        <div className="container">
          <SectionHead kicker="Galeri" title="Projeden Kareler" />
          <div className="gallery-grid" data-reveal-group>
            {project.gallery.map((g, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={g + i} src={g} alt={`${project.title} — kare ${i + 1}`} loading="lazy" data-reveal />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="container">
          <SectionHead kicker="Dönüşüm" title="Önce / Sonra" />
          <div className="before-after" data-reveal-group>
            <figure data-reveal>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={project.before} alt={`${project.title} — önce`} loading="lazy" />
              <figcaption>Önce</figcaption>
            </figure>
            <figure data-reveal>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={project.after} alt={`${project.title} — sonra`} loading="lazy" />
              <figcaption>Sonra</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <SectionHead kicker="Projeler" title="Benzer Projeler" />
          <div className="showcase-grid" data-reveal-group>
            {related.map((p) => <ShowcaseCard key={p.slug} project={p} />)}
          </div>
        </div>
      </section>

      <CtaBand
        title="Benzer bir proje mi düşünüyorsunuz?"
        text="Aracınızı ve beklentinizi paylaşın; bu projedeki yaklaşımın aracınıza nasıl uyarlanacağını birlikte planlayalım."
      />
    </>
  );
}
