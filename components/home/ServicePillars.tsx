// Ana sayfa + hizmetler sayfası: sekiz ana hizmetin editorial pillar grid'i.
// İlk iki hizmet büyük kart, kalan altısı üç kolonda. Reveal'lar mevcut
// data-reveal sistemiyle çalışır (ScrollFx) — ek JS yok, server component.

import { coreServices } from '@/data/services';
import { ServicePillarCard } from '@/components/site/ServicePillarCard';

export default function ServicePillars({ eager = false }: { eager?: boolean }) {
  return (
    <div className="pillar-grid" data-reveal-group>
      {coreServices.map((s, i) => (
        <ServicePillarCard
          key={s.slug}
          service={s}
          index={i}
          large={i < 2}
          priority={eager && i < 2}
        />
      ))}
    </div>
  );
}
