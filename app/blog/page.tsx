import type { Metadata } from 'next';
import { PageHero, CtaBand } from '@/components/site/Shared';
import { BlogCard } from '@/components/site/Cards';
import { blogPosts } from '@/data/blog';

export const metadata: Metadata = {
  title: 'Blog — VIP Araç Dizayn Rehberleri',
  description:
    'VIP araç dizaynı, Vito ve Sprinter dönüşümleri, deri döşeme seçimi, yıldız tavan ve fiyatlandırma hakkında uzman rehber yazıları.',
  alternates: { canonical: '/blog' },
};

const dateFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

export default function Page() {
  const [featured, ...rest] = blogPosts;
  return (
    <>
      <PageHero
        kicker="Blog"
        title="VIP Araç Dizayn Rehberleri"
        lead="Karar vermeden önce bilmeniz gerekenler: süreç, malzeme, fiyatlandırma ve model karşılaştırmaları — pazarlama dili olmadan, atölyeden anlatım."
      />
      <section className="section section-light">
        <div className="container">
          <div className="blog-grid" data-reveal-group>
            <BlogCard
              featured
              href={`/blog/${featured.slug}`}
              image={featured.image}
              category={featured.category}
              title={featured.title}
              excerpt={featured.excerpt}
              meta={`${dateFmt.format(new Date(featured.date))} · ${featured.readMinutes} dk`}
            />
            {rest.map((p) => (
              <BlogCard
                key={p.slug}
                href={`/blog/${p.slug}`}
                image={p.image}
                category={p.category}
                title={p.title}
                excerpt={p.excerpt}
                meta={`${dateFmt.format(new Date(p.date))} · ${p.readMinutes} dk`}
              />
            ))}
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
