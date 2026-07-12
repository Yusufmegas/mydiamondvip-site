'use client';

// Sinematik scroll-film — artık tam sayfa değil, ana sayfanın vitrin BÖLÜMÜ.
// Dış sarmalayıcı FILM_VH kadar scroll alanı üretir; içteki sticky katman
// 100dvh tuval + overlay taşır. Playhead, bölümün KENDİ scroll aralığına eşlenir.
// Motor (WebCodecs/fallback) hiç değişmedi — yalnızca scroll→kare eşlemesi bölüm-göreli.

import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { ScrubEngine, type EngineStats } from '@/lib/scrubEngine';
import { FallbackEngine } from '@/lib/fallbackEngine';
import { LAST_FRAME, STOP_FRAMES, frameFromScroll } from '@/lib/timeline';
import { FILM_1080_URL, FILM_720_URL } from '@/lib/filmSources';
import Gate from './Gate';
import Overlays, { updateOverlays } from './Overlays';
import ProfChip from './ProfChip';

type Engine = ScrubEngine | FallbackEngine;

const FILM_VH = 800;      // bölüm yüksekliği — sahne temposu buradan kontrol edilir
const SNAP_IDLE_MS = 280;
const SNAP_RADIUS = 70;

export const flog = (...a: unknown[]) => console.info('[film]', ...a);

export default function FilmSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gate, setGate] = useState({ progress: 0, open: false });
  const [prof, setProf] = useState(false);
  const [reduced, setReduced] = useState(false);
  const statsRef = useRef<EngineStats | null>(null);

  useEffect(() => {
    const section = sectionRef.current!;
    const canvas = canvasRef.current!;
    let engine: Engine | null = null;
    let lenis: Lenis | null = null;
    let raf = 0;
    let disposed = false;
    let gateOpen = false;
    let snapTimer: ReturnType<typeof setTimeout> | null = null;
    let snapping = false;

    setProf(new URLSearchParams(location.search).has('prof'));

    // Erişilebilirlik: hareket azaltma tercihinde film yerine statik poster
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduced(true);
      flog('film: prefers-reduced-motion → statik poster');
      return;
    }

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      engine?.redraw();
    };
    window.addEventListener('resize', resize);

    // Bölüm-göreli scroll eşlemesi
    const bounds = () => {
      const top = section.offsetTop;
      const len = Math.max(1, section.offsetHeight - window.innerHeight);
      return { top, len };
    };
    const targetFromScroll = () => {
      const { top, len } = bounds();
      return frameFromScroll((window.scrollY - top) / len);
    };
    const inSection = () => {
      const { top, len } = bounds();
      return window.scrollY > top - window.innerHeight * 0.5 && window.scrollY < top + len + window.innerHeight * 0.5;
    };

    // Yumuşak snap — yalnızca film bölümü içindeyken
    const armSnap = () => {
      if (snapTimer) clearTimeout(snapTimer);
      snapping = false;
      snapTimer = setTimeout(() => {
        if (!gateOpen || !lenis || disposed || !inSection()) return;
        const f = targetFromScroll();
        if (f <= 0.5 || f >= LAST_FRAME - 0.5) return; // bölüm sınırlarında snap yok
        let best = -1, bestD = SNAP_RADIUS + 1;
        for (const s of STOP_FRAMES) {
          const d = Math.abs(s - f);
          if (d < bestD) { bestD = d; best = s; }
        }
        if (best >= 0 && bestD > 0.5) {
          const { top, len } = bounds();
          snapping = true;
          lenis.scrollTo(top + (best / LAST_FRAME) * len, {
            duration: 1.1,
            easing: (t: number) => 1 - Math.pow(1 - t, 3),
            lock: false,
          });
        }
      }, SNAP_IDLE_MS);
    };

    const boot = async () => {
      resize();
      const smallViewport = window.matchMedia('(max-width: 900px)').matches;
      const use720 = smallViewport || window.innerWidth * dpr < 1600;
      // URL kaynağı lib/filmSources.ts'ten gelir (env destekli); motor mantığı değişmedi
      const url = use720 ? FILM_720_URL : FILM_1080_URL;
      flog('boot: varyant', { url, smallViewport, dpr });

      const startEngine = async (e: Engine) => {
        if (disposed) { e.destroy(); return; }
        engine = e;
        e.attach(canvas);
        statsRef.current = e.stats;
        (window as unknown as { __film?: typeof e.stats }).__film = e.stats;
        e.onGate = (p, open) => {
          if (disposed) return;
          setGate({ progress: p, open });
          if (open && !gateOpen) {
            gateOpen = true;
            section.classList.add('gate-open');
            flog('gate: AÇIK');
          }
        };
        e.onFrame = (frame) => updateOverlays(frame);
        e.setTarget(targetFromScroll());
        await e.start();
        if (disposed) { e.destroy(); return; }
        flog('engine: hazır', { mode: e.stats.mode, accel: e.stats.accel });
      };

      const useFallback = async (why: unknown) => {
        console.warn('[film] codec yolu düştü, WebP fallback devrede:', why);
        engine?.destroy();
        const fb = new FallbackEngine('/fallback');
        fb.onFatal = (err) => console.error('[film] FATAL: fallback motoru da öldü:', err);
        try {
          await startEngine(fb);
        } catch (err) {
          console.error('[film] FATAL: fallback başlatılamadı:', err);
        }
      };

      if (await ScrubEngine.supported()) {
        let remembered = false;
        try { remembered = localStorage.getItem('film-sw') === '1'; } catch { /* gizli mod */ }
        const preferSoftware = new URLSearchParams(location.search).has('sw') || remembered;
        const se = new ScrubEngine(url, { preferSoftware });
        se.onFatal = (err) => { if (!disposed) void useFallback(err); };
        try {
          await startEngine(se);
        } catch (err) {
          if (!disposed) await useFallback(err);
        }
      } else {
        await useFallback('VideoDecoder yok (iOS<16.4)');
      }
    };

    // Lenis: sitenin tamamına yumuşak scroll (yalnızca ana sayfada init edilir)
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.6 });
    lenis.on('scroll', () => {
      engine?.setTarget(targetFromScroll());
      if (!snapping) armSnap();
    });
    window.addEventListener('wheel', armSnap, { passive: true });
    window.addEventListener('touchstart', armSnap, { passive: true });

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      lenis?.raf(time);
      if (engine) {
        engine.setTarget(targetFromScroll());
        engine.tick(time);
      }
    };
    raf = requestAnimationFrame(loop);
    void boot();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (snapTimer) clearTimeout(snapTimer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('wheel', armSnap);
      window.removeEventListener('touchstart', armSnap);
      lenis?.destroy();
      engine?.destroy();
      section.classList.remove('gate-open');
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`film-section${reduced ? ' film-reduced' : ''}`}
      style={{ height: reduced ? '100dvh' : `${FILM_VH}vh` }}
      aria-label="Sinematik araç deneyimi"
    >
      <div className="film-sticky">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/poster.webp" alt="MyDiamondVIP VIP araç tasarımı" className="film-poster" />
        {!reduced && <canvas ref={canvasRef} className="film-canvas" />}
        {!reduced && <Overlays />}
        {!reduced && <Gate progress={gate.progress} open={gate.open} />}
        {!reduced && <div className="film-hint" aria-hidden>Kaydırarak keşfedin</div>}
        {prof && <ProfChip statsRef={statsRef} />}
      </div>
    </section>
  );
}
