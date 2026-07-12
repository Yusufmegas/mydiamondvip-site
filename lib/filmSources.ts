// Film video kaynak URL'leri — TEK yapılandırma noktası.
// Production: Vercel ortam değişkenlerine Blob/CDN URL'leri yazılır
// (NEXT_PUBLIC_* değişkenleri build sırasında istemci koduna gömülür).
// Yerel geliştirme: değişken tanımlı değilse public/codec/ altındaki
// yerel dosyalara düşer — davranış birebir aynı kalır.
//
// DİKKAT (spec §1.6): CDN/Blob tarafında iki şart doğrulanmalı:
//   1) Range isteklerine 206 dönmesi (?prof=1 çipinde "206-range" görünür)
//   2) Cache-Control: public, max-age=31536000, immutable

export const FILM_1080_URL =
  process.env.NEXT_PUBLIC_FILM_1080_URL || '/codec/film-1080.mp4';

export const FILM_720_URL =
  process.env.NEXT_PUBLIC_FILM_720_URL || '/codec/film-720.mp4';
