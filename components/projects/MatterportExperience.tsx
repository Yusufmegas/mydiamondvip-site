'use client';

// Matterport 360° araç deneyimi — TEK tur (tek fiziksel araç).
// Click-to-load: iframe, kullanıcı "360° Turu Başlat" demeden DOM'a girmez.
// Kapatma kontrolü alanın İÇİNDEDİR (fixed değil); scroll konumuna dokunulmaz,
// body/html overflow değiştirilmez.

import Image from 'next/image';
import { useState } from 'react';
import type { MatterportTour } from '@/data/projects';

export default function MatterportExperience({ tour }: { tour: MatterportTour }) {
  const [active, setActive] = useState(false);

  return (
    <div className="mp-frame">
      {active ? (
        <>
          <iframe
            className="mp-iframe"
            src={tour.embedUrl}
            title={`${tour.title} — interaktif 360° araç turu`}
            allow="autoplay; fullscreen; web-share; xr-spatial-tracking"
            allowFullScreen
          />
          <button
            type="button"
            className="mp-close"
            onClick={() => setActive(false)}
            aria-label="360° turu kapat ve sayfada devam et"
          >
            Turu Kapat ve Sayfada Devam Et
          </button>
        </>
      ) : (
        <>
          <Image
            src={tour.poster}
            alt={`${tour.title} — kabin görünümü`}
            fill
            sizes="(max-width: 700px) 100vw, (max-width: 1400px) 92vw, 1400px"
            style={{ objectFit: 'cover' }}
          />
          <span className="mp-overlay" aria-hidden="true" />
          <div className="mp-poster-ui">
            <span className="mp-tag">Etkileşimli Araç Deneyimi</span>
            <button type="button" className="cta cta-primary mp-start" onClick={() => setActive(true)}>
              360° Turu Başlat
            </button>
          </div>
        </>
      )}
    </div>
  );
}
