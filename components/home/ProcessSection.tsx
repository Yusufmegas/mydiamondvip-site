'use client';

// Ana sayfa — "Dört Adımda Projeniz" bölümü.
// Aşamalı başlık alanı (kicker → SplitText başlık → açıklama), soldan sağa
// çizilen süreç çizgisi, SpotlightCard'lı sıralı adım reveal'ları ve Magnet'li
// bağlantı. Tüm tetikleyiciler once:true; reduced-motion'da animasyon yok;
// Magnet yalnızca fare + ince işaretçi olan cihazlarda etkin.

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitText from '@/components/SplitText';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import Magnet from '@/components/reactbits/Magnet';
import { home } from '@/data/siteContent';
import { processSummary } from '@/data/process';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ProcessSection() {
  const scope = useRef<HTMLElement>(null);
  const [magnetOn, setMagnetOn] = useState(false);

  useEffect(() => {
    setMagnetOn(
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    );
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const q = gsap.utils.selector(scope);

      // Aşama 1–3: kicker fade-up → başlık (SplitText kendi tetikleyicisi) → açıklama
      gsap.fromTo(
        q('[data-fx="kicker"]'),
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: scope.current, start: 'top 78%', once: true },
          onComplete() {
            gsap.set(q('[data-fx="kicker"]'), { clearProps: 'all' });
          },
        },
      );
      gsap.fromTo(
        q('[data-fx="lead"]'),
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.3,
          scrollTrigger: { trigger: scope.current, start: 'top 78%', once: true },
          onComplete() {
            gsap.set(q('[data-fx="lead"]'), { clearProps: 'all' });
          },
        },
      );

      // Süreç çizgisi: soldan sağa; adımlar hafif gecikmeyle sırayla
      const line = q('.process-line');
      const steps = q('.step-spot');
      const tl = gsap.timeline({
        scrollTrigger: { trigger: q('.process-wrap')[0], start: 'top 82%', once: true },
        onComplete() {
          gsap.set([...line, ...steps, ...q('[data-fx="link"]')], {
            clearProps: 'transform,willChange,opacity',
          });
        },
      });
      tl.fromTo(
        line,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 1.1, ease: 'power3.inOut' },
        0,
      );
      tl.fromTo(
        steps,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12 },
        0.15,
      );
      tl.fromTo(
        q('[data-fx="link"]'),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.35',
      );
    },
    { scope },
  );

  return (
    <section className="section section-stone process-fx" ref={scope}>
      <div className="container">
        <div className="section-head">
          <p className="kicker" data-fx="kicker">{home.process.kicker}</p>
          <SplitText
            tag="h2"
            text={home.process.title}
            splitType="words"
            from={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
            to={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            duration={0.85}
            delay={100}
            ease="power4.out"
            threshold={0.2}
            rootMargin="-60px"
            textAlign="left"
          />
          <p className="lead" data-fx="lead">{home.process.lead}</p>
        </div>
        <div className="process-wrap">
          <span className="process-line" aria-hidden="true" />
          <div className="process-strip">
            {processSummary.map((s, i) => (
              <SpotlightCard key={s.title} className="step-spot" spotlightColor="rgba(201, 155, 95, 0.09)">
                <div className="process-step">
                  <p className="no">{String(i + 1).padStart(2, '0')}</p>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 40 }} data-fx="link">
          <Magnet disabled={!magnetOn} padding={36} magnetStrength={18}>
            <Link className="text-link" href="/tasarim-sureci">Sürecin tamamını inceleyin</Link>
          </Magnet>
        </div>
      </div>
    </section>
  );
}
