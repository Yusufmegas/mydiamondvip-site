'use client';

// Sinematik scroll-film — artık tam sayfa değil, ana sayfanın vitrin BÖLÜMÜ.
// Dış sarmalayıcı FILM_VH kadar scroll alanı üretir; içteki sticky katman
// 100dvh tuval + overlay taşır. Playhead, bölümün KENDİ scroll aralığına eşlenir.
// Motor (WebCodecs/fallback) hiç değişmedi — yalnızca scroll→kare eşlemesi bölüm-göreli.

import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrubEngine, type EngineStats } from '@/lib/scrubEngine';
import { FallbackEngine } from '@/lib/fallbackEngine';
import { LAST_FRAME, STOP_FRAMES, frameFromScroll } from '@/lib/timeline';
import { FILM_1080_URL, FILM_720_URL } from '@/lib/filmSources';
import Gate from './Gate';
import Overlays, { updateOverlays } from './Overlays';
import ProfChip from './ProfChip';

gsap.registerPlugin(ScrollTrigger);

type Engine = ScrubEngine | FallbackEngine;

// Bölüm yüksekliği — sahne temposu buradan kontrol edilir. Mobilde scroll
// mesafesi kısalır (overlay kare zamanlamaları DEĞİŞMEZ; playhead bölüm-göreli
// orana eşlendiği için yalnızca parmak yolu kısalır).
const FILM_VH_DESKTOP = 800;
const FILM_VH_MOBILE = 560;
const SNAP_IDLE_MS = 280;
const SNAP_RADIUS = 70;

export const flog = (...a: unknown[]) => console.info('[film]', ...a);

