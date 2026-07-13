// Editorial hizmet kartı — görsel tam yüzey, metin alt kısımda kontrollü
// koyu gradient üzerinde. Hover davranışları CSS'te (dokunmatikte kapalı).

import Image from 'next/image';
import Link from 'next/link';
import type { Service } from '@/data/services';

export function ServicePillarCard({
  service,
  index,
  large = false,
  priority = false,
}: {
  service: Service;
  index: number;
  large?: boolean;
  priority?: boolean;
}) {
  const src = service.pillarImage ?? service.image;
  return (
    <Link
      href={`/hizmetler/${service.slug}`}
      className={`pillar-card${large ? ' pillar-card-lg' : ''}`}
      data-reveal
    >
      <Image
        src={src}
        alt={service.title}
        fill
        priority={priority}
        sizes={large ? '(max-width: 700px) 100vw, (max-width: 1080px) 50vw, 620px' : '(max-width: 700px) 100vw, (max-width: 1080px) 50vw, 420px'}
        style={{ objectFit: 'cover', objectPosition: service.pillarPosition ?? '50% 50%' }}
      />
      <span className="pillar-scrim" aria-hidden="true" />
      <div className="pillar-body">
        <span className="pillar-no">{String(index + 1).padStart(2, '0')}</span>
        <h3>{service.title}</h3>
        <p>{service.summary}</p>
        <span className="pillar-cta">
          İncele <span className="pillar-arrow" aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}
