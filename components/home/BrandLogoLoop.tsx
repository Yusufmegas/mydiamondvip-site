'use client';

// Ana sayfa — FilmSection ile Hizmetler arasındaki marka logo şeridi.
// React Bits LogoLoop sonsuz akışı yönetir; GSAP giriş animasyonu yalnızca
// dış wrapper'lara uygulanır (transform çakışması yok). Işık temalı geçiş
// şeridi: logolar koyu/renkli olduğu için kırık beyaz zemin seçildi.

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import LogoLoop from '@/components/reactbits/LogoLoop';
import { loopLogos } from '@/data/logoLoop';
import './BrandLogoLoop.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Kırık beyaz zemin — kenar fade rengi bire bir aynı olmalı (globals: --off-white)
const SECTION_BG = '#f3f0ea';

export default function BrandLogoLoop() {
  const scope = useRef<HTMLElement>(null);
  const [compact, setCompact] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)');
    const update = () => setCompact(mq.matches);
    update();
    mq.addEventListener('change', update);
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    return () => mq.removeEventListener('change', update);
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const q = gsap.utils.selector(scope);

      const borders = q('.brand-loop-border');
      const track = q('[data-fx="loop"]');

      const tl = gsap.timeline({
        scrollTrigger: { trigger: scope.current, start: 'top 88%', once: true },
        onComplete() {
          gsap.set([...borders, ...track], {
            clearProps: 'transform,willChange,opacity',
          });
        },
      });
      tl.fromTo(
        borders,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 0.9, ease: 'power3.inOut' },
        0,
      );
      tl.fromTo(
        track,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        0.2,
      );
    },
    { scope },
  );

  return (
    <section className="brand-loop theme-light" ref={scope} aria-label="Marka logoları">
      <span className="brand-loop-border brand-loop-border-top" aria-hidden="true" />
      <div className="brand-loop-track" data-fx="loop">
        <LogoLoop
          logos={loopLogos}
          speed={reduced ? 0 : compact ? 48 : 65}
          direction="left"
          logoHeight={compact ? 38 : 56}
          gap={compact ? 48 : 84}
          pauseOnHover
          scaleOnHover
          fadeOut
          fadeOutColor={SECTION_BG}
          ariaLabel="Marka logoları"
        />
      </div>
      <span className="brand-loop-border brand-loop-border-bottom" aria-hidden="true" />
    </section>
  );
}
