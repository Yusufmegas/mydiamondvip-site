// Film video kaynak URL'leri — TEK yapılandırma noktası.
// Canlı ortam: NEXT_PUBLIC_* değişkenleriyle R2/CDN URL'leri kullanılır.
// Vercel önizlemesi: aynı origin'deki /codec yolu R2'ye proxy edilir.
// Yerelde public/codec/ varsa önce oradaki dosyalar servis edilir.
//
// DİKKAT (spec §1.6): CDN/Blob tarafında iki şart doğrulanmalı:
//   1) Range isteklerine 206 dönmesi (?prof=1 çipinde "206-range" görünür)
//   2) Cache-Control: public, max-age=31536000, immutable

// Vercel önizlemeleri medya alanının CORS izin listesinde değil. Bu hostlarda
// aynı origin'deki /codec rewrite'ı kullan; canlı alan adı doğrudan R2'ye gider.
const useSameOriginFilm =
  typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app');

export const FILM_1080_URL = useSameOriginFilm
  ? '/codec/film-1080.mp4'
  : process.env.NEXT_PUBLIC_FILM_1080_URL || '/codec/film-1080.mp4';

export const FILM_720_URL = useSameOriginFilm
  ? '/codec/film-720.mp4'
  : process.env.NEXT_PUBLIC_FILM_720_URL || '/codec/film-720.mp4';

// Telefon / Save-Data varyantı. Production'da 540 tanımlı değilse (ör. henüz 540
// yüklenmemiş v2 kurulumu) 720'ye düşer — yerel /codec/film-540.mp4'e değil (404 olurdu).
export const FILM_540_URL = useSameOriginFilm
  ? '/codec/film-540.mp4'
  : process.env.NEXT_PUBLIC_FILM_540_URL ||
    (process.env.NEXT_PUBLIC_FILM_720_URL ? FILM_720_URL : '/codec/film-540.mp4');
