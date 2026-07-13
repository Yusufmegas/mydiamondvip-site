'use client';

// Editorial proje galerisi — 12 kolon ritmi: ilk görsel geniş, kalanlar
// oryantasyona göre 6/8/4 kolon. Tıklanınca lightbox açılır; kapanınca focus
// tıklanan öğeye döner. Scroll davranışına hiçbir müdahale yok.

import Image from 'next/image';
import { useRef, useState } from 'react';
import type { ProjectGalleryItem } from '@/data/projects';
import GalleryLightbox from './GalleryLightbox';

function spanClass(item: ProjectGalleryItem, index: number): string {
  if (index === 0) return 'g-span-8'; // ilk görsel geniş ve büyük
  switch (item.orientation) {
    case 'wide':
      return 'g-span-8';
    case 'portrait':
      return 'g-span-4 g-tall';
    case 'square':
      return 'g-span-4';
    default:
      return index % 3 === 0 ? 'g-span-6' : 'g-span-4';
  }
}

export default function ProjectGallery({ items }: { items: ProjectGalleryItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const close = () => {
    const idx = openIndex;
    setOpenIndex(null);
    // Lightbox unmount'u tamamlandıktan sonra focus tıklanan öğeye döner
    if (idx !== null) setTimeout(() => itemRefs.current[idx]?.focus(), 0);
  };

  return (
    <>
      <div className="project-gallery" data-reveal-group>
        {items.map((item, i) => (
          <button
            key={item.src}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            type="button"
            className={`gallery-item ${spanClass(item, i)}`}
            onClick={() => setOpenIndex(i)}
            aria-label={`Görseli büyüt: ${item.alt}`}
            data-reveal
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              priority={i === 0}
              sizes="(max-width: 700px) 100vw, (max-width: 1080px) 50vw, 820px"
              style={{ objectFit: 'cover', objectPosition: item.objectPosition ?? '50% 50%' }}
            />
            {item.caption && <span className="gallery-caption">{item.caption}</span>}
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <GalleryLightbox
          items={items}
          index={openIndex}
          onClose={close}
          onNavigate={(i) => setOpenIndex(i)}
        />
      )}
    </>
  );
}
