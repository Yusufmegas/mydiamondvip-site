import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHero, CtaBand, JsonLd } from '@/components/site/Shared';
import { blogPosts, getPost } from '@/data/blog';
import { contact } from '@/data/contact';

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { images: [post.image], type: 'article', publishedTime: post.date },
  };
}

const dateFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.excerpt,
          image: `${contact.siteUrl}${post.image}`,
          datePublished: post.date,
          inLanguage: 'tr-TR',
          author: { '@type': 'Organization', name: contact.companyName },
          publisher: { '@type': 'Organization', name: contact.companyName },
          mainEntityOfPage: `${contact.siteUrl}/blog/${post.slug}`,
        }}
      />

      <PageHero kicker={`Blog · ${post.category}`} title={post.title} lead={post.excerpt} image={post.image} />

      <section className="section section-soft">
        <div className="container prose">
          <div className="post-meta" style={{ marginTop: 0, marginBottom: 34 }} data-reveal="fade">
            <span>{post.category}</span>
            <span>{dateFmt.format(new Date(post.date))}</span>
            <span>{post.readMinutes} dk okuma</span>
          </div>
          {post.body.map((b, i) => (
            <div key={i} data-reveal>
              {b.h && <h2>{b.h}</h2>}
              <p>{b.p}</p>
            </div>
          ))}
          <p style={{ marginTop: 40 }}>
            <Link className="text-link" href="/blog">← Tüm yazılar</Link>
          </p>
        </div>
      </section>

      <CtaBand
        title="Aklınızdaki projeyi konuşalım"
        text="Bu yazıdaki konular aracınız için ne anlama geliyor? Teklif formunu doldurun, size özel değerlendirelim."
      />
    </>
  );
}
