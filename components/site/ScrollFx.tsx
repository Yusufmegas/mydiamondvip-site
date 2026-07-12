'use client';

// Site geneli hafif scroll efektleri — film/scrub motorundan TAMAMEN bağımsız.
// Sunucu bileşenleri yalnızca data attribute ekler:
//   data-reveal            → görünüme girince fade-up (varyant: data-reveal="fade|left|line")
//   data-reveal-group      → çocuklarındaki [data-reveal]'lere sıralı gecikme
//   data-parallax="0.12"   → arka plan görselinde yumuşak dikey parallax
// prefers-reduced-motion'da tümü devre dışı kalır; IO + CSS transition dışında maliyet yok.

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollFx() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Mobil/dokunmatik: parallax kapalı — scroll başına transform hesabı yapılmaz
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    if (reduced) {
      // Reveal'ler kapalı; header tema algılama aşağıda yine de çalışır
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => el.classList.add('is-in'));
    }

    // --- Reveal ---
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    const scan = () => {
      if (reduced) {
        document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)').forEach((el) => el.classList.add('is-in'));
        return;
      }
      // Grup gecikmeleri
      document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
        group.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el, i) => {
          if (!el.style.transitionDelay) el.style.transitionDelay = `${Math.min(i * 90, 540)}ms`;
        });
      });
      document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el));
    };
    scan();

    // Client-side eklenen düğümler (proje filtreleri vb.) için sınırlı gözlem:
    // yalnızca data-reveal içeren node eklendiğinde, debounce ile tarar —
    // scroll sırasında sürekli tüm body taraması yapılmaz.
    let moTimer: ReturnType<typeof setTimeout> | null = null;
    const mo = new MutationObserver((mutations) => {
      let relevant = false;
      for (const m of mutations) {
        for (const n of m.addedNodes) {
          if (n instanceof HTMLElement && (n.hasAttribute('data-reveal') || n.querySelector('[data-reveal]'))) {
            relevant = true;
            break;
          }
        }
        if (relevant) break;
      }
      if (!relevant) return;
      if (moTimer) clearTimeout(moTimer);
      moTimer = setTimeout(() => { moTimer = null; scan(); }, 150);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // --- Parallax + header tema algılama (tek rAF-throttle'lı scroll dinleyicisi) ---
    // Dokunmatik cihazlarda parallax listesi boş bırakılır (maliyet sıfır)
    const pEls = coarse ? [] : Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
    // Header, altındaki bölümün temasına uyum sağlar: açık bölümlerden biri
    // header hattını (y ≈ 46px) kapsıyorsa html.header-light açılır.
    const lightEls = Array.from(
      document.querySelectorAll<HTMLElement>('.section-light, .section-soft, .section-stone, .theme-light'),
    );
    let raf = 0;
    const applyScrollFx = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (const el of reduced ? [] : pEls) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) continue;
        const f = parseFloat(el.dataset.parallax || '0.12');
        const center = r.top + r.height / 2 - vh / 2;
        el.style.transform = `translateY(${(-center * f).toFixed(1)}px) scale(${1 + f * 0.9})`;
      }
      const HEADER_LINE = 46;
      let light = false;
      for (const el of lightEls) {
        const r = el.getBoundingClientRect();
        if (r.top <= HEADER_LINE && r.bottom >= HEADER_LINE) { light = true; break; }
      }
      document.documentElement.classList.toggle('header-light', light);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(applyScrollFx);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    applyScrollFx();

    return () => {
      io.disconnect();
      mo.disconnect();
      if (moTimer) clearTimeout(moTimer);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.documentElement.classList.remove('header-light');
    };
  }, [pathname]);

  return null;
}
