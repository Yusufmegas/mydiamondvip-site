// Proje portfolyosu — kartlar, filtreler ve detay sayfaları buradan beslenir.
// Görseller: public/images/projects/<slug>.webp + galeri için public/images/stills/.
// Gerçek proje fotoğrafları geldiğinde yalnızca bu yollar güncellenir.

export type ProjectCategory =
  | 'Mercedes'
  | 'Volkswagen'
  | 'Binek Araç'
  | 'Zırhlı Araç'
  | 'Turizm Araçları'
  | 'Deri Döşeme';

export interface Project {
  slug: string;
  title: string;
  vehicle: string;
  categories: ProjectCategory[];
  operations: string[];
  summary: string;
  description: string;
  materials: string[];
  image: string;
  gallery: string[];
  before: string;
  after: string;
  keywords: string[];
}

export const projectCategories: ProjectCategory[] = [
  'Mercedes',
  'Volkswagen',
  'Binek Araç',
  'Zırhlı Araç',
  'Turizm Araçları',
  'Deri Döşeme',
];

const img = (slug: string) => `/images/projects/${slug}.webp`;
const still = (n: string) => `/images/stills/f-${n}.webp`;

export const projects: Project[] = [
  {
    slug: 'turizm-arac-dizayn',
    title: 'Turizm Araç Dizayn',
    vehicle: 'Mercedes Sprinter 519',
    categories: ['Mercedes', 'Turizm Araçları'],
    operations: ['VIP koltuk yerleşimi', 'Yıldız tavan', 'Ambiyans aydınlatma', 'Zemin mimarisi', 'Multimedya'],
    summary: 'Yoğun filo kullanımında konforu ve dayanımı aynı kabinde buluşturan turizm dönüşümü.',
    description:
      'Şehirler arası VIP transfer yapan bir turizm filosu için hazırlanan bu projede kabin, günde yüzlerce biniş-inişe göre kurgulandı: aşınma dayanımı yüksek premium döşeme, kolay temizlenen zemin mimarisi ve yolcu başına kişisel aydınlatma-şarj ünitesi. Tam akustik yalıtım, uzun yolculuklarda kabini sessiz bir dinlenme alanına çevirir.',
    materials: ['Aşınma dayanımlı nappa deri', 'Fiber optik yıldız tavan', 'Çok bölgeli ambiyans sistemi', 'Tam akustik yalıtım'],
    image: img('turizm-arac-dizayn'),
    gallery: [still('1010'), still('1040'), still('1150'), still('0900')],
    before: still('0650'),
    after: still('1010'),
    keywords: ['turizm araç dizayn', 'VIP transfer araç', 'Sprinter turizm dizayn'],
  },
  {
    slug: 'mercedes-sprinter-dizayn',
    title: 'Mercedes Sprinter Dizayn',
    vehicle: 'Mercedes Sprinter uzun şasi',
    categories: ['Mercedes'],
    operations: ['Yönetici kabini', 'Privacy bölme', 'Video konferans', 'Nappa döşeme', 'Mutfak ünitesi'],
    summary: 'Uzun şasi Sprinter üzerinde, yol süresini çalışma süresine çeviren mobil ofis kabini.',
    description:
      'Yoğun seyahat eden bir yönetim ekibi için hazırlanan bu Sprinter; karşılıklı dört elektrikli VIP koltuk, katlanır çalışma masaları, video konferans ekranı ve ses yalıtımlı privacy bölmesiyle hareketli bir ofise dönüştürüldü. Mutfak ünitesi ve buzdolabı, uzun rotalarda kabin konforunu tamamlar.',
    materials: ['Nappa deri', 'Gerçek ahşap konsol', 'DSP tabanlı ses sistemi', 'Elektrikli privacy bölme'],
    image: img('mercedes-sprinter-dizayn'),
    gallery: [still('0560'), still('1040'), still('0900'), still('1100')],
    before: still('0360'),
    after: still('1040'),
    keywords: ['Mercedes Sprinter dizayn', 'Sprinter VIP', 'mobil ofis araç'],
  },
  {
    slug: 'volkswagen-vip-arac-dizayn',
    title: 'Volkswagen VIP Araç Dizayn',
    vehicle: 'VW Caravelle T6.1',
    categories: ['Volkswagen'],
    operations: ['VIP koltuk düzeni', 'Tavan & zemin mimarisi', 'Ambiyans aydınlatma', 'Privacy cam'],
    summary: 'Caravelle platformunda, fabrika çizgisini koruyan aile odaklı VIP kabin.',
    description:
      'Aile kullanımı için hazırlanan bu Caravelle projesinde ikinci sıraya elektrikli VIP koltuklar yerleştirildi; döşeme, çocuklu kullanım gerçeğine göre kolay temizlenen premium deriden seçildi. Ambiyans senaryoları yumuşak geçişli kurgulandı; sonuç, orijinal VW çizgisini koruyan fabrika üstü bir kabin.',
    materials: ['Nappa deri', 'Alcantara tavan', 'Çok bölgeli ambiyans sistemi'],
    image: img('volkswagen-vip-arac-dizayn'),
    gallery: [still('0320'), still('0480'), still('1000')],
    before: still('0240'),
    after: still('1000'),
    keywords: ['Volkswagen VIP araç dizayn', 'Caravelle VIP', 'Transporter dizayn'],
  },
  {
    slug: 'binek-arac-deri-doseme',
    title: 'Binek Araç Deri Döşeme',
    vehicle: 'Range Rover Sport',
    categories: ['Binek Araç', 'Deri Döşeme'],
    operations: ['Komple iç döşeme', 'Baklava desen kapitone', 'Direksiyon sarımı', 'Kapı paneli'],
    summary: 'SUV iç mekânının baklava desen kapitone nappa ile terzi işi yenilenmesi.',
    description:
      'Bu projede aracın tüm oturma yüzeyleri, kapı panelleri ve orta konsolu; sahibinin seçtiği renk kombinasyonuna göre baklava desen kapitone nappa deriyle yeniden döşendi. Yan airbag dikiş hatları ve koltuk donanımları üretici standardında korundu — görünen zarafetin altında görünmeyen disiplin.',
    materials: ['Nappa deri', 'Kontrast iplik', 'Perfore orta panel'],
    image: img('binek-arac-deri-doseme'),
    gallery: [still('0950'), still('1080'), still('1100')],
    before: still('0100'),
    after: still('0950'),
    keywords: ['binek araç deri döşeme', 'araç deri döşeme', 'kapitone döşeme'],
  },
  {
    slug: 'zirhli-arac',
    title: 'Zırhlı Araç',
    vehicle: 'Zırhlı SUV platformu',
    categories: ['Zırhlı Araç'],
    operations: ['İç kabin yenileme', 'Güvenlik uyumlu döşeme', 'Ek akustik yalıtım', 'PPF koruma'],
    summary: 'Güvenlik donanımlarına saygılı, ağırlık dengesi gözetilmiş zırhlı kabin işçiliği.',
    description:
      'Zırhlı araçlarda iç mekân işçiliği, güvenlik donanımlarının erişim ve çalışma alanlarına dokunmadan ilerlemek zorundadır. Bu projede kabin, zırh aksamına müdahale edilmeden yeniden döşendi; ek akustik yalıtım uygulandı ve dış yüzey koruma filmiyle tamamlandı.',
    materials: ['Teknik deri', 'Yüksek yoğunluklu yalıtım', 'PPF koruma filmi'],
    image: img('zirhli-arac'),
    gallery: [still('0600'), still('0240'), still('0820')],
    before: still('0240'),
    after: still('0600'),
    keywords: ['zırhlı araç iç dizayn', 'zırhlı araç döşeme'],
  },
  {
    slug: 'mercedes-vip-dizayn',
    title: 'Mercedes VIP Dizayn',
    vehicle: 'Mercedes Vito Tourer',
    categories: ['Mercedes'],
    operations: ['4+1 VIP düzen', '900 nokta yıldız tavan', 'Elektrikli perde', 'Kabin kontrol paneli', 'DSP ses sistemi'],
    summary: 'Atölyenin imza işi: krem deri ve antrasit dengesinde, yıldız tavanlı Vito kabini.',
    description:
      'İmza projelerimizden biri olan bu Vito dönüşümünde; karşılıklı dört elektrikli VIP koltuk, 900 noktalı yıldız tavan, elektrikli privacy perde ve dokunmatik kabin kontrol paneli uygulandı. Krem deri ile antrasit yüzeylerin dengesi, gündüz ve gece ışık senaryolarında ayrı ayrı kalibre edildi.',
    materials: ['Krem nappa deri', 'Fiber optik yıldız tavan', 'Gerçek ahşap detaylar', 'DSP ses sistemi'],
    image: img('mercedes-vip-dizayn'),
    gallery: [still('0100'), still('0900'), still('1000'), still('1040'), still('1400')],
    before: still('0060'),
    after: still('1040'),
    keywords: ['Mercedes VIP dizayn', 'Vito VIP dönüşüm', 'VIP kabin'],
  },
  {
    slug: 'deri-doseme',
    title: 'Deri Döşeme',
    vehicle: 'BMW 5 Serisi',
    categories: ['Binek Araç', 'Deri Döşeme'],
    operations: ['Koltuk döşeme', 'OEM desen koruma', 'Alcantara tavan'],
    summary: 'Yıpranmış orijinal döşemenin, fabrika deseni korunarak nappa ile yenilenmesi.',
    description:
      'Yüksek kilometreli bu araçta hedef gösterişli bir değişim değil, “ilk günkü fabrika hâlinden daha iyisi”ydi. Koltuklar orijinal desen korunarak nappa deriyle yeniden döşendi; tavan alcantara ile yenilendi. Fark, ancak dokununca anlaşılır — tam da istendiği gibi.',
    materials: ['OEM desen nappa deri', 'Alcantara tavan yüzeyi'],
    image: img('deri-doseme'),
    gallery: [still('1080'), still('1000'), still('0950')],
    before: still('0100'),
    after: still('1080'),
    keywords: ['deri döşeme', 'koltuk yenileme', 'alcantara tavan'],
  },
  {
    slug: 'chevrolet-dizayn',
    title: 'Chevrolet Dizayn',
    vehicle: 'Chevrolet Tahoe',
    categories: ['Binek Araç'],
    operations: ['İç kaplama', 'Antrasit deri döşeme', 'Zemin ambiyans hatları', 'Arka kabin ekranları'],
    summary: 'Amerikan SUV karakterine uygun, koyu tonlu ve bütünsel bir iç mekân yorumu.',
    description:
      'Tahoe’nun geniş kabini; antrasit nappa, karbon detaylar ve zemin ambiyans hatlarıyla yeniden yorumlandı. Üçüncü sıra dahil tüm oturma yüzeyleri yenilendi; multimedya sistemi arka kabin ekranlarıyla genişletildi. Koyu tonların içinde ışık, yalnızca gerektiği yerde konuşur.',
    materials: ['Antrasit nappa deri', 'Karbon kaplama', 'Çok bölgeli ambiyans'],
    image: img('chevrolet-dizayn'),
    gallery: [still('0480'), still('1080'), still('1360')],
    before: still('0360'),
    after: still('1080'),
    keywords: ['Chevrolet dizayn', 'Tahoe iç dizayn', 'SUV deri döşeme'],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function relatedProjects(slug: string, limit = 3): Project[] {
  const current = getProject(slug);
  if (!current) return projects.slice(0, limit);
  return projects
    .filter((p) => p.slug !== slug)
    .sort((a, b) => {
      const as = a.categories.filter((c) => current.categories.includes(c)).length;
      const bs = b.categories.filter((c) => current.categories.includes(c)).length;
      return bs - as;
    })
    .slice(0, limit);
}