export default function FilmSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gate, setGate] = useState({ progress: 0, open: false });
  const [prof, setProf] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [filmVh, setFilmVh] = useState(FILM_VH_DESKTOP);
  const statsRef = useRef<EngineStats | null>(null);

  // Mobil scroll mesafesi: SSR 800vh ile eşleşir, client'ta coarse cihazda 560vh'e iner
  useEffect(() => {
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(max-width: 900px)').matches
    ) {
      setFilmVh(FILM_VH_MOBILE);
    }
  }, []);

  // KRİTİK: Film 800vh→560vh'e inince ALT BÖLÜMLER ~2000px yukarı kayar.
  // Craft/Process/CTA/Footer ScrollTrigger'ları konumlarını eski yerleşime göre
  // hesapladıysa tetik noktaları sayfa sonunun altında kalır ve reveal içerikleri
  // (opacity 0) sonsuza dek görünmez kalır. Yeni yükseklik DOM'a uygulandıktan
  // sonra tüm tetikleyici konumları güvenli biçimde yeniden hesaplanır.
  useEffect(() => {
    if (filmVh === FILM_VH_DESKTOP) return;
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => ScrollTrigger.refresh());
    });
    // rAF kısıtlanırsa (arka plan sekmesi vb.) zamanlayıcı yedeği
    const t = setTimeout(() => ScrollTrigger.refresh(), 500);
    // Font yüklemesi satır sarmalarını değiştirebilir — bir kez daha tazele
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(t);
    };
  }, [filmVh]);

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

    // Cihaz profili: dokunmatik/coarse cihazlarda Lenis yok, DPR düşük, mobil decode profili
    const isCoarse =
      window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(max-width: 900px)').matches;
    const isPhone = window.matchMedia('(max-width: 700px)').matches;
    // Canvas DPR: telefon 1 · tablet ≤1.25 · masaüstü ≤2 (mevcut davranış)
    const dpr = isCoarse
      ? (isPhone ? 1 : Math.min(1.25, window.devicePixelRatio || 1))
      : Math.min(2, window.devicePixelRatio || 1);
    // Tampon boyutu canvas'ın KENDİ CSS kutusundan alınır (100dvh) — mobilde adres
    // çubuğu animasyonunda innerHeight ile dvh ayrışınca buffer'ın esnetilip aracın
    // ezilmesini önler. ResizeObserver dvh değişimlerini de yakalar.
    const resize = () => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      const bw = Math.round(w * dpr);
      const bh = Math.round(h * dpr);
      if (canvas.width === bw && canvas.height === bh) return;
      canvas.width = bw;
      canvas.height = bh;
      engine?.redraw();
    };
    window.addEventListener('resize', resize);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);

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
      const use720 = isCoarse || window.innerWidth * dpr < 1600;
      // URL kaynağı lib/filmSources.ts'ten gelir (env destekli); motor mantığı değişmedi
      const url = use720 ? FILM_720_URL : FILM_1080_URL;
      flog('boot: varyant', { url, isCoarse, dpr });

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
        const fb = new FallbackEngine('/fallback', { mobile: isCoarse });
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
        const se = new ScrubEngine(url, { preferSoftware, mobile: isCoarse });
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

    // Lenis yalnızca fare/ince işaretçili masaüstünde; dokunmatik cihazlar
    // native scroll kullanır (touchMultiplier tamamen kaldırıldı) ve
    // film hedefi aktifken rAF döngüsünden (kare başına bir kez) okunur.
    let active = false;   // film bölümü viewport ±1 ekran içinde mi
    let running = false;  // rAF döngüsü çalışıyor mu

    if (!isCoarse) {
      lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
      // Teşhis modu: gerçek scroll testleri Lenis üzerinden sürülebilsin
      if (new URLSearchParams(location.search).has('prof')) {
        (window as unknown as { __lenis?: Lenis | null }).__lenis = lenis;
      }
      lenis.on('scroll', () => {
        if (active) engine?.setTarget(targetFromScroll());
        if (!snapping) armSnap();
      });
      // Snap yalnızca masaüstünde — mobilde tamamen kapalı
      window.addEventListener('wheel', armSnap, { passive: true });
    }

    const loop = (time: number) => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      lenis?.raf(time);
      // Motor tick'i YALNIZCA film bölümü yakınındayken — uzaktayken decode,
      // setTarget ve canvas çizimi tamamen durur.
      if (active && engine) {
        engine.setTarget(targetFromScroll());
        engine.tick(time);
      }
    };
    // Masaüstünde Lenis için döngü sürekli gerekir; mobilde yalnızca film aktifken.
    const needLoop = () => !document.hidden && (lenis !== null || active);
    const syncLoop = () => {
      if (needLoop() && !running) {
        running = true;
        raf = requestAnimationFrame(loop);
      } else if (!needLoop() && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };

    // Aktiflik: bölüm viewport'un ±1 ekran bandındayken motor çalışır
    const io = new IntersectionObserver(
      (entries) => {
        const was = active;
        active = entries[0].isIntersecting;
        if (active && !was) engine?.resume();  // pencereyi yeniden talep et
        if (!active && was) engine?.suspend(); // bekleyen/uçuştaki istekleri bırak
        syncLoop();
      },
      { rootMargin: '100% 0px 100% 0px' },
    );
    io.observe(section);

    // Sekme gizlenince motor ve döngü tamamen durur; görünür olunca kaldığı yerden sürer
    const onVisibility = () => {
      if (document.hidden) engine?.suspend();
      else engine?.resume();
      syncLoop();
    };
    document.addEventListener('visibilitychange', onVisibility);
    syncLoop();
    void boot();

    return () => {
      disposed = true;
      running = false;
      cancelAnimationFrame(raf);
      if (snapTimer) clearTimeout(snapTimer);
      io.disconnect();
      ro?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', resize);
      window.removeEventListener('wheel', armSnap);
      lenis?.destroy();
      engine?.destroy();
      section.classList.remove('gate-open');
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`film-section${reduced ? ' film-reduced' : ''}`}
      style={{ height: reduced ? '100dvh' : `${filmVh}vh` }}
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
