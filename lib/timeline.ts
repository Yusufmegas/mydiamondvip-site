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
export const BASE_CAP_FPS = 2.5 * FPS; // 60 kare/sn — sinematik taban (masaüstü)
export const MAX_CAP_FPS = 480;        // vahşi flick'te yetişme tavanı (masaüstü)
export const GAP_LO = 240;             // bu eşiğin altında taban tavan (referans değer)
export const GAP_HI = 700;             // bu eşikte tavan MAX'a ulaşır

/** Cihaz sınıfına göre decode hız tavanları. Mobil: taban ~32 kare/sn,
 *  yetişme tavanı 96 — her ara kareyi decode etmeye çalışmak yerine motor
 *  hedef çevresindeki hazır kareye kontrollü geçer (starve-jump). */
export interface CapProfile {
  base: number;
  max: number;
}

export const DESKTOP_CAPS: CapProfile = { base: BASE_CAP_FPS, max: MAX_CAP_FPS };
export const MOBILE_CAPS: CapProfile = { base: 32, max: 96 };

export function capForGap(gapAbs: number, caps: CapProfile = DESKTOP_CAPS): number {
  if (gapAbs <= GAP_LO) return caps.base;
  const t = Math.min(1, (gapAbs - GAP_LO) / (GAP_HI - GAP_LO));
  return caps.base + t * (caps.max - caps.base);
}

// ---- CSS crop: segment bazlı object-position (spec §8) ----
// Kare → {x,y} yüzde; keypoint'ler arasında lerp. Masaüstü ve mobil (dikey ekran)
// kadraj haritaları AYRIDIR — mobil değerler araç/kabin/final detaylarını dikey
// kesitte korur; her segmentin x/y'si buradan bağımsızca ayarlanabilir.
type PosKey = { frame: number; x: number; y: number };

const POS_KEYS_DESKTOP: PosKey[] = [
  { frame: 0,    x: 50, y: 50 },
  { frame: 604,  x: 50, y: 50 },  // orbit boyunca merkez
  { frame: 968,  x: 50, y: 40 },  // kabin
  { frame: 1088, x: 50, y: 40 },
  { frame: 1331, x: 50, y: 55 },  // yıldız finali
  { frame: LAST_FRAME, x: 50, y: 55 },
];

const POS_KEYS_MOBILE: PosKey[] = [
  { frame: 0,    x: 50, y: 52 },  // giriş: araç gövdesi dikeyde biraz aşağı
  { frame: 120,  x: 50, y: 52 },
  { frame: 242,  x: 46, y: 50 },  // orbit sol durak: burun kesilmesin
  { frame: 363,  x: 50, y: 50 },  // arka durak: merkez
  { frame: 484,  x: 54, y: 50 },  // sağ durak: kuyruk kesilmesin
  { frame: 604,  x: 50, y: 50 },
  { frame: 847,  x: 50, y: 46 },  // kapı/açılış: eşik detayı
  { frame: 968,  x: 44, y: 42 },  // kabin: koltuk + tavan detayı sola-yukarı
  { frame: 1088, x: 44, y: 42 },
  { frame: 1331, x: 50, y: 50 },  // final: logo/yıldız merkez
  { frame: LAST_FRAME, x: 50, y: 50 },
];

export function objectPositionAt(frame: number, mobile = false): { x: number; y: number } {
  const k = mobile ? POS_KEYS_MOBILE : POS_KEYS_DESKTOP;
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
