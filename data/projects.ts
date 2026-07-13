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

/** Matterport 360° tur — her proje EN FAZLA bir tur taşır (tek fiziksel araç) */
export interface MatterportTour {
  title: string;
  embedUrl: string;
  poster: string;
}

export type GalleryOrientation = 'landscape' | 'portrait' | 'square' | 'wide';

export interface ProjectGalleryItem {
  src: string;
  alt: string;
  caption?: string;
  orientation?: GalleryOrientation;
  objectPosition?: string;
}

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
  matterportTour?: MatterportTour;
  gallery: ProjectGalleryItem[];
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

/** Film karesi galerisi (gerçek çekimi olmayan eski projeler) — dürüst, genel alt metin */
const stillGallery = (title: string, frames: string[]): ProjectGalleryItem[] =>
  frames.map((n, i) => ({
    src: still(n),
    alt: `${title} — proje karesi ${i + 1}`,
    orientation: 'landscape' as const,
  }));

export const projects: Project[] = [
  {
    slug: 'mercedes-vip-dizayn',
    title: 'Mercedes Vito VIP Dizayn — Proje 01',
    vehicle: 'Mercedes Vito',
    categories: ['Mercedes'],
    operations: ['Karşılıklı VIP koltuk düzeni', 'Yıldız tavan', 'Ambiyans aydınlatma', 'Kabin multimedya ekranı', 'Katlanır masa ünitesi', 'Elektrikli perde'],
    summary: 'Krem deri ve antrasit dengesinde, yıldız tavanlı ve büyük ekranlı Vito VIP kabini — 360° turla gezilebilir.',
    description:
      'Bu Vito dönüşümünde karşılıklı VIP koltuklar, yıldız tavan, çevresel ambiyans hatları ve büyük kabin ekranı tek tasarım dili altında birleştirildi. Krem deri ile antrasit yüzeylerin dengesi, gündüz ve gece ışık senaryolarında ayrı ayrı kalibre edildi. Kabini fotoğraflarla ve interaktif 360° Matterport turuyla inceleyebilirsiniz.',
    materials: ['Krem nappa deri', 'Fiber optik yıldız tavan', 'Çok bölgeli ambiyans aydınlatma', 'Kabin multimedya sistemi'],
    image: '/images/projects/mercedes-vip-dizayn/cover.webp',
    matterportTour: {
      title: 'Mercedes Vito VIP Dizayn — Proje 01',
      embedUrl: 'https://my.matterport.com/show/?m=y7jLQXyDvHd',
      poster: '/images/projects/mercedes-vip-dizayn/matterport-cover.webp',
    },
    gallery: [
      {
        src: '/images/projects/mercedes-vip-dizayn/gallery-01.webp',
        alt: 'Mercedes Vito VIP kabin genel görünümü — yıldız tavan, büyük ekran ve karşılıklı VIP koltuklar',
        caption: 'VIP kabin genel görünümü',
        orientation: 'landscape',
        objectPosition: '50% 50%',
      },
      {
        src: '/images/projects/mercedes-vip-dizayn/gallery-02.webp',
        alt: 'Krem deri VIP koltuklar ve kapitone dikiş detayı, yıldız tavan altında',
        caption: 'VIP koltuklar ve kapitone deri işçiliği',
        orientation: 'landscape',
        objectPosition: '50% 45%',
      },
      {
        src: '/images/projects/mercedes-vip-dizayn/gallery-03.webp',
        alt: 'VIP koltuklar ve mor tonlu ambiyans aydınlatma senaryosu',
        caption: 'Ambiyans aydınlatma gece senaryosu',
        orientation: 'landscape',
        objectPosition: '50% 45%',
      },
      {
        src: '/images/projects/mercedes-vip-dizayn/gallery-04.webp',
        alt: 'Kabin multimedya ekranı, katlanır masa ve konsol detayı',
        caption: 'Multimedya ekranı ve katlanır masa',
        orientation: 'landscape',
        objectPosition: '50% 55%',
      },
    ],
    keywords: ['Mercedes VIP dizayn', 'Vito VIP dönüşüm', 'VIP kabin', 'Matterport araç turu'],
  },
  {
    slug: 'mercedes-vito-vip-dizayn-02',
    title: 'Mercedes Vito VIP Dizayn — Proje 02',
    vehicle: 'Mercedes Vito',
    categories: ['Mercedes'],
    operations: ['Karşılıklı VIP koltuk düzeni', 'Yıldız tavan', 'Ambiyans aydınlatma', 'Ahşap konsol ve masa ünitesi', 'Kabin multimedya ekranı', 'Perde sistemi'],
    summary: 'Bordo perde ve ahşap detaylarla sıcak tonlu bir Vito VIP kabini — 360° turla gezilebilir.',
    description:
      'Bu ikinci Vito projesinde kabin; krem deri koltuklar, bordo perdeler ve ahşap konsol detaylarıyla sıcak tonlu bir karakterde kurgulandı. Yıldız tavan, çevresel ambiyans hatları, açılır masa ünitesi ve kabin ekranı aynı tasarım dilinin parçası olarak uygulandı. Kabini fotoğraflarla ve interaktif 360° Matterport turuyla inceleyebilirsiniz.',
    materials: ['Krem nappa deri', 'Fiber optik yıldız tavan', 'Gerçek ahşap konsol yüzeyleri', 'Kabin multimedya sistemi'],
    image: '/images/projects/mercedes-vito-vip-dizayn-02/cover.webp',
    matterportTour: {
      title: 'Mercedes Vito VIP Dizayn — Proje 02',
      embedUrl: 'https://my.matterport.com/show/?m=ASg1DeP33Xs',
      poster: '/images/projects/mercedes-vito-vip-dizayn-02/matterport-cover.webp',
    },
    gallery: [
      {
        src: '/images/projects/mercedes-vito-vip-dizayn-02/gallery-01.webp',
        alt: 'Mercedes Vito VIP kabin genel görünümü — yıldız tavan, kapı paneli ve VIP koltuklar',
        caption: 'VIP kabin genel görünümü',
        orientation: 'landscape',
        objectPosition: '50% 50%',
      },
      {
        src: '/images/projects/mercedes-vito-vip-dizayn-02/gallery-02.webp',
        alt: 'Krem deri VIP koltuklar, orta kol ünitesi ve mor tonlu ambiyans aydınlatma',
        caption: 'VIP koltuklar ve ambiyans aydınlatma',
        orientation: 'landscape',
        objectPosition: '50% 45%',
      },
      {
        src: '/images/projects/mercedes-vito-vip-dizayn-02/gallery-03.webp',
        alt: 'Açılır masa ünitesi ve karşılıklı VIP koltuklar, kırmızı ambiyans hatlarıyla',
        caption: 'Açılır masa ünitesi ve kabin detayı',
        orientation: 'landscape',
        objectPosition: '50% 50%',
      },
      {
        src: '/images/projects/mercedes-vito-vip-dizayn-02/gallery-04.webp',
        alt: 'Kabin multimedya ekranı, hoparlör panelleri ve ahşap konsol detayı',
        caption: 'Multimedya ekranı ve hoparlör panelleri',
        orientation: 'wide',
        objectPosition: '50% 50%',
      },
    ],
    keywords: ['Mercedes Vito VIP dizayn', 'Vito VIP proje', 'VIP kabin', 'Matterport araç turu'],
  },
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
    gallery: stillGallery('Turizm Araç Dizayn', ['1010', '1040', '1150', '0900']),
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
    gallery: stillGallery('Mercedes Sprinter Dizayn', ['0560', '1040', '0900', '1100']),
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
    gallery: stillGallery('Volkswagen VIP Araç Dizayn', ['0320', '0480', '1000']),
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
    gallery: stillGallery('Binek Araç Deri Döşeme', ['0950', '1080', '1100']),
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
    gallery: stillGallery('Zırhlı Araç', ['0600', '0240', '0820']),
    keywords: ['zırhlı araç iç dizayn', 'zırhlı araç döşeme'],
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
    gallery: stillGallery('Deri Döşeme', ['1080', '1000', '0950']),
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
    gallery: stillGallery('Chevrolet Dizayn', ['0480', '1080', '1360']),
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
