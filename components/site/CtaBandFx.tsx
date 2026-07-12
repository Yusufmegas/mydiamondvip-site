'use client';

// Sayfa sonu CTA bandı — sinematik sürüm.
// LightRays arka planı yalnızca bu bölümün mutlak katmanında; masaüstü +
// WebGL + reduced-motion kapalıyken render edilir, aksi halde statik
// gradient fallback kullanılır. Başlık SplitText, açıklama BlurText,
// butonlar Magnet + sıralı GSAP reveal. Kod lazy yüklenir (React.lazy),
// WebGL yalnızca bölüm viewport'a girince başlatılır (bileşen içi IO).

import Link from 'next/link';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SplitText from '@/components/SplitText';
import BlurText from '@/components/reactbits/BlurText';
import Magnet from '@/components/reactbits/Magnet';
import { whatsappLink } from '@/data/contact';
import { whatsappMessages, ctaVariants } from '@/data/siteContent';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LightRays = lazy(() => import('@/components/reactbits/LightRays'));

export function CtaBand({
  variant = 'default',
  title,
  text,
}: {
  variant?: keyof typeof ctaVariants;
  title?: string;
  text?: string;
}) {
  const scope = useRef<HTMLElement>(null);
  const [raysOn, setRaysOn] = useState(false);
  const [magnetOn, setMagnetOn] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const desktop = window.matchMedia('(min-width: 769px)').matches;
    let webgl = false;
    try {
      const c = document.createElement('canvas');
      webgl = !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      webgl = false;
    }
    setRaysOn(!reduced && desktop && webgl);
    setMagnetOn(finePointer && !reduced);
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const q = gsap.utils.selector(scope);
      const btns = q('[data-fx="btn"]');
      gsap.fromTo(
        btns,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: 'power3.out',
          stagger: 0.08,
          delay: 0.35,
          scrollTrigger: { trigger: scope.current, start: 'top 80%', once: true },
          onComplete() {
            gsap.set(btns, { clearProps: 'transform,willChange,opacity' });
          },
        },
      );
    },
    { scope },
  );

  const v = ctaVariants[variant];
  const buttons = [
    { key: 'teklif', node: <Link className="cta cta-primary" href="/teklif-formu">Teklif Al</Link> },
    { key: 'randevu', node: <Link className="cta" href="/randevu-talebi">Randevu Talep Et</Link> },
    {
      key: 'whatsapp',
      node: (
        <a className="cta" href={whatsappLink(whatsappMessages.general)} target="_blank" rel="noopener noreferrer">
          WhatsApp ile Görüş
        </a>
      ),
    },
  ];

  return (
    <section className="cta-band" ref={scope}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/placeholders/dark-exterior.webp" alt="" className="cta-band-bg" loading="lazy" data-parallax="0.08" />
      <div className={`cta-band-rays${raysOn ? '' : ' cta-band-rays-static'}`} aria-hidden="true">
        {raysOn && (
          <Suspense fallback={null}>
            <LightRays
              raysOrigin="top-center"
              raysColor="#e8c896"
              raysSpeed={0.35}
              lightSpread={1.7}
              rayLength={1.3}
              fadeDistance={1.1}
              saturation={0.85}
              followMouse={false}
              mouseInfluence={0}
            />
          </Suspense>
        )}
      </div>
      <div className="container">
        <SplitText
          tag="h2"
          text={title ?? v.title}
          splitType="words"
          from={{ opacity: 0, y: 36, filter: 'blur(6px)' }}
          to={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          duration={0.9}
          delay={90}
          ease="power4.out"
          threshold={0.2}
          rootMargin="-40px"
          textAlign="center"
        />
        <BlurText
          text={text ?? v.text}
          className="cta-band-lead"
          animateBy="words"
          delay={26}
          stepDuration={0.8}
          animationFrom={{ filter: 'blur(6px)', opacity: 0, y: 12 }}
          animationTo={[{ filter: 'blur(0px)', opacity: 1, y: 0 }]}
        />
        <div className="cta-row">
          {buttons.map((b) => (
            <div key={b.key} data-fx="btn" className="cta-magnet">
              <Magnet disabled={!magnetOn} padding={40} magnetStrength={16}>
                {b.node}
              </Magnet>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
