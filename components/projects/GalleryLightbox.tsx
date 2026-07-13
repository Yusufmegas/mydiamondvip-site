'use client';

// Premium galeri lightbox — scroll-güvenli: body/html overflow'a dokunmaz,
// scroll konumunu değiştirmez. Klavye okları + Escape + mobil swipe.
// Focus: açılınca kapatma butonuna, kapanınca tıklanan galeri öğesine döner.

import Image from 'next/image';
import { useCallback, useEffect, useRef } from 'react';
import type { ProjectGalleryItem } from '@/data/projects';

export default function GalleryLightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: ProjectGalleryItem[];
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}) {
  const item = items[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);

  const prev = useCallback(
    () => onNavigate((index - 1 + items.length) % items.length),
    [index, items.length, onNavigate],
  );
  const next = useCallback(
    () => onNavigate((index + 1) % items.length),
    [index, items.length, onNavigate],
  );

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, prev, next]);

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Galeri görseli ${index + 1} / ${items.length}: ${item.alt}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(dx) > 48) (dx > 0 ? prev : next)();
      }}
    >
      <button
        ref={closeRef}
        type="button"
        className="lightbox-close"
        onClick={onClose}
        aria-label="Galeriyi kapat"
      >
        ✕
      </button>

      <button type="button" className="lightbox-nav lightbox-prev" onClick={prev} aria-label="Önceki görsel">
        ←
      </button>

      <figure className="lightbox-figure">
        <div className="lightbox-media">
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="100vw"
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
        <figcaption>
          <span className="lightbox-count">{index + 1} / {items.length}</span>
          {item.caption && <span className="lightbox-caption">{item.caption}</span>}
        </figcaption>
      </figure>

      <button type="button" className="lightbox-nav lightbox-next" onClick={next} aria-label="Sonraki görsel">
        →
      </button>
    </div>
  );
}
