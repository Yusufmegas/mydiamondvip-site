// Hizmet içerikleri — her kayıt bir landing page besler (app/hizmetler/[...]).
// Görseller: public/images/services/<slug>.png (gerçek atölye görselleri);
// güncellemek için yalnızca dosyayı değiştirin, kod ve data aynı kalır.

export interface Faq {
  q: string;
  a: string;
}

/** Hizmet kategorisi: ana hizmetler / araç platformları / satış sonrası */
export type ServiceCategory = 'core' | 'platform' | 'aftercare';

export interface Service {
  slug: string;
  title: string;
  shortTitle: string;
  /** Kart ve meta description — 2 satır, güçlü */
  summary: string;
  /** Sayfa hero paragrafı */
  intro: string;
  image: string;
  /** Ana sayfa/hizmetler pillar grid görseli (public/images/service-pillars/) */
  pillarImage?: string;
  /** Pillar kartında görsel crop odağı (object-position) */
  pillarPosition?: string;
  vehicles: string[];
  scope: string[];
  materials: string[];
  steps: string[];
  faqs: Faq[];
  relatedProjects: string[];
  keywords: string[];
  /** ESKİ ana sayfa vitrini bayrağı — geriye dönük uyumluluk için korunur */
  featured: boolean;
  category: ServiceCategory;
  displayOrder: number;
  /** Ana sayfadaki sekiz ana hizmet vitrini */
  homeFeatured: boolean;
}

// Gerçek atölye görselleri PNG (masaüstü "Vip design görseller" setinden);
// henüz gerçek görseli olmayan hizmetler film karesi (webp) kullanır.
const img = (slug: string, ext: 'png' | 'webp' = 'png') => `/images/services/${slug}.${ext}`;

