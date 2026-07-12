// Malzeme & İşçilik sayfası bölümleri (/malzeme-iscilik) — rakiplerden ayrıştırıcı içerik.
// Görseller: public/images/materials/

export interface MaterialSection {
  title: string;
  description: string;
  points: string[];
  image: string;
}

export const materialSections: MaterialSection[] = [
  {
    title: 'Deri ve Kapitone İşçilik',
    description:
      'Her koltuk, araca özel alınan kalıplarla elde dikilir. Nappa, perfore ve nubuk deriler; baklava, dikey kanal veya kişiye özel desenlerle işlenir. Dikişin düzgünlüğü, bir atölyenin imzasıdır — bizimki çift iğneyle atılır.',
    points: [
      'Çift iğne dikiş ve kontrast iplik seçenekleri',
      'Airbag dikiş hatlarında üretici standardı',
      'Isıtma ve havalandırma donanımlarının korunması',
      'Kişiye özel nakış ve monogram işleme',
    ],
    image: '/images/materials/deri-kapitone.webp',
  },
  {
    title: 'Ambiyans Aydınlatma',
    description:
      'Aydınlatma bir aksesuar değil, kabinin duygusudur. İyi ambiyans, ışığın kendisini değil yüzeye vuruşunu gösterir; hatlar kapı kolu, konsol altı ve zemin çizgisi gibi dolaylı noktalara yerleştirilir.',
    points: [
      'CANBUS uyumlu, araç elektroniğine dokunmayan kurulum',
      'Uygulama üzerinden renk ve senaryo kontrolü',
      'Gündüz ve gece senaryolarının ayrı kalibrasyonu',
    ],
    image: '/images/materials/ambiyans.webp',
  },
  {
    title: 'Yıldız Tavan',
    description:
      'Fiber optik yıldız tavan, ayrı bir panel üzerinde tek tek elle işlenir ve araca zarar vermeden monte edilir. Yıldız dağılımı gerçek gökyüzü haritalarından ilham alır — rastgele değil, kompoze edilmiş bir gece.',
    points: [
      '300–1500 nokta arası yoğunluk seçenekleri',
      'Kayan yıldız ve renk geçiş senaryoları',
      'Alcantara yüzeyle bütünleşik, dikişsiz görünüm',
    ],
    image: '/images/materials/yildiz-tavan.webp',
  },
  {
    title: 'Ahşap / Karbon / Metalik Kaplamalar',
    description:
      'Konsol ve trim parçaları; gerçek ahşap, karbon fiber veya metalik yüzeylerle yeniden kaplanır. Amaç parlaklık değil, dokunulduğunda anlaşılan gerçeklik hissidir. Folyo taklidi bu atölyeye girmez.',
    points: [
      'Gerçek malzeme katmanları',
      'Isı ve UV dayanımlı vernik sistemleri',
      'OEM parça hatlarına birebir uyum',
    ],
    image: '/images/materials/kaplama.webp',
  },
  {
    title: 'Ses ve Multimedya Sistemleri',
    description:
      'Sistem tasarımı akustik ölçümle başlar. Hoparlör yerleşimi, DSP ayarı ve yalıtım birlikte planlanır; sonuç, her koltukta aynı dengede duyulan bir sahnedir.',
    points: [
      'Referans sınıfı komponentler',
      'Gizli subwoofer entegrasyonu',
      'Orijinal ekran ve kumandalarla tam uyum',
    ],
    image: '/images/materials/ses.webp',
  },
  {
    title: 'Zemin ve Tavan Uygulamaları',
    description:
      'Zemin; sessizlik, dayanım ve kolay temizlik için çok katmanlı kurulur. Tavanlar alcantara veya premium kumaşla, sarkma yapmayan teknikle yenilenir. Görünmeyen katmanlar, görünen yüzey kadar önemsenir.',
    points: [
      'Marin sınıfı zemin kaplama seçenekleri',
      'Aydınlatmalı basamak ve eşikler',
      'Sarkmaya karşı garantili tavan işçiliği',
    ],
    image: '/images/materials/zemin-tavan.webp',
  },
  {
    title: 'İzolasyon ve Konfor Detayları',
    description:
      'Lüks, en çok sessizlikte hissedilir. Kapı, zemin ve tavanda çok katmanlı butil ve akustik sünger uygulamasıyla yol ve motor sesi kabinden uzak tutulur; kapı kapanışında duyduğunuz tok ses, bu katmanların imzasıdır.',
    points: [
      'Titreşim sönümleme (deadening) katmanı',
      'Isı yalıtımıyla iklimlendirme verimi',
      'Ölçümle doğrulanan ses seviyesi düşüşü',
    ],
    image: '/images/materials/izolasyon.webp',
  },
];
