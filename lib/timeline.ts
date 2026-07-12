// Film zaman haritası — kaynak: 13 segment, 24fps.
// Segment kare sayıları encode çıktısıyla birebir: 12×121 + 73 + 24 (siyah kuyruk) = 1549.

export const FPS = 24;
export const SEG_FRAMES = [121, 121, 121, 121, 121, 121, 121, 121, 121, 121, 121, 121, 73];
export const BLACK_TAIL = 24; // sona eklenen 1 sn saf siyah
export const TOTAL_FRAMES = SEG_FRAMES.reduce((a, b) => a + b, 0) + BLACK_TAIL; // 1549
export const LAST_FRAME = TOTAL_FRAMES - 1;

/** Segment i (0-tabanlı) başlangıç karesi */
export const SEG_START = SEG_FRAMES.reduce<number[]>((acc, n) => {
  acc.push((acc[acc.length - 1] ?? 0) + n);
  return acc;
}, [0]).slice(0, -1);
// [0,121,242,363,484,605,726,847,968,1089,1210,1331,1452]

export const SCROLL_VH = 800; // toplam scroll yüksekliği

// ---- Bölümler (spec §7) ----
export interface Section {
  id: string;
  from: number; // kare
  to: number;   // kare (dahil)
}

export const SECTIONS: Section[] = [
  { id: 'hero',   from: 0,    to: 120 },   // seg 1
  { id: 'arac',   from: 121,  to: 604 },   // seg 2–5 orbit
  { id: 'esik',   from: 605,  to: 846 },   // seg 6–7 (metin yok)
  { id: 'acilis', from: 847,  to: 967 },   // seg 8
  { id: 'kabin',  from: 968,  to: 1088 },  // seg 9
  { id: 'veda',   from: 1089, to: 1330 },  // seg 10a–10b (metin yok)
  { id: 'final',  from: 1331, to: LAST_FRAME }, // seg 11–12 + siyah
];

// ---- Durak kareleri (snap hedefleri) — gerçek cihazda kalibre edilecek placeholder'lar ----
export const STOP_FRAMES = [
  0,     // giriş
  96,    // hero: farlar yanık, başlık
  170,   // araç: ana başlık
  238,   // orbit durak 1 (sol)
  359,   // orbit durak 2 (arka)
  480,   // orbit durak 3 (sağ)
  900,   // açılış: perde satırı
  1040,  // kabin: hizmet listesi
  LAST_FRAME, // final: logo + CTA
];

// ---- Ağır bölgeler (kapı arka plan dolgusu önceliği): kabin sahneleri ----
export const HEAVY_REGIONS: Array<[number, number]> = [
  [968, 1330], // seg 9–10b
];

export const GATE_FRAMES = 96; // ilk N kare hazır olunca perde kalkar

// ---- Gap-adaptif hız tavanı (spec §2) ----
export const BASE_CAP_FPS = 2.5 * FPS; // 60 kare/sn — sinematik taban
export const MAX_CAP_FPS = 480;        // vahşi flick'te yetişme tavanı
export const GAP_LO = 240;             // bu eşiğin altında taban tavan (referans değer)
export const GAP_HI = 700;             // bu eşikte tavan MAX'a ulaşır

export function capForGap(gapAbs: number): number {
  if (gapAbs <= GAP_LO) return BASE_CAP_FPS;
  const t = Math.min(1, (gapAbs - GAP_LO) / (GAP_HI - GAP_LO));
  return BASE_CAP_FPS + t * (MAX_CAP_FPS - BASE_CAP_FPS);
}

// ---- Mobil CSS crop: segment bazlı object-position (spec §8, placeholder değerler) ----
// Kare → {x,y} yüzde; keypoint'ler arasında lerp.
const POS_KEYS: Array<{ frame: number; x: number; y: number }> = [
  { frame: 0,    x: 50, y: 50 },
  { frame: 604,  x: 50, y: 50 },  // orbit boyunca merkez
  { frame: 968,  x: 50, y: 40 },  // kabin
  { frame: 1088, x: 50, y: 40 },
  { frame: 1331, x: 50, y: 55 },  // yıldız finali
  { frame: LAST_FRAME, x: 50, y: 55 },
];

export function objectPositionAt(frame: number): { x: number; y: number } {
  const k = POS_KEYS;
  if (frame <= k[0].frame) return { x: k[0].x, y: k[0].y };
  for (let i = 1; i < k.length; i++) {
    if (frame <= k[i].frame) {
      const a = k[i - 1], b = k[i];
      const t = (frame - a.frame) / Math.max(1, b.frame - a.frame);
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
  }
  const last = k[k.length - 1];
  return { x: last.x, y: last.y };
}

export function frameFromScroll(progress01: number): number {
  return Math.max(0, Math.min(LAST_FRAME, progress01 * LAST_FRAME));
}
