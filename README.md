# MyDiamondVIP — Scroll-Film Sitesi

Scroll-driven sinematik tanıtım: kullanıcı kaydırdıkça 13 segmentlik film (1549 kare, 24fps)
ileri/geri scrub edilir. WebCodecs (H.264 all-intra + VideoDecoder) ana yol; WebP dizisi
yalnızca fallback (iOS < 16.4 / kalıcı codec hatası).

## Çalıştırma

```bash
npm install
npm run dev      # geliştirme
npm run build && npm run start   # prod
```

`http://localhost:3000/?prof=1` → profil çipi (stalls / maxGap / boost / cache / net).

## Mimari

| Dosya | Görev |
|---|---|
| `lib/rangeLoader.ts` | Öncelikli Range yükleyici: 2MB parçalar; sıra = kapı bölgesi → playhead-ilerisi → ağır bölgeler (kabin) → lineer. Ham chunk deposu sample'ların rastgele erişim kaynağıdır. 4 başarısız denemede kalıcı hata → fallback. |
| `lib/scrubEngine.ts` | WebCodecs motoru. mp4box yalnızca moov parse + avcC description için; sample byte'ları chunk deposundan rastgele erişimle okunur (moov iner inmez TÜM sample tablosu hazır — hiçbir kare dosyanın inmesini beklemez). All-intra ⇒ tek sample = tek kare. VideoFrame'ler playhead ±5 penceresinde, dışına katı `close()`. Decoder hazır olmadan gelen istekler pending'de birikir → `applyPending()`. Starve güvenliği: yalnızca decode edilmiş kareye ilerlenir (blank kare yasak), tarama hedef-merkezli. |
| `lib/fallbackEngine.ts` | 12fps WebP dizisi (775 kare, 720p). Aynı arayüz; kapı pompası tick içinde. |
| `lib/timeline.ts` | Kare haritası: bölümler, durak kareleri, gap-adaptif tavan eğrisi, mobil `object-position` keypoint'leri. |
| `components/FilmPage.tsx` | Orkestratör: Lenis + scroll→kare eşlemesi + tek rAF döngüsü + varyant seçimi (≤900px veya genişlik×dpr<1600 → 720p) + fallback devri. Statik import — `next/dynamic({ssr:false})` YASAK (Turbopack prod tuzağı). |
| `components/Overlays.tsx` | Hold-frame metin katmanları. `data-in/out/fade` (kare) ile playhead'den imperativ sürülür; re-render yok. `transform` CSS'in (ortalamalar), animasyon ayrı `translate` özelliğinde. |
| `next.config.ts` | `/codec/*` ve `/fallback/*` → `immutable` cache header (CDN Range revalidate stall'ını önler). |

## Spec'ten bilinçli sapmalar

1. **mp4box `setExtractionOptions` yerine sample-tablosu rastgele erişimi.** Sıralı
   extraction, "playhead-ilerisi + ağır bölge" öncelikli DOLGUYU karesel erişilebilirliğe
   çeviremez (byte gelse bile ara boşluk varken kare üretmez). moov-sonrası doğrudan
   `trak.samples[offset,size]` okuma, nbSamples kararının amacını (dosya inmeden kare)
   daha güçlü sağlar. Node'da gerçek asset ile doğrulandı: 1549 sample, tümü `is_sync`.
2. **Snap: GSAP ScrollTrigger yerine Lenis `scrollTo`.** ScrollTrigger'ın scroll yazması
   Lenis'in lerp'iyle yarışır; scroll-idle (280ms) + en yakın durak (yarıçap 70 kare)
   yaklaşımı aynı davranışı tek sahiple verir.
3. **Kapı "decode" kriteri:** rastgele erişimli motorda ilk 96 karenin *byte'ları* +
   ilk karenin gerçekten çizilmiş olması. All-intra'da byte=decode edilebilirlik.

## Kalibrasyon düğmeleri (gerçek cihaz turu için)

- `lib/timeline.ts` → `STOP_FRAMES` (durak kareleri), `POS_KEYS` (mobil object-position),
  `GAP_LO/GAP_HI/MAX_CAP_FPS` (hız tavanı; GAP_LO'yu 240 altına indirme — yavaş scroll
  7.7×'e sıçrar, film ucuz hisseder), `GATE_FRAMES`.
- `Overlays.tsx` → `data-in/out/fade` kare pencereleri.
- CTA linkleri placeholder: `wa.me/905000000000`, `tel:+905000000000`,
  `info@mydiamondvip.com` — gerçek değerlerle değiştirin.

## Encode pipeline (yerelde bir kez, `../encode/run-encodes.ps1`)

Kaynak: `../ek/Vip site video/1..13.mp4` (1928×1076 24fps) → concat (`-c copy`) →
all-intra `-g 1 -crf 18 -preset slow` 1080p + `-crf 20` 720p (+1 sn siyah kuyruk `tpad`)
→ `public/codec/`; 12fps WebP dizisi → `public/fallback/`; ilk kare → `public/poster.webp`.
Dikişler kontrol edildi (9→10a, 10a→10b): crossfade gerekmedi.

## Test

`scratchpad/test_film.py` (Playwright, headless): kapı, 206/immutable, duraklarda overlay
görünürlüğü (piksel-düzeyi `checkVisibility`), eşik bölümünde metin yokluğu, geri scrub,
WebCodecs'siz fallback, gerçek 404-yanıtı → fallback. 16/16 geçiyor.

**Headless yalan söyler (spec §5):** buradaki testler fonksiyoneldir. Her performans
iddiası gerçek iPhone + orta segment Android'de, gerçek ağda, sıcak+soğuk doğrulanmalı:
`?prof=1` ile stalls/maxGap/boost okuyun; hedefler: stall 0, vahşi flick'te blank kare 0,
yavaş scroll'da boost 1.00×.
