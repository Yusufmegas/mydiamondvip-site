import Link from 'next/link';
import type { Service } from '@/data/services';
import type { Project } from '@/data/projects';

/** Lüks katalog kartı — hizmetler */
export function ServiceCard({ service, index }: { service: Service; index?: number }) {
  return (
    <article className="card service-card" data-reveal>
      <Link href={`/hizmetler/${service.slug}`} className="card-media" aria-hidden tabIndex={-1}>
        {index !== undefined && <span className="card-index">{String(index + 1).padStart(2, '0')}</span>}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={service.image} alt="" loading="lazy" />
      </Link>
      <div className="card-body">
        <h3>
          <Link href={`/hizmetler/${service.slug}`}>{service.shortTitle}</Link>
        </h3>
        <p>{service.summary}</p>
        <Link className="text-link" href={`/hizmetler/${service.slug}`}>
          Hizmeti İncele
        </Link>
      </div>
    </article>
  );
}

/** Sinematik vitrin kartı — projeler (metin görselin üzerinde).
 *  Matterport turu olan projelerde 360° TUR badge'i gösterir; kart hiçbir
 *  iframe yüklemez, yalnızca detay sayfasına bağlantı verir. */
export function ShowcaseCard({ project }: { project: Project }) {
  const hasTour = Boolean(project.matterportTour);
  return (
    <Link href={`/projeler/${project.slug}`} className="showcase-card" data-reveal>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={project.image} alt={project.title} loading="lazy" />
      {hasTour && <span className="tour-badge">360° TUR</span>}
      <div className="showcase-body">
        <p className="card-meta">{project.vehicle}</p>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <span className="text-link">{hasTour ? 'Projeyi ve 360° Turu İncele' : 'Projeyi İncele'}</span>
      </div>
    </Link>
  );
}

/** Blog kartı */
export function BlogCard({
  href, image, category, title, excerpt, meta, featured,
}: {
  href: string; image: string; category: string; title: string; excerpt: string; meta: string; featured?: boolean;
}) {
  return (
    <article className={`card${featured ? ' blog-featured' : ''}`} data-reveal>
      <Link href={href} className="card-media" aria-hidden tabIndex={-1}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" loading="lazy" />
      </Link>
      <div className="card-body">
        <p className="card-meta">{category} · {meta}</p>
        <h3><Link href={href}>{title}</Link></h3>
        <p>{excerpt}</p>
        <Link className="text-link" href={href}>Devamını Oku</Link>
      </div>
    </article>
  );
}