export const services: Service[] = [
  {
    slug: 'vip-arac-dizayni',
    title: 'Komple VIP Araç Dönüşümü',
    shortTitle: 'Komple VIP Dönüşüm',
    summary:
      'Aracın kullanım senaryosundan koltuk yerleşimine, döşemeden teknolojiye kadar tek merkezde yürütülen bütüncül VIP dönüşüm.',
    intro:
      'MyDiamondVIP; Vito, Sprinter, V-Class, Transporter ve Caravelle platformlarında, yolcu konforu, mahremiyet, malzeme kalitesi ve teknolojik donanımları birlikte ele alan kişiye özel VIP kabin tasarımları geliştirir. Her proje, aracın kullanım amacından yola çıkar; koltuk yerleşiminden ışık senaryosuna kadar tüm kararlar sahibinin gündelik hayatına göre verilir.',
    image: img('vip-arac-dizayni'),
    pillarImage: '/images/service-pillars/komple-vip-arac-donusumu.webp',
    vehicles: ['Mercedes Vito', 'Mercedes Sprinter', 'Mercedes V-Class', 'VW Transporter', 'VW Caravelle', 'Ford Custom'],
    scope: [
      'Kullanım senaryosuna göre koltuk yerleşimi ve VIP koltuk uygulaması',
      'Kabin paneli, tavan ve zemin mimarisi',
      'Privacy bölme ve elektrikli perde sistemleri',
      'Yıldız tavan ve çok bölgeli ambiyans aydınlatma',
      'Multimedya, ekran ve ses sistemi entegrasyonu',
      'Buzdolabı, katlanır masa ve gizli saklama çözümleri',
    ],
    materials: [
      'Nappa sınıfı otomotiv derisi, kapitone dikiş seçenekleri',
      'Gerçek ahşap, karbon ve metalik yüzeyler',
      'Çok katmanlı akustik yalıtım',
      'CANBUS uyumlu elektrik ve aydınlatma altyapısı',
    ],
    steps: [
      'Kullanım senaryosu ve ihtiyaç analizi',
      'Konsept yerleşim ve malzeme panosu onayı',
      'Üretim, döşeme ve sistem entegrasyonu',
      'Kalite kontrol, yol testi ve teslim',
    ],
    faqs: [
      {
        q: 'VIP dönüşüm ne kadar sürer?',
        a: 'Kapsama göre değişir; tam kabin dönüşümleri tipik olarak 4-8 hafta aralığında tamamlanır. Net takvim, konsept onayıyla birlikte yazılı olarak paylaşılır.',
      },
      {
        q: 'Aracın garantisi ve elektroniği etkilenir mi?',
        a: 'Uygulamalar aracın orijinal donanımına müdahale etmeden, sökülebilir ve üretici standartlarına uygun yöntemlerle yapılır. Elektrik beslemeleri araç veri yoluna dokunmadan, sigortalı ayrı hatlarla planlanır.',
      },
      {
        q: 'Projeyi görmeden bütçe alabilir miyim?',
        a: 'Teklif formunda aracınızı ve beklentinizi paylaştığınızda ön bütçe aralığı iletilir; kesin teklif, araç analizinden sonra kalem kalem yazılı verilir.',
      },
    ],
    relatedProjects: ['mercedes-vip-dizayn', 'turizm-arac-dizayn', 'mercedes-sprinter-dizayn'],
    keywords: ['VIP araç dizayn', 'VIP oto dizayn', 'VIP araç iç dizayn', 'İstanbul VIP araç dizayn'],
    featured: true,
    category: 'core',
    displayOrder: 1,
    homeFeatured: true,
  },
  {
    slug: 'mercedes-vito-vip-dizayn',
    title: 'Mercedes Vito VIP Dizayn',
    shortTitle: 'Vito VIP Dizayn',
    summary:
      'Vito’nun kompakt gövdesini yönetici sınıfı bir yolcu kabinine dönüştüren yerleşim, döşeme ve teknoloji bütünü.',
    intro:
      'Mercedes Vito, doğru yerleşim planıyla şehir içinde binek konforu, kabinde yönetici sınıfı bir deneyim sunar. MyDiamondVIP; Vito’da koltuk mimarisi, deri döşeme, yıldız tavan, ambiyans aydınlatma ve multimedya sistemlerini tek bir tasarım dili altında birleştirir.',
    image: img('mercedes-vito-vip-dizayn'),
    vehicles: ['Mercedes Vito Tourer', 'Mercedes Vito Select', 'Mercedes eVito'],
    scope: [
      '4+1 karşılıklı veya 2+1 yönetici düzeni koltuk yerleşimi',
      'Elektrikli, masajlı ve ısıtmalı VIP koltuk uygulamaları',
      'Privacy cam, elektrikli perde ve bölme çözümleri',
      'Yıldız tavan ve çevresel ambiyans hatları',
      'Ekran, soundbar ve kabin kontrol sistemleri',
      'Aydınlatmalı basamak ve zemin mimarisi',
    ],
    materials: [
      'Nappa deri ve alcantara tavan kombinasyonları',
      'Fiber optik yıldız tavan sistemi',
      'Gerçek ahşap ve piano black konsol yüzeyleri',
    ],
    steps: [
      'Gövde ve donanım analizi',
      'Yerleşim planı ve konsept onayı',
      'Döşeme, kaplama ve elektrik entegrasyonu',
      'Kalite kontrol ve teslim',
    ],
    faqs: [
      {
        q: 'Vito’da hangi koltuk düzenleri mümkün?',
        a: 'Kullanım amacına göre 4+1’den 8+1’e kadar farklı yerleşimler uygulanır. VIP projelerde en çok tercih edilen düzen, karşılıklı oturmalı 4+1’dir.',
      },
      {
        q: 'Uygulama hangi kasalara yapılır?',
        a: 'W447 ve sonrası kasalarda tüm uygulamalar yapılır; önceki kasalar için kapsam, araç analiziyle netleştirilir.',
      },
    ],
    relatedProjects: ['mercedes-vip-dizayn', 'turizm-arac-dizayn'],
    keywords: ['Mercedes Vito VIP dizayn', 'Vito VIP', 'Vito iç dizayn', 'VIP araç dizayn'],
    featured: true,
    category: 'platform',
    displayOrder: 1,
    homeFeatured: false,
  },
  {
    slug: 'mercedes-sprinter-vip-dizayn',
    title: 'Mercedes Sprinter VIP Dizayn',
    shortTitle: 'Sprinter VIP Dizayn',
    summary:
      'Ayakta durulabilen iç hacmiyle Sprinter; mobil ofis, aile salonu veya VIP transfer kabini olarak yeniden doğar.',
    intro:
      'Mercedes Sprinter, VIP dönüşüm dünyasının en esnek platformudur. MyDiamondVIP; Sprinter’da yönetici ofisi, aile lounge’u ve turizm senaryolarına göre kabin mimarisi kurar: koltuk yerleşimi, panel imalatı, aydınlatma, multimedya ve premium döşeme tek elden, tek sorumlulukla uygulanır.',
    image: img('mercedes-sprinter-vip-dizayn'),
    vehicles: ['Sprinter Tourer', 'Sprinter Panelvan', 'Sprinter uzun şasi'],
    scope: [
      'Yönetici ofisi, lounge veya turizm düzeni kabin planlaması',
      'Tam kabin panel ve tavan imalatı',
      'Video konferans, çoklu ekran ve ofis donanımları',
      'Mutfak ünitesi, buzdolabı ve tuvalet opsiyonları',
      'Tam akustik yalıtım ve iklimlendirme desteği',
    ],
    materials: [
      'Yüksek yoğunluklu kompozit panel altyapısı',
      'Nappa deri, alcantara ve kapitone kombinasyonları',
      'Ticari sınıf multimedya ve ağ donanımı',
    ],
    steps: [
      'Kullanım senaryosu ve yerleşim etüdü',
      'Konsept ve donanım listesi onayı',
      'Panel imalatı, döşeme ve sistem montajı',
      'Yol testi, kalite kontrol ve teslim',
    ],
    faqs: [
      {
        q: 'Sprinter VIP dönüşüm kimler için uygun?',
        a: 'Şehirler arası yoğun seyahat eden yöneticiler, VIP transfer ve turizm filoları ile hareketli ofis ihtiyacı olan ekipler için idealdir.',
      },
      {
        q: 'Koltuk sayısı ve ruhsat süreçleri nasıl ilerler?',
        a: 'Yerleşim planı mevzuat gereklilikleri gözetilerek hazırlanır; teslim öncesi uygunluk süreçlerinde yönlendirme sağlanır.',
      },
    ],
    relatedProjects: ['mercedes-sprinter-dizayn', 'turizm-arac-dizayn'],
    keywords: ['Mercedes Sprinter VIP dizayn', 'Sprinter VIP', 'Sprinter iç dizayn'],
    featured: true,
    category: 'platform',
    displayOrder: 2,
    homeFeatured: false,
  },
  {
    slug: 'mercedes-v-class-vip-dizayn',
    title: 'Mercedes V-Class VIP Dizayn',
    shortTitle: 'V-Class VIP Dizayn',
    summary:
      'Fabrika konforunun üzerine inşa edilen, OEM çizgisini koruyan kişiye özel V-Class kabin yorumu.',
    intro:
      'V-Class, premium tabanı en güçlü platformdur; doğru dokunuş, fabrika çizgisini bozmadan kabini kişiselleştirmektir. MyDiamondVIP, V-Class’ta orijinal donanımla kusursuz bütünleşen döşeme, aydınlatma ve teknoloji uygulamaları geliştirir.',
    image: img('mercedes-v-class-vip-dizayn'),
    vehicles: ['V-Class Avantgarde', 'V-Class Exclusive', 'Mercedes EQV'],
    scope: [
      'Orijinal koltukların yeniden döşenmesi veya VIP koltuk dönüşümü',
      'Yıldız tavan ve kapı-konsol ambiyans hatları',
      'Perde, privacy cam ve bölme çözümleri',
      'Arka kabin eğlence ve ofis sistemleri',
    ],
    materials: [
      'OEM renk kodlarıyla eşleşen nappa deri',
      'Fabrika görünümünü koruyan entegre aydınlatma',
    ],
    steps: ['Donanım ve renk uyum analizi', 'Konsept onayı', 'Uygulama ve entegrasyon', 'Teslim ve kullanım eğitimi'],
    faqs: [
      {
        q: 'V-Class’ta orijinal görünüm korunur mu?',
        a: 'Evet. Tüm uygulamalar OEM çizgisini koruyacak şekilde, fabrikadan çıkmış hissi veren malzeme ve işçilikle yapılır.',
      },
    ],
    relatedProjects: ['mercedes-vip-dizayn'],
    keywords: ['Mercedes V-Class VIP dizayn', 'V-Class iç dizayn', 'VIP araç dizayn'],
    featured: false,
    category: 'platform',
    displayOrder: 3,
    homeFeatured: false,
  },
  {
    slug: 'volkswagen-vip-dizayn',
    title: 'Volkswagen VIP Dizayn',
    shortTitle: 'Volkswagen VIP Dizayn',
    summary:
      'Transporter, Caravelle ve Multivan için araca özel kalıplanmış panel, döşeme ve aydınlatma mimarisi.',
    intro:
      'Volkswagen ticari ailesi, doğru kabin planı ve premium malzeme diliyle VIP sınıfına taşınır. MyDiamondVIP; T5’ten T7’ye tüm platformlarda koltuk, döşeme, aydınlatma ve multimedya dönüşümlerini araca özel kalıplarla uygular.',
    image: img('volkswagen-vip-dizayn', 'webp'),
    vehicles: ['VW Transporter', 'VW Caravelle', 'VW Multivan'],
    scope: [
      'VIP koltuk düzeni ve premium döşeme',
      'Tavan, zemin ve kapı paneli mimarisi',
      'Yıldız tavan ve ambiyans aydınlatma',
      'Ekran ve ses sistemi entegrasyonları',
    ],
    materials: [
      'Nappa deri ve mikrofiber kombinasyonları',
      'Araca özel kalıplanmış panel altyapısı',
    ],
    steps: ['Araç analizi', 'Konsept ve malzeme onayı', 'Uygulama', 'Kontrol ve teslim'],
    faqs: [
      {
        q: 'Multivan T7 için de uygulama yapıyor musunuz?',
        a: 'Evet; T5, T6, T6.1 ve T7 platformlarının tamamında araca özel çözümler uygulanır.',
      },
    ],
    relatedProjects: ['volkswagen-vip-arac-dizayn'],
    keywords: ['Volkswagen VIP dizayn', 'Transporter VIP', 'Caravelle VIP dizayn'],
    featured: false,
    category: 'platform',
    displayOrder: 4,
    homeFeatured: false,
  },
  {
    slug: 'binek-arac-deri-doseme',
    title: 'Deri Döşeme & Özel Yüzeyler',
    shortTitle: 'Deri & Özel Yüzeyler',
    summary:
      'Nappa deri, Alcantara, ahşap, karbon ve kişiye özel dikişlerle terzi işi kabin uygulamaları.',
    intro:
      'Deri döşeme, araçta her gün dokunduğunuz tek yüzeydir. MyDiamondVIP; koltuk, kapı paneli, direksiyon ve tavanda, aracın kullanım amacına ve kabin karakterine uygun deri, dikiş ve yüzey kombinasyonlarıyla iç mekânı kişiye özel bir deneyime dönüştürür. Her araç için kalıp, desen ve renk çalışması ayrı hazırlanır.',
    image: img('binek-arac-deri-doseme'),
    pillarImage: '/images/service-pillars/deri-doseme-ozel-yuzeyler.webp',
    vehicles: ['Tüm binek modeller', 'SUV ve pickup', 'Klasik araçlar'],
    scope: [
      'Koltuk ve kafalık döşeme — kapitone, baklava, perfore seçenekleri',
      'Kapı paneli, kolçak ve orta konsol kaplama',
      'Direksiyon ve vites körüğü sarımı',
      'Alcantara tavan yenileme',
      'Kişiye özel nakış ve monogram işleme',
    ],
    materials: [
      'Nappa, perfore ve nubuk otomotiv derileri',
      'Alcantara ve premium mikrofiber',
      'UV ve aşınma dayanımlı iplik sistemleri',
    ],
    steps: ['Renk ve desen seçimi', 'Söküm ve kalıp alma', 'Dikiş ve döşeme', 'Montaj ve kontrol'],
    faqs: [
      {
        q: 'Isıtma, havalandırma ve airbag korunur mu?',
        a: 'Evet. Yan airbag dikiş hatları patlama hattına uygun özel iplikle dikilir; ısıtma ve havalandırma donanımları üretici standardında korunur.',
      },
      {
        q: 'Komple iç döşeme ne kadar sürer?',
        a: 'Tam iç mekân tipik olarak 3-7 iş günü sürer; direksiyon gibi tekil işlemler aynı gün teslim edilebilir.',
      },
    ],
    relatedProjects: ['binek-arac-deri-doseme', 'deri-doseme', 'chevrolet-dizayn'],
    keywords: ['binek araç deri döşeme', 'araç deri döşeme', 'oto deri döşeme', 'koltuk döşeme'],
    featured: true,
    category: 'core',
    displayOrder: 4,
    homeFeatured: true,
  },
  {
    slug: 'arac-ici-kaplama',
    title: 'Araç İçi Kaplama',
    shortTitle: 'Araç İçi Kaplama',
    summary:
      'Konsol, kapı ve trim yüzeylerini tek renk ve doku dili altında toplayan gerçek ahşap, karbon ve deri kaplama.',
    intro:
      'İç mekânın bütünlüğü, yüzeylerin aynı dili konuşmasıyla başlar. MyDiamondVIP; konsol, kapı çıtaları ve trim parçalarını gerçek ahşap, karbon, metalik veya deri yüzeylerle yeniden yorumlar — parlaklık için değil, dokunulduğunda anlaşılan gerçeklik hissi için.',
    image: img('arac-ici-kaplama'),
    vehicles: ['Binek araçlar', 'VIP van projeleri', 'Klasik restorasyonlar'],
    scope: [
      'Konsol ve trim kaplama — ahşap, karbon, piano black',
      'Tavan ve direk kaplamaları',
      'Deri ve alcantara yüzey dönüşümleri',
      'Özel doku ve hydrographics uygulamaları',
    ],
    materials: [
      'Gerçek ahşap ve karbon fiber katmanlar',
      'Isı ve UV dayanımlı otomotiv vernik sistemleri',
    ],
    steps: ['Parça analizi ve söküm', 'Yüzey hazırlığı', 'Kaplama ve vernik', 'Montaj'],
    faqs: [
      {
        q: 'Kaplama orijinal parçaya zarar verir mi?',
        a: 'Hayır. İşlemler parça yüzeyinde kalıcı iz bırakmadan uygulanır; istenirse orijinal görünüme dönülebilir.',
      },
    ],
    relatedProjects: ['mercedes-vip-dizayn', 'chevrolet-dizayn'],
    keywords: ['araç içi kaplama', 'konsol kaplama', 'karbon kaplama', 'ahşap kaplama'],
    featured: true,
    category: 'core',
    displayOrder: 9, // ikincil uzmanlık sayfası — ana grid dışı
    homeFeatured: false,
  },
  {
    slug: 'ambiyans-aydinlatma-yildiz-tavan',
    title: 'Yıldız Tavan & Ambiyans Aydınlatma',
    shortTitle: 'Yıldız Tavan & Ambiyans',
    summary:
      'Fiber optik yıldız tavan, dolaylı ambiyans hatları ve kişiye özel gece ışık senaryoları.',
    intro:
      'Kabinin duygusunu gündüz malzeme, gece ışık belirler. MyDiamondVIP; fiber optik yıldız tavanı ve çok bölgeli ambiyans hatlarını araca özel tasarlar: ışığın kendisi değil, yüzeye vuruşu görünür. Gündüz ve gece senaryoları ayrı ayrı kalibre edilir.',
    image: img('ambiyans-aydinlatma-yildiz-tavan'),
    pillarImage: '/images/service-pillars/yildiz-tavan-ambiyans.webp',
    pillarPosition: '50% 20%',
    vehicles: ['VIP van projeleri', 'Binek araçlar', 'Turizm araçları'],
    scope: [
      'Fiber optik yıldız tavan — statik veya kayan yıldız senaryosu',
      'Kapı, konsol, zemin ve bagaj ambiyans hatları',
      'Uygulama ve telefon üzerinden senaryo kontrolü',
      'Gündüz/gece renk kalibrasyonu',
    ],
    materials: [
      'Yüksek yoğunluklu fiber optik demetler',
      'CANBUS uyumlu kontrol üniteleri',
      'Alcantara tavan yüzeyleri',
    ],
    steps: ['Tavan analizi', 'Yıldız haritası ve renk planı', 'Fiber işleme ve montaj', 'Senaryo kurulumu'],
    faqs: [
      {
        q: 'Yıldız tavan araca zarar verir mi?',
        a: 'Hayır. Uygulama, orijinal tavanın üzerine hazırlanan ayrı bir panelde yapılır; araç tavanı delinmez ve geri dönüş her zaman mümkündür.',
      },
      {
        q: 'Kaç yıldız noktası kullanılıyor?',
        a: 'Kabin boyutuna göre 300 ile 1500 arası fiber nokta uygulanır; yoğunluk, konsept onayında birlikte belirlenir.',
      },
    ],
    relatedProjects: ['mercedes-vip-dizayn', 'turizm-arac-dizayn'],
    keywords: ['yıldız tavan', 'ambiyans aydınlatma', 'fiber optik tavan', 'araç aydınlatma'],
    featured: true,
    category: 'core',
    displayOrder: 5,
    homeFeatured: true,
  },
  {
    slug: 'muzik-ses-sistemi',
    title: 'Müzik ve Ses Sistemi',
    shortTitle: 'Müzik & Ses Sistemi',
    summary:
      'Akustik ölçümle başlayan sistem tasarımı: her koltukta dengeli sahne, kabinde stüdyo sessizliği.',
    intro:
      'İyi bir kabin, iyi bir sahnedir. MyDiamondVIP; akustik ölçüm, çok katmanlı yalıtım ve doğru komponent seçimiyle araca özel ses sistemleri kurar. Hedef yüksek ses değil, her koltukta aynı dengede duyulan doğru sestir.',
    image: img('muzik-ses-sistemi'),
    vehicles: ['Binek araçlar', 'VIP van projeleri'],
    scope: [
      'Komponent hoparlör, amfi ve DSP kurulumu',
      'Gizli subwoofer ve kabin entegrasyonu',
      'Kapı ve zemin akustik yalıtımı',
      'CarPlay/Android tabanlı multimedya ve ekran sistemleri',
    ],
    materials: [
      'Referans sınıfı komponent hoparlörler',
      'Çok katmanlı butil yalıtım',
      'DSP tabanlı kanal yönetimi',
    ],
    steps: ['Akustik analiz', 'Sistem tasarımı', 'Yalıtım ve montaj', 'Ölçüm ve ince ayar'],
    faqs: [
      {
        q: 'Orijinal ekran ve kumandalar korunur mu?',
        a: 'Evet; sistemler mevcut ekran ve direksiyon kontrolleriyle tam uyumlu şekilde entegre edilir.',
      },
    ],
    relatedProjects: ['mercedes-sprinter-dizayn'],
    keywords: ['araç ses sistemi', 'oto müzik sistemi', 'araç akustik yalıtım'],
    featured: true,
    category: 'core',
    displayOrder: 10, // ikincil uzmanlık sayfası — ana grid dışı
    homeFeatured: false,
  },
  {
    slug: 'dis-kaplama',
    title: 'Dış Kaplama',
    shortTitle: 'Dış Kaplama',
    summary:
      'Aracın karakterini değiştirirken boyayı koruyan renk değişim folyosu ve PPF uygulamaları.',
    intro:
      'Dış kaplama, iki işi aynı anda yapar: aracın rengini ve karakterini yeniden kurar, boyayı taş izlerine ve güneşe karşı korur. MyDiamondVIP; premium cast folyo ve kendini onaran PPF filmleri, kapalı ve kontrollü atölye koşullarında uygular.',
    image: img('dis-kaplama'),
    vehicles: ['Tüm binek ve ticari modeller'],
    scope: [
      'Tam veya kısmi renk değişim folyo',
      'PPF boya koruma filmi',
      'Mat, saten, metalik ve özel doku seçenekleri',
      'Cam filmi ve detay koruma paketleri',
    ],
    materials: [
      'Premium cast folyo sistemleri',
      'Kendini onaran (self-healing) PPF filmler',
    ],
    steps: ['Yüzey hazırlığı ve dekontaminasyon', 'Kaplama', 'Detay ve kenar işçiliği', 'Kontrol ve teslim'],
    faqs: [
      {
        q: 'Folyo boyaya zarar verir mi?',
        a: 'Kaliteli cast folyolar doğru uygulandığında boyaya zarar vermez; aksine dış etkenlere karşı korur.',
      },
    ],
    relatedProjects: ['zirhli-arac', 'chevrolet-dizayn'],
    keywords: ['araç kaplama', 'renk değişim folyo', 'PPF', 'boya koruma filmi'],
    featured: true,
    category: 'core',
    displayOrder: 11, // folyo/PPF odaklı ikincil hizmet sayfası — ana grid dışı
    homeFeatured: false,
  },
  {
    slug: 'bakim-onarim',
    title: 'Bakım & Onarım',
    shortTitle: 'Bakım & Onarım',
    summary:
      'VIP kabinin değerini koruyan periyodik bakım; döşeme, mekanizma ve donanımda uzman onarım.',
    intro:
      'VIP dönüşümlü bir aracın değeri, düzenli ve doğru bakımla korunur. MyDiamondVIP; kendi projelerinde ve başka atölyelerin uygulamalarında deri bakımı, mekanizma onarımı, aydınlatma ve multimedya arıza giderme hizmetleri sunar.',
    image: img('bakim-onarim'),
    vehicles: ['VIP dönüşümlü tüm araçlar', 'Binek araçlar'],
    scope: [
      'Deri temizlik, besleme ve renk yenileme',
      'Koltuk mekanizması ve elektrikli donanım onarımı',
      'Aydınlatma ve multimedya arıza giderme',
      'Döşeme yenileme ve lokal onarımlar',
    ],
    materials: ['Üretici onaylı bakım kimyasalları', 'Orijinal yedek komponentler'],
    steps: ['Durum tespiti', 'Onarım planı ve onay', 'Uygulama', 'Test ve teslim'],
    faqs: [
      {
        q: 'Başka atölyede yapılmış dönüşüme bakım veriyor musunuz?',
        a: 'Evet; araç analizi sonrasında mevcut uygulamanın durumuna göre bakım ve iyileştirme planı çıkarılır.',
      },
    ],
    relatedProjects: ['deri-doseme'],
    keywords: ['VIP araç bakım', 'deri koltuk bakımı', 'araç iç onarım'],
    featured: true,
    category: 'aftercare',
    displayOrder: 1,
    homeFeatured: false,
  },
  {
    slug: 'ozel-kabin-tasarimi',
    title: 'Özel Kabin Tasarımı & İç Mimari',
    shortTitle: 'Kabin Tasarımı & İç Mimari',
    summary:
      'Kabin planı, tavan, zemin, panel mimarisi ve malzeme paletinin araca ve sahibine özel olarak tasarlanması.',
    intro:
      'Kabin tasarımı, dönüşümün mimari katmanıdır: yerleşim planı, tavan ve zemin yapısı, panel hatları ve malzeme paleti burada kurulur. MyDiamondVIP her projede kabini boş bir hacim olarak ele alır; oturma düzeni, sirkülasyon, saklama ve ışık, aracın kullanım senaryosuna göre yeniden planlanır. Sonuç, sonradan eklenmiş parçalar değil, tek elden çizilmiş bir iç mimaridir.',
    image: '/images/service-pillars/ozel-kabin-tasarimi.webp',
    pillarImage: '/images/service-pillars/ozel-kabin-tasarimi.webp',
    vehicles: ['Mercedes Vito', 'Mercedes Sprinter', 'Mercedes V-Class', 'VW Transporter', 'VW Caravelle'],
    scope: [
      'Kullanım senaryosuna göre kabin yerleşim planı',
      'Tavan, zemin ve kapı paneli mimarisi — araca özel kalıp',
      'Malzeme paleti: deri, ahşap, karbon ve metal kombinasyonları',
      'Privacy bölme, perde ve saklama entegrasyonu',
      'Aydınlatma ve teknoloji altyapısının plana işlenmesi',
    ],
    materials: [
      'Yüksek yoğunluklu kompozit panel altyapısı',
      'Gerçek ahşap, karbon ve piano black yüzeyler',
      'Nappa deri ve Alcantara kaplama katmanları',
      'Çok katmanlı akustik ve ısı yalıtımı',
    ],
    steps: [
      'Keşif: araç ölçüleri ve kullanım senaryosu analizi',
      'Yerleşim planı, malzeme panosu ve konsept onayı',
      'Panel imalatı, kaplama ve montaj',
      'Detay kontrolü ve teslim',
    ],
    faqs: [
      {
        q: 'Kabin planı tamamen sıfırdan mı çiziliyor?',
        a: 'Evet. Her proje, aracın gövdesi ve sahibinin kullanım senaryosu üzerinden yeniden planlanır; hazır şablon uygulanmaz.',
      },
      {
        q: 'Mevcut iç donanım korunabilir mi?',
        a: 'İstenirse korunur. Plan, orijinal donanımın hangi bölümlerinin kalacağına göre kademeli olarak da kurgulanabilir.',
      },
    ],
    relatedProjects: ['mercedes-vip-dizayn', 'mercedes-sprinter-dizayn'],
    keywords: ['özel kabin tasarımı', 'araç iç mimari', 'VIP kabin planı', 'araç kabin tasarımı'],
    featured: false,
    category: 'core',
    displayOrder: 2,
    homeFeatured: true,
  },
  {
    slug: 'vip-koltuk-konfor-sistemleri',
    title: 'VIP Koltuk & Konfor Sistemleri',
    shortTitle: 'VIP Koltuk & Konfor',
    summary:
      'Elektrikli, raylı, yatabilen, ısıtmalı, soğutmalı ve masajlı VIP koltuk çözümleri.',
    intro:
      'VIP kabinin merkezinde koltuk vardır. MyDiamondVIP; elektrikli hareket, ray sistemi, yatar pozisyon, ısıtma, havalandırma ve masaj fonksiyonlarını tek koltuk mimarisinde birleştirir. Koltuk seçimi ve yerleşimi, yolculuk süresine ve kullanım amacına göre planlanır; döşeme, kabinin genel malzeme diliyle aynı elden yapılır.',
    image: '/images/service-pillars/vip-koltuk-konfor-sistemleri.webp',
    pillarImage: '/images/service-pillars/vip-koltuk-konfor-sistemleri.webp',
    vehicles: ['Mercedes Vito', 'Mercedes Sprinter', 'Mercedes V-Class', 'VW Transporter', 'Binek araçlar'],
    scope: [
      'Elektrikli kaptan koltuğu ve VIP koltuk uygulamaları',
      'Ray sistemi ile ileri-geri ve döner yerleşim',
      'Yatar pozisyon, bacak desteği ve ottoman mekanizmaları',
      'Isıtma, havalandırma ve masaj fonksiyonları',
      'Koltuk içi USB, kablosuz şarj ve kontrol panelleri',
    ],
    materials: [
      'OEM sınıfı koltuk iskeleti ve mekanizmalar',
      'Nappa deri, perfore ve kapitone döşeme seçenekleri',
      'CANBUS uyumlu elektrik altyapısı',
    ],
    steps: [
      'Kullanım senaryosu ve yerleşim analizi',
      'Koltuk modeli, fonksiyon listesi ve döşeme onayı',
      'Montaj, elektrik entegrasyonu ve döşeme',
      'Fonksiyon testleri ve teslim',
    ],
    faqs: [
      {
        q: 'Koltuklar araç muayenesine uygun mu?',
        a: 'Yerleşim planı mevzuat gereklilikleri gözetilerek hazırlanır; bağlantı ve emniyet kemeri standartları korunur, uygunluk süreçlerinde yönlendirme sağlanır.',
      },
      {
        q: 'Mevcut koltuklarım dönüştürülebilir mi?',
        a: 'Uygun iskelete sahip koltuklara fonksiyon eklenebilir; çoğu projede ise VIP sınıfı hazır iskelet üzerine kişiye özel döşeme uygulanır.',
      },
    ],
    relatedProjects: ['mercedes-vip-dizayn', 'turizm-arac-dizayn'],
    keywords: ['VIP koltuk', 'masajlı koltuk', 'elektrikli koltuk', 'kaptan koltuğu'],
    featured: false,
    category: 'core',
    displayOrder: 3,
    homeFeatured: true,
  },
  {
    slug: 'multimedya-ses-akilli-kontrol',
    title: 'Multimedya, Ses & Akıllı Kontrol',
    shortTitle: 'Multimedya & Akıllı Kontrol',
    summary:
      'Ekran, profesyonel ses, tablet kontrolü, perde, aydınlatma ve kabin sistemlerinin tek arayüzde yönetilmesi.',
    intro:
      'Modern VIP kabinde teknoloji, tek tek cihazlar değil bütünleşik bir sistemdir. MyDiamondVIP; ekranları, ses sistemini, perdeleri, aydınlatmayı ve iklimlendirme senaryolarını tek kontrol arayüzünde toplar. Kablolama ve güç yönetimi araç veri yoluna dokunmadan, sigortalı ayrı hatlarla planlanır; kullanım, tablet veya telefon üzerinden tek dokunuşla yapılır.',
    image: '/images/service-pillars/multimedya-akilli-kontrol.webp',
    pillarImage: '/images/service-pillars/multimedya-akilli-kontrol.webp',
    vehicles: ['Mercedes Vito', 'Mercedes Sprinter', 'Mercedes V-Class', 'VW Transporter'],
    scope: [
      'Kabin ekranları ve akıllı TV entegrasyonu',
      'DSP tabanlı profesyonel ses sistemi kurulumu',
      'Tablet ve telefon üzerinden kabin kontrolü',
      'Elektrikli perde, aydınlatma ve senaryo yönetimi',
      'Wi-Fi, güç yönetimi ve gizli kablolama altyapısı',
    ],
    materials: [
      'Referans sınıfı komponent hoparlör ve amfiler',
      'Endüstriyel sınıf kontrol üniteleri',
      'CANBUS uyumlu, sigortalı ayrı güç hatları',
    ],
    steps: [
      'İhtiyaç analizi ve sistem şeması',
      'Cihaz listesi ve arayüz onayı',
      'Kablolama, montaj ve yazılım kurulumu',
      'Senaryo testleri ve kullanım eğitimi',
    ],
    faqs: [
      {
        q: 'Sistem aracın orijinal elektroniğini etkiler mi?',
        a: 'Hayır. Tüm beslemeler araç veri yoluna dokunmadan, sigortalı bağımsız hatlarla kurulur; orijinal donanım aynen çalışmaya devam eder.',
      },
      {
        q: 'Kontrol arayüzü hangi cihazlarda çalışır?',
        a: 'Kabine sabitlenen tablet ile birlikte iOS ve Android telefonlardan da aynı senaryolar yönetilebilir.',
      },
    ],
    relatedProjects: ['mercedes-sprinter-dizayn', 'mercedes-vip-dizayn'],
    keywords: ['araç multimedya sistemi', 'akıllı kabin kontrolü', 'VIP ses sistemi', 'araç tablet kontrolü'],
    featured: false,
    category: 'core',
    displayOrder: 6,
    homeFeatured: true,
  },
  {
    slug: 'mini-bar-masa-mobil-ofis',
    title: 'Mini Bar, Masa & Mobil Ofis',
    shortTitle: 'Mini Bar & Mobil Ofis',
    summary:
      'Buzdolabı, elektrikli masa, kablosuz şarj, gizli saklama ve yönetici çalışma alanları.',
    intro:
      'Yol üzerinde geçen saatler, doğru donanımla çalışma ve ağırlama zamanına dönüşür. MyDiamondVIP; buzdolabı, elektrikli katlanır masa, kablosuz şarj ve gizli saklama çözümlerini kabin mimarisinin içine gömülü olarak tasarlar. Hedef, sonradan eklenmiş aksesuar görüntüsü değil, konsolun doğal bir parçası gibi duran işlevsel üniteler kurmaktır.',
    image: '/images/service-pillars/mini-bar-masa-mobil-ofis.webp',
    pillarImage: '/images/service-pillars/mini-bar-masa-mobil-ofis.webp',
    vehicles: ['Mercedes Vito', 'Mercedes Sprinter', 'Mercedes V-Class', 'VW Caravelle'],
    scope: [
      'Konsola gömülü buzdolabı ve mini bar ünitesi',
      'Elektrikli katlanır masa ve çalışma yüzeyleri',
      'Kablosuz şarj, USB-C ve 230V güç noktaları',
      'Gizli saklama, sürgülü bölme ve bardaklık üniteleri',
      'Yönetici koltuğuna göre planlanan mobil ofis düzeni',
    ],
    materials: [
      'Araç sınıfı kompresörlü soğutma üniteleri',
      'Alüminyum mekanizmalı elektrikli masa sistemleri',
      'Kabin diliyle eşleşen ahşap, deri ve metal yüzeyler',
    ],
    steps: [
      'Kullanım senaryosu ve yerleşim analizi',
      'Ünite listesi ve konsol tasarım onayı',
      'İmalat, montaj ve güç entegrasyonu',
      'Fonksiyon testleri ve teslim',
    ],
    faqs: [
      {
        q: 'Buzdolabı aracın aküsünü zorlar mı?',
        a: 'Üniteler bağımsız sigortalı hatlardan beslenir ve akü koruma eşiğiyle çalışır; kontak kapalıyken derin deşarj oluşmaz.',
      },
      {
        q: 'Masa sürüş sırasında güvenli mi?',
        a: 'Masalar kilitli mekanizmalıdır; kapalı konumda titreşimsiz sabitlenir ve sürüş güvenliğini etkilemez.',
      },
    ],
    relatedProjects: ['mercedes-sprinter-dizayn', 'turizm-arac-dizayn'],
    keywords: ['araç mini bar', 'araç buzdolabı', 'mobil ofis araç', 'araç katlanır masa'],
    featured: false,
    category: 'core',
    displayOrder: 7,
    homeFeatured: true,
  },
  {
    slug: 'dis-tasarim-govde-uygulamalari',
    title: 'Dış Tasarım & Gövde Uygulamaları',
    shortTitle: 'Dış Tasarım & Gövde',
    summary:
      'Body kit, panjur, jant, basamak, dış kaplama ve aracın genel karakterini tamamlayan gövde uygulamaları.',
    intro:
      'Kabinde kurulan karakter, dış tasarımla tamamlanır. MyDiamondVIP; body kit, panjur, jant, elektrikli basamak ve dış kaplama uygulamalarını aracın orijinal hatlarına saygılı, bütüncül bir gövde diliyle uygular. Amaç gösterişli eklentiler değil, aracın duruşunu netleştiren ölçülü ve kalıcı bir dış kimliktir.',
    image: '/images/service-pillars/dis-tasarim-govde.webp',
    pillarImage: '/images/service-pillars/dis-tasarim-govde.webp',
    vehicles: ['Mercedes Vito', 'Mercedes Sprinter', 'Mercedes V-Class', 'VW Transporter'],
    scope: [
      'Body kit ve tampon uygulamaları',
      'Panjur, ayna kapağı ve dış aksesuar dönüşümleri',
      'Jant seçimi ve lastik uyumu',
      'Elektrikli yan basamak montajı',
      'Renk değişim folyo ve koruma filmi ile bütünleşik gövde dili',
    ],
    materials: [
      'OEM uyumlu poliüretan ve ABS gövde parçaları',
      'Premium cast folyo ve PPF filmleri',
      'Korozyona dayanıklı montaj donanımı',
    ],
    steps: [
      'Gövde analizi ve konsept görselleştirme',
      'Parça listesi ve uygulama onayı',
      'Montaj, boya/kaplama ve hizalama',
      'Yol testi ve teslim',
    ],
    faqs: [
      {
        q: 'Body kit orijinal tampona zarar verir mi?',
        a: 'Uygulamalar geri dönüştürülebilir montaj yöntemleriyle yapılır; istenirse araç orijinal görünümüne döndürülebilir.',
      },
      {
        q: 'Jant değişimi garanti ve sigortayı etkiler mi?',
        a: 'Araç üreticisinin onayladığı ölçü aralığında kalınır; yük ve hız endeksleri orijinal değerlerin altına düşürülmez.',
      },
    ],
    relatedProjects: ['zirhli-arac', 'volkswagen-vip-arac-dizayn'],
    keywords: ['araç body kit', 'Vito body kit', 'araç dış tasarım', 'elektrikli basamak'],
    featured: false,
    category: 'core',
    displayOrder: 8,
    homeFeatured: true,
  },
];

const byOrder = (a: Service, b: Service) => a.displayOrder - b.displayOrder;

/** Ana sayfa + hizmetler sayfası ilk bölümü: sekiz ana hizmet */
export const coreServices = services
  .filter((s) => s.category === 'core' && s.homeFeatured)
  .sort(byOrder);

/** Araç platformları (Vito, Sprinter, V-Class, Volkswagen) */
export const platformServices = services
  .filter((s) => s.category === 'platform')
  .sort(byOrder);

/** Satış sonrası (bakım & onarım) */
export const aftercareServices = services
  .filter((s) => s.category === 'aftercare')
  .sort(byOrder);

/** GERİYE DÖNÜK: eski ana sayfa vitrini — artık sekiz ana hizmete işaret eder */
export const featuredServices = coreServices;

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
