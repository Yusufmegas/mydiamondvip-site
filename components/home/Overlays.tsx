'use client';

// Hold-frame HTML metin katmanları. Görünürlük React state ile değil, film
// playhead'inden kare-tabanlı imperativ sürülür — kare başına re-render yok.
// data-in / data-out / data-fade: kare cinsinden giriş, çıkış, geçiş penceresi.
// Metinler sahneye yavaş fade/slide ile girer ve görüntüyü kapatmaz.

import Link from 'next/link';
import { contact, whatsappLink } from '@/data/contact';
import { whatsappMessages } from '@/data/siteContent';

interface OvEl {
  el: HTMLElement;
  in: number;
  out: number;
  fade: number;
  interactive: boolean;
}

let registry: OvEl[] | null = null;

function collect(): OvEl[] {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-ov]'));
  return els.map((el) => ({
    el,
    in: Number(el.dataset.in),
    out: Number(el.dataset.out),
    fade: Number(el.dataset.fade ?? 16),
    interactive: el.dataset.interactive === '1',
  }));
}

const smooth = (t: number) => {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
};

export function updateOverlays(frame: number) {
  if (!registry || (registry[0] && !registry[0].el.isConnected)) registry = collect();
  for (const o of registry) {
    const oIn = smooth((frame - o.in) / o.fade);
    const oOut = 1 - smooth((frame - (o.out - o.fade)) / o.fade);
    const opacity = Math.min(oIn, oOut);
    o.el.style.opacity = opacity.toFixed(3);
    // transform CSS'e ait (ortalama translateX(-50%) vb.) — animasyon ayrı `translate` özelliğinde
    o.el.style.translate = `0px ${((1 - oIn) * 14).toFixed(2)}px`;
    o.el.style.visibility = opacity <= 0.001 ? 'hidden' : 'visible';
    if (o.interactive) o.el.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
  }
}

const NEVER = 99999; // çıkışı olmayan katmanlar (final)

export default function Overlays() {
  return (
    <div className="ov-root">
      {/* AÇILIŞ — farlar yanınca marka anı */}
      <section className="ov ov-hero" data-ov data-in="58" data-out="134" data-fade="20">
        <div className="brand-mark">MYDIAMOND<span>VIP</span></div>
        <h2>Her Detay, Size Özel</h2>
      </section>

      {/* ARAÇ — orbit ana başlık */}
      <section className="ov ov-arac" data-ov data-in="132" data-out="228" data-fade="16">
        <h2>Mercedes Vito VIP Dönüşüm</h2>
        <p>Her araç, sahibi için tek üretim: tasarımdan son dikişe kadar size özel.</p>
      </section>

      {/* ARAÇ — orbit duraklarındaki mikro-özellikler */}
      <div className="ov ov-micro ov-micro-1" data-ov data-in="222" data-out="270" data-fade="12">
        <span className="tick" />El yapımı deri kabin
      </div>
      <div className="ov ov-micro ov-micro-2" data-ov data-in="343" data-out="391" data-fade="12">
        <span className="tick" />Akustik sessizlik paketi
      </div>
      <div className="ov ov-micro ov-micro-3" data-ov data-in="464" data-out="512" data-fade="12">
        <span className="tick" />Panoramik yıldız tavan
      </div>

      {/* AÇILIŞ — perde inerken tek satır */}
      <section className="ov ov-acilis" data-ov data-in="872" data-out="952" data-fade="18">
        <p>İçeride, başka bir dünya.</p>
      </section>

      {/* KABİN — hizmet listesi, sıralı fade-in (durak 1040'ta tümü tam görünür) */}
      <section className="ov ov-kabin" data-ov data-in="986" data-out="1086" data-fade="12">
        <h3 data-ov data-in="988" data-out="1086" data-fade="14">Kabinde sizi bekleyenler</h3>
        <ul>
          <li data-ov data-in="996" data-out="1086" data-fade="12">VIP iç tasarım</li>
          <li data-ov data-in="1004" data-out="1086" data-fade="12">Deri döşeme</li>
          <li data-ov data-in="1012" data-out="1086" data-fade="12">Yıldız tavan</li>
          <li data-ov data-in="1020" data-out="1086" data-fade="12">Ambiyans aydınlatma</li>
          <li data-ov data-in="1028" data-out="1086" data-fade="12">Ses sistemi</li>
        </ul>
      </section>

      {/* FİNAL — simsiyah ekranda logo + yönlendirme */}
      <section className="ov ov-final" data-ov data-interactive="1" data-in="1462" data-out={NEVER} data-fade="26">
        <div className="brand-mark large">MYDIAMOND<span>VIP</span></div>
        <p className="final-line">Aracınız için özel bir tasarım planlayalım.</p>
        <div className="cta-row">
          <Link className="cta cta-primary" href="/teklif-formu">Teklif Al</Link>
          <a className="cta" href={whatsappLink(whatsappMessages.quote)} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          <a className="cta" href={contact.phoneHref}>Ara</a>
        </div>
      </section>
    </div>
  );
}
