'use client';

// Ana sayfa — "Detay Odaklı İşçilik, Kişiye Özel Kabin Deneyimi" bölümü.
// SplitText başlık reveal + GSAP sıralı madde girişleri + SpotlightCard
// mikro etkileşimi. Scroll-film motorundan tamamen bağımsız; tüm
// tetikleyiciler once:true, reduced-motion'da animasyon yok.

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitText from '@/components/SplitText';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import { home } from '@/data/siteContent';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function CraftSection() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const q = gsap.utils.selector(scope);

      // Kicker: yumuşak fade (başlık SplitText kendi tetikleyicisiyle gelir)
      gsap.fromTo(
        q('[data-fx="kicker"]'),
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: scope.current, start: 'top 78%', once: true },
          onComplete() {
            gsap.set(q('[data-fx="kicker"]'), { clearProps: 'all' });
          },
        },
      );

      // Açıklama: başlığın ~150ms ardından fade-up
      gsap.fromTo(
        q('[data-fx="lead"]'),
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.15,
          scrollTrigger: { trigger: scope.current, start: 'top 78%', once: true },
          onComplete() {
            gsap.set(q('[data-fx="lead"]'), { clearProps: 'all' });
          },
        },
      );

      // 01–06 maddeleri: sağdan hafif kayarak, blur çözülerek sırayla;
      // ayırıcı çizgiler her maddeyle birlikte soldan çizilir.
      const items = q('[data-fx="item"]');
      const lines = q('[data-fx="line"]');
      gsap.set(lines, { scaleX: 0, transformOrigin: 'left center' });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: q('.why-list')[0], start: 'top 82%', once: true },
        onComplete() {
          gsap.set([...items, ...lines], { clearProps: 'transform,filter,willChange,opacity' });
        },
      });
      tl.fromTo(
        items,
        { opacity: 0, x: 30, filter: 'blur(5px)' },
        { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.75, ease: 'power3.out', stagger: 0.1 },
        0,
      );
      tl.to(lines, { scaleX: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1 }, 0.05);
    },
    { scope },
  );

  return (
    <section className="section section-soft craft-fx" ref={scope}>
      <div className="container sticky-side">
        <div className="side">
          <p className="kicker" data-fx="kicker">{home.why.kicker}</p>
          <SplitText
            tag="h2"
            text={home.why.title}
            splitType="words"
            from={{ opacity: 0, y: 48, filter: 'blur(8px)' }}
            to={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            duration={0.85}
            delay={100}
            ease="power4.out"
            threshold={0.2}
            rootMargin="-60px"
            textAlign="left"
          />
          <p className="lead" data-fx="lead">{home.why.lead}</p>
        </div>
        <div className="why-list">
          {home.why.items.map((f, i) => (
            <SpotlightCard key={f.title} className="why-spot" spotlightColor="rgba(201, 155, 95, 0.10)">
              <div className="why-item" data-fx="item">
                <span className="no">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              </div>
              <span className="why-line" data-fx="line" aria-hidden="true" />
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
